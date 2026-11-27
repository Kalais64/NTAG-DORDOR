(() => {
  'use strict';

  const DATA = window.GOOD_GIRL_DATA;
  const POS = window.GOOD_GIRL_POS;

  const SUN_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
  const MOON_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`;

  const state = {
    activeTab: 'kanban',
    cashierCategory: 'all',
    registerCart: [],
  };

  const lanes = {
    received: document.getElementById('lane-received'),
    preparing: document.getElementById('lane-preparing'),
    ready: document.getElementById('lane-ready'),
    complete: document.getElementById('lane-complete'),
  };

  const counts = {
    received: document.getElementById('count-received'),
    preparing: document.getElementById('count-preparing'),
    ready: document.getElementById('count-ready'),
    complete: document.getElementById('count-complete'),
  };

  const el = {
    posConnDot: document.getElementById('posConnDot'),
    posConnText: document.getElementById('posConnText'),
    tabBtns: Array.from(document.querySelectorAll('.pos-tab-btn')),
    panels: {
      kanban: document.getElementById('panel-kanban'),
      cashier: document.getElementById('panel-cashier'),
      stock: document.getElementById('panel-stock'),
      sales: document.getElementById('panel-sales'),
    },
    kpiActive: document.getElementById('kpiActive'),
    kpiReady: document.getElementById('kpiReady'),
    kpiServed: document.getElementById('kpiServed'),
    kpiSoldOut: document.getElementById('kpiSoldOut'),
    kpiRating: document.getElementById('kpiRating'),
    kpiRevenue: document.getElementById('kpiRevenue'),
    simOrderBtn: document.getElementById('simOrderBtn'),
    posThemeToggle: document.getElementById('posThemeToggle'),
    posThemeIcon: document.getElementById('posThemeIcon'),
    posThemeLabel: document.getElementById('posThemeLabel'),

    // Cashier
    cashierCatBar: document.getElementById('cashierCatBar'),
    cashierMenuGrid: document.getElementById('cashierMenuGrid'),
    regGuestName: document.getElementById('regGuestName'),
    regMode: document.getElementById('regMode'),
    regTable: document.getElementById('regTable'),
    regPayMethod: document.getElementById('regPayMethod'),
    registerItems: document.getElementById('registerItems'),
    registerTotal: document.getElementById('registerTotal'),
    clearRegisterBtn: document.getElementById('clearRegisterBtn'),
    submitCounterOrderBtn: document.getElementById('submitCounterOrderBtn'),

    // Stock
    stockGrid: document.getElementById('stockGrid'),
    restockAllBtn: document.getElementById('restockAllBtn'),

    // Sales & QR
    salesMethodBars: document.getElementById('salesMethodBars'),
    salesTopItems: document.getElementById('salesTopItems'),
    lanQrLink: document.getElementById('lanQrLink'),
    copyLanLinkBtn: document.getElementById('copyLanLinkBtn'),
    salesQrSvgBox: document.getElementById('salesQrSvgBox'),

    // Modal & Toast
    jsonModalBackdrop: document.getElementById('jsonModalBackdrop'),
    jsonModalTitle: document.getElementById('jsonModalTitle'),
    jsonModalContent: document.getElementById('jsonModalContent'),
    copyJsonBtn: document.getElementById('copyJsonBtn'),
    closeJsonModal: document.getElementById('closeJsonModal'),
    posToast: document.getElementById('posToast'),
  };

  let activeJsonText = '';
  let toastTimer = null;

  function showToast(msg) {
    el.posToast.textContent = msg;
    el.posToast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.posToast.classList.remove('is-visible'), 2500);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function timeAgo(iso) {
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  function buildQrSvg(seed) {
    const size = 21;
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
    const finderCell = (r, c) => {
      const lr = r >= size - 7 ? r - (size - 7) : r;
      const lc = c >= size - 7 ? c - (size - 7) : c;
      return lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
    };
    const rects = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let on = false;
        if (isFinder(r, c)) on = finderCell(r, c);
        else if (r === 6 || c === 6) on = (r + c) % 2 === 0;
        else {
          hash = Math.imul(hash ^ (r * 31 + c * 17), 16777619) >>> 0;
          on = (hash & 3) !== 0 && (hash & 1) === 1;
        }
        if (on) rects.push(`<rect x="${c * 6}" y="${r * 6}" width="5.6" height="5.6" rx="1.2" fill="#0e2216"/>`);
      }
    }
    return `<svg width="136" height="136" viewBox="0 0 ${size * 6} ${size * 6}">${rects.join('')}</svg>`;
  }

  function syncConnectionBadge() {
    const online = POS.isBackendOnline();
    el.posConnDot.classList.toggle('is-fallback', !online);
    el.posConnText.textContent = online
      ? 'LIVE FULL-STACK SSE • MULTI-DEVICE SYNC'
      : 'BROWSER SYNC • STATIC MODE';
  }

  function syncPosThemeUI() {
    const theme = POS.getTheme();
    document.documentElement.dataset.theme = theme;
    const isLight = theme === 'light';
    el.posThemeIcon.innerHTML = isLight ? SUN_SVG : MOON_SVG;
    el.posThemeLabel.textContent = isLight ? 'Fresh White' : 'Dark Glass';
  }

  function switchPosTab(tab) {
    state.activeTab = tab;
    el.tabBtns.forEach((b) => {
      const active = b.dataset.posTab === tab;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });
    Object.entries(el.panels).forEach(([k, p]) => {
      p.hidden = k !== tab;
      p.classList.toggle('is-active', k === tab);
    });
    if (tab === 'cashier') renderCashier();
    if (tab === 'stock') renderStockGrid();
    if (tab === 'sales') renderSalesPanel();
  }

  /* ===================== TAB 1: KITCHEN KANBAN ===================== */

  function renderAll() {
    syncConnectionBadge();
    renderBoard();
    if (state.activeTab === 'cashier') renderCashier();
    if (state.activeTab === 'stock') renderStockGrid();
    if (state.activeTab === 'sales') renderSalesPanel();
  }

  function renderBoard() {
    const orders = POS.getOrders().filter((o) => o.status !== 'cancelled');
    const grouped = { received: [], preparing: [], ready: [], complete: [] };

    orders.forEach((o) => {
      const bucket = grouped[o.status] ? o.status : 'received';
      grouped[bucket].push(o);
    });

    const stats = POS.getStats();
    const soldOutCount = DATA.MENU_ITEMS.filter((i) => !POS.isItemAvailable(i.id)).length;

    el.kpiActive.textContent = String(grouped.received.length + grouped.preparing.length);
    el.kpiReady.textContent = String(grouped.ready.length);
    el.kpiServed.textContent = String(grouped.complete.length);
    el.kpiSoldOut.textContent = String(soldOutCount);
    el.kpiRating.textContent = stats.avgRating ? `${stats.avgRating} ★` : '—';
    el.kpiRevenue.textContent = DATA.formatRp(stats.revenue);

    POS.STATUS_FLOW.forEach((status) => {
      const list = grouped[status];
      counts[status].textContent = String(list.length);
      lanes[status].innerHTML = '';

      if (list.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'lane-empty';
        empty.textContent = 'No tickets in this stage';
        lanes[status].appendChild(empty);
        return;
      }

      list.forEach((order) => {
        const meta = POS.STATUS_META[order.status];
        const card = document.createElement('article');
        card.className = 'ticket-card';

        let modeText = 'SELF PICK-UP';
        if (order.orderMode === 'dine-in') modeText = `DINE-IN • TABLE ${escapeHtml(order.tableNumber || '07')}`;
        else if (order.orderMode === 'pickup') modeText = `PICK UP • ${escapeHtml(order.pickupTime || 'Now')}`;
        else if (order.orderMode === 'delivery') modeText = 'DELIVERY';

        const mergedBadge = order.mergedCount > 1 ? `<span class="t-pill t-merged">MERGED &times;${order.mergedCount}</span>` : '';
        const sourceBadge = order.source === 'POS_COUNTER' ? `<span class="t-pill t-counter">COUNTER POS</span>` : '';

        const itemsHtml = (order.items || [])
          .map((it) => {
            const mods = [
              it.style,
              it.size,
              it.milk && it.milk !== 'Fresh Dairy' ? it.milk : null,
              it.sugar && it.sugar !== 'Normal' ? it.sugar : null,
              it.ice && it.ice !== 'Normal' ? it.ice : null,
            ]
              .filter(Boolean)
              .join(' • ');
            const addonsHtml =
              Array.isArray(it.addons) && it.addons.length
                ? `<div class="ticket-item-addons">+ ${escapeHtml(it.addons.map((a) => a.label || a).join(', '))}</div>`
                : '';
            const noteHtml = it.note ? `<div class="ticket-item-note">Note: ${escapeHtml(it.note)}</div>` : '';
            return `
              <div class="ticket-item-row">
                <div class="ticket-thumb"><img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.name)}" /></div>
                <div class="ticket-item-body">
                  <div class="ticket-item-name">${it.qty}&times; ${escapeHtml(it.name)}</div>
                  <div class="ticket-item-mods">${escapeHtml(mods || it.volume || '')}</div>
                  ${addonsHtml}
                  ${noteHtml}
                </div>
              </div>
            `;
          })
          .join('');

        const ratingHtml = order.rating
          ? `<div class="ticket-rating-strip">${'★'.repeat(order.rating.stars)} (${order.rating.stars}/5)${order.rating.comment ? ` — "${escapeHtml(order.rating.comment)}"` : ''}</div>`
          : '';

        const advanceBtnHtml = meta.nextStatus
          ? `<button type="button" class="btn-advance ${meta.nextStatus === 'complete' ? 'is-ready-btn' : ''}" data-advance="${escapeHtml(order.orderId)}" data-next="${meta.nextStatus}">${meta.posAction} &rarr;</button>`
          : `<span class="t-pill t-paid">SERVED ✓</span>`;

        card.innerHTML = `
          <div class="ticket-top">
            <div>
              <div class="ticket-id">#${escapeHtml(order.orderId)}</div>
              <div class="ticket-badges">
                <span class="t-pill t-mode">${modeText}</span>
                <span class="t-pill t-paid">PAID • ${escapeHtml(order.payment ? order.payment.method : 'QRIS')}</span>
                ${mergedBadge}
                ${sourceBadge}
              </div>
            </div>
            <span class="ticket-time">${timeAgo(order.updatedAt || order.createdAt)}</span>
          </div>
          <div class="ticket-customer">
            Guest: <strong>${escapeHtml(order.customer ? order.customer.name : 'Guest')}</strong> • ${escapeHtml(order.outletName || 'Senopati Flagship')}
            ${order.deliveryAddress ? `<div class="ticket-address">Deliver to: ${escapeHtml(order.deliveryAddress)}</div>` : ''}
          </div>
          <div class="ticket-items">${itemsHtml}</div>
          ${ratingHtml}
          <div class="ticket-footer">
            <span class="ticket-total">${DATA.formatRp(order.pricing ? order.pricing.total : 0)}</span>
            <div class="ticket-btns">
              <button type="button" class="btn-json" data-json="${escapeHtml(order.orderId)}">JSON</button>
              ${advanceBtnHtml}
            </div>
          </div>
        `;

        card.querySelector('[data-json]').addEventListener('click', () => openJsonModal(order));
        const advBtn = card.querySelector('[data-advance]');
        if (advBtn) {
          advBtn.addEventListener('click', async () => {
            const next = advBtn.dataset.next;
            try {
              await POS.updateOrderStatus(order.orderId, next, 'POS_BARISTA');
              showToast(`#${order.orderId} -> ${POS.STATUS_META[next].shortLabel} (live synced!)`);
              renderAll();
            } catch (err) {
              showToast(err.message);
            }
          });
        }

        lanes[status].appendChild(card);
      });
    });
  }

  /* ===================== TAB 2: COUNTER CASHIER POS ===================== */

  function renderCashier() {
    el.cashierCatBar.innerHTML = '';
    DATA.CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cashier-cat-pill ${state.cashierCategory === cat.id ? 'is-active' : ''}`;
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        state.cashierCategory = cat.id;
        renderCashier();
      });
      el.cashierCatBar.appendChild(btn);
    });

    const filtered = DATA.MENU_ITEMS.filter(
      (i) => state.cashierCategory === 'all' || i.category === state.cashierCategory
    );

    el.cashierMenuGrid.innerHTML = '';
    filtered.forEach((item) => {
      const available = POS.isItemAvailable(item.id);
      const price = DATA.getBasePrice(item);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cashier-item-btn';
      btn.disabled = !available;
      btn.innerHTML = `
        ${!available ? '<span class="soldout-tag">SOLD OUT</span>' : ''}
        <img src="${item.image}" alt="${escapeHtml(item.shortName)}" />
        <strong>${escapeHtml(item.shortName)}</strong>
        <span>${DATA.formatRp(price)}</span>
      `;
      btn.addEventListener('click', () => {
        const sizeKey = DATA.getDefaultSizeKey(item);
        const sz = item.sizes[sizeKey];
        const existing = state.registerCart.find((r) => r.itemId === item.id);
        if (existing) existing.qty += 1;
        else {
          state.registerCart.push({
            sku: `${item.skuPrefix}-${sizeKey.slice(0, 3).toUpperCase()}`,
            itemId: item.id,
            name: item.name,
            category: item.categoryLabel,
            image: item.image,
            style: item.styles[0].label,
            size: sz.label,
            volume: sz.volume,
            milk: item.hasMilk ? 'Fresh Dairy' : null,
            addons: [],
            sugar: item.hasLevels ? 'Normal' : null,
            ice: item.hasLevels ? 'Normal' : null,
            note: '',
            qty: 1,
            unitPrice: sz.price,
          });
        }
        renderRegisterCart();
      });
      el.cashierMenuGrid.appendChild(btn);
    });

    renderRegisterCart();
  }

  function renderRegisterCart() {
    el.registerItems.innerHTML = '';
    let total = 0;

    if (state.registerCart.length === 0) {
      el.registerItems.innerHTML = `<div class="lane-empty">Tap items on the left to ring up a walk-in guest</div>`;
    } else {
      state.registerCart.forEach((r, idx) => {
        total += r.unitPrice * r.qty;
        const row = document.createElement('div');
        row.className = 'reg-row';
        row.innerHTML = `
          <div>
            <strong>${escapeHtml(r.name)}</strong>
            <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(r.size)} • ${DATA.formatRp(r.unitPrice * r.qty)}</div>
          </div>
          <div class="reg-qty-ctrl">
            <button type="button" class="reg-qty-btn" data-d="-1">&minus;</button>
            <strong>${r.qty}</strong>
            <button type="button" class="reg-qty-btn" data-d="1">+</button>
          </div>
        `;
        row.querySelector('[data-d="-1"]').addEventListener('click', () => {
          state.registerCart[idx].qty -= 1;
          if (state.registerCart[idx].qty <= 0) state.registerCart.splice(idx, 1);
          renderRegisterCart();
        });
        row.querySelector('[data-d="1"]').addEventListener('click', () => {
          state.registerCart[idx].qty += 1;
          renderRegisterCart();
        });
        el.registerItems.appendChild(row);
      });
    }

    el.registerTotal.textContent = DATA.formatRp(total);
    el.submitCounterOrderBtn.disabled = state.registerCart.length === 0;
  }

  /* ===================== TAB 3: LIVE STOCK (86) CONTROL ===================== */

  function renderStockGrid() {
    el.stockGrid.innerHTML = '';
    DATA.MENU_ITEMS.forEach((item) => {
      const available = POS.isItemAvailable(item.id);
      const card = document.createElement('div');
      card.className = `stock-card ${available ? '' : 'is-soldout'}`;
      card.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.shortName)}" />
        <div class="stock-info">
          <strong>${escapeHtml(item.shortName)}</strong>
          <small>${escapeHtml(item.categoryLabel)} • ${DATA.formatRp(DATA.getBasePrice(item))}</small>
        </div>
        <button type="button" class="stock-toggle-btn">${available ? 'In Stock' : 'Sold Out (86)'}</button>
      `;
      card.querySelector('.stock-toggle-btn').addEventListener('click', async () => {
        try {
          await POS.setItemStock(item.id, !available);
          showToast(`${item.shortName} marked ${!available ? 'In Stock' : 'Sold Out (86)'} across all phones!`);
          renderAll();
        } catch (err) {
          showToast(err.message);
        }
      });
      el.stockGrid.appendChild(card);
    });
  }

  /* ===================== TAB 4: SALES & MOBILE QR ===================== */

  function renderSalesPanel() {
    const stats = POS.getStats();

    // Payment method breakdown
    const methods = Object.entries(stats.byMethod).sort((a, b) => b[1] - a[1]);
    const maxMethod = methods.length ? methods[0][1] : 1;
    el.salesMethodBars.innerHTML = methods.length
      ? methods
          .map(([m, val]) => {
            const pct = Math.max(8, Math.round((val / maxMethod) * 100));
            return `
              <div>
                <div class="bar-item-head"><span>${escapeHtml(m)}</span><strong>${DATA.formatRp(val)}</strong></div>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
              </div>
            `;
          })
          .join('')
      : `<div class="lane-empty">No completed sales yet</div>`;

    // Top items
    const maxQty = stats.topItems.length ? stats.topItems[0].qty : 1;
    el.salesTopItems.innerHTML = stats.topItems.length
      ? stats.topItems
          .map((it) => {
            const pct = Math.max(12, Math.round((it.qty / maxQty) * 100));
            return `
              <div>
                <div class="bar-item-head"><span>${escapeHtml(it.name)}</span><strong>${it.qty}&times; sold</strong></div>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
              </div>
            `;
          })
          .join('')
      : `<div class="lane-empty">No items ordered yet</div>`;

    const mobileUrl = `${POS.getLanUrl()}/?table=07&outlet=senopati`;
    el.lanQrLink.textContent = mobileUrl;
    el.salesQrSvgBox.innerHTML = buildQrSvg(mobileUrl);
  }

  /* ===================== SIMULATE WEB ORDER & JSON MODAL ===================== */

  async function simulateWebOrder() {
    const availableDrinks = DATA.MENU_ITEMS.filter((i) => i.itemType === 'drink' && POS.isItemAvailable(i.id));
    const availableFoods = DATA.MENU_ITEMS.filter((i) => (i.itemType === 'food' || i.itemType === 'pastry') && POS.isItemAvailable(i.id));
    const d1 = availableDrinks[Math.floor(Math.random() * availableDrinks.length)] || DATA.MENU_ITEMS[0];
    const d2 = availableFoods[Math.floor(Math.random() * availableFoods.length)] || DATA.getItemById('matcha-mochi');
    const s1 = d1.sizes.medium;
    const s2 = d2.sizes.small;
    const addon = d1.hasMilk ? [{ id: 'cheese-foam', label: 'Sea Salt Cheese Foam', price: 9000 }] : [];
    const d1Unit = s1.price + (addon[0] ? addon[0].price : 0);
    const subtotal = d1Unit + s2.price;

    try {
      const order = await POS.createOrder({
        source: 'CUSTOMER_WEB_MOBILE',
        outletId: 'senopati',
        outletName: 'Senopati Flagship',
        orderMode: Math.random() > 0.35 ? 'dine-in' : 'pickup',
        tableNumber: String(2 + Math.floor(Math.random() * 14)).padStart(2, '0'),
        pickupTime: 'Now (~5 min)',
        customer: { name: ['Alya', 'Raka', 'Kira', 'Mochi'][Math.floor(Math.random() * 4)], tier: 'Emerald Member', memberId: 'GG-M-8824' },
        items: [
          {
            sku: `${d1.skuPrefix}-MED-ICE`,
            itemId: d1.id,
            name: d1.name,
            category: d1.categoryLabel,
            image: d1.image,
            style: d1.styles[0].label,
            size: s1.label,
            volume: s1.volume,
            milk: d1.hasMilk ? 'Oatside Oat' : null,
            addons: addon,
            sugar: 'Less Sugar',
            ice: 'Normal',
            note: 'Extra creamy foam please',
            qty: 1,
            unitPrice: d1Unit,
            lineTotal: d1Unit,
          },
          {
            sku: `${d2.skuPrefix}-SM`,
            itemId: d2.id,
            name: d2.name,
            category: d2.categoryLabel,
            image: d2.image,
            style: d2.styles[0].label,
            size: s2.label,
            volume: s2.volume,
            milk: null,
            addons: [],
            sugar: null,
            ice: null,
            note: '',
            qty: 1,
            unitPrice: s2.price,
            lineTotal: s2.price,
          },
        ],
        pricing: { subtotal, deliveryFee: 0, voucherCode: null, discount: 0, total: subtotal, pointsEarned: Math.round(subtotal / 1000) },
        payment: { method: ['QRIS', 'GoPay', 'BCA VA'][Math.floor(Math.random() * 3)], provider: 'Simulated Web Gateway', reference: 'PAY-' + Math.floor(10000000 + Math.random() * 89999999) },
      });
      showToast(`New web order #${order.orderId} received!`);
      renderAll();
    } catch (err) {
      showToast(err.message);
    }
  }

  function openJsonModal(order) {
    activeJsonText = JSON.stringify(order, null, 2);
    el.jsonModalTitle.textContent = `POS Payload — #${order.orderId}`;
    el.jsonModalContent.textContent = activeJsonText;
    el.jsonModalBackdrop.classList.add('is-open');
    el.jsonModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeJson() {
    el.jsonModalBackdrop.classList.remove('is-open');
    el.jsonModalBackdrop.setAttribute('aria-hidden', 'true');
  }

  /* ===================== EVENTS ===================== */

  el.tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchPosTab(btn.dataset.posTab));
  });

  el.posThemeToggle.addEventListener('click', () => {
    const next = POS.getTheme() === 'light' ? 'dark' : 'light';
    POS.setTheme(next);
    syncPosThemeUI();
    showToast(next === 'light' ? 'Theme: Fresh White & Matcha Green' : 'Theme: Dark Liquid Glass');
  });

  el.simOrderBtn.addEventListener('click', simulateWebOrder);

  el.clearRegisterBtn.addEventListener('click', () => {
    state.registerCart = [];
    renderRegisterCart();
  });

  el.submitCounterOrderBtn.addEventListener('click', async () => {
    if (state.registerCart.length === 0) return;
    const subtotal = state.registerCart.reduce((acc, r) => acc + r.unitPrice * r.qty, 0);
    const mode = el.regMode.value;
    const payMethod = el.regPayMethod.value;

    try {
      const order = await POS.createOrder({
        source: 'POS_COUNTER',
        outletId: 'senopati',
        outletName: 'Senopati Flagship',
        orderMode: mode,
        tableNumber: mode === 'dine-in' ? (el.regTable.value || '04').padStart(2, '0') : null,
        pickupTime: mode === 'pickup' ? 'Counter Now' : null,
        customer: { name: (el.regGuestName.value || 'Walk-in Guest').trim(), tier: 'Walk-In', memberId: null },
        items: state.registerCart.map((r) => Object.assign({}, r, { lineTotal: r.unitPrice * r.qty })),
        pricing: { subtotal, deliveryFee: 0, voucherCode: null, discount: 0, total: subtotal, pointsEarned: 0 },
        payment: { method: payMethod, provider: 'Counter Cashier POS', reference: 'POS-' + Math.floor(100000 + Math.random() * 899999) },
      });
      state.registerCart = [];
      renderRegisterCart();
      switchPosTab('kanban');
      renderAll();
      showToast(`Walk-in order #${order.orderId} charged via ${payMethod}!`);
    } catch (err) {
      showToast(err.message);
    }
  });

  el.restockAllBtn.addEventListener('click', async () => {
    for (const item of DATA.MENU_ITEMS) {
      if (!POS.isItemAvailable(item.id)) {
        await POS.setItemStock(item.id, true);
      }
    }
    showToast('All 23 menu items marked In Stock!');
    renderAll();
  });

  el.copyLanLinkBtn.addEventListener('click', () => {
    const txt = el.lanQrLink.textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
    showToast('Mobile QR link copied!');
  });

  el.closeJsonModal.addEventListener('click', closeJson);
  el.jsonModalBackdrop.addEventListener('click', (e) => {
    if (e.target === el.jsonModalBackdrop) closeJson();
  });
  el.copyJsonBtn.addEventListener('click', () => {
    if (navigator.clipboard && activeJsonText) {
      navigator.clipboard.writeText(activeJsonText).then(() => showToast('POS JSON copied'));
    }
  });

  POS.subscribe((evt) => {
    if (evt.type === 'THEME_CHANGED' || evt.type === 'STORAGE_SYNC') syncPosThemeUI();
    renderAll();
    if (evt.type === 'ORDER_CREATED') showToast(`Incoming order #${evt.order.orderId}!`);
    else if (evt.type === 'ORDER_MERGED') showToast(`Add-on merged into #${evt.order.orderId}!`);
    else if (evt.type === 'ORDER_RATED') showToast(`New ${evt.rating.stars}★ rating on #${evt.orderId}!`);
  });

  syncPosThemeUI();
  POS.ready.then(() => renderAll());
  renderAll();
  setInterval(renderBoard, 15000);
})();
