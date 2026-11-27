#!/usr/bin/env node
'use strict';

/* ==========================================================================
   GOOD GIRL — Zero-Dependency Full-Stack Café & Live POS Server
   - Serves Customer Mobile/Web App (index.html) & Live Barista POS (pos.html)
   - Persistent JSON database (data/store.json)
   - Real-Time Server-Sent Events (/api/events) across phones & POS terminals
   - Full REST API for Orders, Table Merge, Stock 86, Cashier, Ratings & Member
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = Number(process.env.PORT) || 8765;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const MAX_BODY_BYTES = 512 * 1024;

const VALID_STATUSES = new Set(['received', 'preparing', 'ready', 'complete', 'cancelled']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/* ===================== LAN IP DISCOVERY (FOR MOBILE QR) ===================== */

function getLanIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const info of ifaces[name] || []) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address;
      }
    }
  }
  return '127.0.0.1';
}

/* ===================== PERSISTENT STORE ===================== */

function createSeedStore() {
  const now = Date.now();
  const t1 = new Date(now - 3 * 60 * 1000).toISOString();
  const t2 = new Date(now - 90 * 1000).toISOString();

  return {
    counter: 41,
    theme: 'light',
    stock: {}, // { [itemId]: { available: boolean } } (default true when omitted)
    member: {
      name: 'Mochi',
      memberId: 'GG-M-8824',
      tier: 'Emerald Member',
      nextTier: 'Obsidian VIP',
      points: 840,
      nextTierPoints: 1000,
      stamps: 3, // out of 5 toward Free Signature Drink
      stampsTarget: 5,
      ggPayBalance: 250000,
      favorites: ['matcha-nitro', 'spirulina-cake', 'biscoff-choco-frappe', 'aren-palm-latte'],
      claimedVouchers: ['MATCHA20', 'FIRSTBREW', 'FREEPASTRY', 'GGVIP10'],
      unlockedRewards: [], // dynamic vouchers redeemed from Rewards Store
    },
    orders: [
      {
        orderId: 'GG-041',
        createdAt: t1,
        updatedAt: t2,
        source: 'CUSTOMER_WEB_MOBILE',
        outletId: 'senopati',
        outletName: 'Senopati Flagship',
        status: 'preparing',
        statusHistory: [
          { status: 'received', at: t1, actor: 'CUSTOMER' },
          { status: 'preparing', at: t2, actor: 'POS_BARISTA' },
        ],
        orderMode: 'dine-in',
        tableNumber: '07',
        pickupTime: null,
        deliveryAddress: null,
        mergedCount: 1,
        customer: {
          name: 'Mochi',
          tier: 'Emerald Member',
          memberId: 'GG-M-8824',
        },
        items: [
          {
            sku: 'SIG-MNT-MED-ICE',
            itemId: 'matcha-nitro',
            name: 'MATCHA NITRO',
            category: 'Signature Blends',
            image: 'assets/matcha-nitro.png',
            style: 'Nitro Ice',
            size: 'Medium',
            volume: '250 ML',
            milk: 'Fresh Dairy',
            addons: [],
            sugar: 'Normal',
            ice: 'Normal',
            note: '',
            qty: 1,
            unitPrice: 42000,
            lineTotal: 42000,
          },
        ],
        pricing: {
          subtotal: 42000,
          deliveryFee: 0,
          voucherCode: null,
          discount: 0,
          total: 42000,
          pointsEarned: 42,
        },
        payment: {
          method: 'QRIS',
          provider: 'QRIS Instant',
          reference: 'QRIS-74108841',
          status: 'PAID',
          paidAt: t1,
        },
        rating: null,
      },
    ],
  };
}

