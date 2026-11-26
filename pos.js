(() => {
  'use strict';

  const DATA = window.GOOD_GIRL_DATA;
  const POS = window.GOOD_GIRL_POS;

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

  const kpiActive = document.getElementById('kpiActive');
  const kpiReady = document.getElementById('kpiReady');
  const kpiServed = document.getElementById('kpiServed');
  const kpiRevenue = document.getElementById('kpiRevenue');

  const simOrderBtn = document.getElementById('simOrderBtn');
  const posThemeToggle = document.getElementById('posThemeToggle');
  const posThemeIcon = document.getElementById('posThemeIcon');
  const posThemeLabel = document.getElementById('posThemeLabel');
  const jsonModalBackdrop = document.getElementById('jsonModalBackdrop');
  const jsonModalTitle = document.getElementById('jsonModalTitle');
  const jsonModalContent = document.getElementById('jsonModalContent');
  const copyJsonBtn = document.getElementById('copyJsonBtn');
  const closeJsonModal = document.getElementById('closeJsonModal');
  const posToast = document.getElementById('posToast');

  let activeJsonText = '';
  let toastTimer = null;

  function showToast(msg) {
    posToast.textContent = msg;
    posToast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => posToast.classList.remove('is-visible'), 2500);
  }

  function timeAgo(iso) {
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openJsonModal(order) {
    activeJsonText = JSON.stringify(order, null, 2);
    jsonModalTitle.textContent = `POS Payload — #${order.orderId}`;
    jsonModalContent.textContent = activeJsonText;
    jsonModalBackdrop.classList.add('is-open');
    jsonModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeJson() {
    jsonModalBackdrop.classList.remove('is-open');
    jsonModalBackdrop.setAttribute('aria-hidden', 'true');
  }

  function renderBoard() {
    const orders = POS.getOrders();
    const grouped = { received: [], preparing: [], ready: [], complete: [] };

    let totalRevenue = 0;
    orders.forEach((o) => {
      totalRevenue += o.pricing ? o.pricing.total : 0;
      const bucket = grouped[o.status] ? o.status : 'received';
      grouped[bucket].push(o);
    });

    kpiActive.textContent = String(grouped.received.length + grouped.preparing.length);
    kpiReady.textContent = String(grouped.ready.length);
    kpiServed.textContent = String(grouped.complete.length);
    kpiRevenue.textContent = DATA.formatRp(totalRevenue);

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

        const modeText =
          order.orderMode === 'dine-in'
            ? `DINE-IN • TABLE ${escapeHtml(order.tableNumber || '07')}`
            : 'SELF PICK-UP';

        const mergedBadge =
          order.mergedCount > 1
            ? `<span class="t-pill t-merged">MERGED &times;${order.mergedCount}</span>`
            : '';

        const itemsHtml = order.items
          .map((it) => {
            const mods = [it.style, it.size, it.sugar && it.sugar !== 'Normal' ? it.sugar : null, it.ice && it.ice !== 'Normal' ? it.ice : null]
              .filter(Boolean)
              .join(' • ');
            const noteHtml = it.note
              ? `<div class="ticket-item-note">Note: ${escapeHtml(it.note)}</div>`
              : '';
            return `
              <div class="ticket-item-row">
                <div class="ticket-thumb"><img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.name)}" /></div>
                <div class="ticket-item-body">
                  <div class="ticket-item-name">${it.qty}&times; ${escapeHtml(it.name)}</div>
                  <div class="ticket-item-mods">${escapeHtml(mods || it.volume || '')}</div>
                  ${noteHtml}
                </div>
              </div>
            `;
          })
          .join('');

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
              </div>
            </div>
            <span class="ticket-time">${timeAgo(order.updatedAt || order.createdAt)}</span>
          </div>
          <div class="ticket-customer">Guest: <strong>${escapeHtml(order.customer ? order.customer.name : 'Guest')}</strong> • ${escapeHtml(order.customer ? order.customer.tier : 'Member')}</div>
          <div class="ticket-items">${itemsHtml}</div>
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
          advBtn.addEventListener('click', () => {
            const next = advBtn.dataset.next;
            POS.updateOrderStatus(order.orderId, next, 'POS_BARISTA');
            showToast(`#${order.orderId} moved to ${POS.STATUS_META[next].shortLabel} (synced to customer)`);
            renderBoard();
          });
        }

        lanes[status].appendChild(card);
      });
    });
  }

  function simulateWebOrder() {
    const sampleItems = [
      DATA.getItemById('biscoff-choco-frappe'),
      DATA.getItemById('iced-americano'),
      DATA.getItemById('strawberry-matcha-cloud'),
      DATA.getItemById('spirulina-cake'),
      DATA.getItemById('matcha-mochi'),
    ];
    const d1 = sampleItems[Math.floor(Math.random() * 3)];
    const d2 = sampleItems[3 + Math.floor(Math.random() * 2)];
    const s1 = d1.sizes.medium;
    const s2 = d2.sizes.small;
    const tableNo = String(2 + Math.floor(Math.random() * 14)).padStart(2, '0');
    const mode = Math.random() > 0.35 ? 'dine-in' : 'pickup';
    const subtotal = s1.price + s2.price;

    const order = POS.createOrder({
      orderMode: mode,
      tableNumber: tableNo,
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
          sugar: 'Less Sugar',
          ice: 'Normal',
          note: 'Extra creamy foam please',
          qty: 1,
          unitPrice: s1.price,
          lineTotal: s1.price,
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
          sugar: null,
          ice: null,
          note: '',
          qty: 1,
          unitPrice: s2.price,
          lineTotal: s2.price,
        },
      ],
      pricing: {
        subtotal,
        voucherCode: null,
        discount: 0,
        total: subtotal,
        pointsEarned: Math.round(subtotal / 1000),
      },
      payment: {
        method: ['QRIS', 'GoPay', 'BCA VA'][Math.floor(Math.random() * 3)],
        provider: 'Simulated Web Gateway',
        reference: 'PAY-' + Math.floor(10000000 + Math.random() * 89999999),
      },
    });

    showToast(`New web order #${order.orderId} received!`);
    renderBoard();
  }

  function syncPosThemeUI() {
    const theme = POS.getTheme();
    document.documentElement.dataset.theme = theme;
    const isLight = theme === 'light';
    if (posThemeIcon) posThemeIcon.innerHTML = isLight ? '&#9728;' : '&#9790;';
    if (posThemeLabel) posThemeLabel.textContent = isLight ? 'Fresh White' : 'Dark Glass';
  }

  if (posThemeToggle) {
    posThemeToggle.addEventListener('click', () => {
      const next = POS.getTheme() === 'light' ? 'dark' : 'light';
      POS.setTheme(next);
      syncPosThemeUI();
      showToast(next === 'light' ? 'Theme: Fresh White & Matcha Green' : 'Theme: Dark Liquid Glass');
    });
  }

  simOrderBtn.addEventListener('click', simulateWebOrder);
  closeJsonModal.addEventListener('click', closeJson);
  jsonModalBackdrop.addEventListener('click', (e) => {
    if (e.target === jsonModalBackdrop) closeJson();
  });
  copyJsonBtn.addEventListener('click', () => {
    if (navigator.clipboard && activeJsonText) {
      navigator.clipboard.writeText(activeJsonText).then(() => showToast('POS JSON copied to clipboard'));
    } else {
      showToast('Select & copy JSON from inspector');
    }
  });

  POS.subscribe((evt) => {
    if (evt.type === 'THEME_CHANGED' || evt.type === 'STORAGE_SYNC') {
      syncPosThemeUI();
    }
    renderBoard();
    if (evt.type === 'ORDER_CREATED') {
      showToast(`Incoming customer order #${evt.order.orderId}!`);
    } else if (evt.type === 'ORDER_MERGED') {
      showToast(`Table add-on merged into #${evt.order.orderId}!`);
    }
  });

  syncPosThemeUI();
  renderBoard();
  setInterval(renderBoard, 15000);
})();
