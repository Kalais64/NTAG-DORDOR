/* ==========================================================================
   GOOD GIRL — Real-Time Customer ↔ POS Bridge
   Synchronizes orders, merges, member points & kitchen status via
   localStorage + BroadcastChannel('good_girl_pos_v1') across open tabs.
   ========================================================================== */

(function (global) {
  'use strict';

  const STORAGE_ORDERS_KEY = 'gg_pos_orders_v1';
  const STORAGE_MEMBER_KEY = 'gg_member_profile_v1';
  const STORAGE_COUNTER_KEY = 'gg_pos_seq_v1';
  const CHANNEL_NAME = 'good_girl_pos_v1';

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
      posAction: 'Complete & Served',
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
  };

  let channel = null;
  try {
    if ('BroadcastChannel' in global) {
      channel = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch (_) {
    channel = null;
  }

  const listeners = new Set();

  function notifyLocal(event) {
    listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('[POS Bridge listener error]', err);
      }
    });
  }

  function broadcast(event) {
    notifyLocal(event);
    if (channel) {
      try {
        channel.postMessage(event);
      } catch (_) {}
    }
  }

  if (channel) {
    channel.addEventListener('message', (msg) => {
      if (msg && msg.data) {
        notifyLocal(msg.data);
      }
    });
  }

  global.addEventListener('storage', (e) => {
    if (e.key === STORAGE_ORDERS_KEY || e.key === STORAGE_MEMBER_KEY) {
      notifyLocal({ type: 'STORAGE_SYNC', key: e.key, at: Date.now() });
    }
  });

  function readJSON(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJSON(key, val) {
    try {
      global.localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  /* ===================== MEMBER PROFILE ===================== */

  function getMember() {
    const existing = readJSON(STORAGE_MEMBER_KEY, null);
    if (existing) return existing;

    const initial = {
      name: 'Mochi',
      memberId: 'GG-M-8824',
      tier: 'Emerald Member',
      nextTier: 'Obsidian VIP',
      points: 840,
      nextTierPoints: 1000,
      ggPayBalance: 250000,
      favorites: ['matcha-nitro', 'spirulina-cake', 'biscoff-choco-frappe'],
      claimedVouchers: ['MATCHA20', 'FIRSTBREW', 'FREEPASTRY', 'GGVIP10'],
    };
    writeJSON(STORAGE_MEMBER_KEY, initial);
    return initial;
  }

  function saveMember(patch) {
    const cur = getMember();
    const updated = Object.assign({}, cur, patch);
    if (updated.points >= 1000) {
      updated.tier = 'Obsidian VIP';
      updated.nextTier = 'Botanical Legend';
      updated.nextTierPoints = 2500;
    }
    writeJSON(STORAGE_MEMBER_KEY, updated);
    broadcast({ type: 'MEMBER_UPDATED', member: updated, at: Date.now() });
    return updated;
  }

  /* ===================== SEED INITIAL LIVE ORDER ===================== */

  function seedIfEmpty() {
    const existing = readJSON(STORAGE_ORDERS_KEY, null);
    if (Array.isArray(existing) && existing.length > 0) return existing;

    const now = Date.now();
    const t1 = new Date(now - 3 * 60 * 1000).toISOString();
    const t2 = new Date(now - 90 * 1000).toISOString();

    const seeded = [
      {
        orderId: 'GG-041',
        createdAt: t1,
        updatedAt: t2,
        source: 'CUSTOMER_WEB_MOBILE',
        status: 'preparing',
        statusHistory: [
          { status: 'received', at: t1 },
          { status: 'preparing', at: t2 },
        ],
        orderMode: 'dine-in',
        tableNumber: '07',
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
      },
    ];

    writeJSON(STORAGE_ORDERS_KEY, seeded);
    writeJSON(STORAGE_COUNTER_KEY, 41);
    return seeded;
  }

  function getOrders() {
    return seedIfEmpty();
  }

  function nextOrderId() {
    const cur = Number(readJSON(STORAGE_COUNTER_KEY, 41)) || 41;
    const next = cur + 1;
    writeJSON(STORAGE_COUNTER_KEY, next);
    return 'GG-' + String(next).padStart(3, '0');
  }

  function getActiveOrder() {
    const orders = getOrders();
    return (
      orders.find((o) => o.status !== 'complete') ||
      orders[0] ||
      null
    );
  }

  /* ===================== CREATE / MERGE / UPDATE ORDER ===================== */

  function createOrder(payload) {
    const orders = getOrders();
    const nowIso = new Date().toISOString();
    const orderId = nextOrderId();

    const order = {
      orderId,
      createdAt: nowIso,
      updatedAt: nowIso,
      source: 'CUSTOMER_WEB_MOBILE',
      status: 'received',
      statusHistory: [{ status: 'received', at: nowIso }],
      orderMode: payload.orderMode || 'dine-in',
      tableNumber: payload.orderMode === 'dine-in' ? payload.tableNumber || '07' : null,
      mergedCount: 1,
      customer: payload.customer,
      items: payload.items,
      pricing: payload.pricing,
      payment: Object.assign({ status: 'PAID', paidAt: nowIso }, payload.payment),
    };

    orders.unshift(order);
    writeJSON(STORAGE_ORDERS_KEY, orders);
    broadcast({ type: 'ORDER_CREATED', order, at: Date.now() });
    return order;
  }

  function mergeIntoOrder(orderId, addedItems, extraPricing, paymentInfo) {
    const orders = getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (!target) return null;

    const nowIso = new Date().toISOString();
    target.items = target.items.concat(addedItems);
    target.mergedCount = (target.mergedCount || 1) + 1;
    target.pricing.subtotal += extraPricing.subtotal;
    target.pricing.discount += extraPricing.discount || 0;
    target.pricing.total += extraPricing.total;
    target.pricing.pointsEarned += extraPricing.pointsEarned || 0;
    if (extraPricing.voucherCode) {
      target.pricing.voucherCode = extraPricing.voucherCode;
    }
    target.updatedAt = nowIso;
    if (paymentInfo) {
      target.payment.mergedPayments = target.payment.mergedPayments || [];
      target.payment.mergedPayments.push(
        Object.assign({ paidAt: nowIso, amount: extraPricing.total }, paymentInfo)
      );
    }

    // If order was already ready, move back to preparing so barista prepares added items
    if (target.status === 'ready') {
      target.status = 'preparing';
      target.statusHistory.push({ status: 'preparing', at: nowIso, note: 'Merged add-on items' });
    }

    writeJSON(STORAGE_ORDERS_KEY, orders);
    broadcast({ type: 'ORDER_MERGED', order: target, at: Date.now() });
    return target;
  }

  function updateOrderStatus(orderId, newStatus, actor) {
    if (!STATUS_FLOW.includes(newStatus)) return null;
    const orders = getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (!target) return null;

    const nowIso = new Date().toISOString();
    target.status = newStatus;
    target.updatedAt = nowIso;
    target.statusHistory = target.statusHistory || [];
    target.statusHistory.push({ status: newStatus, at: nowIso, actor: actor || 'POS' });

    writeJSON(STORAGE_ORDERS_KEY, orders);
    broadcast({
      type: 'ORDER_STATUS_UPDATED',
      orderId,
      status: newStatus,
      order: target,
      actor: actor || 'POS',
      at: Date.now(),
    });
    return target;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  global.GOOD_GIRL_POS = {
    STATUS_FLOW,
    STATUS_META,
    getMember,
    saveMember,
    getOrders,
    getActiveOrder,
    createOrder,
    mergeIntoOrder,
    updateOrderStatus,
    subscribe,
  };
})(window);