function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const seed = createSeedStore();
      fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.orders) || !parsed.member) {
      throw new Error('Corrupt store');
    }
    if (!parsed.stock) parsed.stock = {};
    if (typeof parsed.member.stamps !== 'number') parsed.member.stamps = 3;
    if (typeof parsed.member.stampsTarget !== 'number') parsed.member.stampsTarget = 5;
    if (!Array.isArray(parsed.member.unlockedRewards)) parsed.member.unlockedRewards = [];
    return parsed;
  } catch (err) {
    console.warn('[Store] Resetting to clean seed:', err.message);
    const seed = createSeedStore();
    saveStore(seed);
    return seed;
  }
}

function saveStore(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = STORE_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

let store = loadStore();

/* ===================== SSE REAL-TIME BROADCAST ===================== */

const sseClients = new Set();

function broadcastSSE(eventObj) {
  const payload = `data: ${JSON.stringify(eventObj)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (_) {
      sseClients.delete(res);
    }
  }
}

// Keepalive ping every 20s for mobile browsers
setInterval(() => {
  for (const res of sseClients) {
    try {
      res.write(': keepalive\n\n');
    } catch (_) {
      sseClients.delete(res);
    }
  }
}, 20000);

/* ===================== HTTP HELPERS ===================== */

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8').trim();
        resolve(text ? JSON.parse(text) : {});
      } catch (_) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function computeStats() {
  const activeOrders = store.orders.filter((o) => o.status !== 'cancelled');
  let revenue = 0;
  const byMethod = {};
  const itemCounts = {};
  let ratingSum = 0;
  let ratingCount = 0;

  for (const o of activeOrders) {
    const tot = Number(o.pricing && o.pricing.total) || 0;
    revenue += tot;
    const m = (o.payment && o.payment.method) || 'QRIS';
    byMethod[m] = (byMethod[m] || 0) + tot;

    for (const it of o.items || []) {
      const k = it.name || it.itemId;
      itemCounts[k] = (itemCounts[k] || 0) + (Number(it.qty) || 1);
    }

    if (o.rating && typeof o.rating.stars === 'number') {
      ratingSum += o.rating.stars;
      ratingCount += 1;
    }
  }

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, qty]) => ({ name, qty }));

  return {
    totalOrders: activeOrders.length,
    revenue,
    avgTicket: activeOrders.length ? Math.round(revenue / activeOrders.length) : 0,
    avgRating: ratingCount ? Number((ratingSum / ratingCount).toFixed(1)) : null,
    ratingCount,
    byMethod,
    topItems,
  };
}

function applyTierProgression(member) {
  if (member.points >= 1000) {
    member.tier = 'Obsidian VIP';
    member.nextTier = 'Botanical Legend';
    member.nextTierPoints = 2500;
  } else {
    member.tier = 'Emerald Member';
    member.nextTier = 'Obsidian VIP';
    member.nextTierPoints = 1000;
  }
}

/* ===================== API ROUTER ===================== */

async function handleApi(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // GET /api/health
  if (method === 'GET' && pathname === '/api/health') {
    const lanIp = getLanIp();
    sendJson(res, 200, {
      ok: true,
      mode: 'FULLSTACK_SSE',
      port: PORT,
      lanUrl: `http://${lanIp}:${PORT}`,
      clients: sseClients.size,
      ordersCount: store.orders.length,
    });
    return;
  }

  // GET /api/state
  if (method === 'GET' && pathname === '/api/state') {
    sendJson(res, 200, {
      orders: store.orders,
      stock: store.stock,
      member: store.member,
      theme: store.theme,
      stats: computeStats(),
    });
    return;
  }

  // GET /api/events (SSE stream)
  if (method === 'GET' && pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', at: Date.now() })}\n\n`);
    sseClients.add(res);
    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // POST /api/orders (Create Customer Web or Walk-in POS Order)
  if (method === 'POST' && pathname === '/api/orders') {
    try {
      const body = await readJsonBody(req);
      if (!Array.isArray(body.items) || body.items.length === 0) {
        sendJson(res, 400, { error: 'Order must contain at least 1 item' });
        return;
      }

      // Check live stock on server
      for (const it of body.items) {
        const st = store.stock[it.itemId];
        if (st && st.available === false) {
          sendJson(res, 409, { error: `${it.name || it.itemId} is currently Sold Out` });
          return;
        }
      }

      const nowIso = new Date().toISOString();
      store.counter = (Number(store.counter) || 41) + 1;
      const orderId = 'GG-' + String(store.counter).padStart(3, '0');

      const order = {
        orderId,
        createdAt: nowIso,
        updatedAt: nowIso,
        source: body.source || 'CUSTOMER_WEB_MOBILE',
        outletId: body.outletId || 'senopati',
        outletName: body.outletName || 'Senopati Flagship',
        status: 'received',
        statusHistory: [{ status: 'received', at: nowIso, actor: body.source === 'POS_COUNTER' ? 'POS_CASHIER' : 'CUSTOMER' }],
        orderMode: body.orderMode || 'dine-in',
        tableNumber: body.orderMode === 'dine-in' ? body.tableNumber || '07' : null,
        pickupTime: body.orderMode === 'pickup' ? body.pickupTime || 'Now (~5 min)' : null,
        deliveryAddress: body.orderMode === 'delivery' ? String(body.deliveryAddress || '').slice(0, 140) : null,
        mergedCount: 1,
        customer: body.customer || { name: 'Walk-in Guest', tier: 'Guest', memberId: null },
        items: body.items,
        pricing: body.pricing || { subtotal: 0, deliveryFee: 0, voucherCode: null, discount: 0, total: 0, pointsEarned: 0 },
        payment: Object.assign({ status: 'PAID', paidAt: nowIso }, body.payment || { method: 'QRIS' }),
        rating: null,
      };

      // Update member profile atomically if customer web order
      if (order.source === 'CUSTOMER_WEB_MOBILE' && body.memberUpdate) {
        const mu = body.memberUpdate;
        if (typeof mu.deductBalance === 'number' && mu.deductBalance > 0) {
          if (store.member.ggPayBalance < mu.deductBalance) {
            sendJson(res, 400, { error: 'Insufficient GG Pay balance' });
            return;
          }
          store.member.ggPayBalance -= mu.deductBalance;
        }
        if (typeof mu.deductPoints === 'number' && mu.deductPoints > 0) {
          store.member.points = Math.max(0, store.member.points - mu.deductPoints);
        }
        if (typeof mu.addPoints === 'number' && mu.addPoints > 0) {
          store.member.points += mu.addPoints;
        }
        // Increment stamp card (1 stamp per order; resets after hitting target and grants Free Brew reward!)
        store.member.stamps = (Number(store.member.stamps) || 0) + 1;
        if (store.member.stamps >= (store.member.stampsTarget || 5)) {
          store.member.stamps = 0;
          const freeCode = 'STAMPFREE-' + String(store.counter);
          store.member.unlockedRewards.push({
            code: freeCode,
            title: 'Stamp Mission Free Drink!',
            desc: 'Rp45.000 off any drink (5-brew mission reward)',
            type: 'flat',
            value: 45000,
            maxDiscount: 45000,
            minSpend: 0,
            badge: 'STAMP REWARD',
          });
        }
        // Mark redeemed reward voucher as consumed if used
        if (order.pricing.voucherCode) {
          store.member.unlockedRewards = store.member.unlockedRewards.filter(
            (r) => r.code !== order.pricing.voucherCode
          );
        }
        applyTierProgression(store.member);
      }

      store.orders.unshift(order);
      saveStore(store);

      broadcastSSE({ type: 'ORDER_CREATED', order, member: store.member, at: Date.now() });
      sendJson(res, 201, { order, member: store.member });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // POST /api/orders/:id/merge
  const mergeMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9-]+)\/merge$/);
  if (method === 'POST' && mergeMatch) {
    try {
      const orderId = mergeMatch[1];
      const target = store.orders.find((o) => o.orderId === orderId);
      if (!target) {
        sendJson(res, 404, { error: 'Order not found' });
        return;
      }
      const body = await readJsonBody(req);
      const nowIso = new Date().toISOString();
      const addedItems = Array.isArray(body.items) ? body.items : [];
      if (addedItems.length === 0) {
        sendJson(res, 400, { error: 'No items to merge' });
        return;
      }

      target.items = target.items.concat(addedItems);
      target.mergedCount = (target.mergedCount || 1) + 1;
      const p = body.pricing || {};
      target.pricing.subtotal += Number(p.subtotal) || 0;
      target.pricing.discount += Number(p.discount) || 0;
      target.pricing.total += Number(p.total) || 0;
      target.pricing.pointsEarned += Number(p.pointsEarned) || 0;
      if (p.voucherCode) target.pricing.voucherCode = p.voucherCode;
      target.updatedAt = nowIso;

      if (body.payment) {
        target.payment.mergedPayments = target.payment.mergedPayments || [];
        target.payment.mergedPayments.push(
          Object.assign({ paidAt: nowIso, amount: Number(p.total) || 0 }, body.payment)
        );
      }

      if (target.status === 'ready') {
        target.status = 'preparing';
        target.statusHistory.push({ status: 'preparing', at: nowIso, actor: 'CUSTOMER_MERGE' });
      }

      if (body.memberUpdate) {
        const mu = body.memberUpdate;
        if (typeof mu.deductBalance === 'number' && mu.deductBalance > 0) {
          store.member.ggPayBalance = Math.max(0, store.member.ggPayBalance - mu.deductBalance);
        }
        if (typeof mu.deductPoints === 'number' && mu.deductPoints > 0) {
          store.member.points = Math.max(0, store.member.points - mu.deductPoints);
        }
        if (typeof mu.addPoints === 'number' && mu.addPoints > 0) {
          store.member.points += mu.addPoints;
        }
        applyTierProgression(store.member);
      }

      saveStore(store);
      broadcastSSE({ type: 'ORDER_MERGED', order: target, member: store.member, at: Date.now() });
      sendJson(res, 200, { order: target, member: store.member });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // PATCH /api/orders/:id/status
  const statusMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9-]+)\/status$/);
  if (method === 'PATCH' && statusMatch) {
    try {
      const orderId = statusMatch[1];
      const target = store.orders.find((o) => o.orderId === orderId);
      if (!target) {
        sendJson(res, 404, { error: 'Order not found' });
        return;
      }
      const body = await readJsonBody(req);
      const nextStatus = body.status;
      if (!VALID_STATUSES.has(nextStatus)) {
        sendJson(res, 400, { error: 'Invalid status' });
        return;
      }

      // Refund GG Pay if customer cancels before preparation starts
      if (nextStatus === 'cancelled' && target.status !== 'received' && body.actor === 'CUSTOMER') {
        sendJson(res, 409, { error: 'Order is already being prepared and cannot be cancelled' });
        return;
      }
      if (nextStatus === 'cancelled' && target.payment && target.payment.method === 'GG Pay') {
        store.member.ggPayBalance += Number(target.pricing.total) || 0;
      }

      const nowIso = new Date().toISOString();
      target.status = nextStatus;
      target.updatedAt = nowIso;
      target.statusHistory = target.statusHistory || [];
      target.statusHistory.push({ status: nextStatus, at: nowIso, actor: body.actor || 'POS_BARISTA' });

      saveStore(store);
      broadcastSSE({
        type: 'ORDER_STATUS_UPDATED',
        orderId,
        status: nextStatus,
        order: target,
        member: store.member,
        actor: body.actor || 'POS_BARISTA',
        at: Date.now(),
      });
      sendJson(res, 200, { order: target, member: store.member });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // POST /api/orders/:id/rating
  const ratingMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9-]+)\/rating$/);
  if (method === 'POST' && ratingMatch) {
    try {
      const orderId = ratingMatch[1];
      const target = store.orders.find((o) => o.orderId === orderId);
      if (!target) {
        sendJson(res, 404, { error: 'Order not found' });
        return;
      }
      const body = await readJsonBody(req);
      const stars = Math.max(1, Math.min(5, Math.round(Number(body.stars) || 5)));
      const comment = String(body.comment || '').trim().slice(0, 140);
      target.rating = { stars, comment, at: new Date().toISOString() };
      saveStore(store);

      broadcastSSE({ type: 'ORDER_RATED', orderId, rating: target.rating, order: target, at: Date.now() });
      sendJson(res, 200, { order: target });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // PATCH /api/stock/:itemId
  const stockMatch = pathname.match(/^\/api\/stock\/([a-z0-9-]+)$/);
  if (method === 'PATCH' && stockMatch) {
    try {
      const itemId = stockMatch[1];
      const body = await readJsonBody(req);
      const available = Boolean(body.available);
      store.stock[itemId] = { available, updatedAt: new Date().toISOString() };
      saveStore(store);

      broadcastSSE({ type: 'STOCK_UPDATED', itemId, available, stock: store.stock, at: Date.now() });
      sendJson(res, 200, { itemId, available, stock: store.stock });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // PATCH /api/member (Favorites, Top-up, Redeem Reward)
  if (method === 'PATCH' && pathname === '/api/member') {
    try {
      const body = await readJsonBody(req);
      if (Array.isArray(body.favorites)) {
        store.member.favorites = body.favorites.slice(0, 40);
      }
      if (typeof body.topUpAmount === 'number' && body.topUpAmount > 0 && body.topUpAmount <= 2000000) {
        store.member.ggPayBalance += Math.round(body.topUpAmount);
      }
      if (body.redeemReward && typeof body.redeemReward.cost === 'number') {
        const cost = Math.round(body.redeemReward.cost);
        if (store.member.points < cost) {
          sendJson(res, 400, { error: 'Not enough points to redeem this reward' });
          return;
        }
        store.member.points -= cost;
        store.member.unlockedRewards.push(body.redeemReward.voucher);
        applyTierProgression(store.member);
      }
      saveStore(store);
      broadcastSSE({ type: 'MEMBER_UPDATED', member: store.member, at: Date.now() });
      sendJson(res, 200, { member: store.member });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // PATCH /api/theme
  if (method === 'PATCH' && pathname === '/api/theme') {
    try {
      const body = await readJsonBody(req);
      store.theme = body.theme === 'dark' ? 'dark' : 'light';
      saveStore(store);
      broadcastSSE({ type: 'THEME_CHANGED', theme: store.theme, at: Date.now() });
      sendJson(res, 200, { theme: store.theme });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  sendJson(res, 404, { error: 'API endpoint not found' });
}

/* ===================== STATIC FILE SERVER ===================== */

function serveStatic(req, res, parsedUrl) {
  let reqPath = decodeURIComponent(parsedUrl.pathname || '/');
  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(path.join(ROOT_DIR, reqPath));
  if (!safePath.startsWith(ROOT_DIR) || safePath.startsWith(DATA_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': ext === '.png' || ext === '.jpg' ? 'public, max-age=3600' : 'no-store, no-cache, must-revalidate',
    });
    fs.createReadStream(safePath).pipe(res);
  });
}

/* ===================== SERVER BOOT ===================== */

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (parsedUrl.pathname.startsWith('/api/')) {
    handleApi(req, res, parsedUrl);
  } else {
    serveStatic(req, res, parsedUrl);
  }
});

server.listen(PORT, HOST, () => {
  const lanIp = getLanIp();
  console.log(`GOOD GIRL Full-Stack Café & Live POS Server running:`);
  console.log(`  Local Customer App : http://127.0.0.1:${PORT}/`);
  console.log(`  Local Barista POS  : http://127.0.0.1:${PORT}/pos.html`);
  console.log(`  Wi-Fi Mobile URL   : http://${lanIp}:${PORT}/?table=07`);
});
