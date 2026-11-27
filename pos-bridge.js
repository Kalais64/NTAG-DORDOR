/* ==========================================================================
   GOOD GIRL — Hybrid Full-Stack Real-Time Bridge (REST + SSE + Static Fallback)
   - Automatically detects live Node.js server (/api/health -> FULLSTACK_SSE)
   - Syncs orders, table merges, stock 86/Sold Out, ratings, member & theme
     across real mobile phones & POS terminals in real time!
   - Seamlessly falls back to localStorage + BroadcastChannel on static hosting.
   ========================================================================== */

(function (global) {
  'use strict';

  const STORAGE_ORDERS_KEY = 'gg_pos_orders_v2';
  const STORAGE_STOCK_KEY = 'gg_pos_stock_v2';
  const STORAGE_MEMBER_KEY = 'gg_member_profile_v2';
  const STORAGE_COUNTER_KEY = 'gg_pos_seq_v2';
  const STORAGE_THEME_KEY = 'gg_theme_v1';
  const CHANNEL_NAME = 'good_girl_pos_v2';

  const STATUS_FLOW = ['received', 'preparing', 'ready', 'complete'];

  const STATUS_META = {
    received: {
      step: 1,
      progress: 22,
      heading: 'Order received',
      shortLabel: 'Received',
      eta: '8 min left',
      posAction: 'Start Preparing',
      nextStatus: 'preparing',
    },
    preparing: {
      step: 2,
      progress: 62,
      heading: 'Preparing your order',
      shortLabel: 'Preparing',
      eta: '5 min left',
      posAction: 'Mark Ready',
      nextStatus: 'ready',
    },
    ready: {
      step: 3,
      progress: 88,
      heading: 'Ready to serve!',
      shortLabel: 'Ready',
      eta: 'Pick up at Bar / On the way',
      posAction: 'Serve ✓',
      nextStatus: 'complete',
    },
    complete: {
      step: 4,
      progress: 100,
      heading: 'Order complete',
      shortLabel: 'Complete',
      eta: 'Served • Enjoy your brew!',
      posAction: 'Completed',
      nextStatus: null,
    },
    cancelled: {
      step: 0,
      progress: 0,
      heading: 'Order cancelled',
      shortLabel: 'Cancelled',
      eta: 'Refunded cleanly',
      posAction: 'Cancelled',
      nextStatus: null,
    },
  };

  /* ===================== RUNTIME CACHE & SYNC STATE ===================== */

  const runtime = {
    backendOnline: false,
    lanUrl:
      global.location && global.location.protocol !== 'file:' && global.location.origin !== 'null'
        ? global.location.origin
        : 'http://127.0.0.1:8765',
    orders: null,
    stock: null,
    member: null,
    stats: null,
    sse: null,
    readyPromise: null,
  };

  let channel = null;
  try {
    if ('BroadcastChannel' in global) {
      channel = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch (_) {}

  const listeners = new Set();

  function notify(evt) {
    listeners.forEach((fn) => {
      try {
        fn(evt);
      } catch (err) {
        console.error('[POS Bridge listener]', err);
      }
    });
  }

  function broadcastLocal(evt) {
    notify(evt);
    if (channel) {
      try {
        channel.postMessage(evt);
      } catch (_) {}
    }
  }

  if (channel) {
    channel.addEventListener('message', (msg) => {
      if (msg && msg.data) {
        if (!runtime.backendOnline) hydrateLocalCache();
        notify(msg.data);
      }
    });
  }

  global.addEventListener('storage', (e) => {
    if (
      e.key === STORAGE_ORDERS_KEY ||
      e.key === STORAGE_STOCK_KEY ||
      e.key === STORAGE_MEMBER_KEY ||
      e.key === STORAGE_THEME_KEY
    ) {
      if (!runtime.backendOnline) hydrateLocalCache();
      notify({ type: 'STORAGE_SYNC', key: e.key, at: Date.now() });
    }
  });

  function readLS(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeLS(key, val) {
    try {
      global.localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  function createLocalSeedMember() {
    return {
      name: 'Mochi',
      memberId: 'GG-M-8824',
      tier: 'Emerald Member',
      nextTier: 'Obsidian VIP',
      points: 840,
      nextTierPoints: 1000,
      stamps: 3,
      stampsTarget: 5,
      ggPayBalance: 250000,
      favorites: ['matcha-nitro', 'spirulina-cake', 'biscoff-choco-frappe', 'aren-palm-latte'],
      claimedVouchers: ['MATCHA20', 'FIRSTBREW', 'FREEPASTRY', 'GGVIP10'],
      unlockedRewards: [],
    };
  }

  function createLocalSeedOrders() {
    const now = Date.now();
    const t1 = new Date(now - 3 * 60 * 1000).toISOString();
    const t2 = new Date(now - 90 * 1000).toISOString();
    return [
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
        customer: { name: 'Mochi', tier: 'Emerald Member', memberId: 'GG-M-8824' },
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
        pricing: { subtotal: 42000, deliveryFee: 0, voucherCode: null, discount: 0, total: 42000, pointsEarned: 42 },
        payment: { method: 'QRIS', provider: 'QRIS Instant', reference: 'QRIS-74108841', status: 'PAID', paidAt: t1 },
        rating: null,
      },
    ];
  }

  function hydrateLocalCache() {
    let orders = readLS(STORAGE_ORDERS_KEY, null);
    if (!Array.isArray(orders) || orders.length === 0) {
      orders = createLocalSeedOrders();
      writeLS(STORAGE_ORDERS_KEY, orders);
      writeLS(STORAGE_COUNTER_KEY, 41);
    }
    let member = readLS(STORAGE_MEMBER_KEY, null);
    if (!member) {
      member = createLocalSeedMember();
      writeLS(STORAGE_MEMBER_KEY, member);
    }
    const stock = readLS(STORAGE_STOCK_KEY, {}) || {};
    runtime.orders = orders;
    runtime.member = member;
    runtime.stock = stock;
  }

  hydrateLocalCache();

  /* ===================== THEME SYNC ===================== */

  function getTheme() {
    try {
      const saved = global.localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (_) {}
    return 'light';
  }

  function setTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    try {
      global.localStorage.setItem(STORAGE_THEME_KEY, next);
    } catch (_) {}
    document.documentElement.dataset.theme = next;
    broadcastLocal({ type: 'THEME_CHANGED', theme: next, at: Date.now() });

    if (runtime.backendOnline) {
      fetch('/api/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: next }),
      }).catch(() => {});
    }
    return next;
  }

  document.documentElement.dataset.theme = getTheme();

  /* ===================== BACKEND BOOT & SSE ===================== */

  async function pullBackendState() {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) throw new Error('State fetch failed');
    const data = await res.json();
    runtime.orders = data.orders || [];
    runtime.stock = data.stock || {};
    runtime.member = data.member || createLocalSeedMember();
    runtime.stats = data.stats || null;
    if (data.theme && !global.localStorage.getItem(STORAGE_THEME_KEY)) {
      document.documentElement.dataset.theme = data.theme;
    }
    notify({ type: 'STATE_SYNCED', at: Date.now() });
  }

  function connectSSE() {
    if (runtime.sse || typeof EventSource === 'undefined') return;
    try {
      const es = new EventSource('/api/events');
      runtime.sse = es;
      es.onmessage = (msg) => {
        try {
          const evt = JSON.parse(msg.data);
          if (evt.type === 'CONNECTED') return;
          if (evt.member) runtime.member = evt.member;
          if (evt.stock) runtime.stock = evt.stock;
          if (evt.type === 'THEME_CHANGED' && evt.theme) {
            try {
              global.localStorage.setItem(STORAGE_THEME_KEY, evt.theme);
            } catch (_) {}
            document.documentElement.dataset.theme = evt.theme;
          }
          // Refresh full orders list smoothly on any order mutation
          if (
            evt.type === 'ORDER_CREATED' ||
            evt.type === 'ORDER_MERGED' ||
            evt.type === 'ORDER_STATUS_UPDATED' ||
            evt.type === 'ORDER_RATED'
          ) {
            pullBackendState()
              .then(() => notify(evt))
              .catch(() => notify(evt));
          } else {
            notify(evt);
          }
        } catch (_) {}
      };
      es.onerror = () => {
        // Browser EventSource auto-reconnects; no spam needed
      };
    } catch (_) {}
  }

  async function initBackend() {
    if (!global.location || global.location.protocol === 'file:') {
      return { online: false };
    }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 950);
      const res = await fetch('/api/health', { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (!res.ok) throw new Error('No backend');
      const health = await res.json();
      if (health && health.ok) {
        runtime.backendOnline = true;
        runtime.lanUrl = health.lanUrl || global.location.origin;
        await pullBackendState();
        connectSSE();
        notify({ type: 'CONNECTION_STATUS', online: true, lanUrl: runtime.lanUrl });
        return { online: true, lanUrl: runtime.lanUrl };
      }
    } catch (_) {
      runtime.backendOnline = false;
    }
    notify({ type: 'CONNECTION_STATUS', online: false, lanUrl: runtime.lanUrl });
    return { online: false };
  }

  runtime.readyPromise = initBackend();

  /* ===================== READ ACCESSORS ===================== */

  function isBackendOnline() {
    return runtime.backendOnline;
  }

  function getLanUrl() {
    return runtime.lanUrl;
  }

  function getOrders() {
    return runtime.orders || [];
  }

  function getActiveOrder(preferredOrderId) {
    const list = getOrders();
    if (preferredOrderId) {
      const exact = list.find((o) => o.orderId === preferredOrderId);
      if (exact) return exact;
    }
    const customerList = list.filter((o) => o.source !== 'POS_COUNTER');
    const pool = customerList.length ? customerList : list;
    return (
      pool.find((o) => o.status !== 'complete' && o.status !== 'cancelled') ||
      pool.find((o) => o.status !== 'cancelled') ||
      pool[0] ||
      null
    );
  }

  function getMember() {
    return runtime.member || createLocalSeedMember();
  }

  function getStockMap() {
    return runtime.stock || {};
  }

  function isItemAvailable(itemId) {
    const entry = (runtime.stock || {})[itemId];
    return !entry || entry.available !== false;
  }

  function getStats() {
    const activeOrders = getOrders().filter((o) => o.status !== 'cancelled');
    let revenue = 0;
    const byMethod = {};
    const itemCounts = {};
    let ratingSum = 0;
    let ratingCount = 0;

    activeOrders.forEach((o) => {
      const tot = Number(o.pricing && o.pricing.total) || 0;
      revenue += tot;
      const m = (o.payment && o.payment.method) || 'QRIS';
      byMethod[m] = (byMethod[m] || 0) + tot;
      (o.items || []).forEach((it) => {
        const k = it.name || it.itemId;
        itemCounts[k] = (itemCounts[k] || 0) + (Number(it.qty) || 1);
      });
      if (o.rating && typeof o.rating.stars === 'number') {
        ratingSum += o.rating.stars;
        ratingCount += 1;
      }
    });

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

  /* ===================== MUTATIONS (HYBRID API OR LOCAL) ===================== */

  function applyLocalTier(m) {
    if (m.points >= 1000) {
      m.tier = 'Obsidian VIP';
      m.nextTier = 'Botanical Legend';
      m.nextTierPoints = 2500;
    } else {
      m.tier = 'Emerald Member';
      m.nextTier = 'Obsidian VIP';
      m.nextTierPoints = 1000;
    }
  }

  async function createOrder(payload) {
    if (runtime.backendOnline) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      if (data.member) runtime.member = data.member;
      await pullBackendState();
      return data.order;
    }

    // Static fallback
    const nowIso = new Date().toISOString();
    const nextNum = (Number(readLS(STORAGE_COUNTER_KEY, 41)) || 41) + 1;
    writeLS(STORAGE_COUNTER_KEY, nextNum);
    const orderId = 'GG-' + String(nextNum).padStart(3, '0');

    const order = {
      orderId,
      createdAt: nowIso,
      updatedAt: nowIso,
      source: payload.source || 'CUSTOMER_WEB_MOBILE',
      outletId: payload.outletId || 'senopati',
      outletName: payload.outletName || 'Senopati Flagship',
      status: 'received',
      statusHistory: [{ status: 'received', at: nowIso, actor: payload.source === 'POS_COUNTER' ? 'POS_CASHIER' : 'CUSTOMER' }],
      orderMode: payload.orderMode || 'dine-in',
      tableNumber: payload.orderMode === 'dine-in' ? payload.tableNumber || '07' : null,
      pickupTime: payload.orderMode === 'pickup' ? payload.pickupTime || 'Now (~5 min)' : null,
      deliveryAddress: payload.orderMode === 'delivery' ? payload.deliveryAddress || '' : null,
      mergedCount: 1,
      customer: payload.customer,
      items: payload.items,
      pricing: payload.pricing,
      payment: Object.assign({ status: 'PAID', paidAt: nowIso }, payload.payment),
      rating: null,
    };

    if (order.source === 'CUSTOMER_WEB_MOBILE' && payload.memberUpdate) {
      const m = getMember();
      const mu = payload.memberUpdate;
      if (mu.deductBalance) m.ggPayBalance = Math.max(0, m.ggPayBalance - mu.deductBalance);
      if (mu.deductPoints) m.points = Math.max(0, m.points - mu.deductPoints);
      if (mu.addPoints) m.points += mu.addPoints;
      m.stamps = (m.stamps || 0) + 1;
      if (m.stamps >= (m.stampsTarget || 5)) {
        m.stamps = 0;
        m.unlockedRewards = m.unlockedRewards || [];
        m.unlockedRewards.push({
          code: 'STAMPFREE-' + String(nextNum),
          title: 'Stamp Mission Free Drink!',
          desc: 'Rp45.000 off any drink (5-brew mission reward)',
          type: 'flat',
          value: 45000,
          maxDiscount: 45000,
          minSpend: 0,
          badge: 'STAMP REWARD',
        });
      }
      if (order.pricing.voucherCode && Array.isArray(m.unlockedRewards)) {
        m.unlockedRewards = m.unlockedRewards.filter((r) => r.code !== order.pricing.voucherCode);
      }
      applyLocalTier(m);
      runtime.member = m;
      writeLS(STORAGE_MEMBER_KEY, m);
    }

    runtime.orders.unshift(order);
    writeLS(STORAGE_ORDERS_KEY, runtime.orders);
    broadcastLocal({ type: 'ORDER_CREATED', order, member: runtime.member, at: Date.now() });
    return order;
  }

  async function mergeIntoOrder(orderId, addedItems, extraPricing, paymentInfo, memberUpdate) {
    if (runtime.backendOnline) {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: addedItems, pricing: extraPricing, payment: paymentInfo, memberUpdate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to merge order');
      if (data.member) runtime.member = data.member;
      await pullBackendState();
      return data.order;
    }

    const target = runtime.orders.find((o) => o.orderId === orderId);
    if (!target) throw new Error('Order not found');
    const nowIso = new Date().toISOString();
    target.items = target.items.concat(addedItems);
    target.mergedCount = (target.mergedCount || 1) + 1;
    target.pricing.subtotal += extraPricing.subtotal || 0;
    target.pricing.discount += extraPricing.discount || 0;
    target.pricing.total += extraPricing.total || 0;
    target.pricing.pointsEarned += extraPricing.pointsEarned || 0;
    target.updatedAt = nowIso;
    if (target.status === 'ready') target.status = 'preparing';
    if (memberUpdate) {
      const m = getMember();
      if (memberUpdate.deductBalance) m.ggPayBalance = Math.max(0, m.ggPayBalance - memberUpdate.deductBalance);
      if (memberUpdate.deductPoints) m.points = Math.max(0, m.points - memberUpdate.deductPoints);
      if (memberUpdate.addPoints) m.points += memberUpdate.addPoints;
      applyLocalTier(m);
      writeLS(STORAGE_MEMBER_KEY, m);
    }
    writeLS(STORAGE_ORDERS_KEY, runtime.orders);
    broadcastLocal({ type: 'ORDER_MERGED', order: target, member: runtime.member, at: Date.now() });
    return target;
  }

  async function updateOrderStatus(orderId, status, actor) {
    if (runtime.backendOnline) {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actor: actor || 'POS_BARISTA' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      if (data.member) runtime.member = data.member;
      await pullBackendState();
      return data.order;
    }

    const target = runtime.orders.find((o) => o.orderId === orderId);
    if (!target) return null;
    if (status === 'cancelled' && target.payment && target.payment.method === 'GG Pay') {
      runtime.member.ggPayBalance += Number(target.pricing.total) || 0;
      writeLS(STORAGE_MEMBER_KEY, runtime.member);
    }
    const nowIso = new Date().toISOString();
    target.status = status;
    target.updatedAt = nowIso;
    target.statusHistory = target.statusHistory || [];
    target.statusHistory.push({ status, at: nowIso, actor: actor || 'POS_BARISTA' });
    writeLS(STORAGE_ORDERS_KEY, runtime.orders);
    broadcastLocal({ type: 'ORDER_STATUS_UPDATED', orderId, status, order: target, actor: actor || 'POS_BARISTA', at: Date.now() });
    return target;
  }

  async function submitRating(orderId, stars, comment) {
    if (runtime.backendOnline) {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
      await pullBackendState();
      return data.order;
    }

    const target = runtime.orders.find((o) => o.orderId === orderId);
    if (!target) return null;
    target.rating = { stars, comment, at: new Date().toISOString() };
    writeLS(STORAGE_ORDERS_KEY, runtime.orders);
    broadcastLocal({ type: 'ORDER_RATED', orderId, rating: target.rating, order: target, at: Date.now() });
    return target;
  }

  async function setItemStock(itemId, available) {
    if (runtime.backendOnline) {
      const res = await fetch(`/api/stock/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: Boolean(available) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Stock update failed');
      runtime.stock = data.stock;
      notify({ type: 'STOCK_UPDATED', itemId, available: Boolean(available), stock: runtime.stock });
      return data.stock;
    }

    runtime.stock[itemId] = { available: Boolean(available), updatedAt: new Date().toISOString() };
    writeLS(STORAGE_STOCK_KEY, runtime.stock);
    broadcastLocal({ type: 'STOCK_UPDATED', itemId, available: Boolean(available), stock: runtime.stock, at: Date.now() });
    return runtime.stock;
  }

  async function updateMember(patch) {
    if (runtime.backendOnline) {
      const res = await fetch('/api/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Member update failed');
      runtime.member = data.member;
      notify({ type: 'MEMBER_UPDATED', member: runtime.member });
      return runtime.member;
    }

    const m = getMember();
    if (Array.isArray(patch.favorites)) m.favorites = patch.favorites;
    if (patch.topUpAmount) m.ggPayBalance += patch.topUpAmount;
    if (patch.redeemReward) {
      if (m.points < patch.redeemReward.cost) throw new Error('Not enough points');
      m.points -= patch.redeemReward.cost;
      m.unlockedRewards = m.unlockedRewards || [];
      m.unlockedRewards.push(patch.redeemReward.voucher);
      applyLocalTier(m);
    }
    runtime.member = m;
    writeLS(STORAGE_MEMBER_KEY, m);
    broadcastLocal({ type: 'MEMBER_UPDATED', member: m, at: Date.now() });
    return m;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  global.GOOD_GIRL_POS = {
    STATUS_FLOW,
    STATUS_META,
    ready: runtime.readyPromise,
    isBackendOnline,
    getLanUrl,
    getTheme,
    setTheme,
    getOrders,
    getActiveOrder,
    getMember,
    getStockMap,
    isItemAvailable,
    getStats,
    createOrder,
    mergeIntoOrder,
    updateOrderStatus,
    submitRating,
    setItemStock,
    updateMember,
    subscribe,
  };
})(window);
