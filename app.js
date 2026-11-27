(() => {
  'use strict';

  const DATA = window.GOOD_GIRL_DATA;
  const POS = window.GOOD_GIRL_POS;

  const SUN_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
  const MOON_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`;

  /* ========================================================================
     URL QR TABLE / OUTLET AUTO-DETECT (?table=07&outlet=senopati)
     ======================================================================== */

  const urlParams = new URLSearchParams(window.location.search);
  const initialTable = (urlParams.get('table') || '07').replace(/[^0-9]/g, '').slice(0, 2).padStart(2, '0') || '07';
  const initialOutlet = DATA.OUTLETS.some((o) => o.id === urlParams.get('outlet'))
    ? urlParams.get('outlet')
    : 'senopati';

  /* ========================================================================
     APPLICATION STATE
     ======================================================================== */

  const state = {
    currentView: 'menu', // 'menu' | 'promo' | 'bag' | 'orders' | 'me'
    previousTab: 'menu',
    detailOpen: false,
    activeCategory: 'all',
    searchQuery: '',
    outletId: initialOutlet,
    orderMode: 'dine-in', // 'dine-in' | 'pickup' | 'delivery'
    tableNumber: initialTable,
    pickupSlotIndex: 0,
    deliveryAddress: 'Jl. Gunawarman No. 12, Kebayoran Baru',
    mergeIntoActive: false,
    trackedOrderId: null,
    ratingDraftStars: 5,

    detail: {
      itemId: 'matcha-nitro',
      styleId: 'ice',
      sizeKey: 'medium',
      milkId: 'dairy',
      addonIds: [],
      sugar: 'Normal',
      ice: 'Normal',
      qty: 1,
      note: '',
      descExpanded: false,
      selectedTagIndex: -1,
      editingCartKey: null,
    },

    cart: [],
    appliedVoucher: null,

    payment: {
      methodId: 'qris',
      subProvider: 'GoPay',
      vaBank: 'BCA VA',
      redeemPoints: false,
      qrisSeconds: 300,
      qrisInterval: null,
    },
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
    toolbarBagBadge: document.getElementById('toolbarBagBadge'),
    toolbarSyncDot: document.getElementById('toolbarSyncDot'),
    mobilePreviewToggle: document.getElementById('mobilePreviewToggle'),
    dockBtns: Array.from(document.querySelectorAll('.dock-btn')),
    dockBagBadge: document.getElementById('dockBagBadge'),
    dockOrdersDot: document.getElementById('dockOrdersDot'),

    // Menu Home
    homeMemberName: document.getElementById('homeMemberName'),
    homeSyncLabel: document.getElementById('homeSyncLabel'),
    homePointsChip: document.getElementById('homePointsChip'),
    homePointsVal: document.getElementById('homePointsVal'),
    outletSelectBtn: document.getElementById('outletSelectBtn'),
    activeOutletName: document.getElementById('activeOutletName'),
    activeOutletMeta: document.getElementById('activeOutletMeta'),
    modeOpts: Array.from(document.querySelectorAll('.mode-opt')),
    tableSelectBtn: document.getElementById('tableSelectBtn'),
    tableNumberLabel: document.getElementById('tableNumberLabel'),
    pickupSlotBtn: document.getElementById('pickupSlotBtn'),
    pickupSlotLabel: document.getElementById('pickupSlotLabel'),
    deliveryAddressBar: document.getElementById('deliveryAddressBar'),
    deliveryAddressInput: document.getElementById('deliveryAddressInput'),
    deliveryFeePill: document.getElementById('deliveryFeePill'),
    homeActiveOrderBanner: document.getElementById('homeActiveOrderBanner'),
    homeActiveOrderTitle: document.getElementById('homeActiveOrderTitle'),
    homeActiveOrderSub: document.getElementById('homeActiveOrderSub'),
    menuSearchInput: document.getElementById('menuSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    promoCarousel: document.getElementById('promoCarousel'),
    orderAgainBlock: document.getElementById('orderAgainBlock'),
    orderAgainRow: document.getElementById('orderAgainRow'),
    categoryPills: document.getElementById('categoryPills'),
    menuGridHeading: document.getElementById('menuGridHeading'),
    menuGridCount: document.getElementById('menuGridCount'),
    menuGrid: document.getElementById('menuGrid'),

    // Promo & Rewards
    promoAppliedPill: document.getElementById('promoAppliedPill'),
    stampCounterLabel: document.getElementById('stampCounterLabel'),
    stampDotsRow: document.getElementById('stampDotsRow'),
    promoCodeForm: document.getElementById('promoCodeForm'),
    promoCodeInput: document.getElementById('promoCodeInput'),
    promoVoucherList: document.getElementById('promoVoucherList'),
    promoPointsAvail: document.getElementById('promoPointsAvail'),
    rewardsStoreList: document.getElementById('rewardsStoreList'),
    promoMerchList: document.getElementById('promoMerchList'),

    // Bag
    bagHeaderCount: document.getElementById('bagHeaderCount'),
    bagAddMoreBtn: document.getElementById('bagAddMoreBtn'),
    bagModeSummary: document.getElementById('bagModeSummary'),
    bagOutletSummary: document.getElementById('bagOutletSummary'),
    bagChangeModeBtn: document.getElementById('bagChangeModeBtn'),
    mergeToggleRow: document.getElementById('mergeToggleRow'),
    mergeTargetId: document.getElementById('mergeTargetId'),
    mergeOrderCheckbox: document.getElementById('mergeOrderCheckbox'),
    bagItemsList: document.getElementById('bagItemsList'),
    bagUpsellRow: document.getElementById('bagUpsellRow'),
    bagVoucherTrigger: document.getElementById('bagVoucherTrigger'),
    bagVoucherTitle: document.getElementById('bagVoucherTitle'),
    bagVoucherSub: document.getElementById('bagVoucherSub'),
    bagSubtotal: document.getElementById('bagSubtotal'),
    bagDeliveryRow: document.getElementById('bagDeliveryRow'),
    bagDeliveryVal: document.getElementById('bagDeliveryVal'),
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
    cancelOrderBtn: document.getElementById('cancelOrderBtn'),
    orderRatingCard: document.getElementById('orderRatingCard'),
    ratingStarsRow: document.getElementById('ratingStarsRow'),
    ratingCommentInput: document.getElementById('ratingCommentInput'),
    submitRatingBtn: document.getElementById('submitRatingBtn'),
    trackerBrandBtn: document.getElementById('trackerBrandBtn'),
    callRestaurantBtn: document.getElementById('callRestaurantBtn'),
    pairingCarousel: document.getElementById('pairingCarousel'),
    orderHistoryCount: document.getElementById('orderHistoryCount'),
    orderHistoryList: document.getElementById('orderHistoryList'),

    // Me
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

    // Product Detail & Floating Mini-Cart
    detailDesktopScrim: document.getElementById('detailDesktopScrim'),
    detailFrameContainer: document.querySelector('#screenDetail .detail-frame-container'),
    productGlassSheet: document.getElementById('productGlassSheet'),
    detailHandleBar: document.getElementById('detailHandleBar'),
    floatingMiniCart: document.getElementById('floatingMiniCart'),
    miniCartThumbs: document.getElementById('miniCartThumbs'),
    miniCartSummary: document.getElementById('miniCartSummary'),
    miniCartMeta: document.getElementById('miniCartMeta'),
    detailScroll: document.getElementById('detailScroll'),
    detailBackBtn: document.getElementById('detailBackBtn'),
    detailCategoryPill: document.getElementById('detailCategoryPill'),
    detailFavBtn: document.getElementById('detailFavBtn'),
    detailTitle: document.getElementById('detailTitle'),
    detailVolume: document.getElementById('detailVolume'),
    detailUnitPrice: document.getElementById('detailUnitPrice'),
    detailNutritionRow: document.getElementById('detailNutritionRow'),
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
    detailMilkGroup: document.getElementById('detailMilkGroup'),
    detailMilkPills: document.getElementById('detailMilkPills'),
    detailAddonsGroup: document.getElementById('detailAddonsGroup'),
    detailAddonsList: document.getElementById('detailAddonsList'),
    detailLevelsGroup: document.getElementById('detailLevelsGroup'),
    sugarLevelPills: Array.from(document.querySelectorAll('#sugarLevelPills .level-pill')),
    iceLevelPills: Array.from(document.querySelectorAll('#iceLevelPills .level-pill')),
    detailNoteInput: document.getElementById('detailNoteInput'),
    detailBagShortcut: document.getElementById('detailBagShortcut'),
    detailBagCount: document.getElementById('detailBagCount'),
    detailAddBtn: document.getElementById('detailAddBtn'),
    detailAddLabel: document.getElementById('detailAddLabel'),

    // Modals
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

    outletModalBackdrop: document.getElementById('outletModalBackdrop'),
    outletList: document.getElementById('outletList'),

    tableModalBackdrop: document.getElementById('tableModalBackdrop'),
    tableGrid: document.getElementById('tableGrid'),

    callSheetBackdrop: document.getElementById('callSheetBackdrop'),
    dialNowBtn: document.getElementById('dialNowBtn'),
    pingBaristaBtn: document.getElementById('pingBaristaBtn'),

    glassToast: document.getElementById('glassToast'),
  };

  /* ========================================================================
     HELPERS
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
      if (icon) icon.innerHTML = isLight ? SUN_SVG : MOON_SVG;
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
    const size = 21;
    let hash = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
      hash ^= seedText.charCodeAt(i);
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
        if (on) rects.push(`<rect x="${c * 6}" y="${r * 6}" width="5.6" height="5.6" rx="1.2" fill="#08131a"/>`);
      }
    }
    return `<svg width="132" height="132" viewBox="0 0 ${size * 6} ${size * 6}" aria-label="QRIS Code">${rects.join('')}</svg>`;
  }

  /* ========================================================================
     NAVIGATION
     ======================================================================== */

  const TAB_ORDER = ['menu', 'promo', 'bag', 'orders', 'me'];
  let leavingTimer = null;

  function triggerPop(node) {
    if (!node) return;
    node.classList.remove('is-popping');
    void node.offsetWidth;
    node.classList.add('is-popping');
  }

  function resetUnderlyingScreenTransform() {
    const under = el.screens[state.currentView];
    if (under) {
      under.style.transform = '';
      under.style.filter = '';
      under.style.transition = '';
    }
    if (el.detailDesktopScrim) {
      el.detailDesktopScrim.style.opacity = '';
      el.detailDesktopScrim.style.transition = '';
    }
  }

  function openDetailSheet() {
    state.detailOpen = true;
    resetUnderlyingScreenTransform();
    el.screens.detail.classList.add('is-active');
    el.screens.detail.setAttribute('aria-hidden', 'false');
    el.phoneShell.classList.add('has-detail-open');
    el.phoneShell.dataset.view = 'detail';
    if (el.detailFrameContainer) el.detailFrameContainer.style.transform = '';
    syncMiniCartVisibility();
  }

  function closeDetailSheet() {
    if (!state.detailOpen) return;
    state.detailOpen = false;
    resetUnderlyingScreenTransform();
    el.screens.detail.classList.remove('is-active');
    el.screens.detail.setAttribute('aria-hidden', 'true');
    el.phoneShell.classList.remove('has-detail-open');
    el.phoneShell.dataset.view = state.currentView;
    if (el.detailFrameContainer) el.detailFrameContainer.style.transform = '';
    syncMiniCartVisibility();
  }

  function switchView(target) {
    if (target === 'detail') {
      openDetailSheet();
      return;
    }
    if (!el.screens[target]) return;
    if (state.detailOpen) closeDetailSheet();

    const prev = state.currentView;
    if (prev && prev !== target && el.screens[prev]) {
      const prevIdx = TAB_ORDER.indexOf(prev);
      const nextIdx = TAB_ORDER.indexOf(target);
      const dir = nextIdx >= prevIdx ? 1 : -1;
      el.phoneShell.style.setProperty('--nav-dir', String(dir));

      clearTimeout(leavingTimer);
      Object.values(el.screens).forEach((s) => s.classList.remove('is-leaving'));
      const outNode = el.screens[prev];
      outNode.classList.add('is-leaving');
      leavingTimer = setTimeout(() => outNode.classList.remove('is-leaving'), 340);
    }

    state.previousTab = target;

    Object.entries(el.screens).forEach(([key, node]) => {
      if (key === 'detail') return;
      const active = key === target;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-hidden', String(!active));
    });

    state.currentView = target;
    el.phoneShell.dataset.view = target;

    el.dockBtns.forEach((btn) => {
      const active = btn.dataset.tab === target;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    el.toolbarTabs.forEach((tab) => {
      const active = tab.dataset.navView === target;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    if (target === 'menu') {
      renderOrderAgain();
      renderMenuGrid(false);
    }
    if (target === 'bag') renderBag();
    if (target === 'orders') renderOrdersView();
    if (target === 'promo') renderPromoView();
    if (target === 'me') renderMeView();
    syncMiniCartVisibility();
  }

  function openItemDetail(itemId, editItem) {
    const item = DATA.getItemById(itemId);
    if (!POS.isItemAvailable(item.id) && !editItem) {
      showToast(`${item.shortName} is currently Sold Out`);
      return;
    }

    if (editItem) {
      state.detail = {
        itemId: item.id,
        styleId: editItem.styleId || item.styles[0].id,
        sizeKey: editItem.sizeKey || DATA.getDefaultSizeKey(item),
        milkId: editItem.milkId || 'dairy',
        addonIds: Array.isArray(editItem.addons) ? editItem.addons.map((a) => a.id) : [],
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
        milkId: 'dairy',
        addonIds: [],
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
    if (el.detailScroll) el.detailScroll.scrollTop = 0;
    openDetailSheet();
  }

  /* ========================================================================
     CART & PRICING ENGINE (WITH MILK, PAID ADD-ONS & DELIVERY FEE)
     ======================================================================== */

  function computeDetailUnitPrice() {
    const d = state.detail;
    const item = DATA.getItemById(d.itemId);
    let unit = item.sizes[d.sizeKey].price;
    if (item.hasMilk) {
      const m = DATA.MILK_OPTIONS.find((x) => x.id === d.milkId);
      if (m) unit += m.price;
    }
    const validAddons = DATA.getAddonsForItem(item);
    d.addonIds.forEach((aid) => {
      const a = validAddons.find((x) => x.id === aid);
      if (a) unit += a.price;
    });
    return unit;
  }

  function getCartMetrics() {
    const member = POS.getMember();
    const outlet = DATA.getOutletById(state.outletId);
    let count = 0;
    let subtotal = 0;
    state.cart.forEach((c) => {
      count += c.qty;
      subtotal += c.unitPrice * c.qty;
    });

    const deliveryFee = state.orderMode === 'delivery' && count > 0 ? outlet.deliveryFee : 0;
    const voucherRes = DATA.calculateVoucherDiscount(state.appliedVoucher, state.cart, subtotal, member);
    const discount = voucherRes.valid ? voucherRes.discount : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);
    const pointsEarned = Math.round(total / 1000);
    return { count, subtotal, deliveryFee, discount, total, pointsEarned, voucherRes };
  }

  function syncMiniCartVisibility() {
    if (!el.floatingMiniCart) return;
    const { count, total } = getCartMetrics();
    const shouldShow = count > 0 && state.currentView !== 'bag' && !state.detailOpen;

    document.body.classList.toggle('has-cart-items', count > 0);
    el.floatingMiniCart.classList.toggle('is-visible', shouldShow);
    el.floatingMiniCart.setAttribute('aria-hidden', String(!shouldShow));

    if (count > 0) {
      const thumbs = state.cart
        .slice(0, 3)
        .map((c) => `<img src="${c.image}" alt="" class="minicart-thumb" />`)
        .join('');
      el.miniCartThumbs.innerHTML = thumbs;
      el.miniCartSummary.textContent = `${count} ${count === 1 ? 'item' : 'items'} • ${DATA.formatRp(total)}`;
      const outlet = DATA.getOutletById(state.outletId);
      const loc = state.orderMode === 'dine-in' ? `Table ${state.tableNumber}` : state.orderMode === 'delivery' ? 'Delivery' : 'Pick Up';
      el.miniCartMeta.textContent = `${outlet.name} • ${loc}`;
    }
  }

  function syncGlobalBadges(shouldPop) {
    const { count } = getCartMetrics();
    el.dockBagBadge.textContent = String(count);
    el.dockBagBadge.hidden = count === 0;
    el.toolbarBagBadge.textContent = String(count);
    el.toolbarBagBadge.hidden = count === 0;
    el.detailBagCount.textContent = String(count);

    syncMiniCartVisibility();
    if (shouldPop && count > 0) {
      triggerPop(el.dockBagBadge);
      triggerPop(el.toolbarBagBadge);
      triggerPop(el.floatingMiniCart);
    }

    const online = POS.isBackendOnline();
    el.homeSyncLabel.textContent = online
      ? 'KOTA Coffee • Live Multi-Device POS Connected'
      : 'KOTA Coffee • Live Browser POS Sync';

    const activeOrder = POS.getActiveOrder();
    const hasRunning = activeOrder && activeOrder.status !== 'complete' && activeOrder.status !== 'cancelled';
    el.dockOrdersDot.hidden = !hasRunning;

    if (hasRunning) {
      const meta = POS.STATUS_META[activeOrder.status];
      el.homeActiveOrderBanner.hidden = false;
      el.homeActiveOrderTitle.textContent = `#${activeOrder.orderId} • ${meta.heading}`;
      const loc =
        activeOrder.orderMode === 'dine-in'
          ? `Table ${activeOrder.tableNumber || '07'}`
          : activeOrder.orderMode === 'delivery'
          ? 'Delivery'
          : `Pick Up (${activeOrder.pickupTime || 'Now'})`;
      el.homeActiveOrderSub.textContent = `${meta.eta} • ${loc} • Tap to track`;
    } else {
      el.homeActiveOrderBanner.hidden = true;
    }

    const member = POS.getMember();
    el.homeMemberName.textContent = member.name;
    el.homePointsVal.textContent = String(member.points);
  }

  function quickAddToBag(item, btnEl) {
    if (!POS.isItemAvailable(item.id)) {
      showToast(`${item.shortName} is Sold Out`);
      return;
    }
    const sizeKey = DATA.getDefaultSizeKey(item);
    const sizeObj = item.sizes[sizeKey];
    const styleObj = item.styles[0];
    const key = `${item.id}::${styleObj.id}::${sizeKey}::dairy::::Normal::Normal::`;

    const existing = state.cart.find((c) => c.key === key);
    if (existing) existing.qty += 1;
    else {
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
        milkId: item.hasMilk ? 'dairy' : null,
        milk: item.hasMilk ? 'Fresh Dairy' : null,
        addons: [],
        sugar: item.hasLevels ? 'Normal' : null,
        ice: item.hasLevels ? 'Normal' : null,
        note: '',
        qty: 1,
        unitPrice: sizeObj.price,
      });
    }

    if (btnEl) {
      btnEl.classList.add('is-added');
      btnEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>`;
      setTimeout(() => {
        btnEl.classList.remove('is-added');
        btnEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
      }, 650);
    }

    syncGlobalBadges(true);
    if (state.currentView === 'bag') renderBag();
    showToast(`Added ${item.shortName} • ${DATA.formatRp(sizeObj.price)}`);
  }

  function saveDetailToBag() {
    const d = state.detail;
    const item = DATA.getItemById(d.itemId);
    if (!POS.isItemAvailable(item.id)) {
      showToast(`${item.shortName} was just marked Sold Out at POS`);
      return;
    }

    const styleObj = item.styles.find((s) => s.id === d.styleId) || item.styles[0];
    const sizeObj = item.sizes[d.sizeKey];
    const milkObj = item.hasMilk ? DATA.MILK_OPTIONS.find((m) => m.id === d.milkId) || DATA.MILK_OPTIONS[0] : null;
    const validAddons = DATA.getAddonsForItem(item);
    const chosenAddons = d.addonIds
      .map((aid) => validAddons.find((a) => a.id === aid))
      .filter(Boolean)
      .map((a) => ({ id: a.id, label: a.label, price: a.price }));

    const unitPrice = computeDetailUnitPrice();
    const cleanNote = (el.detailNoteInput.value || '').trim();
    const addonKey = chosenAddons.map((a) => a.id).sort().join(',');
    const key = `${item.id}::${styleObj.id}::${d.sizeKey}::${milkObj ? milkObj.id : ''}::${addonKey}::${item.hasLevels ? d.sugar : ''}::${item.hasLevels ? d.ice : ''}::${cleanNote}`;

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
      milkId: milkObj ? milkObj.id : null,
      milk: milkObj ? milkObj.label : null,
      addons: chosenAddons,
      sugar: item.hasLevels ? d.sugar : null,
      ice: item.hasLevels ? d.ice : null,
      note: cleanNote,
      qty: d.qty,
      unitPrice,
    };

    if (d.editingCartKey) {
      const idx = state.cart.findIndex((c) => c.key === d.editingCartKey);
      if (idx !== -1) state.cart[idx] = entry;
      else state.cart.push(entry);
      showToast(`Updated ${item.shortName} in My Bag`);
      closeDetailSheet();
      syncGlobalBadges(true);
      switchView('bag');
      return;
    }

    const existing = state.cart.find((c) => c.key === key);
    if (existing) existing.qty += d.qty;
    else state.cart.push(entry);

    // Dismiss bottom sheet cleanly back to Menu & surface Floating Mini-Cart Bar!
    closeDetailSheet();
    syncGlobalBadges(true);
    showToast(`${d.qty}× ${item.shortName} added to Bag • Tap View Bag anytime`);
  }

  /* ========================================================================
     RENDER: VIEW 1 (MENU HOME)
     ======================================================================== */

  function renderOutletAndModeUI() {
    const outlet = DATA.getOutletById(state.outletId);
    el.activeOutletName.textContent = outlet.name;
    el.activeOutletMeta.textContent = `${outlet.distance} • ${outlet.prepTime}`;
    el.deliveryFeePill.textContent = `+${DATA.formatRp(outlet.deliveryFee)}`;

    el.modeOpts.forEach((btn) => {
      const active = btn.dataset.orderMode === state.orderMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', String(active));
    });

    el.tableSelectBtn.hidden = state.orderMode !== 'dine-in';
    el.pickupSlotBtn.hidden = state.orderMode !== 'pickup';
    el.deliveryAddressBar.hidden = state.orderMode !== 'delivery';

    el.tableNumberLabel.textContent = `Table ${state.tableNumber}`;
    const slot = DATA.PICKUP_SLOTS[state.pickupSlotIndex] || DATA.PICKUP_SLOTS[0];
    el.pickupSlotLabel.textContent = slot.label;
  }

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

  function renderOrderAgain() {
    const orders = POS.getOrders();
    const seen = new Set();
    const recentItems = [];
    for (const o of orders) {
      for (const it of o.items || []) {
        if (!seen.has(it.itemId) && POS.isItemAvailable(it.itemId)) {
          seen.add(it.itemId);
          recentItems.push(DATA.getItemById(it.itemId));
          if (recentItems.length >= 6) break;
        }
      }
      if (recentItems.length >= 6) break;
    }

    el.orderAgainBlock.hidden = recentItems.length === 0;
    if (recentItems.length === 0) return;

    el.orderAgainRow.innerHTML = '';
    recentItems.forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'order-again-chip';
      chip.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.shortName)}" />
        <span>
          <strong>${escapeHtml(item.shortName)}</strong>
          <small>${DATA.formatRp(DATA.getBasePrice(item))}</small>
        </span>
        <span class="oa-plus">+</span>
      `;
      chip.addEventListener('click', () => quickAddToBag(item, null));
      el.orderAgainRow.appendChild(chip);
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
        if (state.activeCategory === cat.id) return;
        state.activeCategory = cat.id;
        renderCategoryPills();
        renderMenuGrid(true);
        const activeBtn = el.categoryPills.querySelector('.cat-pill.is-active');
        if (activeBtn && activeBtn.scrollIntoView) {
          activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
      el.categoryPills.appendChild(btn);
    });
  }

  function renderMenuGrid(animateCards) {
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
      ? 'SEARCH RESULTS'
      : state.activeCategory === 'all'
      ? 'ALL BOTANICAL MENU'
      : catObj.label.toUpperCase();
    el.menuGridCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}`;

    el.menuGrid.innerHTML = '';
    if (filtered.length === 0) {
      el.menuGrid.innerHTML = `<div class="menu-empty">No menu items match "${escapeHtml(q)}". Try "matcha", "aren", "croissant", or "panini".</div>`;
      return;
    }

    filtered.forEach((item, idx) => {
      const price = DATA.getBasePrice(item);
      const available = POS.isItemAvailable(item.id);
      const card = document.createElement('article');
      card.className = `menu-card ${available ? '' : 'is-soldout'} ${animateCards ? 'is-entering' : ''}`;
      if (animateCards) card.style.setProperty('--card-delay', `${Math.min(idx * 24, 180)}ms`);
      card.setAttribute('role', 'listitem');
      card.dataset.itemId = item.id;

      card.innerHTML = `
        <div class="notched-frame-wrap">
          <div class="notched-glass-surface" style="--card-top:${item.theme.cardTop};--card-bot:${item.theme.cardBot}">
            <span class="card-badge-chip">${available ? escapeHtml(item.badge) : 'SOLD OUT'}</span>
            <img src="${item.image}" alt="${escapeHtml(item.shortName)}" class="card-item-img" draggable="false" />
            <button type="button" class="notched-add-btn" ${available ? '' : 'disabled'} aria-label="Quick add ${escapeHtml(item.shortName)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
        <div class="menu-card-meta">
          <h3 class="menu-card-name">${escapeHtml(item.shortName)}</h3>
          <p class="menu-card-sub">${escapeHtml(item.tags.slice(0, 2).map((t) => t.label).join(' • '))}</p>
          <p class="menu-card-price">${available ? DATA.formatRp(price) : 'Temporarily Out'}</p>
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

  /* ========================================================================
     RENDER: PRO ADAPTIVE PRODUCT DETAIL VIEW
     ======================================================================== */

  function renderDetailView() {
    const d = state.detail;
    const item = DATA.getItemById(d.itemId);
    const sizeObj = item.sizes[d.sizeKey];
    const member = POS.getMember();
    const unitPrice = computeDetailUnitPrice();

    applyAdaptiveTheme(item);

    el.detailCategoryPill.textContent = item.categoryLabel;
    el.detailTitle.textContent = item.name;
    el.detailVolume.textContent = sizeObj.volume;
    el.detailUnitPrice.textContent = DATA.formatRp(unitPrice);
    el.detailDescText.textContent = d.descExpanded ? item.fullDesc : item.shortDesc;
    el.detailReadMoreBtn.textContent = d.descExpanded ? 'Show less' : 'Read more';
    el.detailReadMoreBtn.setAttribute('aria-expanded', String(d.descExpanded));

    // Nutrition & Caffeine micro-pills
    const nutPills = [];
    if (item.kcal) nutPills.push(`<span class="nut-pill">${item.kcal} kcal</span>`);
    if (item.caffeine) nutPills.push(`<span class="nut-pill">Caffeine: ${escapeHtml(item.caffeine)}</span>`);
    el.detailNutritionRow.innerHTML = nutPills.join('');
    el.detailNutritionRow.hidden = nutPills.length === 0;

    const isFav = member.favorites.includes(item.id);
    el.detailFavBtn.classList.toggle('is-favorited', isFav);
    el.detailFavBtn.setAttribute('aria-pressed', String(isFav));

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

    // Size segmented control
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

    // Style cards
    el.detailStyleRow.innerHTML = '';
    item.styles.forEach((st) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `style-card-btn ${d.styleId === st.id ? 'is-active' : ''}`;
      btn.innerHTML = `${getStyleIconSvg(st.icon)}<span>${escapeHtml(st.label)}</span>`;
      btn.addEventListener('click', () => {
        d.styleId = st.id;
        renderDetailView();
      });
      el.detailStyleRow.appendChild(btn);
    });

    // Milk Choice (for milk-based drinks)
    el.detailMilkGroup.hidden = !item.hasMilk;
    if (item.hasMilk) {
      el.detailMilkPills.innerHTML = '';
      DATA.MILK_OPTIONS.forEach((m) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `milk-pill ${d.milkId === m.id ? 'is-active' : ''}`;
        btn.innerHTML = `<span>${escapeHtml(m.label)}</span><small>${m.price > 0 ? `+${DATA.formatRp(m.price)}` : 'Included'}</small>`;
        btn.addEventListener('click', () => {
          d.milkId = m.id;
          renderDetailView();
        });
        el.detailMilkPills.appendChild(btn);
      });
    }

    // Paid Add-ons & Toppings
    const itemAddons = DATA.getAddonsForItem(item);
    el.detailAddonsGroup.hidden = itemAddons.length === 0;
    if (itemAddons.length > 0) {
      el.detailAddonsList.innerHTML = '';
      itemAddons.forEach((a) => {
        const selected = d.addonIds.includes(a.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `addon-chip-btn ${selected ? 'is-active' : ''}`;
        btn.innerHTML = `<span>${selected ? '✓ ' : '+ '}${escapeHtml(a.label)}</span><strong>+${DATA.formatRp(a.price)}</strong>`;
        btn.addEventListener('click', () => {
          if (selected) d.addonIds = d.addonIds.filter((x) => x !== a.id);
          else d.addonIds = d.addonIds.concat(a.id);
          renderDetailView();
        });
        el.detailAddonsList.appendChild(btn);
      });
    }

    // Sugar & Ice Levels
    el.detailLevelsGroup.hidden = !item.hasLevels;
    if (item.hasLevels) {
      el.sugarLevelPills.forEach((p) => p.classList.toggle('is-active', p.dataset.sugar === d.sugar));
      el.iceLevelPills.forEach((p) => p.classList.toggle('is-active', p.dataset.ice === d.ice));
    }

    el.detailQtyVal.textContent = String(d.qty);
    if (el.detailNoteInput.value !== d.note) el.detailNoteInput.value = d.note;

    const lineTotal = unitPrice * d.qty;
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
     RENDER: VIEW 2 (PROMO, STAMP MISSION & REWARDS REDEMPTION STORE)
     ======================================================================== */

  function buildVoucherCard(v, closeModalAfter = false) {
    const isApplied = state.appliedVoucher === v.code;
    const card = document.createElement('article');
    card.className = `voucher-card ${isApplied ? 'is-applied' : ''}`;
    card.innerHTML = `
      <div class="voucher-left">
        <div class="voucher-code-row">
          <span class="voucher-code-badge">${escapeHtml(v.code)}</span>
          <span class="voucher-tag">${escapeHtml(v.badge || 'PROMO')}</span>
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
        const check = DATA.calculateVoucherDiscount(v.code, state.cart, subtotal, POS.getMember());
        if (state.cart.length > 0 && !check.valid) showToast(`Saved ${v.code} (${check.reason})`);
        else showToast(`Voucher ${v.code} applied!`);
      }
      renderPromoView();
      renderBag();
      renderVoucherModalList();
      if (closeModalAfter) closeModal('voucher');
    });
    return card;
  }

  function renderPromoView() {
    const member = POS.getMember();
    el.promoAppliedPill.hidden = !state.appliedVoucher;
    if (state.appliedVoucher) el.promoAppliedPill.textContent = `${state.appliedVoucher} Active`;

    // Stamp Mission Card
    const stamps = member.stamps || 0;
    const target = member.stampsTarget || 5;
    el.stampCounterLabel.textContent = `${stamps} / ${target}`;
    el.stampDotsRow.innerHTML = '';
    for (let i = 1; i <= target; i++) {
      const dot = document.createElement('div');
      dot.className = `stamp-dot ${i <= stamps ? 'is-earned' : ''}`;
      dot.innerHTML = i <= stamps ? '✓' : i === target ? '★' : String(i);
      el.stampDotsRow.appendChild(dot);
    }

    // All Vouchers (Unlocked Rewards + Built-in Vouchers)
    el.promoVoucherList.innerHTML = '';
    DATA.getAllVouchers(member).forEach((v) => el.promoVoucherList.appendChild(buildVoucherCard(v, false)));

    // Rewards Store (Spend Points -> Unlock Voucher!)
    el.promoPointsAvail.textContent = `${member.points} pts available`;
    el.rewardsStoreList.innerHTML = '';
    DATA.REWARDS_STORE.forEach((r) => {
      const canAfford = member.points >= r.cost;
      const card = document.createElement('article');
      card.className = 'voucher-card';
      card.innerHTML = `
        <div class="voucher-left">
          <div class="voucher-code-row">
            <span class="voucher-code-badge">${r.cost} PTS</span>
            <span class="voucher-tag">REWARD</span>
          </div>
          <div class="voucher-title">${escapeHtml(r.title)}</div>
          <div class="voucher-desc">${escapeHtml(r.desc)}</div>
        </div>
        <button type="button" class="voucher-apply-btn" ${canAfford ? '' : 'disabled'}>Redeem</button>
      `;
      card.querySelector('.voucher-apply-btn').addEventListener('click', async () => {
        try {
          const uniqueCode = `${r.voucher.code}-${Math.floor(10 + Math.random() * 89)}`;
          const rewardVoucher = Object.assign({}, r.voucher, { code: uniqueCode });
          await POS.updateMember({ redeemReward: { cost: r.cost, voucher: rewardVoucher } });
          state.appliedVoucher = uniqueCode;
          syncGlobalBadges();
          renderPromoView();
          renderMeView();
          showToast(`Redeemed! Voucher ${uniqueCode} unlocked & applied!`);
        } catch (err) {
          showToast(err.message);
        }
      });
      el.rewardsStoreList.appendChild(card);
    });

    // Merch Spotlight
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
    DATA.getAllVouchers(POS.getMember()).forEach((v) => el.modalVoucherList.appendChild(buildVoucherCard(v, true)));
  }

  /* ========================================================================
     RENDER: VIEW 3 (MY BAG + SMART UPSELL + MERGE TABLE)
     ======================================================================== */

  function renderBag() {
    const metrics = getCartMetrics();
    const outlet = DATA.getOutletById(state.outletId);

    el.bagHeaderCount.textContent = `(${metrics.count})`;
    if (state.orderMode === 'dine-in') {
      el.bagModeSummary.textContent = `Dine-In • Table ${state.tableNumber}`;
    } else if (state.orderMode === 'pickup') {
      el.bagModeSummary.textContent = `Self Pick-Up • ${DATA.PICKUP_SLOTS[state.pickupSlotIndex].label}`;
    } else {
      el.bagModeSummary.textContent = `Delivery • ${state.deliveryAddress || 'Enter address'}`;
    }
    el.bagOutletSummary.textContent = `${outlet.name} • Direct to Barista POS`;

    const activeOrder = POS.getActiveOrder();
    const canMerge =
      activeOrder &&
      activeOrder.status !== 'complete' &&
      activeOrder.status !== 'cancelled' &&
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
        <p>Explore ceremonial matcha, specialty coffee, brunch, pastries, or merch to start ordering.</p>
        <button type="button" class="add-more-pill" id="emptyBrowseBtn">Browse Menu</button>
      `;
      empty.querySelector('#emptyBrowseBtn').addEventListener('click', () => switchView('menu'));
      el.bagItemsList.appendChild(empty);
    } else {
      state.cart.forEach((item, index) => {
        const mods = [
          item.style,
          item.size,
          item.milk && item.milk !== 'Fresh Dairy' ? item.milk : null,
          item.sugar && item.sugar !== 'Normal' ? item.sugar : null,
          item.ice && item.ice !== 'Normal' ? item.ice : null,
        ]
          .filter(Boolean)
          .join(', ');

        const addonsLine =
          Array.isArray(item.addons) && item.addons.length > 0
            ? `<div class="bag-item-addons">+ ${escapeHtml(item.addons.map((a) => a.label).join(', '))}</div>`
            : '';

        const card = document.createElement('article');
        card.className = 'bag-item-card';
        card.innerHTML = `
          <div class="bag-item-info">
            <div class="bag-item-name">${escapeHtml(item.name)}</div>
            <div class="bag-item-mods">${escapeHtml(mods)}</div>
            ${addonsLine}
            ${item.note ? `<div class="bag-item-note">"${escapeHtml(item.note)}"</div>` : ''}
            <div class="bag-item-bottom">
              <span class="bag-item-price">${DATA.formatRp(item.unitPrice * item.qty)}</span>
              <button type="button" class="bag-change-btn">Change</button>
            </div>
          </div>
          <div class="bag-item-right">
            <div class="bag-item-thumb"><img src="${item.image}" alt="${escapeHtml(item.name)}" /></div>
            <div class="qty-inline-stepper">
              <button type="button" class="qty-btn" data-d="-1" aria-label="Decrease">&minus;</button>
              <span class="qty-val">${item.qty}</span>
              <button type="button" class="qty-btn is-plus" data-d="1" aria-label="Increase">+</button>
            </div>
          </div>
        `;

        card.querySelector('.bag-change-btn').addEventListener('click', () => openItemDetail(item.itemId, item));
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

    // Smart Bag Upsell (Pastries & Brunch not yet in Bag)
    const inBagIds = new Set(state.cart.map((c) => c.itemId));
    const upsells = DATA.MENU_ITEMS.filter(
      (i) => (i.category === 'pastry' || i.category === 'food') && !inBagIds.has(i.id) && POS.isItemAvailable(i.id)
    ).slice(0, 4);

    el.bagUpsellRow.innerHTML = '';
    upsells.forEach((u) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'upsell-mini-card';
      card.innerHTML = `
        <img src="${u.image}" alt="${escapeHtml(u.shortName)}" />
        <div class="upsell-copy">
          <strong>${escapeHtml(u.shortName)}</strong>
          <span>${DATA.formatRp(DATA.getBasePrice(u))}</span>
        </div>
        <span class="upsell-plus">+</span>
      `;
      card.addEventListener('click', () => quickAddToBag(u, null));
      el.bagUpsellRow.appendChild(card);
    });

    // Voucher Trigger UI
    if (state.appliedVoucher && metrics.voucherRes.valid) {
      el.bagVoucherTitle.textContent = `${state.appliedVoucher} Applied!`;
      el.bagVoucherSub.textContent = `Saving ${DATA.formatRp(metrics.discount)} on this order`;
    } else if (state.appliedVoucher && !metrics.voucherRes.valid) {
      el.bagVoucherTitle.textContent = `${state.appliedVoucher} (Not eligible yet)`;
      el.bagVoucherSub.textContent = metrics.voucherRes.reason || 'Tap to pick another voucher';
    } else {
      el.bagVoucherTitle.textContent = 'Have a voucher?';
      el.bagVoucherSub.textContent = 'Tap to pick MATCHA20, FIRSTBREW, or redeemed rewards';
    }

    el.bagSubtotal.textContent = DATA.formatRp(metrics.subtotal);
    el.bagDeliveryRow.hidden = metrics.deliveryFee <= 0;
    el.bagDeliveryVal.textContent = DATA.formatRp(metrics.deliveryFee);
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
     PAYMENT GATEWAY & LIVE FULL-STACK POS DISPATCH
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
        const t = document.getElementById('qrisCountdownVal');
        if (t) {
          t.textContent = `${String(Math.floor(state.payment.qrisSeconds / 60)).padStart(2, '0')}:${String(state.payment.qrisSeconds % 60).padStart(2, '0')}`;
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
      const mm = String(Math.floor(p.qrisSeconds / 60)).padStart(2, '0');
      const ss = String(p.qrisSeconds % 60).padStart(2, '0');
      el.payGatewayPanel.innerHTML = `
        <div class="qris-box">
          <span class="qris-header-pill">QRIS • NATIONAL STANDARD</span>
          <div class="qris-svg-frame">${buildQrisSvg(`KOTACOFFEE-${finalAmount}-${metrics.count}`)}</div>
          <div style="font-size:12px;color:var(--text-secondary);">Merchant: <strong>KOTA COFFEE &amp; BOTANICAL BAR</strong></div>
          <div class="qris-timer">Expires in <strong id="qrisCountdownVal">${mm}:${ss}</strong></div>
        </div>
      `;
      el.confirmPaymentLabel.textContent = `Pay with QRIS • ${DATA.formatRp(finalAmount)}`;
    } else if (p.methodId === 'gopay') {
      const providers = DATA.PAYMENT_METHODS.find((x) => x.id === 'gopay').providers;
      el.payGatewayPanel.innerHTML = `
        <div style="font-size:12.5px;font-weight:700;">Select E-Wallet / Handpay</div>
        <div class="provider-pills">
          ${providers.map((name) => `<button type="button" class="provider-pill ${p.subProvider === name ? 'is-active' : ''}" data-ew="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('')}
        </div>
        <p style="font-size:11.5px;color:var(--text-muted);margin-top:10px;">Instant approval • Zero gateway fee.</p>
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
      const prefix = p.vaBank === 'BCA VA' ? '8801' : p.vaBank === 'Mandiri VA' ? '8902' : '8810';
      const vaNum = `${prefix} 0812 8824 0042`;
      el.payGatewayPanel.innerHTML = `
        <div style="font-size:12.5px;font-weight:700;">Select Bank Virtual Account</div>
        <div class="provider-pills">
          ${banks.map((b) => `<button type="button" class="provider-pill ${p.vaBank === b ? 'is-active' : ''}" data-va="${escapeHtml(b)}">${escapeHtml(b)}</button>`).join('')}
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
        ${insufficient ? `<p style="margin-top:8px;font-size:11.5px;color:#e04866;">Insufficient GG Pay balance — top up on Me tab or choose QRIS.</p>` : ''}
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

  async function completePaymentAndDispatchPOS() {
    const metrics = getCartMetrics();
    if (metrics.count === 0) return;

    const member = POS.getMember();
    const outlet = DATA.getOutletById(state.outletId);
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
      providerLabel = 'KOTA Member Balance';
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
      milk: c.milk,
      addons: c.addons,
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
      deliveryFee: metrics.deliveryFee,
      voucherCode: metrics.voucherRes.valid ? state.appliedVoucher : null,
      discount: metrics.discount + pointsDiscount,
      total: finalTotal,
      pointsEarned,
    };

    const memberUpdate = {
      deductBalance: p.methodId === 'ggpay' ? finalTotal : 0,
      deductPoints: pointsDiscount > 0 ? 200 : 0,
      addPoints: pointsEarned,
    };

    try {
      let resultingOrder = null;
      const active = POS.getActiveOrder();
      if (state.mergeIntoActive && active && active.status !== 'complete' && active.status !== 'cancelled' && state.orderMode === 'dine-in') {
        resultingOrder = await POS.mergeIntoOrder(active.orderId, posItems, pricingObj, paymentObj, memberUpdate);
      } else {
        resultingOrder = await POS.createOrder({
          source: 'CUSTOMER_WEB_MOBILE',
          outletId: outlet.id,
          outletName: outlet.name,
          orderMode: state.orderMode,
          tableNumber: state.tableNumber,
          pickupTime: DATA.PICKUP_SLOTS[state.pickupSlotIndex].label,
          deliveryAddress: state.deliveryAddress,
          customer: { name: member.name, tier: member.tier, memberId: member.memberId },
          items: posItems,
          pricing: pricingObj,
          payment: paymentObj,
          memberUpdate,
        });
      }

      state.cart = [];
      state.appliedVoucher = null;
      state.mergeIntoActive = false;
      state.payment.redeemPoints = false;
      state.trackedOrderId = resultingOrder.orderId;

      closeModal('payment');
      syncGlobalBadges();
      renderOrdersView();
      switchView('orders');
      showToast(`Paid via ${methodLabel}! Sent #${resultingOrder.orderId} to Live POS (+${pointsEarned} pts)`);
    } catch (err) {
      showToast(err.message || 'Payment failed');
    }
  }

  /* ========================================================================
     RENDER: VIEW 4 (ORDERS, CANCEL WINDOW, RATING & PAIRING)
     ======================================================================== */

  function renderOrdersView() {
    const allOrders = POS.getOrders();
    const customerOrders = allOrders.filter((o) => o.source !== 'POS_COUNTER');
    const orders = customerOrders.length ? customerOrders : allOrders;
    const active = POS.getActiveOrder(state.trackedOrderId);

    if (active) {
      const meta = POS.STATUS_META[active.status] || POS.STATUS_META.preparing;
      const leadItem = active.items[0];
      if (leadItem && leadItem.image) el.trackerDrinkImg.src = leadItem.image;
      el.trackerQueueId.textContent = `#${active.orderId}`;

      let modeTxt = 'Self Pick-Up';
      if (active.orderMode === 'dine-in') modeTxt = `Dine-In • Table ${active.tableNumber || '07'}`;
      else if (active.orderMode === 'pickup') modeTxt = `Pick Up • ${active.pickupTime || 'Now'}`;
      else if (active.orderMode === 'delivery') modeTxt = 'Delivery';

      el.trackerOrderMode.textContent = active.mergedCount > 1 ? `${modeTxt} • Merged ×${active.mergedCount}` : modeTxt;
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

      // Cancel Order allowed ONLY while status === 'received'
      el.cancelOrderBtn.hidden = active.status !== 'received';

      // Post-Serve Rating Card shown when status === 'complete' and not rated yet
      el.orderRatingCard.hidden = !(active.status === 'complete' && !active.rating);
      renderRatingStars();
    }

    // Pairing carousel (Pastry & Food!)
    el.pairingCarousel.innerHTML = '';
    DATA.MENU_ITEMS.filter((i) => i.category === 'pastry' || i.category === 'food').forEach((item) => {
      const available = POS.isItemAvailable(item.id);
      const card = document.createElement('article');
      card.className = `pairing-card ${available ? '' : 'is-soldout'}`;
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <div class="notched-frame-wrap">
          <div class="notched-glass-surface" style="--card-top:${item.theme.cardTop};--card-bot:${item.theme.cardBot}">
            ${!available ? '<span class="card-badge-chip">SOLD OUT</span>' : ''}
            <img src="${item.image}" alt="${escapeHtml(item.shortName)}" class="card-item-img" draggable="false" />
            <button type="button" class="notched-add-btn" ${available ? '' : 'disabled'} aria-label="Add ${escapeHtml(item.shortName)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
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

    // Order History
    el.orderHistoryCount.textContent = `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`;
    el.orderHistoryList.innerHTML = '';
    orders.forEach((order) => {
      const meta = POS.STATUS_META[order.status] || POS.STATUS_META.received;
      const itemSummary = (order.items || []).map((it) => `${it.qty}× ${it.name}`).join(', ');
      const needsRating = order.status === 'complete' && !order.rating;
      const isSelected = active && active.orderId === order.orderId;
      const row = document.createElement('div');
      row.className = `history-row ${isSelected ? 'is-tracked' : ''}`;
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <div class="history-left">
          <strong>#${escapeHtml(order.orderId)} • ${escapeHtml(meta.shortLabel)}${order.rating ? ` • ${order.rating.stars}★` : ''}</strong>
          <small>${escapeHtml(itemSummary)} • ${DATA.formatRp(order.pricing.total)}</small>
        </div>
        <div class="history-actions">
          ${needsRating ? `<button type="button" class="history-btn is-primary" data-rate="${escapeHtml(order.orderId)}">Rate ★</button>` : ''}
          <button type="button" class="history-btn" data-receipt="${escapeHtml(order.orderId)}">Receipt</button>
          <button type="button" class="history-btn ${needsRating ? '' : 'is-primary'}" data-reorder="${escapeHtml(order.orderId)}">Reorder</button>
        </div>
      `;
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        state.trackedOrderId = order.orderId;
        renderOrdersView();
      });
      const rateBtn = row.querySelector('[data-rate]');
      if (rateBtn) {
        rateBtn.addEventListener('click', () => {
          state.trackedOrderId = order.orderId;
          renderOrdersView();
          el.orderRatingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      row.querySelector('[data-receipt]').addEventListener('click', () => openReceiptModal(order));
      row.querySelector('[data-reorder]').addEventListener('click', () => {
        (order.items || []).forEach((it) => quickAddToBag(DATA.getItemById(it.itemId), null));
        switchView('bag');
      });
      el.orderHistoryList.appendChild(row);
    });
  }

  function renderRatingStars() {
    el.ratingStarsRow.querySelectorAll('.star-btn').forEach((btn) => {
      const s = Number(btn.dataset.star);
      btn.classList.toggle('is-lit', s <= state.ratingDraftStars);
    });
  }

  function openReceiptModal(order) {
    if (!order) return;
    el.receiptModalTitle.textContent = `Receipt #${order.orderId}`;
    const modeStr =
      order.orderMode === 'dine-in'
        ? `Dine-In (Table ${order.tableNumber || '07'})`
        : order.orderMode === 'delivery'
        ? `Delivery`
        : `Self Pick-Up (${order.pickupTime || 'Now'})`;
    const meta = POS.STATUS_META[order.status] || POS.STATUS_META.received;

    el.receiptVisualView.innerHTML = `
      <div class="receipt-meta-grid">
        <div><span>ORDER ID</span><strong>#${escapeHtml(order.orderId)}</strong></div>
        <div><span>STATUS</span><strong style="color:var(--lime-neon);">${escapeHtml(meta.shortLabel.toUpperCase())}</strong></div>
        <div><span>OUTLET</span><strong>${escapeHtml(order.outletName || 'Senopati Flagship')}</strong></div>
        <div><span>FULFILLMENT</span><strong>${escapeHtml(modeStr)}</strong></div>
        <div><span>PAYMENT</span><strong>${escapeHtml(order.payment.method)} (PAID)</strong></div>
        <div><span>POINTS EARNED</span><strong style="color:var(--cyan-logo);">+${order.pricing.pointsEarned} pts</strong></div>
      </div>
      ${(order.items || [])
        .map((it) => {
          const mods = [
            it.style,
            it.size,
            it.milk && it.milk !== 'Fresh Dairy' ? it.milk : null,
            Array.isArray(it.addons) && it.addons.length ? it.addons.map((a) => `+${a.label}`).join(', ') : null,
            it.note,
          ]
            .filter(Boolean)
            .join(' • ');
          return `
            <div class="receipt-line">
              <div>
                <strong>${it.qty}&times; ${escapeHtml(it.name)}</strong>
                <small>${escapeHtml(mods)}</small>
              </div>
              <strong style="font-family:var(--font-display);">${DATA.formatRp(it.lineTotal)}</strong>
            </div>`;
        })
        .join('')}
      <div style="border-top:1px solid rgba(120,160,140,0.2);padding-top:10px;display:flex;flex-direction:column;gap:5px;">
        <div class="receipt-line"><span>Subtotal</span><span>${DATA.formatRp(order.pricing.subtotal)}</span></div>
        ${order.pricing.deliveryFee > 0 ? `<div class="receipt-line"><span>Delivery Fee</span><span>${DATA.formatRp(order.pricing.deliveryFee)}</span></div>` : ''}
        ${order.pricing.discount > 0 ? `<div class="receipt-line" style="color:var(--lime-neon);"><span>Discount (${escapeHtml(order.pricing.voucherCode || 'Pts')})</span><span>-${DATA.formatRp(order.pricing.discount)}</span></div>` : ''}
        <div class="receipt-line" style="font-size:15px;font-weight:700;margin-top:3px;">
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
    el.meNextTierText.textContent = remain > 0 ? `${remain} pts to ${m.nextTier}` : `${m.tier} Unlocked!`;
    const pct = Math.min(100, Math.round((m.points / m.nextTierPoints) * 100));
    el.meTierProgressFill.style.width = `${pct}%`;
    el.meWalletBalance.textContent = DATA.formatRp(m.ggPayBalance);

    const favItems = (m.favorites || []).map((id) => DATA.getItemById(id)).filter(Boolean);
    el.meFavCount.textContent = `${favItems.length} saved`;
    el.meFavoritesRow.innerHTML = '';

    if (favItems.length === 0) {
      el.meFavoritesRow.innerHTML = `<div style="font-size:12.5px;color:var(--text-muted);padding:12px;">Tap ♡ on any menu item to save it here.</div>`;
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
     MODALS (OUTLET, TABLE, VOUCHER, PAYMENT, RECEIPT, CALL)
     ======================================================================== */

  const MODAL_MAP = {
    payment: el.paymentModalBackdrop,
    receipt: el.receiptModalBackdrop,
    voucher: el.voucherModalBackdrop,
    outlet: el.outletModalBackdrop,
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
    if (name === 'payment' || name === 'all') clearInterval(state.payment.qrisInterval);
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

  function renderOutletModal() {
    el.outletList.innerHTML = '';
    DATA.OUTLETS.forEach((o) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `outlet-choice-card ${o.id === state.outletId ? 'is-active' : ''}`;
      btn.innerHTML = `
        <div>
          <strong>${escapeHtml(o.name)}</strong>
          <small>${escapeHtml(o.area)}</small>
        </div>
        <div class="outlet-choice-right">
          <span>${escapeHtml(o.distance)}</span>
          <small>${escapeHtml(o.prepTime)} • ${escapeHtml(o.status)}</small>
        </div>
      `;
      btn.addEventListener('click', () => {
        state.outletId = o.id;
        renderOutletAndModeUI();
        renderBag();
        closeModal('outlet');
        showToast(`Switched outlet to ${o.name}`);
      });
      el.outletList.appendChild(btn);
    });
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
        renderOutletAndModeUI();
        renderBag();
        closeModal('table');
        showToast(`Table ${code} selected`);
      });
      el.tableGrid.appendChild(btn);
    }
  }

  /* ========================================================================
     EVENT BINDINGS & LIVE SSE SUBSCRIPTION
     ======================================================================== */

  function bindEvents() {
    el.dockBtns.forEach((btn) => btn.addEventListener('click', () => switchView(btn.dataset.tab)));
    el.toolbarTabs.forEach((tab) => tab.addEventListener('click', () => switchView(tab.dataset.navView)));

    // Toggle Full Responsive Web <-> Centered iPhone Frame Preview on Desktop
    el.mobilePreviewToggle.addEventListener('click', () => {
      const on = document.body.classList.toggle('mobile-preview-mode');
      el.mobilePreviewToggle.classList.toggle('is-active', on);
      el.mobilePreviewToggle.setAttribute('aria-pressed', String(on));
      showToast(on ? 'Phone Frame Preview active' : 'Full Responsive Web Layout active');
    });

    // Theme toggles
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
      });
    });

    // Menu Home
    el.homePointsChip.addEventListener('click', () => switchView('me'));
    el.homeActiveOrderBanner.addEventListener('click', () => switchView('orders'));

    el.outletSelectBtn.addEventListener('click', () => {
      renderOutletModal();
      openModal('outlet');
    });

    el.modeOpts.forEach((opt) => {
      opt.addEventListener('click', () => {
        state.orderMode = opt.dataset.orderMode;
        renderOutletAndModeUI();
        renderBag();
      });
    });

    el.tableSelectBtn.addEventListener('click', () => {
      renderTableGrid();
      openModal('table');
    });

    el.pickupSlotBtn.addEventListener('click', () => {
      state.pickupSlotIndex = (state.pickupSlotIndex + 1) % DATA.PICKUP_SLOTS.length;
      renderOutletAndModeUI();
      renderBag();
      showToast(`Pick-Up Time: ${DATA.PICKUP_SLOTS[state.pickupSlotIndex].label}`);
    });

    el.deliveryAddressInput.addEventListener('input', () => {
      state.deliveryAddress = el.deliveryAddressInput.value;
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

    // Promo Code Form
    el.promoCodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (el.promoCodeInput.value || '').trim().toUpperCase();
      const found = DATA.getAllVouchers(POS.getMember()).find((v) => v.code === code);
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

    // Bag
    el.bagAddMoreBtn.addEventListener('click', () => switchView('menu'));
    el.bagChangeModeBtn.addEventListener('click', () => {
      if (state.orderMode === 'dine-in') {
        renderTableGrid();
        openModal('table');
      } else {
        renderOutletModal();
        openModal('outlet');
      }
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

    // Orders
    el.trackerDrinkThumbBtn.addEventListener('click', () => {
      const active = POS.getActiveOrder(state.trackedOrderId);
      if (active && active.items[0]) openItemDetail(active.items[0].itemId);
    });
    el.trackerBrandBtn.addEventListener('click', () => switchView('menu'));
    el.callRestaurantBtn.addEventListener('click', () => openModal('call'));
    el.openReceiptBtn.addEventListener('click', () => openReceiptModal(POS.getActiveOrder(state.trackedOrderId)));

    el.stagePillsRow.querySelectorAll('.stage-pill').forEach((pill) => {
      pill.addEventListener('click', async () => {
        const active = POS.getActiveOrder(state.trackedOrderId);
        if (!active) return;
        try {
          await POS.updateOrderStatus(active.orderId, pill.dataset.stage, 'CUSTOMER_DEMO');
          renderOrdersView();
          syncGlobalBadges();
        } catch (err) {
          showToast(err.message);
        }
      });
    });

    el.cancelOrderBtn.addEventListener('click', async () => {
      const active = POS.getActiveOrder(state.trackedOrderId);
      if (!active || active.status !== 'received') return;
      try {
        await POS.updateOrderStatus(active.orderId, 'cancelled', 'CUSTOMER');
        syncGlobalBadges();
        renderOrdersView();
        renderMeView();
        showToast(`Order #${active.orderId} cancelled & synced to POS`);
      } catch (err) {
        showToast(err.message);
      }
    });

    el.ratingStarsRow.querySelectorAll('.star-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ratingDraftStars = Number(btn.dataset.star);
        renderRatingStars();
      });
    });

    el.submitRatingBtn.addEventListener('click', async () => {
      const active = POS.getActiveOrder(state.trackedOrderId);
      if (!active) return;
      try {
        await POS.submitRating(active.orderId, state.ratingDraftStars, el.ratingCommentInput.value);
        el.ratingCommentInput.value = '';
        renderOrdersView();
        showToast(`Thank you! ${state.ratingDraftStars}★ sent to Barista POS`);
      } catch (err) {
        showToast(err.message);
      }
    });

    el.receiptTabs.forEach((tab) => tab.addEventListener('click', () => switchReceiptTab(tab.dataset.receiptTab)));

    // Me
    el.topUpWalletBtn.addEventListener('click', async () => {
      try {
        await POS.updateMember({ topUpAmount: 100000 });
        renderMeView();
        showToast('Topped up +Rp100.000 to GG Member Pay!');
      } catch (err) {
        showToast(err.message);
      }
    });

    // Floating Mini-Cart Bar
    if (el.floatingMiniCart) {
      el.floatingMiniCart.addEventListener('click', () => switchView('bag'));
    }

    // Reusable pointer drag-to-dismiss helper (interpolates live underlying screen & scrim!)
    function attachSheetDrag(handleEl, sheetEl, onDismiss, isDetailOverlay) {
      if (!handleEl || !sheetEl) return;
      let startY = 0;
      let deltaY = 0;
      let dragging = false;

      handleEl.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button, input, a')) return;
        dragging = true;
        startY = e.clientY;
        deltaY = 0;
        sheetEl.classList.add('is-dragging');
        if (isDetailOverlay) {
          const under = el.screens[state.currentView];
          if (under) under.style.transition = 'none';
          if (el.detailDesktopScrim) el.detailDesktopScrim.style.transition = 'none';
        }
        if (handleEl.setPointerCapture) {
          try { handleEl.setPointerCapture(e.pointerId); } catch (_) {}
        }
      });

      handleEl.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        deltaY = Math.max(0, e.clientY - startY);
        const isDesktopModal = window.innerWidth > 680 && !document.body.classList.contains('mobile-preview-mode');
        sheetEl.style.transform = isDesktopModal
          ? `translate3d(0, ${deltaY * 0.7}px, 0) scale(${Math.max(0.94, 1 - deltaY / 2400)})`
          : `translate3d(0, ${deltaY}px, 0)`;

        if (isDetailOverlay) {
          const progress = Math.min(1, deltaY / 320);
          if (el.detailDesktopScrim) {
            el.detailDesktopScrim.style.opacity = String(Math.max(0, 1 - progress * 0.92));
          }
          const under = el.screens[state.currentView];
          if (under) {
            const baseScale = isDesktopModal ? 0.986 : 0.962;
            const curScale = baseScale + (1 - baseScale) * progress;
            under.style.transform = `translate3d(0, 0, 0) scale(${curScale.toFixed(4)})`;
            under.style.filter = `brightness(${(0.92 + 0.08 * progress).toFixed(3)})`;
          }
        }
      });

      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        sheetEl.classList.remove('is-dragging');
        sheetEl.style.transform = '';
        resetUnderlyingScreenTransform();
        if (deltaY > 75) onDismiss();
      };

      handleEl.addEventListener('pointerup', endDrag);
      handleEl.addEventListener('pointercancel', endDrag);
    }

    // Product Detail (Single Clean Bottom-Up Sheet Popup + Live Slide-Down Reveal)
    el.detailBackBtn.addEventListener('click', closeDetailSheet);
    el.detailDesktopScrim.addEventListener('click', closeDetailSheet);
    if (el.detailHandleBar) {
      el.detailHandleBar.addEventListener('click', closeDetailSheet);
      el.detailHandleBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') closeDetailSheet();
      });
      attachSheetDrag(el.detailHandleBar, el.detailFrameContainer, closeDetailSheet, true);
    }
    const detailTopbar = document.querySelector('#screenDetail .product-topbar');
    if (detailTopbar) {
      attachSheetDrag(detailTopbar, el.detailFrameContainer, closeDetailSheet, true);
    }

    // Touch pull-down to dismiss when scrolled to very top of detail sheet
    if (el.detailScroll && el.detailFrameContainer) {
      let touchStartY = 0;
      let pullingSheet = false;
      let pullDelta = 0;

      el.detailScroll.addEventListener('touchstart', (e) => {
        if (el.detailScroll.scrollTop <= 0 && e.touches.length === 1) {
          touchStartY = e.touches[0].clientY;
          pullingSheet = false;
          pullDelta = 0;
        } else {
          touchStartY = -1;
        }
      }, { passive: true });

      el.detailScroll.addEventListener('touchmove', (e) => {
        if (touchStartY < 0 || e.touches.length !== 1) return;
        const dy = e.touches[0].clientY - touchStartY;
        if (dy > 8 && el.detailScroll.scrollTop <= 0) {
          pullingSheet = true;
          pullDelta = dy;
          el.detailFrameContainer.classList.add('is-dragging');
          el.detailFrameContainer.style.transform = `translate3d(0, ${dy * 0.85}px, 0)`;
          const progress = Math.min(1, dy / 320);
          if (el.detailDesktopScrim) {
            el.detailDesktopScrim.style.transition = 'none';
            el.detailDesktopScrim.style.opacity = String(Math.max(0, 1 - progress * 0.92));
          }
          const under = el.screens[state.currentView];
          if (under) {
            under.style.transition = 'none';
            const s = 0.962 + 0.038 * progress;
            under.style.transform = `translate3d(0, 0, 0) scale(${s.toFixed(4)})`;
          }
        }
      }, { passive: true });

      const endTouchPull = () => {
        if (!pullingSheet) return;
        pullingSheet = false;
        el.detailFrameContainer.classList.remove('is-dragging');
        el.detailFrameContainer.style.transform = '';
        resetUnderlyingScreenTransform();
        if (pullDelta > 85) closeDetailSheet();
      };
      el.detailScroll.addEventListener('touchend', endTouchPull, { passive: true });
      el.detailScroll.addEventListener('touchcancel', endTouchPull, { passive: true });
    }

    el.detailBagShortcut.addEventListener('click', () => {
      closeDetailSheet();
      switchView('bag');
    });

    el.detailFavBtn.addEventListener('click', async () => {
      const m = POS.getMember();
      const id = state.detail.itemId;
      const favs = new Set(m.favorites || []);
      if (favs.has(id)) {
        favs.delete(id);
        showToast('Removed from favorites');
      } else {
        favs.add(id);
        showToast('Saved to favorites ♡');
      }
      await POS.updateMember({ favorites: Array.from(favs) });
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

    // Modals & Call Sheet (plus interactive downward drag-to-dismiss)
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      const modalName = btn.dataset.closeModal;
      btn.addEventListener('click', () => closeModal(modalName));
      if (btn.classList.contains('sheet-handle-bar')) {
        const drawer = btn.closest('.glass-drawer');
        attachSheetDrag(btn, drawer, () => closeModal(modalName));
      }
    });
    Object.entries(MODAL_MAP).forEach(([name, node]) => {
      node.addEventListener('click', (e) => {
        if (e.target === node) closeModal(name);
      });
    });

    el.dialNowBtn.addEventListener('click', () => {
      closeModal('call');
      showToast('Calling KOTA Coffee & Botanical Bar...');
    });
    el.pingBaristaBtn.addEventListener('click', () => {
      closeModal('call');
      showToast('Barista notified on Live POS!');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal('all');
        if (state.detailOpen) closeDetailSheet();
      }
    });

    // Real-Time Full-Stack SSE / BroadcastChannel Listener
    POS.subscribe((evt) => {
      if (evt.type === 'THEME_CHANGED' || evt.type === 'STORAGE_SYNC') syncThemeUI();
      syncGlobalBadges();
      if (state.currentView === 'menu') {
        renderOrderAgain();
        renderMenuGrid();
      }
      if (state.currentView === 'orders') renderOrdersView();
      if (state.currentView === 'promo') renderPromoView();
      if (state.currentView === 'me') renderMeView();
      if (evt.type === 'STOCK_UPDATED') {
        const item = DATA.getItemById(evt.itemId);
        showToast(`${item.shortName} is now ${evt.available ? 'back In Stock!' : 'Sold Out'}`);
      } else if (evt.type === 'ORDER_STATUS_UPDATED' && evt.actor === 'POS_BARISTA') {
        const meta = POS.STATUS_META[evt.status];
        showToast(`POS Update: #${evt.orderId} is now ${meta.heading}!`);
      }
    });
  }

  function init() {
    syncThemeUI();
    renderOutletAndModeUI();
    renderPromoBanners();
    renderOrderAgain();
    renderCategoryPills();
    renderMenuGrid();
    renderPromoView();
    renderOrdersView();
    renderMeView();
    syncGlobalBadges();
    bindEvents();

    POS.ready.then(() => {
      syncGlobalBadges();
      renderOrderAgain();
      renderMenuGrid();
      renderOrdersView();
      renderMeView();
      renderPromoView();
    });
  }

  init();
})();
