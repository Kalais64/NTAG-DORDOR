(() => {
  'use strict';

  const DATA = window.GOOD_GIRL_DATA;
  const POS = window.GOOD_GIRL_POS;

  const NOTCH_BORDER_PATH =
    'M 28 0.75 L 138 0.75 A 27.25 27.25 0 0 1 165.25 28 L 165.25 90 A 17.25 17.25 0 0 1 148 107.25 L 134 107.25 A 26.75 26.75 0 0 0 107.25 134 L 107.25 148 A 17.25 17.25 0 0 1 90 165.25 L 28 165.25 A 27.25 27.25 0 0 1 0.75 138 L 0.75 28 A 27.25 27.25 0 0 1 28 0.75 Z';

  /* ========================================================================
     APPLICATION STATE
     ======================================================================== */

  const state = {
    currentView: 'menu', // 'menu' | 'promo' | 'bag' | 'orders' | 'me' | 'detail'
    previousTab: 'menu',
    activeCategory: 'all',
    searchQuery: '',
    orderMode: 'dine-in', // 'dine-in' | 'pickup'
    tableNumber: '07',
    mergeIntoActive: false,

    // Product Detail state (supports fresh add OR editing existing Bag item!)
    detail: {
      itemId: 'matcha-nitro',
      styleId: 'ice',
      sizeKey: 'medium',
      sugar: 'Normal',
      ice: 'Normal',
      qty: 1,
      note: '',
      descExpanded: false,
      selectedTagIndex: -1,
      editingCartKey: null,
    },

    // Shopping Bag & Voucher
    cart: [],
    appliedVoucher: null,

    // Payment Gateway state
    payment: {
      methodId: 'qris',
      subProvider: 'GoPay',
      vaBank: 'BCA VA',
      redeemPoints: false,
      qrisSeconds: 300,
      qrisInterval: null,
    },

    // Receipt modal
    activeReceiptOrderId: null,
  };

  /* ========================================================================
     DOM REFERENCES
     ======================================================================== */

  const el = {
    phoneShell: document.getElementById('phoneShell'),
    screens: {
      menu: document.getElementById('screenMenu'),
      promo: document.getElementById('screenPromo'),
      bag: document.getElementById('screenBag'),
      orders: document.getElementById('screenOrders'),
      me: document.getElementById('screenMe'),
      detail: document.getElementById('screenDetail'),
    },
    toolbarTabs: Array.from(document.querySelectorAll('.toolbar-tab')),
    statusBarToggle: document.getElementById('statusBarToggle'),
    dockBtns: Array.from(document.querySelectorAll('.dock-btn')),
    dockBagBadge: document.getElementById('dockBagBadge'),
    dockOrdersDot: document.getElementById('dockOrdersDot'),

    // Menu Home
    homeMemberName: document.getElementById('homeMemberName'),
    homePointsChip: document.getElementById('homePointsChip'),
    homePointsVal: document.getElementById('homePointsVal'),
    modeOpts: Array.from(document.querySelectorAll('.mode-opt')),
    tableSelectBtn: document.getElementById('tableSelectBtn'),
    tableNumberLabel: document.getElementById('tableNumberLabel'),
    homeActiveOrderBanner: document.getElementById('homeActiveOrderBanner'),
    homeActiveOrderTitle: document.getElementById('homeActiveOrderTitle'),
    homeActiveOrderSub: document.getElementById('homeActiveOrderSub'),
    menuSearchInput: document.getElementById('menuSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    promoCarousel: document.getElementById('promoCarousel'),
    categoryPills: document.getElementById('categoryPills'),
    menuGridHeading: document.getElementById('menuGridHeading'),
    menuGridCount: document.getElementById('menuGridCount'),
    menuGrid: document.getElementById('menuGrid'),

    // Promo
    promoAppliedPill: document.getElementById('promoAppliedPill'),
    promoCodeForm: document.getElementById('promoCodeForm'),
    promoCodeInput: document.getElementById('promoCodeInput'),
    promoVoucherList: document.getElementById('promoVoucherList'),
    promoMerchList: document.getElementById('promoMerchList'),

    // Bag
    bagHeaderCount: document.getElementById('bagHeaderCount'),
    bagAddMoreBtn: document.getElementById('bagAddMoreBtn'),
    bagModeSummary: document.getElementById('bagModeSummary'),
    bagChangeModeBtn: document.getElementById('bagChangeModeBtn'),
    mergeToggleRow: document.getElementById('mergeToggleRow'),
    mergeTargetId: document.getElementById('mergeTargetId'),
    mergeOrderCheckbox: document.getElementById('mergeOrderCheckbox'),
    bagItemsList: document.getElementById('bagItemsList'),
    bagVoucherTrigger: document.getElementById('bagVoucherTrigger'),
    bagVoucherTitle: document.getElementById('bagVoucherTitle'),
    bagVoucherSub: document.getElementById('bagVoucherSub'),
    bagSubtotal: document.getElementById('bagSubtotal'),
    bagDiscountRow: document.getElementById('bagDiscountRow'),
    bagDiscountLabel: document.getElementById('bagDiscountLabel'),
    bagDiscountVal: document.getElementById('bagDiscountVal'),
    bagPointsEarn: document.getElementById('bagPointsEarn'),
    bagTotal: document.getElementById('bagTotal'),
    bagPayItemCount: document.getElementById('bagPayItemCount'),
    bagPayTotal: document.getElementById('bagPayTotal'),
    payNowBtn: document.getElementById('payNowBtn'),

    // Orders & Tracker
    trackerDrinkThumbBtn: document.getElementById('trackerDrinkThumbBtn'),
    trackerDrinkImg: document.getElementById('trackerDrinkImg'),
    trackerQueueId: document.getElementById('trackerQueueId'),
    trackerOrderMode: document.getElementById('trackerOrderMode'),
    orderStatusHeading: document.getElementById('orderStatusHeading'),
    orderStatusEta: document.getElementById('orderStatusEta'),
    progressFill: document.getElementById('progressFill'),
    progressKnob: document.getElementById('progressKnob'),
    stagePillsRow: document.getElementById('stagePillsRow'),
    openReceiptBtn: document.getElementById('openReceiptBtn'),
    trackerBrandBtn: document.getElementById('trackerBrandBtn'),
    callRestaurantBtn: document.getElementById('callRestaurantBtn'),
    pairingCarousel: document.getElementById('pairingCarousel'),
    orderHistoryCount: document.getElementById('orderHistoryCount'),
    orderHistoryList: document.getElementById('orderHistoryList'),

    // Me / Membership
    meMemberName: document.getElementById('meMemberName'),
    meMemberId: document.getElementById('meMemberId'),
    meTierBadge: document.getElementById('meTierBadge'),
    mePointsBig: document.getElementById('mePointsBig'),
    meNextTierText: document.getElementById('meNextTierText'),
    meTierProgressFill: document.getElementById('meTierProgressFill'),
    meWalletBalance: document.getElementById('meWalletBalance'),
    topUpWalletBtn: document.getElementById('topUpWalletBtn'),
    meFavCount: document.getElementById('meFavCount'),
    meFavoritesRow: document.getElementById('meFavoritesRow'),
    meThemeDesc: document.getElementById('meThemeDesc'),
    themeToggleBtns: Array.from(document.querySelectorAll('[data-theme-toggle]')),
    themeSetBtns: Array.from(document.querySelectorAll('[data-set-theme]')),

    // Adaptive Product Detail Sheet
    productGlassSheet: document.getElementById('productGlassSheet'),
    detailHandleBar: document.getElementById('detailHandleBar'),
    detailBackBtn: document.getElementById('detailBackBtn'),
    detailCategoryPill: document.getElementById('detailCategoryPill'),
    detailFavBtn: document.getElementById('detailFavBtn'),
    detailTitle: document.getElementById('detailTitle'),
    detailVolume: document.getElementById('detailVolume'),
    detailUnitPrice: document.getElementById('detailUnitPrice'),
    detailDescText: document.getElementById('detailDescText'),
    detailReadMoreBtn: document.getElementById('detailReadMoreBtn'),
    detailFlavorChips: document.getElementById('detailFlavorChips'),
    detailFlavorNote: document.getElementById('detailFlavorNote'),
    heroDrinkStage: document.getElementById('heroDrinkStage'),
    detailHeroImg: document.getElementById('detailHeroImg'),
    detailSizeThumb: document.getElementById('detailSizeThumb'),
    detailSizeOptions: Array.from(document.querySelectorAll('#detailSizeSelector .size-option')),
    detailQtyMinus: document.getElementById('detailQtyMinus'),
    detailQtyPlus: document.getElementById('detailQtyPlus'),
    detailQtyVal: document.getElementById('detailQtyVal'),
    detailStyleRow: document.getElementById('detailStyleRow'),
    detailLevelsGroup: document.getElementById('detailLevelsGroup'),
    sugarLevelPills: Array.from(document.querySelectorAll('#sugarLevelPills .level-pill')),
    iceLevelPills: Array.from(document.querySelectorAll('#iceLevelPills .level-pill')),
    detailNoteInput: document.getElementById('detailNoteInput'),
    detailBagShortcut: document.getElementById('detailBagShortcut'),
    detailBagCount: document.getElementById('detailBagCount'),
    detailAddBtn: document.getElementById('detailAddBtn'),
    detailAddLabel: document.getElementById('detailAddLabel'),

    // Modals & Toast
    paymentModalBackdrop: document.getElementById('paymentModalBackdrop'),
    paymentAmountDue: document.getElementById('paymentAmountDue'),
    payMethodsGrid: document.getElementById('payMethodsGrid'),
    payGatewayPanel: document.getElementById('payGatewayPanel'),
    confirmPaymentBtn: document.getElementById('confirmPaymentBtn'),
    confirmPaymentLabel: document.getElementById('confirmPaymentLabel'),

    receiptModalBackdrop: document.getElementById('receiptModalBackdrop'),
    receiptModalTitle: document.getElementById('receiptModalTitle'),
    receiptTabs: Array.from(document.querySelectorAll('.receipt-tab')),
    receiptVisualView: document.getElementById('receiptVisualView'),
    receiptJsonView: document.getElementById('receiptJsonView'),

    voucherModalBackdrop: document.getElementById('voucherModalBackdrop'),
    modalVoucherList: document.getElementById('modalVoucherList'),

    tableModalBackdrop: document.getElementById('tableModalBackdrop'),
    tableGrid: document.getElementById('tableGrid'),

    callSheetBackdrop: document.getElementById('callSheetBackdrop'),
    dialNowBtn: document.getElementById('dialNowBtn'),
    pingBaristaBtn: document.getElementById('pingBaristaBtn'),

    glassToast: document.getElementById('glassToast'),
  };

  /* ========================================================================
     HELPERS & THEME ADAPTATION
     ======================================================================== */

  let toastTimer = null;
  function showToast(msg) {
    el.glassToast.textContent = msg;
    el.glassToast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.glassToast.classList.remove('is-visible'), 2500);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyAdaptiveTheme(item) {
    const t = item.theme;
    const root = document.documentElement;
    root.style.setProperty('--item-top-bg', t.topBg);
    root.style.setProperty('--item-top-bg-2', t.topBg2);
    root.style.setProperty('--item-sheet-top', t.sheetTop);
    root.style.setProperty('--item-sheet-mid', t.sheetMid);
    root.style.setProperty('--item-sheet-bot', t.sheetBot);
    root.style.setProperty('--item-glow-top', t.glowTop);
    root.style.setProperty('--item-glow-bot', t.glowBot);
    root.style.setProperty('--item-accent', t.accent);
  }

  function syncThemeUI() {
    const theme = POS.getTheme();
    document.documentElement.dataset.theme = theme;
    const isLight = theme === 'light';

    el.themeToggleBtns.forEach((btn) => {
      const icon = btn.querySelector('.theme-pill-icon');
      const label = btn.querySelector('.theme-pill-label');
      if (icon) icon.innerHTML = isLight ? '&#9728;' : '&#9790;';
      if (label) label.textContent = isLight ? 'Fresh' : 'Dark';
    });

    el.themeSetBtns.forEach((btn) => {
      const active = btn.dataset.setTheme === theme;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', String(active));
    });

    if (el.meThemeDesc) {
      el.meThemeDesc.textContent = isLight
        ? 'Fresh White & Matcha Green Glass'
        : 'Obsidian Dark Liquid Glass';
    }
  }

  function getStyleIconSvg(icon) {
    if (icon === 'hot') {
      return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 10h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-5Z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 6c0-1 1-1.5 1-2.5M12 6c0-1 1-1.5 1-2.5"/></svg>`;
    }
    if (icon === 'box' || icon === 'gift') {
      return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="13" rx="3"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-2 0-4-1.5-4-3s1.2-2 2.2-2C11.4 3 12 5 12 8Zm0 0c2 0 4-1.5 4-3s-1.2-2-2.2-2C12.6 3 12 5 12 8Z"/></svg>`;
    }
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 6h10l-1.2 13a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8L7 6Z"/><path d="M12 2v4M9 11h6M10 15h4"/></svg>`;
  }

  function buildQrisSvg(seedText) {
    // Deterministic crisp QR-style SVG matrix with valid 3 corner finder patterns
    const size = 21;
    let hash = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
      hash ^= seedText.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const isFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

    const finderCell = (r, c) => {
      const lr = r >= size - 7 ? r - (size - 7) : r;
      const lc = c >= size - 7 ? c - (size - 7) : c;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };

    const rects = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let on = false;
        if (isFinder(r, c)) {
          on = finderCell(r, c);
        } else if (r === 6 || c === 6) {
          on = (r + c) % 2 === 0;
        } else {
          hash = Math.imul(hash ^ (r * 31 + c * 17), 16777619) >>> 0;
          on = (hash & 3) !== 0 && (hash & 1) === 1;
        }
        if (on) {
          rects.push(`<rect x="${c * 6}" y="${r * 6}" width="5.6" height="5.6" rx="1.2" fill="#08131a"/>`);
        }
      }
    }
    return `<svg width="132" height="132" viewBox="0 0 ${size * 6} ${size * 6}" aria-label="QRIS Code">${rects.join('')}</svg>`;
  }

  /* ========================================================================
     NAVIGATION
     ======================================================================== */

  function switchView(target) {
    if (!el.screens[target]) return;

    if (target !== 'detail') {
      state.previousTab = target;
    }

    Object.entries(el.screens).forEach(([key, node]) => {
      const active = key === target;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-hidden', String(!active));
    });

    state.currentView = target;
    el.phoneShell.dataset.view = target;

    // Sync bottom dock active tab
    el.dockBtns.forEach((btn) => {
      const active = btn.dataset.tab === target;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    // Sync desktop toolbar tabs
    el.toolbarTabs.forEach((tab) => {
      const active = tab.dataset.navView === target;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    if (target === 'bag') renderBag();
    if (target === 'orders') renderOrdersView();
    if (target === 'promo') renderPromoView();
    if (target === 'me') renderMeView();
    if (target === 'detail') renderDetailView();
  }

  function openItemDetail(itemId, editItem) {
    const item = DATA.getItemById(itemId);
    if (editItem) {
      state.detail = {
        itemId: item.id,
        styleId: editItem.styleId || item.styles[0].id,
        sizeKey: editItem.sizeKey || DATA.getDefaultSizeKey(item),
        sugar: editItem.sugar || 'Normal',
        ice: editItem.ice || 'Normal',
        qty: editItem.qty || 1,
        note: editItem.note || '',
        descExpanded: false,
        selectedTagIndex: -1,
        editingCartKey: editItem.key,
      };
    } else {
      state.detail = {
        itemId: item.id,
        styleId: item.styles[0].id,
        sizeKey: DATA.getDefaultSizeKey(item),
        sugar: 'Normal',
        ice: 'Normal',
        qty: 1,
        note: '',
        descExpanded: false,
        selectedTagIndex: -1,
        editingCartKey: null,
      };
    }

    renderDetailView();
    switchView('detail');
  }

  /* ========================================================================
     CART & VOUCHER CALCULATIONS
     ======================================================================== */

  function getCartMetrics() {
    let count = 0;
    let subtotal = 0;
    state.cart.forEach((c) => {
      count += c.qty;
      subtotal += c.unitPrice * c.qty;
    });

    const voucherRes = DATA.calculateVoucherDiscount(state.appliedVoucher, state.cart, subtotal);
    const discount = voucherRes.valid ? voucherRes.discount : 0;
    const total = Math.max(0, subtotal - discount);
    const pointsEarned = Math.round(total / 1000);
    return { count, subtotal, discount, total, pointsEarned, voucherRes };
  }

  function syncGlobalBadges() {
    const { count } = getCartMetrics();
    el.dockBagBadge.textContent = String(count);
    el.dockBagBadge.hidden = count === 0;
    el.detailBagCount.textContent = String(count);

    const activeOrder = POS.getActiveOrder();
    const hasRunning = activeOrder && activeOrder.status !== 'complete';
    el.dockOrdersDot.hidden = !hasRunning;

    if (hasRunning) {
      const meta = POS.STATUS_META[activeOrder.status];
      el.homeActiveOrderBanner.hidden = false;
      el.homeActiveOrderTitle.textContent = `#${activeOrder.orderId} • ${meta.heading}`;
      const loc =
        activeOrder.orderMode === 'dine-in'
          ? `Table ${activeOrder.tableNumber || '07'}`
          : 'Self Pick-Up';
      el.homeActiveOrderSub.textContent = `${meta.eta} • ${loc} • Tap to track`;
    } else {
      el.homeActiveOrderBanner.hidden = true;
    }

    const member = POS.getMember();
    el.homeMemberName.textContent = member.name;
    el.homePointsVal.textContent = String(member.points);
  }

  function quickAddToBag(item, btnEl) {
    const sizeKey = DATA.getDefaultSizeKey(item);
    const sizeObj = item.sizes[sizeKey];
    const styleObj = item.styles[0];
    const key = `${item.id}::${styleObj.id}::${sizeKey}::Normal::Normal::`;

    const existing = state.cart.find((c) => c.key === key);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        key,
        itemId: item.id,
        sku: `${item.skuPrefix}-${sizeKey.slice(0, 3).toUpperCase()}-${styleObj.id.toUpperCase()}`,
        name: item.name,
        category: item.categoryLabel,
        image: item.image,
        styleId: styleObj.id,
        style: styleObj.label,
        sizeKey,
        size: sizeObj.label,
        volume: sizeObj.volume,
        sugar: item.hasLevels ? 'Normal' : null,
        ice: item.hasLevels ? 'Normal' : null,
        note: '',
        qty: 1,
        unitPrice: sizeObj.price,
      });
    }

    if (btnEl) {
      btnEl.classList.add('is-added');
      btnEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>`;
      setTimeout(() => {
        btnEl.classList.remove('is-added');
        btnEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
      }, 650);
    }

    syncGlobalBadges();
    showToast(`Added ${item.shortName} • ${DATA.formatRp(sizeObj.price)}`);
  }

  function saveDetailToBag() {
    const d = state.detail;
    const item = DATA.getItemById(d.itemId);
    const styleObj = item.styles.find((s) => s.id === d.styleId) || item.styles[0];
    const sizeObj = item.sizes[d.sizeKey];
    const cleanNote = (el.detailNoteInput.value || '').trim();
    const key = `${item.id}::${styleObj.id}::${d.sizeKey}::${item.hasLevels ? d.sugar : ''}::${item.hasLevels ? d.ice : ''}::${cleanNote}`;

    const entry = {
      key,
      itemId: item.id,
      sku: `${item.skuPrefix}-${d.sizeKey.slice(0, 3).toUpperCase()}-${styleObj.id.toUpperCase()}`,
      name: item.name,
      category: item.categoryLabel,
      image: item.image,
      styleId: styleObj.id,
      style: styleObj.label,
      sizeKey: d.sizeKey,
      size: sizeObj.label,
      volume: sizeObj.volume,
      sugar: item.hasLevels ? d.sugar : null,
      ice: item.hasLevels ? d.ice : null,
      note: cleanNote,
      qty: d.qty,
      unitPrice: sizeObj.price,
    };

    if (d.editingCartKey) {
      const idx = state.cart.findIndex((c) => c.key === d.editingCartKey);
      if (idx !== -1) state.cart[idx] = entry;
      else state.cart.push(entry);
      showToast(`Updated ${item.shortName} in My Bag`);
      syncGlobalBadges();
      switchView('bag');
      return;
    }

    const existing = state.cart.find((c) => c.key === key);
    if (existing) {
      existing.qty += d.qty;
    } else {
      state.cart.push(entry);
    }

    syncGlobalBadges();
    showToast(`${d.qty}× ${item.shortName} added to My Bag`);
    switchView('bag');
  }

  /* ========================================================================
     RENDER: VIEW 1 (MENU HOME)
     ======================================================================== */

  function renderPromoBanners() {
    el.promoCarousel.innerHTML = '';
    DATA.PROMO_BANNERS.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'promo-banner-card';
      btn.style.background = b.gradient;
      btn.innerHTML = `
        <div class="promo-banner-copy">
          <span class="promo-kicker" style="color:${b.accent}">${escapeHtml(b.kicker)}</span>
          <h3 class="promo-banner-title">${escapeHtml(b.title)}</h3>
          <span class="promo-banner-cta">${escapeHtml(b.cta)} &rarr;</span>
        </div>
        <img src="${b.image}" alt="${escapeHtml(b.title)}" class="promo-banner-img" draggable="false" />
      `;
      btn.addEventListener('click', () => {
        if (b.voucherCode) {
          state.appliedVoucher = b.voucherCode;
          showToast(`Voucher ${b.voucherCode} pre-selected!`);
        }
        openItemDetail(b.itemId);
      });
      el.promoCarousel.appendChild(btn);
    });
  }

  function renderCategoryPills() {
    el.categoryPills.innerHTML = '';
    DATA.CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cat-pill ${state.activeCategory === cat.id ? 'is-active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(state.activeCategory === cat.id));
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        state.activeCategory = cat.id;
        renderCategoryPills();
        renderMenuGrid();
      });
      el.categoryPills.appendChild(btn);
    });
  }

  function renderMenuGrid() {
    const q = state.searchQuery.trim().toLowerCase();
    const filtered = DATA.MENU_ITEMS.filter((item) => {
      const catOk = state.activeCategory === 'all' || item.category === state.activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.tags.some((t) => t.label.toLowerCase().includes(q))
      );
    });

    const catObj = DATA.CATEGORIES.find((c) => c.id === state.activeCategory);
    el.menuGridHeading.textContent = q
      ? `SEARCH RESULTS`
      : state.activeCategory === 'all'
      ? 'ALL BOTANICAL MENU'
      : catObj.label.toUpperCase();
    el.menuGridCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}`;

    el.menuGrid.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'menu-empty';
      empty.textContent = 'No menu items match your search. Try "matcha", "americano", or "mochi".';
      el.menuGrid.appendChild(empty);
      return;
    }

    filtered.forEach((item) => {
      const price = DATA.getBasePrice(item);
      const card = document.createElement('article');
      card.className = 'menu-card';
      card.setAttribute('role', 'listitem');
      card.dataset.itemId = item.id;

      card.innerHTML = `
        <div class="notched-frame-wrap">
          <div class="notched-glass-surface" style="--card-tint:${item.theme.cardTint}">
            <span class="card-badge-chip">${escapeHtml(item.badge)}</span>
            <img src="${item.image}" alt="${escapeHtml(item.shortName)}" class="card-item-img" draggable="false" />
          </div>
          <svg class="notched-border-svg" viewBox="0 0 166 166" fill="none" aria-hidden="true">
            <path d="${NOTCH_BORDER_PATH}" stroke="url(#notchGlassBorder)" stroke-width="1.35" />
          </svg>
          <button type="button" class="notched-add-btn" aria-label="Quick add ${escapeHtml(item.shortName)}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        <div class="menu-card-meta">
          <h3 class="menu-card-name">${escapeHtml(item.shortName)}</h3>
          <p class="menu-card-sub">${escapeHtml(item.tags.slice(0, 2).map((t) => t.label).join(' • '))}</p>
          <p class="menu-card-price">${DATA.formatRp(price)}</p>
        </div>
      `;

      const addBtn = card.querySelector('.notched-add-btn');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quickAddToBag(item, addBtn);
      });

      card.addEventListener('click', () => openItemDetail(item.id));
      el.menuGrid.appendChild(card);
    });
  }

  function renderOrderModeUI() {
    el.modeOpts.forEach((btn) => {
      const active = btn.dataset.orderMode === state.orderMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', String(active));
    });
    el.tableSelectBtn.hidden = state.orderMode !== 'dine-in';
    el.tableNumberLabel.textContent = `Table ${state.tableNumber}`;
  }

  /* ========================================================================
     RENDER: ADAPTIVE PRODUCT DETAIL VIEW
     ======================================================================== */

  function renderDetailView() {
    const d = state.detail;
    const item = DATA.getItemById(d.itemId);
    const sizeObj = item.sizes[d.sizeKey];
    const member = POS.getMember();

    applyAdaptiveTheme(item);

    el.detailCategoryPill.textContent = item.categoryLabel;
    el.detailTitle.textContent = item.name;
    el.detailVolume.textContent = sizeObj.volume;
    el.detailUnitPrice.textContent = DATA.formatRp(sizeObj.price);
    el.detailDescText.textContent = d.descExpanded ? item.fullDesc : item.shortDesc;
    el.detailReadMoreBtn.textContent = d.descExpanded ? 'Show less' : 'Read more';
    el.detailReadMoreBtn.setAttribute('aria-expanded', String(d.descExpanded));

    const isFav = member.favorites.includes(item.id);
    el.detailFavBtn.classList.toggle('is-favorited', isFav);
    el.detailFavBtn.setAttribute('aria-pressed', String(isFav));

    // Hero transparent PNG
    if (el.detailHeroImg.getAttribute('src') !== item.image) {
      el.detailHeroImg.src = item.image;
      el.detailHeroImg.alt = item.name;
    }
    el.detailHeroImg.dataset.scale = d.sizeKey;

    // Flavor chips
    el.detailFlavorChips.innerHTML = '';
    item.tags.forEach((tag, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `flavor-chip ${d.selectedTagIndex === idx ? 'is-selected' : ''}`;
      btn.textContent = tag.label;
      btn.addEventListener('click', () => {
        d.selectedTagIndex = d.selectedTagIndex === idx ? -1 : idx;
        renderDetailFlavorNote(item);
      });
      el.detailFlavorChips.appendChild(btn);
    });
    renderDetailFlavorNote(item);

    // Size segmented control labels & sliding thumb
    const sizeKeys = ['small', 'medium', 'large'];
    const idx = sizeKeys.indexOf(d.sizeKey);
    el.detailSizeThumb.style.transform = `translateX(${idx * 100}%)`;
    el.detailSizeOptions.forEach((opt) => {
      const k = opt.dataset.size;
      opt.textContent = item.sizes[k].label;
      const active = k === d.sizeKey;
      opt.classList.toggle('is-active', active);
      opt.setAttribute('aria-checked', String(active));
    });

    // Style cards (Ice/Hot, Chilled/Gift Box, Standard/Gift Wrap)
    el.detailStyleRow.innerHTML = '';
    item.styles.forEach((st) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `style-card-btn ${d.styleId === st.id ? 'is-active' : ''}`;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(d.styleId === st.id));
      btn.innerHTML = `${getStyleIconSvg(st.icon)}<span>${escapeHtml(st.label)}</span>`;
      btn.addEventListener('click', () => {
        d.styleId = st.id;
        renderDetailView();
      });
      el.detailStyleRow.appendChild(btn);
    });

    // Sugar & Ice levels
    el.detailLevelsGroup.hidden = !item.hasLevels;
    if (item.hasLevels) {
      el.sugarLevelPills.forEach((p) => p.classList.toggle('is-active', p.dataset.sugar === d.sugar));
      el.iceLevelPills.forEach((p) => p.classList.toggle('is-active', p.dataset.ice === d.ice));
    }

    // Qty & Note & CTA
    el.detailQtyVal.textContent = String(d.qty);
    if (el.detailNoteInput.value !== d.note) {
      el.detailNoteInput.value = d.note;
    }

    const lineTotal = sizeObj.price * d.qty;
    const prefix = d.editingCartKey ? 'Update Item' : 'Add to My Bag';
    el.detailAddLabel.textContent = `${prefix} • ${DATA.formatRp(lineTotal)}`;
  }

  function renderDetailFlavorNote(item) {
    const chips = el.detailFlavorChips.querySelectorAll('.flavor-chip');
    chips.forEach((c, i) => c.classList.toggle('is-selected', i === state.detail.selectedTagIndex));
    if (state.detail.selectedTagIndex >= 0 && item.tags[state.detail.selectedTagIndex]) {
      const t = item.tags[state.detail.selectedTagIndex];
      el.detailFlavorNote.textContent = `${t.label}: ${t.note}`;
      el.detailFlavorNote.classList.add('is-visible');
    } else {
      el.detailFlavorNote.classList.remove('is-visible');
    }
  }

  /* ========================================================================
     RENDER: VIEW 2 (PROMO & VOUCHERS)
     ======================================================================== */

  function buildVoucherCard(v, closeModalAfter = false) {
    const isApplied = state.appliedVoucher === v.code;
    const card = document.createElement('article');
    card.className = `voucher-card ${isApplied ? 'is-applied' : ''}`;
    card.innerHTML = `
      <div class="voucher-left">
        <div class="voucher-code-row">
          <span class="voucher-code-badge">${escapeHtml(v.code)}</span>
          <span class="voucher-tag">${escapeHtml(v.badge)}</span>
        </div>
        <div class="voucher-title">${escapeHtml(v.title)}</div>
        <div class="voucher-desc">${escapeHtml(v.desc)}</div>
      </div>
      <button type="button" class="voucher-apply-btn">${isApplied ? 'Applied ✓' : 'Use'}</button>
    `;

    card.querySelector('.voucher-apply-btn').addEventListener('click', () => {
      if (isApplied) {
        state.appliedVoucher = null;
        showToast(`Removed voucher ${v.code}`);
      } else {
        state.appliedVoucher = v.code;
        const { subtotal } = getCartMetrics();
        const check = DATA.calculateVoucherDiscount(v.code, state.cart, subtotal);
        if (state.cart.length > 0 && !check.valid) {
          showToast(`Saved ${v.code} (${check.reason})`);
        } else {
          showToast(`Voucher ${v.code} applied!`);
        }
      }
      renderPromoView();
      renderBag();
      renderVoucherModalList();
      if (closeModalAfter) closeModal('voucher');
    });
    return card;
  }

  function renderPromoView() {
    el.promoAppliedPill.hidden = !state.appliedVoucher;
    if (state.appliedVoucher) {
      el.promoAppliedPill.textContent = `${state.appliedVoucher} Active`;
    }

    el.promoVoucherList.innerHTML = '';
    DATA.VOUCHERS.forEach((v) => el.promoVoucherList.appendChild(buildVoucherCard(v, false)));

    el.promoMerchList.innerHTML = '';
    DATA.MENU_ITEMS.filter((i) => i.category === 'merch').forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'merch-row-card';
      btn.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.shortName)}" />
        <div class="merch-row-info">
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.tags.slice(0, 2).map((t) => t.label).join(' • '))}</small>
          <span class="merch-row-price">${DATA.formatRp(DATA.getBasePrice(item))}</span>
        </div>
        <span style="color:var(--lime-neon);font-weight:700;">&rarr;</span>
      `;
      btn.addEventListener('click', () => openItemDetail(item.id));
      el.promoMerchList.appendChild(btn);
    });
  }

  function renderVoucherModalList() {
    el.modalVoucherList.innerHTML = '';
    DATA.VOUCHERS.forEach((v) => el.modalVoucherList.appendChild(buildVoucherCard(v, true)));
  }

  /* ========================================================================
     RENDER: VIEW 3 (MY BAG)
     ======================================================================== */

  function renderBag() {
    const metrics = getCartMetrics();
    el.bagHeaderCount.textContent = `(${metrics.count})`;
    el.bagModeSummary.textContent =
      state.orderMode === 'dine-in'
        ? `Dine-In • Table ${state.tableNumber}`
        : 'Self Pick-Up • Bar Counter';

    // Show Merge into Active Order toggle if an active dine-in order exists
    const activeOrder = POS.getActiveOrder();
    const canMerge =
      activeOrder &&
      activeOrder.status !== 'complete' &&
      state.orderMode === 'dine-in' &&
      state.cart.length > 0;
    el.mergeToggleRow.hidden = !canMerge;
    if (canMerge) {
      el.mergeTargetId.textContent = `#${activeOrder.orderId}`;
      el.mergeOrderCheckbox.checked = state.mergeIntoActive;
    } else {
      state.mergeIntoActive = false;
    }

    el.bagItemsList.innerHTML = '';
    if (state.cart.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'bag-empty-card';
      empty.innerHTML = `
        <strong>Your bag is empty</strong>
        <p>Explore ceremonial matcha, specialty coffee, pastries, or merch to start ordering.</p>
        <button type="button" class="add-more-pill" id="emptyBrowseBtn">Browse Menu</button>
      `;
      empty.querySelector('#emptyBrowseBtn').addEventListener('click', () => switchView('menu'));
      el.bagItemsList.appendChild(empty);
    } else {
      state.cart.forEach((item, index) => {
        const mods = [
          item.style,
          item.size,
          item.sugar && item.sugar !== 'Normal' ? item.sugar : null,
          item.ice && item.ice !== 'Normal' ? item.ice : null,
        ]
          .filter(Boolean)
          .join(', ');

        const card = document.createElement('article');
        card.className = 'bag-item-card';
        card.innerHTML = `
          <div class="bag-item-info">
            <div class="bag-item-name">${escapeHtml(item.name)}</div>
            <div class="bag-item-mods">${escapeHtml(mods)}</div>
            ${item.note ? `<div class="bag-item-note">"${escapeHtml(item.note)}"</div>` : ''}
            <div class="bag-item-bottom">
              <span class="bag-item-price">${DATA.formatRp(item.unitPrice * item.qty)}</span>
              <button type="button" class="bag-change-btn">Change</button>
            </div>
          </div>
          <div class="bag-item-right">
            <div class="bag-item-thumb">
              <img src="${item.image}" alt="${escapeHtml(item.name)}" />
            </div>
            <div class="qty-inline-stepper">
              <button type="button" class="qty-btn" data-d="-1" aria-label="Decrease">&minus;</button>
              <span class="qty-val">${item.qty}</span>
              <button type="button" class="qty-btn is-plus" data-d="1" aria-label="Increase">+</button>
            </div>
          </div>
        `;

        card.querySelector('.bag-change-btn').addEventListener('click', () => {
          openItemDetail(item.itemId, item);
        });
        card.querySelector('[data-d="-1"]').addEventListener('click', () => {
          state.cart[index].qty -= 1;
          if (state.cart[index].qty <= 0) state.cart.splice(index, 1);
          syncGlobalBadges();
          renderBag();
        });
        card.querySelector('[data-d="1"]').addEventListener('click', () => {
          state.cart[index].qty += 1;
          syncGlobalBadges();
          renderBag();
        });

        el.bagItemsList.appendChild(card);
      });
    }

    // Voucher Trigger UI
    if (state.appliedVoucher && metrics.voucherRes.valid) {
      el.bagVoucherTitle.textContent = `${state.appliedVoucher} Applied!`;
      el.bagVoucherSub.textContent = `Saving ${DATA.formatRp(metrics.discount)} on this order`;
    } else if (state.appliedVoucher && !metrics.voucherRes.valid) {
      el.bagVoucherTitle.textContent = `${state.appliedVoucher} (Not eligible yet)`;
      el.bagVoucherSub.textContent = metrics.voucherRes.reason || 'Tap to pick another voucher';
    } else {
      el.bagVoucherTitle.textContent = 'Have a voucher?';
      el.bagVoucherSub.textContent = 'Tap to apply MATCHA20, FIRSTBREW, or member perk';
    }

    // Totals
    el.bagSubtotal.textContent = DATA.formatRp(metrics.subtotal);
    el.bagDiscountRow.hidden = metrics.discount <= 0;
    el.bagDiscountLabel.textContent = `Voucher (${state.appliedVoucher || ''})`;
    el.bagDiscountVal.textContent = `-${DATA.formatRp(metrics.discount)}`;
    el.bagPointsEarn.textContent = `+${metrics.pointsEarned} pts`;
    el.bagTotal.textContent = DATA.formatRp(metrics.total);

    el.bagPayItemCount.textContent = `${metrics.count} ${metrics.count === 1 ? 'item' : 'items'}`;
    el.bagPayTotal.textContent = DATA.formatRp(metrics.total);
    el.payNowBtn.disabled = metrics.count === 0;
  }

  /* ========================================================================
     PAYMENT GATEWAY MODAL & LIVE POS DISPATCH
     ======================================================================== */

  function openPaymentModal() {
    const metrics = getCartMetrics();
    if (metrics.count === 0) return;

    state.payment.qrisSeconds = 300;
    renderPaymentModal();
    openModal('payment');

    clearInterval(state.payment.qrisInterval);
    state.payment.qrisInterval = setInterval(() => {
      if (state.payment.qrisSeconds > 0) {
        state.payment.qrisSeconds -= 1;
        const timerEl = document.getElementById('qrisCountdownVal');
        if (timerEl) {
          const m = String(Math.floor(state.payment.qrisSeconds / 60)).padStart(2, '0');
          const s = String(state.payment.qrisSeconds % 60).padStart(2, '0');
          timerEl.textContent = `${m}:${s}`;
        }
      }
    }, 1000);
  }

  function renderPaymentModal() {
    const metrics = getCartMetrics();
    const member = POS.getMember();
    const pointsDiscount =
      state.payment.methodId === 'ggpay' && state.payment.redeemPoints && member.points >= 200
        ? Math.min(10000, metrics.total)
        : 0;
    const finalAmount = Math.max(0, metrics.total - pointsDiscount);

    el.paymentAmountDue.textContent = DATA.formatRp(finalAmount);

    el.payMethodsGrid.innerHTML = '';
    DATA.PAYMENT_METHODS.forEach((m) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pay-method-btn ${state.payment.methodId === m.id ? 'is-active' : ''}`;
      btn.innerHTML = `
        <div class="pay-method-top">
          <span class="pay-method-name">${escapeHtml(m.name)}</span>
          <span class="pay-method-badge">${escapeHtml(m.badge)}</span>
        </div>
        <div class="pay-method-sub">${escapeHtml(m.subtitle)}</div>
      `;
      btn.addEventListener('click', () => {
        state.payment.methodId = m.id;
        renderPaymentModal();
      });
      el.payMethodsGrid.appendChild(btn);
    });

    const p = state.payment;
    if (p.methodId === 'qris') {
      const m = String(Math.floor(p.qrisSeconds / 60)).padStart(2, '0');
      const s = String(p.qrisSeconds % 60).padStart(2, '0');
      el.payGatewayPanel.innerHTML = `
        <div class="qris-box">
          <span class="qris-header-pill">QRIS • NATIONAL STANDARD</span>
          <div class="qris-svg-frame">${buildQrisSvg(`GOODGIRL-${finalAmount}-${metrics.count}`)}</div>
          <div style="font-size:12px;color:var(--text-secondary);">Merchant: <strong>GOOD GIRL BOTANICAL LAB</strong></div>
          <div class="qris-timer">Expires in <strong id="qrisCountdownVal">${m}:${s}</strong></div>
        </div>
      `;
      el.confirmPaymentLabel.textContent = `Pay with QRIS • ${DATA.formatRp(finalAmount)}`;
    } else if (p.methodId === 'gopay') {
      const providers = DATA.PAYMENT_METHODS.find((x) => x.id === 'gopay').providers;
      el.payGatewayPanel.innerHTML = `
        <div style="font-size:12.5px;font-weight:700;color:#fff;">Select E-Wallet / Handpay</div>
        <div class="provider-pills" id="ewalletProviderPills">
          ${providers
            .map(
              (name) =>
                `<button type="button" class="provider-pill ${p.subProvider === name ? 'is-active' : ''}" data-ew="${escapeHtml(name)}">${escapeHtml(name)}</button>`
            )
            .join('')}
        </div>
        <p style="font-size:11.5px;color:var(--text-muted);margin-top:10px;">Instant biometric / app approval • Zero gateway fee.</p>
      `;
      el.payGatewayPanel.querySelectorAll('[data-ew]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p.subProvider = btn.dataset.ew;
          renderPaymentModal();
        });
      });
      el.confirmPaymentLabel.textContent = `Pay with ${p.subProvider} • ${DATA.formatRp(finalAmount)}`;
    } else if (p.methodId === 'va') {
      const banks = DATA.PAYMENT_METHODS.find((x) => x.id === 'va').providers;
      const bankPrefix = p.vaBank === 'BCA VA' ? '8801' : p.vaBank === 'Mandiri VA' ? '8902' : '8810';
      const vaNum = `${bankPrefix} 0812 8824 0042`;
      el.payGatewayPanel.innerHTML = `
        <div style="font-size:12.5px;font-weight:700;color:#fff;">Select Bank Virtual Account</div>
        <div class="provider-pills">
          ${banks
            .map(
              (b) =>
                `<button type="button" class="provider-pill ${p.vaBank === b ? 'is-active' : ''}" data-va="${escapeHtml(b)}">${escapeHtml(b)}</button>`
            )
            .join('')}
        </div>
        <div class="va-code-box">
          <code>${vaNum}</code>
          <button type="button" class="mini-glass-btn" id="copyVaBtn">Copy</button>
        </div>
      `;
      el.payGatewayPanel.querySelectorAll('[data-va]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p.vaBank = btn.dataset.va;
          renderPaymentModal();
        });
      });
      const copyBtn = document.getElementById('copyVaBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          if (navigator.clipboard) navigator.clipboard.writeText(vaNum.replace(/\s+/g, ''));
          showToast(`${p.vaBank} number copied`);
        });
      }
      el.confirmPaymentLabel.textContent = `Confirm ${p.vaBank} • ${DATA.formatRp(finalAmount)}`;
    } else {
      const canUsePts = member.points >= 200;
      const insufficient = member.ggPayBalance < finalAmount;
      el.payGatewayPanel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-display);">GG PAY WALLET</div>
            <strong style="font-size:18px;font-family:var(--font-display);color:var(--lime-neon);">${DATA.formatRp(member.ggPayBalance)}</strong>
          </div>
          <span class="pay-method-badge" style="font-size:10.5px;">2&times; POINTS</span>
        </div>
        <label class="merge-toggle-row" style="margin-top:10px;">
          <span class="merge-toggle-copy">
            <strong>Redeem 200 pts (-Rp10.000)</strong>
            <small>Available: ${member.points} pts</small>
          </span>
          <input type="checkbox" id="redeemPtsSwitch" class="glass-switch" ${p.redeemPoints && canUsePts ? 'checked' : ''} ${!canUsePts ? 'disabled' : ''} />
        </label>
        ${insufficient ? `<p style="margin-top:8px;font-size:11.5px;color:#ff94a8;">Insufficient GG Pay balance — top up on Me tab or choose QRIS.</p>` : ''}
      `;
      const sw = document.getElementById('redeemPtsSwitch');
      if (sw) {
        sw.addEventListener('change', () => {
          p.redeemPoints = sw.checked;
          renderPaymentModal();
        });
      }
      el.confirmPaymentLabel.textContent = insufficient
        ? 'Insufficient GG Balance'
        : `Pay with GG Pay • ${DATA.formatRp(finalAmount)}`;
      el.confirmPaymentBtn.disabled = insufficient;
      return;
    }

    el.confirmPaymentBtn.disabled = false;
  }

  function completePaymentAndDispatchPOS() {
    const metrics = getCartMetrics();
    if (metrics.count === 0) return;

    const member = POS.getMember();
    const p = state.payment;
    const pointsDiscount =
      p.methodId === 'ggpay' && p.redeemPoints && member.points >= 200
        ? Math.min(10000, metrics.total)
        : 0;
    const finalTotal = Math.max(0, metrics.total - pointsDiscount);
    const pointsEarned = Math.round(finalTotal / 1000) * (p.methodId === 'ggpay' ? 2 : 1);

    let methodLabel = 'QRIS';
    let providerLabel = 'QRIS Instant';
    if (p.methodId === 'gopay') {
      methodLabel = p.subProvider;
      providerLabel = `${p.subProvider} Handpay`;
    } else if (p.methodId === 'va') {
      methodLabel = p.vaBank;
      providerLabel = `${p.vaBank} Auto-Verify`;
    } else if (p.methodId === 'ggpay') {
      if (member.ggPayBalance < finalTotal) {
        showToast('Insufficient GG Pay balance');
        return;
      }
      methodLabel = 'GG Pay';
      providerLabel = 'GOOD GIRL Member Balance';
    }

    const posItems = state.cart.map((c) => ({
      sku: c.sku,
      itemId: c.itemId,
      name: c.name,
      category: c.category,
      image: c.image,
      style: c.style,
      size: c.size,
      volume: c.volume,
      sugar: c.sugar,
      ice: c.ice,
      note: c.note,
      qty: c.qty,
      unitPrice: c.unitPrice,
      lineTotal: c.unitPrice * c.qty,
    }));

    const paymentObj = {
      method: methodLabel,
      provider: providerLabel,
      reference: `PAY-${Math.floor(10000000 + Math.random() * 89999999)}`,
    };

    const pricingObj = {
      subtotal: metrics.subtotal,
      voucherCode: metrics.voucherRes.valid ? state.appliedVoucher : null,
      discount: metrics.discount + pointsDiscount,
      total: finalTotal,
      pointsEarned,
    };

    // Check if merging into existing active table order or creating a new POS ticket
    let resultingOrder = null;
    const active = POS.getActiveOrder();
    if (state.mergeIntoActive && active && active.status !== 'complete' && state.orderMode === 'dine-in') {
      resultingOrder = POS.mergeIntoOrder(active.orderId, posItems, pricingObj, paymentObj);
    } else {
      resultingOrder = POS.createOrder({
        orderMode: state.orderMode,
        tableNumber: state.tableNumber,
        customer: { name: member.name, tier: member.tier, memberId: member.memberId },
        items: posItems,
        pricing: pricingObj,
        payment: paymentObj,
      });
    }

    // Update member points & GG Pay wallet
    const nextBalance = p.methodId === 'ggpay' ? member.ggPayBalance - finalTotal : member.ggPayBalance;
    const nextPoints = member.points - (pointsDiscount > 0 ? 200 : 0) + pointsEarned;
    POS.saveMember({ ggPayBalance: nextBalance, points: nextPoints });

    // Clear Bag
    state.cart = [];
    state.appliedVoucher = null;
    state.mergeIntoActive = false;
    state.payment.redeemPoints = false;

    closeModal('payment');
    syncGlobalBadges();
    renderOrdersView();
    switchView('orders');
    showToast(`Paid via ${methodLabel}! Sent #${resultingOrder.orderId} to POS (+${pointsEarned} pts)`);
  }

  /* ========================================================================
     RENDER: VIEW 4 (ORDERS, 4-STAGE TRACKER, RECEIPT & PAIRING SHEET)
     ======================================================================== */

  function renderOrdersView() {
    const orders = POS.getOrders();
    const active = POS.getActiveOrder();

    if (active) {
      const meta = POS.STATUS_META[active.status] || POS.STATUS_META.preparing;
      const leadItem = active.items[0];
      if (leadItem && leadItem.image) {
        el.trackerDrinkImg.src = leadItem.image;
      }
      el.trackerQueueId.textContent = `#${active.orderId}`;
      const modeTxt =
        active.orderMode === 'dine-in'
          ? `Dine-In • Table ${active.tableNumber || '07'}`
          : 'Self Pick-Up';
      el.trackerOrderMode.textContent =
        active.mergedCount > 1 ? `${modeTxt} • Merged ×${active.mergedCount}` : modeTxt;
      el.orderStatusHeading.textContent = meta.heading;
      el.orderStatusEta.textContent = meta.eta;
      el.progressFill.style.width = `${meta.progress}%`;
      el.progressKnob.style.left = `${meta.progress}%`;

      const curIdx = POS.STATUS_FLOW.indexOf(active.status);
      el.stagePillsRow.querySelectorAll('.stage-pill').forEach((pill) => {
        const stIdx = POS.STATUS_FLOW.indexOf(pill.dataset.stage);
        pill.classList.toggle('is-active', stIdx === curIdx);
        pill.classList.toggle('is-done', stIdx < curIdx);
      });
    }

    // Pairing carousel (exact concave-notched cards for Pastry & Dessert!)
    el.pairingCarousel.innerHTML = '';
    DATA.MENU_ITEMS.filter((i) => i.category === 'pastry').forEach((item) => {
      const card = document.createElement('article');
      card.className = 'pairing-card';
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <div class="notched-frame-wrap">
          <div class="notched-glass-surface" style="--card-tint:${item.theme.cardTint}">
            <img src="${item.image}" alt="${escapeHtml(item.shortName)}" class="card-item-img" draggable="false" />
          </div>
          <svg class="notched-border-svg" viewBox="0 0 166 166" fill="none" aria-hidden="true">
            <path d="${NOTCH_BORDER_PATH}" stroke="url(#notchGlassBorder)" stroke-width="1.35" />
          </svg>
          <button type="button" class="notched-add-btn" aria-label="Add ${escapeHtml(item.shortName)}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        <h3 class="pairing-card-name">${escapeHtml(item.shortName)}</h3>
        <p class="pairing-card-sub">${escapeHtml(item.sizes.small.volume)} • ${DATA.formatRp(item.sizes.small.price)}</p>
      `;

      const addBtn = card.querySelector('.notched-add-btn');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quickAddToBag(item, addBtn);
      });
      card.addEventListener('click', () => openItemDetail(item.id));
      el.pairingCarousel.appendChild(card);
    });

    // Order History & Receipts
    el.orderHistoryCount.textContent = `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`;
    el.orderHistoryList.innerHTML = '';
    orders.forEach((order) => {
      const meta = POS.STATUS_META[order.status];
      const itemSummary = order.items.map((it) => `${it.qty}× ${it.name}`).join(', ');
      const row = document.createElement('div');
      row.className = 'history-row';
      row.innerHTML = `
        <div class="history-left">
          <strong>#${escapeHtml(order.orderId)} • ${escapeHtml(meta.shortLabel)}</strong>
          <small>${escapeHtml(itemSummary)} • ${DATA.formatRp(order.pricing.total)}</small>
        </div>
        <div class="history-actions">
          <button type="button" class="history-btn" data-receipt="${escapeHtml(order.orderId)}">Receipt</button>
          <button type="button" class="history-btn is-primary" data-reorder="${escapeHtml(order.orderId)}">Reorder</button>
        </div>
      `;
      row.querySelector('[data-receipt]').addEventListener('click', () => openReceiptModal(order));
      row.querySelector('[data-reorder]').addEventListener('click', () => {
        order.items.forEach((it) => {
          const menuRef = DATA.getItemById(it.itemId);
          quickAddToBag(menuRef, null);
        });
        switchView('bag');
      });
      el.orderHistoryList.appendChild(row);
    });
  }

  function openReceiptModal(order) {
    if (!order) return;
    state.activeReceiptOrderId = order.orderId;
    el.receiptModalTitle.textContent = `Receipt #${order.orderId}`;

    const modeStr =
      order.orderMode === 'dine-in' ? `Dine-In (Table ${order.tableNumber || '07'})` : 'Self Pick-Up';
    const meta = POS.STATUS_META[order.status];

    el.receiptVisualView.innerHTML = `
      <div class="receipt-meta-grid">
        <div><span>ORDER ID</span><strong>#${escapeHtml(order.orderId)}</strong></div>
        <div><span>STATUS</span><strong style="color:var(--lime-neon);">${escapeHtml(meta.shortLabel.toUpperCase())}</strong></div>
        <div><span>FULFILLMENT</span><strong>${escapeHtml(modeStr)}</strong></div>
        <div><span>PAYMENT</span><strong>${escapeHtml(order.payment.method)} (PAID)</strong></div>
        <div><span>REFERENCE</span><strong>${escapeHtml(order.payment.reference)}</strong></div>
        <div><span>POINTS EARNED</span><strong style="color:var(--cyan-logo);">+${order.pricing.pointsEarned} pts</strong></div>
      </div>
      ${order.items
        .map(
          (it) => `
          <div class="receipt-line">
            <div>
              <strong>${it.qty}&times; ${escapeHtml(it.name)}</strong>
              <small>${escapeHtml([it.style, it.size, it.sugar, it.note].filter(Boolean).join(' • '))}</small>
            </div>
            <strong style="font-family:var(--font-display);">${DATA.formatRp(it.lineTotal)}</strong>
          </div>`
        )
        .join('')}
      <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:10px;display:flex;flex-direction:column;gap:5px;">
        <div class="receipt-line"><span>Subtotal</span><span>${DATA.formatRp(order.pricing.subtotal)}</span></div>
        ${
          order.pricing.discount > 0
            ? `<div class="receipt-line" style="color:#a8ff78;"><span>Discount (${escapeHtml(order.pricing.voucherCode || 'Pts')})</span><span>-${DATA.formatRp(order.pricing.discount)}</span></div>`
            : ''
        }
        <div class="receipt-line" style="font-size:15px;font-weight:700;color:#fff;margin-top:3px;">
          <span>Total Paid</span>
          <span style="font-family:var(--font-display);color:var(--lime-neon);">${DATA.formatRp(order.pricing.total)}</span>
        </div>
      </div>
    `;

    el.receiptJsonView.textContent = JSON.stringify(order, null, 2);
    switchReceiptTab('visual');
    openModal('receipt');
  }

  function switchReceiptTab(tab) {
    el.receiptTabs.forEach((b) => b.classList.toggle('is-active', b.dataset.receiptTab === tab));
    el.receiptVisualView.hidden = tab !== 'visual';
    el.receiptJsonView.hidden = tab !== 'json';
  }

  /* ========================================================================
     RENDER: VIEW 5 (ME / MEMBERSHIP)
     ======================================================================== */

  function renderMeView() {
    const m = POS.getMember();
    el.meMemberName.textContent = m.name.toUpperCase();
    el.meMemberId.textContent = m.memberId;
    el.meTierBadge.textContent = m.tier.toUpperCase();
    el.mePointsBig.textContent = String(m.points);
    const remain = Math.max(0, m.nextTierPoints - m.points);
    el.meNextTierText.textContent =
      remain > 0 ? `${remain} pts to ${m.nextTier}` : `${m.tier} Unlocked!`;
    const pct = Math.min(100, Math.round((m.points / m.nextTierPoints) * 100));
    el.meTierProgressFill.style.width = `${pct}%`;
    el.meWalletBalance.textContent = DATA.formatRp(m.ggPayBalance);

    // Favorites
    const favItems = m.favorites.map((id) => DATA.getItemById(id)).filter(Boolean);
    el.meFavCount.textContent = `${favItems.length} saved`;
    el.meFavoritesRow.innerHTML = '';

    if (favItems.length === 0) {
      el.meFavoritesRow.innerHTML = `<div style="font-size:12.5px;color:var(--text-muted);padding:12px;">Tap ♡ on any drink or pastry to save it here.</div>`;
    } else {
      favItems.forEach((item) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'fav-mini-card';
        card.innerHTML = `
          <img src="${item.image}" alt="${escapeHtml(item.shortName)}" />
          <strong>${escapeHtml(item.shortName)}</strong>
          <span>${DATA.formatRp(DATA.getBasePrice(item))}</span>
        `;
        card.addEventListener('click', () => openItemDetail(item.id));
        el.meFavoritesRow.appendChild(card);
      });
    }
  }

  /* ========================================================================
     MODALS & TABLE PICKER
     ======================================================================== */

  const MODAL_MAP = {
    payment: el.paymentModalBackdrop,
    receipt: el.receiptModalBackdrop,
    voucher: el.voucherModalBackdrop,
    table: el.tableModalBackdrop,
    call: el.callSheetBackdrop,
  };

  function openModal(name) {
    const node = MODAL_MAP[name];
    if (!node) return;
    node.classList.add('is-open');
    node.setAttribute('aria-hidden', 'false');
  }

  function closeModal(name) {
    if (name === 'payment' || name === 'all') {
      clearInterval(state.payment.qrisInterval);
    }
    if (name === 'all') {
      Object.values(MODAL_MAP).forEach((n) => {
        n.classList.remove('is-open');
        n.setAttribute('aria-hidden', 'true');
      });
      return;
    }
    const node = MODAL_MAP[name];
    if (node) {
      node.classList.remove('is-open');
      node.setAttribute('aria-hidden', 'true');
    }
  }

  function renderTableGrid() {
    el.tableGrid.innerHTML = '';
    for (let i = 1; i <= 16; i++) {
      const code = String(i).padStart(2, '0');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `table-btn ${state.tableNumber === code ? 'is-active' : ''}`;
      btn.textContent = code;
      btn.addEventListener('click', () => {
        state.tableNumber = code;
        state.orderMode = 'dine-in';
        renderOrderModeUI();
        renderBag();
        closeModal('table');
        showToast(`Table ${code} selected`);
      });
      el.tableGrid.appendChild(btn);
    }
  }

  /* ========================================================================
     EVENT BINDINGS & LIVE POS SUBSCRIPTION
     ======================================================================== */

  function bindEvents() {
    // Bottom Dock & Desktop Toolbar
    el.dockBtns.forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.dataset.tab));
    });

    el.toolbarTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const v = tab.dataset.navView;
        if (v === 'detail') openItemDetail(state.detail.itemId || 'matcha-nitro');
        else switchView(v);
      });
    });

    el.statusBarToggle.addEventListener('click', () => {
      const on = document.body.classList.toggle('show-statusbar');
      el.statusBarToggle.classList.toggle('is-active', on);
      el.statusBarToggle.setAttribute('aria-pressed', String(on));
    });

    // Synced Fresh White-Matcha <-> Dark Glass theme controls
    el.themeToggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = POS.getTheme() === 'light' ? 'dark' : 'light';
        POS.setTheme(next);
        syncThemeUI();
        showToast(next === 'light' ? 'Switched to Fresh White & Matcha' : 'Switched to Dark Liquid Glass');
      });
    });

    el.themeSetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.setTheme;
        if (next === POS.getTheme()) return;
        POS.setTheme(next);
        syncThemeUI();
        showToast(next === 'light' ? 'Fresh White & Matcha active' : 'Dark Liquid Glass active');
      });
    });

    // Menu Home interactions
    el.homePointsChip.addEventListener('click', () => switchView('me'));
    el.homeActiveOrderBanner.addEventListener('click', () => switchView('orders'));

    el.modeOpts.forEach((opt) => {
      opt.addEventListener('click', () => {
        state.orderMode = opt.dataset.orderMode;
        renderOrderModeUI();
        renderBag();
      });
    });

    el.tableSelectBtn.addEventListener('click', () => {
      renderTableGrid();
      openModal('table');
    });

    el.menuSearchInput.addEventListener('input', () => {
      state.searchQuery = el.menuSearchInput.value;
      el.searchClearBtn.hidden = state.searchQuery.length === 0;
      renderMenuGrid();
    });

    el.searchClearBtn.addEventListener('click', () => {
      state.searchQuery = '';
      el.menuSearchInput.value = '';
      el.searchClearBtn.hidden = true;
      renderMenuGrid();
    });

    // Promo manual code form
    el.promoCodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (el.promoCodeInput.value || '').trim().toUpperCase();
      const found = DATA.VOUCHERS.find((v) => v.code === code);
      if (!found) {
        showToast(`Invalid code "${code}". Try MATCHA20 or FIRSTBREW`);
        return;
      }
      state.appliedVoucher = found.code;
      el.promoCodeInput.value = '';
      renderPromoView();
      renderBag();
      showToast(`Voucher ${found.code} applied!`);
    });

    // Bag controls
    el.bagAddMoreBtn.addEventListener('click', () => switchView('menu'));
    el.bagChangeModeBtn.addEventListener('click', () => {
      renderTableGrid();
      openModal('table');
    });
    el.mergeOrderCheckbox.addEventListener('change', () => {
      state.mergeIntoActive = el.mergeOrderCheckbox.checked;
    });
    el.bagVoucherTrigger.addEventListener('click', () => {
      renderVoucherModalList();
      openModal('voucher');
    });
    el.payNowBtn.addEventListener('click', openPaymentModal);
    el.confirmPaymentBtn.addEventListener('click', completePaymentAndDispatchPOS);

    // Orders controls
    el.trackerDrinkThumbBtn.addEventListener('click', () => {
      const active = POS.getActiveOrder();
      if (active && active.items[0]) openItemDetail(active.items[0].itemId);
    });
    el.trackerBrandBtn.addEventListener('click', () => switchView('menu'));
    el.callRestaurantBtn.addEventListener('click', () => openModal('call'));
    el.openReceiptBtn.addEventListener('click', () => openReceiptModal(POS.getActiveOrder()));

    el.stagePillsRow.querySelectorAll('.stage-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const active = POS.getActiveOrder();
        if (!active) return;
        const st = pill.dataset.stage;
        POS.updateOrderStatus(active.orderId, st, 'CUSTOMER_DEMO');
        renderOrdersView();
        syncGlobalBadges();
        showToast(`Order #${active.orderId}: ${POS.STATUS_META[st].heading}`);
      });
    });

    el.receiptTabs.forEach((tab) => {
      tab.addEventListener('click', () => switchReceiptTab(tab.dataset.receiptTab));
    });

    // Me controls
    el.topUpWalletBtn.addEventListener('click', () => {
      const m = POS.getMember();
      POS.saveMember({ ggPayBalance: m.ggPayBalance + 100000 });
      renderMeView();
      showToast('Topped up +Rp100.000 to GG Member Pay!');
    });

    // Adaptive Product Detail controls
    el.detailBackBtn.addEventListener('click', () => switchView(state.previousTab || 'menu'));
    el.detailBagShortcut.addEventListener('click', () => switchView('bag'));

    el.detailFavBtn.addEventListener('click', () => {
      const m = POS.getMember();
      const id = state.detail.itemId;
      const favs = new Set(m.favorites);
      if (favs.has(id)) {
        favs.delete(id);
        showToast('Removed from favorites');
      } else {
        favs.add(id);
        showToast('Saved to favorites ♡');
      }
      POS.saveMember({ favorites: Array.from(favs) });
      renderDetailView();
    });

    el.detailReadMoreBtn.addEventListener('click', () => {
      state.detail.descExpanded = !state.detail.descExpanded;
      renderDetailView();
    });

    el.detailSizeOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        state.detail.sizeKey = opt.dataset.size;
        renderDetailView();
      });
    });

    el.detailQtyMinus.addEventListener('click', () => {
      state.detail.qty = Math.max(1, state.detail.qty - 1);
      renderDetailView();
    });
    el.detailQtyPlus.addEventListener('click', () => {
      state.detail.qty = Math.min(20, state.detail.qty + 1);
      renderDetailView();
    });

    el.sugarLevelPills.forEach((p) => {
      p.addEventListener('click', () => {
        state.detail.sugar = p.dataset.sugar;
        renderDetailView();
      });
    });
    el.iceLevelPills.forEach((p) => {
      p.addEventListener('click', () => {
        state.detail.ice = p.dataset.ice;
        renderDetailView();
      });
    });

    el.detailNoteInput.addEventListener('input', () => {
      state.detail.note = el.detailNoteInput.value;
    });

    el.detailAddBtn.addEventListener('click', saveDetailToBag);

    // Subtle pointer parallax on hero image
    el.heroDrinkStage.addEventListener('pointermove', (e) => {
      const rect = el.heroDrinkStage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 9;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 7;
      const scaleMap = { small: 0.9, medium: 1, large: 1.07 };
      const sc = scaleMap[state.detail.sizeKey] || 1;
      el.detailHeroImg.style.transform = `translate3d(${nx}px, ${ny}px, 0) scale(${sc})`;
    });
    el.heroDrinkStage.addEventListener('pointerleave', () => {
      el.detailHeroImg.style.transform = '';
    });

    // Pull down handle on Detail to close cleanly
    let startY = 0;
    let dragging = false;
    el.detailHandleBar.addEventListener('pointerdown', (e) => {
      startY = e.clientY;
      dragging = true;
      el.detailHandleBar.setPointerCapture(e.pointerId);
      el.productGlassSheet.style.transition = 'none';
    });
    el.detailHandleBar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dy = Math.max(0, Math.min(120, e.clientY - startY));
      el.productGlassSheet.style.transform = `translateY(${dy}px)`;
    });
    const endDetailDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      const dy = e.clientY - startY;
      el.productGlassSheet.style.transition = '';
      el.productGlassSheet.style.transform = '';
      if (dy > 72) switchView(state.previousTab || 'menu');
    };
    el.detailHandleBar.addEventListener('pointerup', endDetailDrag);
    el.detailHandleBar.addEventListener('pointercancel', endDetailDrag);

    // Modal closing & Call Sheet actions
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });
    Object.entries(MODAL_MAP).forEach(([name, node]) => {
      node.addEventListener('click', (e) => {
        if (e.target === node) closeModal(name);
      });
    });

    el.dialNowBtn.addEventListener('click', () => {
      closeModal('call');
      showToast('Calling GOOD GIRL Botanical Lab...');
    });
    el.pingBaristaBtn.addEventListener('click', () => {
      closeModal('call');
      showToast('Barista notified on Live POS!');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal('all');
    });

    // Real-time subscription from Live POS Terminal (pos.html)!
    POS.subscribe((evt) => {
      if (evt.type === 'THEME_CHANGED' || evt.type === 'STORAGE_SYNC') {
        syncThemeUI();
      }
      syncGlobalBadges();
      if (state.currentView === 'orders') renderOrdersView();
      if (state.currentView === 'me') renderMeView();
      if (evt.type === 'ORDER_STATUS_UPDATED' && evt.actor === 'POS_BARISTA') {
        const meta = POS.STATUS_META[evt.status];
        showToast(`POS Update: #${evt.orderId} is now ${meta.heading}!`);
      }
    });
  }

  function init() {
    syncThemeUI();
    renderPromoBanners();
    renderCategoryPills();
    renderMenuGrid();
    renderOrderModeUI();
    renderPromoView();
    renderOrdersView();
    renderMeView();
    syncGlobalBadges();
    bindEvents();
  }

  init();
})();
