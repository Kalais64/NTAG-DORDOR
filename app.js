(() => {
  'use strict';

  /* ========================================================================
     DATA CATALOG (Exact Reference Items + Matching Botanical Extensions)
     ======================================================================== */

  const DRINKS = [
    {
      id: 'matcha-nitro',
      name: 'MATCHA NITRO',
      image: 'assets/matcha-nitro.png',
      shortDesc:
        'A smooth, layered drink that combines ceremonial matcha with nitrogen-infused botanical base. Velvety texture,...',
      fullDesc:
        'A smooth, layered drink that combines ceremonial Uji matcha with a chilled nitrogen-infused butterfly-pea botanical base. Velvety micro-foam texture, zero refined sugar, and a crisp floral mineral finish.',
      tags: [
        { label: 'CREAMY', note: 'Nitrogen-whipped ceremonial Uji matcha micro-foam.' },
        { label: 'FLORAL', note: 'Subtle butterfly-pea blossom & botanical essence.' },
        { label: 'SILKY', note: 'Cold-infused velvety body with zero bitterness.' },
        { label: 'EARTHY', note: 'First-harvest stone-ground Kyoto shade-grown leaves.' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 6.5 },
        medium: { label: 'Medium', volume: '250 ML', price: 7.5 },
        large: { label: 'Large', volume: '350 ML', price: 8.9 },
      },
      theme: {
        topBg: '#a9db4c',
        topBg2: '#7fb82f',
        glowTop: 'rgba(154, 222, 54, 0.28)',
        glowBottom: 'rgba(12, 120, 174, 0.42)',
        accent: '#baf458',
      },
    },
    {
      id: 'blue-cloud-latte',
      name: 'BLUE CLOUD LATTE',
      image: 'assets/blue-cloud-latte.png',
      shortDesc:
        'Velvety sky-blue spirulina cold foam suspended above chilled barista oat milk with botanical sapphire swirls,...',
      fullDesc:
        'Velvety sky-blue spirulina cold foam suspended above chilled organic barista oat milk with delicate botanical sapphire swirls and a hint of Madagascar vanilla bean.',
      tags: [
        { label: 'CLOUDY', note: 'Whipped blue spirulina cold cloud foam.' },
        { label: 'OAT', note: 'Silky micro-filtered Scandinavian oat base.' },
        { label: 'VANILLA', note: 'Cold-steeped Madagascar vanilla pod infusion.' },
        { label: 'SMOOTH', note: 'Naturally caffeine-free restorative sip.' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 6.2 },
        medium: { label: 'Medium', volume: '250 ML', price: 7.2 },
        large: { label: 'Large', volume: '350 ML', price: 8.6 },
      },
      theme: {
        topBg: '#8ec9f5',
        topBg2: '#4d92cc',
        glowTop: 'rgba(126, 202, 255, 0.30)',
        glowBottom: 'rgba(26, 98, 168, 0.42)',
        accent: '#8ee6ff',
      },
    },
    {
      id: 'yuzu-matcha-fizz',
      name: 'YUZU MATCHA FIZZ',
      image: 'assets/yuzu-matcha-fizz.png',
      shortDesc:
        'Bright emerald ceremonial matcha layered cleanly over sparkling Japanese yuzu citrus botanical tonic,...',
      fullDesc:
        'Bright emerald ceremonial matcha layered cleanly over sparkling Kochi yuzu citrus botanical tonic with micro-effervescent bubbles and a crisp, uplifting finish.',
      tags: [
        { label: 'BRIGHT', note: 'Fresh-pressed aromatic Japanese yuzu peel.' },
        { label: 'SPARKLING', note: 'High-carbonation chilled botanical tonic.' },
        { label: 'CRISP', note: 'Clean, refreshing palate cleanser.' },
        { label: 'MATCHA', note: 'Hand-whisked ceremonial top layer.' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 6.4 },
        medium: { label: 'Medium', volume: '250 ML', price: 7.4 },
        large: { label: 'Large', volume: '350 ML', price: 8.8 },
      },
      theme: {
        topBg: '#b8e44c',
        topBg2: '#95b22b',
        glowTop: 'rgba(154, 224, 62, 0.28)',
        glowBottom: 'rgba(206, 152, 34, 0.34)',
        accent: '#d0ff5c',
      },
    },
  ];

  const DESSERTS = [
    {
      id: 'spirulina-cake',
      name: 'Spirulina Cake',
      weight: '250 g',
      price: 6.8,
      image: 'assets/spirulina-cake.png',
    },
    {
      id: 'matcha-mochi',
      name: 'Matcha Mochi',
      weight: '150 g',
      price: 4.9,
      image: 'assets/matcha-mochi.png',
    },
    {
      id: 'blueberry-tart',
      name: 'Blueberry Tart',
      weight: '250 g',
      price: 6.5,
      image: 'assets/blueberry-tart.png',
    },
    {
      id: 'yuzu-matcha-roll',
      name: 'Yuzu Matcha Roll',
      weight: '180 g',
      price: 5.6,
      image: 'assets/yuzu-matcha-roll.png',
    },
  ];

  const NOTCH_BORDER_PATH =
    'M 28 0.75 L 138 0.75 A 27.25 27.25 0 0 1 165.25 28 L 165.25 90 A 17.25 17.25 0 0 1 148 107.25 L 134 107.25 A 26.75 26.75 0 0 0 107.25 134 L 107.25 148 A 17.25 17.25 0 0 1 90 165.25 L 28 165.25 A 27.25 27.25 0 0 1 0.75 138 L 0.75 28 A 27.25 27.25 0 0 1 28 0.75 Z';

  /* ========================================================================
     APPLICATION STATE
     ======================================================================== */

  const state = {
    currentScreen: 'product', // 'catalog' | 'product' | 'tracker'
    activeDrinkId: 'matcha-nitro',
    selectedSize: 'medium',
    descExpanded: false,
    selectedTagIndex: -1,
    favorites: new Set(),
    orderProgress: 64, // Matches Reference Image 2 (~64% / 5 min left)
    isDraggingProgress: false,
    pairingExpanded: false,
    hasPlacedOrder: false,
    cart: [
      {
        key: 'matcha-nitro::medium',
        type: 'drink',
        id: 'matcha-nitro',
        size: 'medium',
        name: 'MATCHA NITRO',
        meta: 'Medium • 250 ML',
        price: 7.5,
        qty: 1,
        image: 'assets/matcha-nitro.png',
      },
    ],
  };

  /* ========================================================================
     DOM REFERENCES
     ======================================================================== */

  const el = {
    phoneShell: document.getElementById('phoneShell'),
    screens: {
      catalog: document.getElementById('screenCatalog'),
      product: document.getElementById('screenProduct'),
      tracker: document.getElementById('screenTracker'),
    },
    toolbarTabs: Array.from(document.querySelectorAll('.toolbar-tab')),
    statusBarToggle: document.getElementById('statusBarToggle'),

    // Catalog
    catalogDrinksList: document.getElementById('catalogDrinksList'),
    catalogDessertsGrid: document.getElementById('catalogDessertsGrid'),
    catalogCartBtn: document.getElementById('catalogCartBtn'),
    catalogCartCount: document.getElementById('catalogCartCount'),
    catalogLiveOrderPill: document.getElementById('catalogLiveOrderPill'),
    catalogLiveEta: document.getElementById('catalogLiveEta'),

    // Product Detail (Screen 1)
    productGlassSheet: document.getElementById('productGlassSheet'),
    productHandleBar: document.getElementById('productHandleBar'),
    productBackBtn: document.getElementById('productBackBtn'),
    productFavBtn: document.getElementById('productFavBtn'),
    productTitle: document.getElementById('productTitle'),
    productVolume: document.getElementById('productVolume'),
    productDescText: document.getElementById('productDescText'),
    readMoreBtn: document.getElementById('readMoreBtn'),
    flavorChipsRow: document.getElementById('flavorChipsRow'),
    flavorNoteToast: document.getElementById('flavorNoteToast'),
    heroDrinkStage: document.getElementById('heroDrinkStage'),
    heroDrinkImg: document.getElementById('heroDrinkImg'),
    sizeSelector: document.getElementById('sizeSelector'),
    sizeThumb: document.getElementById('sizeThumb'),
    sizeOptions: Array.from(document.querySelectorAll('.size-option')),
    addToOrderBtn: document.getElementById('addToOrderBtn'),

    // Order Tracker & Pairing (Screen 2)
    trackerDrinkThumbBtn: document.getElementById('trackerDrinkThumbBtn'),
    trackerDrinkImg: document.getElementById('trackerDrinkImg'),
    trackerBrandBtn: document.getElementById('trackerBrandBtn'),
    orderStatusHeading: document.getElementById('orderStatusHeading'),
    orderStatusEta: document.getElementById('orderStatusEta'),
    progressTrackWrap: document.getElementById('progressTrackWrap'),
    progressFill: document.getElementById('progressFill'),
    progressKnob: document.getElementById('progressKnob'),
    callRestaurantBtn: document.getElementById('callRestaurantBtn'),
    pairingSheet: document.getElementById('pairingSheet'),
    pairingHandleBar: document.getElementById('pairingHandleBar'),
    pairingCarousel: document.getElementById('pairingCarousel'),
    floatingOrderPill: document.getElementById('floatingOrderPill'),
    floatingOrderCount: document.getElementById('floatingOrderCount'),
    floatingOrderLabel: document.getElementById('floatingOrderLabel'),
    floatingOrderTotal: document.getElementById('floatingOrderTotal'),

    // Modals & Toast
    cartDrawerBackdrop: document.getElementById('cartDrawerBackdrop'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartTotal: document.getElementById('cartTotal'),
    cartConfirmBtn: document.getElementById('cartConfirmBtn'),
    callSheetBackdrop: document.getElementById('callSheetBackdrop'),
    dialNowBtn: document.getElementById('dialNowBtn'),
    pingBaristaBtn: document.getElementById('pingBaristaBtn'),
    glassToast: document.getElementById('glassToast'),
  };

  /* ========================================================================
     HELPERS
     ======================================================================== */

  const formatMoney = (val) => `$${val.toFixed(2)}`;

  const getActiveDrink = () =>
    DRINKS.find((d) => d.id === state.activeDrinkId) || DRINKS[0];

  let toastTimer = null;
  function showToast(message) {
    el.glassToast.textContent = message;
    el.glassToast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.glassToast.classList.remove('is-visible');
    }, 2400);
  }

  function applyDrinkTheme(drink) {
    const root = document.documentElement;
    root.style.setProperty('--drink-top-bg', drink.theme.topBg);
    root.style.setProperty('--drink-top-bg-2', drink.theme.topBg2);
    root.style.setProperty('--drink-glow-top', drink.theme.glowTop);
    root.style.setProperty('--drink-glow-bottom', drink.theme.glowBottom);
    root.style.setProperty('--drink-accent', drink.theme.accent);
  }

  /* ========================================================================
     NAVIGATION
     ======================================================================== */

  const SCREEN_ORDER = ['catalog', 'product', 'tracker'];

  function navigateTo(target) {
    if (!el.screens[target] || target === state.currentScreen) return;

    const prevIndex = SCREEN_ORDER.indexOf(state.currentScreen);
    const nextIndex = SCREEN_ORDER.indexOf(target);
    const goingForward = nextIndex > prevIndex;

    const prevScreen = el.screens[state.currentScreen];
    const nextScreen = el.screens[target];

    // Clear residual classes
    Object.values(el.screens).forEach((s) => {
      s.classList.remove('exit-left', 'exit-right');
    });

    prevScreen.classList.remove('is-active');
    prevScreen.classList.add(goingForward ? 'exit-left' : 'exit-right');
    prevScreen.setAttribute('aria-hidden', 'true');

    nextScreen.classList.add('is-active');
    nextScreen.setAttribute('aria-hidden', 'false');

    state.currentScreen = target;
    el.phoneShell.dataset.screen = target;

    // Sync desktop toolbar tabs
    el.toolbarTabs.forEach((tab) => {
      const active = tab.dataset.navTarget === target;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    // Reset sheet expansion if leaving tracker
    if (target !== 'tracker' && state.pairingExpanded) {
      state.pairingExpanded = false;
      el.pairingSheet.classList.remove('is-expanded');
    }
  }

  /* ========================================================================
     RENDERING: SCREEN 1 (PRODUCT DETAIL)
     ======================================================================== */

  function renderProductScreen() {
    const drink = getActiveDrink();
    const sizeInfo = drink.sizes[state.selectedSize];
    applyDrinkTheme(drink);

    el.productTitle.textContent = drink.name;
    el.productVolume.textContent = sizeInfo.volume;
    el.productDescText.textContent = state.descExpanded
      ? drink.fullDesc
      : drink.shortDesc;
    el.readMoreBtn.textContent = state.descExpanded ? 'Show less' : 'Read more';
    el.readMoreBtn.setAttribute('aria-expanded', String(state.descExpanded));

    // Favorite heart state
    const isFav = state.favorites.has(drink.id);
    el.productFavBtn.classList.toggle('is-favorited', isFav);
    el.productFavBtn.setAttribute('aria-pressed', String(isFav));

    // Hero transparent PNG image + size scale
    if (el.heroDrinkImg.getAttribute('src') !== drink.image) {
      el.heroDrinkImg.style.opacity = '0.25';
      el.heroDrinkImg.src = drink.image;
      el.heroDrinkImg.alt = `${drink.name} specialty layered drink`;
      requestAnimationFrame(() => {
        el.heroDrinkImg.style.opacity = '1';
      });
    }
    el.heroDrinkImg.dataset.scale = state.selectedSize;

    // Flavor tags
    el.flavorChipsRow.innerHTML = '';
    drink.tags.forEach((tag, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flavor-chip';
      btn.setAttribute('role', 'listitem');
      btn.textContent = tag.label;
      if (state.selectedTagIndex === idx) {
        btn.classList.add('is-selected');
      }
      btn.addEventListener('click', () => {
        state.selectedTagIndex = state.selectedTagIndex === idx ? -1 : idx;
        renderFlavorNote(drink);
      });
      el.flavorChipsRow.appendChild(btn);
    });
    renderFlavorNote(drink);

    // Segmented size control thumb position
    const sizeKeys = ['small', 'medium', 'large'];
    const idx = sizeKeys.indexOf(state.selectedSize);
    el.sizeThumb.style.transform = `translateX(${idx * 100}%)`;
    el.sizeOptions.forEach((opt) => {
      const active = opt.dataset.size === state.selectedSize;
      opt.classList.toggle('is-active', active);
      opt.setAttribute('aria-checked', String(active));
    });
  }

  function renderFlavorNote(drink) {
    const chips = el.flavorChipsRow.querySelectorAll('.flavor-chip');
    chips.forEach((chip, i) => {
      chip.classList.toggle('is-selected', i === state.selectedTagIndex);
    });

    if (state.selectedTagIndex >= 0 && drink.tags[state.selectedTagIndex]) {
      const t = drink.tags[state.selectedTagIndex];
      el.flavorNoteToast.textContent = `${t.label}: ${t.note}`;
      el.flavorNoteToast.classList.add('is-visible');
    } else {
      el.flavorNoteToast.classList.remove('is-visible');
    }
  }

  /* ========================================================================
     RENDERING: SCREEN 2 (ORDER TRACKER & CONCAVE-NOTCHED PAIRING CARDS)
     ======================================================================== */

  function renderPairingCarousel() {
    el.pairingCarousel.innerHTML = '';

    DESSERTS.forEach((item) => {
      const cartItem = state.cart.find((c) => c.key === `dessert::${item.id}`);
      const qty = cartItem ? cartItem.qty : 0;

      const card = document.createElement('article');
      card.className = 'pairing-card';
      card.setAttribute('role', 'listitem');
      card.dataset.dessertId = item.id;

      card.innerHTML = `
        <div class="notched-frame-wrap">
          <div class="notched-glass-surface">
            <img src="${item.image}" alt="${item.name}" class="pairing-item-img" draggable="false" />
          </div>
          <svg class="notched-border-svg" viewBox="0 0 166 166" fill="none" aria-hidden="true">
            <path d="${NOTCH_BORDER_PATH}" stroke="url(#notchGlassBorder)" stroke-width="1.35" />
          </svg>
          <span class="pairing-qty-badge ${qty > 0 ? 'is-visible' : ''}" data-qty-badge="${item.id}">&times;${qty}</span>
          <button type="button" class="notched-add-btn" data-add-dessert="${item.id}" aria-label="Add ${item.name} to order">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        <h3 class="pairing-card-name">${item.name}</h3>
        <p class="pairing-card-weight">${item.weight}</p>
      `;

      const addBtn = card.querySelector('.notched-add-btn');
      addBtn.addEventListener('click', () => {
        addDessertToCart(item, addBtn);
      });

      el.pairingCarousel.appendChild(card);
    });
  }

  function updatePairingBadges() {
    DESSERTS.forEach((item) => {
      const cartItem = state.cart.find((c) => c.key === `dessert::${item.id}`);
      const qty = cartItem ? cartItem.qty : 0;
      const badge = el.pairingCarousel.querySelector(`[data-qty-badge="${item.id}"]`);
      if (badge) {
        badge.textContent = `×${qty}`;
        badge.classList.toggle('is-visible', qty > 0);
      }
    });
  }

  function renderOrderProgress() {
    const pct = Math.max(0, Math.min(100, state.orderProgress));
    el.progressFill.style.width = `${pct}%`;
    el.progressKnob.style.left = `${pct}%`;
    el.progressTrackWrap.setAttribute('aria-valuenow', String(Math.round(pct)));

    let heading = 'Preparing your order';
    let eta = '5 min left';

    if (pct >= 100) {
      heading = 'Order delivered!';
      eta = 'Enjoy your chilled matcha';
    } else if (pct >= 84) {
      heading = 'Almost ready!';
      eta = '1 min left';
    } else if (pct >= 72) {
      heading = 'Preparing your order';
      eta = '3 min left';
    } else if (pct >= 50) {
      heading = 'Preparing your order';
      eta = '5 min left';
    } else if (pct >= 25) {
      heading = 'Infusing nitro foam';
      eta = '8 min left';
    } else {
      heading = 'Order received';
      eta = '10 min left';
    }

    el.orderStatusHeading.textContent = heading;
    el.orderStatusEta.textContent = eta;
    el.catalogLiveEta.textContent = `${eta} • Tap to track`;
  }

  /* ========================================================================
     RENDERING: SCREEN 0 (LIGHTWEIGHT MENU CATALOG)
     ======================================================================== */

  function renderCatalog() {
    el.catalogDrinksList.innerHTML = '';
    DRINKS.forEach((drink) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'catalog-drink-card';
      btn.innerHTML = `
        <div class="catalog-drink-thumb">
          <img src="${drink.image}" alt="${drink.name}" draggable="false" />
        </div>
        <div class="catalog-drink-info">
          <div class="catalog-drink-name">${drink.name}</div>
          <div class="catalog-drink-tags">${drink.tags.map((t) => t.label).join(' • ')}</div>
          <div class="catalog-drink-meta">
            <span class="catalog-price-pill">${formatMoney(drink.sizes.medium.price)}</span>
            <span class="catalog-vol-label">${drink.sizes.medium.volume}</span>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(220,245,255,0.65)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      `;
      btn.addEventListener('click', () => {
        state.activeDrinkId = drink.id;
        state.selectedSize = 'medium';
        state.descExpanded = false;
        state.selectedTagIndex = -1;
        renderProductScreen();
        navigateTo('product');
      });
      el.catalogDrinksList.appendChild(btn);
    });

    el.catalogDessertsGrid.innerHTML = '';
    DESSERTS.forEach((item) => {
      const tile = document.createElement('div');
      tile.className = 'mini-dessert-tile';
      tile.innerHTML = `
        <img src="${item.image}" alt="${item.name}" draggable="false" />
        <h3>${item.name}</h3>
        <div class="mini-dessert-foot">
          <span>${item.weight} • ${formatMoney(item.price)}</span>
          <button type="button" class="mini-add-btn" aria-label="Add ${item.name}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      `;
      tile.querySelector('.mini-add-btn').addEventListener('click', () => {
        addDessertToCart(item, null);
      });
      el.catalogDessertsGrid.appendChild(tile);
    });
  }

  /* ========================================================================
     CART & ORDER MANAGEMENT
     ======================================================================== */

  function getCartTotals() {
    let count = 0;
    let total = 0;
    for (const item of state.cart) {
      count += item.qty;
      total += item.price * item.qty;
    }
    return { count, total };
  }

  function syncCartUI(pulse = false) {
    const { count, total } = getCartTotals();

    el.catalogCartCount.textContent = String(count);
    el.floatingOrderCount.textContent = String(count);
    el.floatingOrderTotal.textContent = formatMoney(total);
    el.floatingOrderLabel.textContent =
      count === 1 ? '1 item in order' : `${count} items in order`;

    // Sync tracker thumbnail to latest drink in cart
    const primaryDrink = state.cart.find((c) => c.type === 'drink') || getActiveDrink();
    if (primaryDrink && primaryDrink.image) {
      el.trackerDrinkImg.src = primaryDrink.image;
    }

    if (pulse) {
      el.floatingOrderPill.classList.remove('is-pulsing');
      void el.floatingOrderPill.offsetWidth;
      el.floatingOrderPill.classList.add('is-pulsing');
    }

    updatePairingBadges();
    renderCartDrawerList();
  }

  function addCurrentDrinkToOrder() {
    const drink = getActiveDrink();
    const sizeInfo = drink.sizes[state.selectedSize];
    const key = `${drink.id}::${state.selectedSize}`;

    const newItem = {
      key,
      type: 'drink',
      id: drink.id,
      size: state.selectedSize,
      name: drink.name,
      meta: `${sizeInfo.label} • ${sizeInfo.volume}`,
      price: sizeInfo.price,
      qty: 1,
      image: drink.image,
    };

    if (!state.hasPlacedOrder) {
      // First explicit order replaces the initial default preview item cleanly
      state.cart = [newItem, ...state.cart.filter((c) => c.type === 'dessert')];
      state.hasPlacedOrder = true;
    } else {
      const existing = state.cart.find((c) => c.key === key);
      if (existing) {
        existing.qty += 1;
      } else {
        state.cart.unshift(newItem);
      }
    }

    // Reset progress to preparing state matching Reference Image 2 when placing fresh order
    state.orderProgress = 64;
    renderOrderProgress();
    syncCartUI(true);
    showToast(`${drink.name} (${sizeInfo.label}) added to order`);
    navigateTo('tracker');
  }

  function addDessertToCart(item, btnEl) {
    const key = `dessert::${item.id}`;
    const existing = state.cart.find((c) => c.key === key);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        key,
        type: 'dessert',
        id: item.id,
        name: item.name,
        meta: item.weight,
        price: item.price,
        qty: 1,
        image: item.image,
      });
    }

    if (btnEl) {
      btnEl.classList.add('is-added');
      btnEl.innerHTML = `
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      `;
      setTimeout(() => {
        btnEl.classList.remove('is-added');
        btnEl.innerHTML = `
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        `;
      }, 650);
    }

    syncCartUI(true);
    showToast(`Added ${item.name} • ${formatMoney(item.price)}`);
  }

  function adjustCartQty(key, delta) {
    const idx = state.cart.findIndex((c) => c.key === key);
    if (idx === -1) return;
    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) {
      state.cart.splice(idx, 1);
    }
    syncCartUI(false);
  }

  function renderCartDrawerList() {
    const { total } = getCartTotals();
    el.cartSubtotal.textContent = formatMoney(total);
    el.cartTotal.textContent = formatMoney(total);
    el.cartItemsList.innerHTML = '';

    if (state.cart.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cart-row';
      empty.innerHTML = `
        <div class="cart-row-info" style="text-align:center; padding: 14px 6px;">
          <div class="cart-row-name">Your order tray is empty</div>
          <div class="cart-row-sub">Add a signature drink or pastry to begin</div>
        </div>
      `;
      el.cartItemsList.appendChild(empty);
      return;
    }

    state.cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div class="cart-row-thumb">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-row-info">
          <div class="cart-row-name">${item.name}</div>
          <div class="cart-row-sub">${item.meta} • ${formatMoney(item.price)}</div>
        </div>
        <div class="cart-stepper">
          <button type="button" class="stepper-btn" data-step="-1" aria-label="Decrease quantity">&minus;</button>
          <span class="stepper-qty">${item.qty}</span>
          <button type="button" class="stepper-btn is-plus" data-step="1" aria-label="Increase quantity">+</button>
        </div>
      `;

      row.querySelector('[data-step="-1"]').addEventListener('click', () =>
        adjustCartQty(item.key, -1)
      );
      row.querySelector('[data-step="1"]').addEventListener('click', () =>
        adjustCartQty(item.key, 1)
      );
      el.cartItemsList.appendChild(row);
    });
  }

  /* ========================================================================
     MODALS (CART DRAWER & CALL SHEET)
     ======================================================================== */

  function openModal(which) {
    if (which === 'cart') {
      renderCartDrawerList();
      el.cartDrawerBackdrop.classList.add('is-open');
      el.cartDrawerBackdrop.setAttribute('aria-hidden', 'false');
    } else if (which === 'call') {
      el.callSheetBackdrop.classList.add('is-open');
      el.callSheetBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal(which) {
    if (which === 'cart' || which === 'all') {
      el.cartDrawerBackdrop.classList.remove('is-open');
      el.cartDrawerBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (which === 'call' || which === 'all') {
      el.callSheetBackdrop.classList.remove('is-open');
      el.callSheetBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  /* ========================================================================
     INTERACTIVE GESTURES (SCRUBBABLE PROGRESS BAR, DRAGGABLE SHEETS, TILT)
     ======================================================================== */

  function setupProgressScrubber() {
    const updateFromClientX = (clientX) => {
      const rect = el.progressTrackWrap.getBoundingClientRect();
      const ratio = (clientX - rect.left) / Math.max(rect.width, 1);
      state.orderProgress = Math.max(0, Math.min(100, ratio * 100));
      renderOrderProgress();
    };

    el.progressTrackWrap.addEventListener('pointerdown', (e) => {
      state.isDraggingProgress = true;
      el.progressTrackWrap.classList.add('is-dragging');
      el.progressTrackWrap.setPointerCapture(e.pointerId);
      updateFromClientX(e.clientX);
    });

    el.progressTrackWrap.addEventListener('pointermove', (e) => {
      if (!state.isDraggingProgress) return;
      updateFromClientX(e.clientX);
    });

    const endDrag = () => {
      if (!state.isDraggingProgress) return;
      state.isDraggingProgress = false;
      el.progressTrackWrap.classList.remove('is-dragging');
    };

    el.progressTrackWrap.addEventListener('pointerup', endDrag);
    el.progressTrackWrap.addEventListener('pointercancel', endDrag);

    el.progressTrackWrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        state.orderProgress = Math.min(100, state.orderProgress + 5);
        renderOrderProgress();
      } else if (e.key === 'ArrowLeft') {
        state.orderProgress = Math.max(0, state.orderProgress - 5);
        renderOrderProgress();
      }
    });

    // Gentle live auto-progression while viewing Tracker screen
    setInterval(() => {
      if (
        state.currentScreen === 'tracker' &&
        !state.isDraggingProgress &&
        state.orderProgress < 96
      ) {
        state.orderProgress = Math.min(96, state.orderProgress + 0.35);
        renderOrderProgress();
      }
    }, 1800);
  }

  function setupDraggableSheets() {
    // Pairing Sheet drag / tap to expand slightly
    let startY = 0;
    let dragging = false;

    el.pairingHandleBar.addEventListener('click', () => {
      state.pairingExpanded = !state.pairingExpanded;
      el.pairingSheet.classList.toggle('is-expanded', state.pairingExpanded);
    });

    el.pairingHandleBar.addEventListener('pointerdown', (e) => {
      startY = e.clientY;
      dragging = true;
      el.pairingHandleBar.setPointerCapture(e.pointerId);
    });

    el.pairingHandleBar.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dy = e.clientY - startY;
      if (dy < -24) {
        state.pairingExpanded = true;
        el.pairingSheet.classList.add('is-expanded');
      } else if (dy > 24) {
        state.pairingExpanded = false;
        el.pairingSheet.classList.remove('is-expanded');
      }
    });

    // Product Sheet subtle rubber-band pull-down (back to catalog if pulled > 70px)
    let prodStartY = 0;
    let prodDragging = false;

    el.productHandleBar.addEventListener('pointerdown', (e) => {
      prodStartY = e.clientY;
      prodDragging = true;
      el.productHandleBar.setPointerCapture(e.pointerId);
      el.productGlassSheet.style.transition = 'none';
    });

    el.productHandleBar.addEventListener('pointermove', (e) => {
      if (!prodDragging) return;
      const dy = Math.max(0, Math.min(110, e.clientY - prodStartY));
      el.productGlassSheet.style.transform = `translateY(${dy}px)`;
    });

    const releaseProductDrag = (e) => {
      if (!prodDragging) return;
      prodDragging = false;
      const dy = e.clientY - prodStartY;
      el.productGlassSheet.style.transition = '';
      el.productGlassSheet.style.transform = '';
      if (dy > 72) {
        navigateTo('catalog');
      }
    };

    el.productHandleBar.addEventListener('pointerup', releaseProductDrag);
    el.productHandleBar.addEventListener('pointercancel', releaseProductDrag);
  }

  function setupSubtleDrinkMotion() {
    el.heroDrinkStage.addEventListener('pointermove', (e) => {
      const rect = el.heroDrinkStage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
      const scaleMap = { small: 0.9, medium: 1, large: 1.07 };
      const baseScale = scaleMap[state.selectedSize] || 1;
      el.heroDrinkImg.style.transform = `translate3d(${nx}px, ${ny}px, 0) scale(${baseScale})`;
    });

    el.heroDrinkStage.addEventListener('pointerleave', () => {
      el.heroDrinkImg.style.transform = '';
    });
  }

  /* ========================================================================
     EVENT BINDINGS & BOOTSTRAP
     ======================================================================== */

  function bindEvents() {
    // Desktop Preview Toolbar
    el.toolbarTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        navigateTo(tab.dataset.navTarget);
      });
    });

    el.statusBarToggle.addEventListener('click', () => {
      const on = document.body.classList.toggle('show-statusbar');
      el.statusBarToggle.classList.toggle('is-active', on);
      el.statusBarToggle.setAttribute('aria-pressed', String(on));
    });

    // Screen 1 controls
    el.productBackBtn.addEventListener('click', () => navigateTo('catalog'));

    el.productFavBtn.addEventListener('click', () => {
      const drink = getActiveDrink();
      if (state.favorites.has(drink.id)) {
        state.favorites.delete(drink.id);
        showToast(`Removed ${drink.name} from favorites`);
      } else {
        state.favorites.add(drink.id);
        showToast(`Saved ${drink.name} to favorites`);
      }
      renderProductScreen();
    });

    el.readMoreBtn.addEventListener('click', () => {
      state.descExpanded = !state.descExpanded;
      renderProductScreen();
    });

    el.sizeOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        const nextSize = opt.dataset.size;
        if (nextSize === state.selectedSize) return;
        state.selectedSize = nextSize;
        renderProductScreen();
        el.productVolume.classList.add('is-bumping');
        setTimeout(() => el.productVolume.classList.remove('is-bumping'), 260);
      });
    });

    el.addToOrderBtn.addEventListener('click', addCurrentDrinkToOrder);

    // Screen 2 controls
    el.trackerDrinkThumbBtn.addEventListener('click', () => navigateTo('product'));
    el.trackerBrandBtn.addEventListener('click', () => navigateTo('catalog'));
    el.floatingOrderPill.addEventListener('click', () => openModal('cart'));
    el.callRestaurantBtn.addEventListener('click', () => openModal('call'));

    // Screen 0 controls
    el.catalogCartBtn.addEventListener('click', () => openModal('cart'));
    el.catalogLiveOrderPill.addEventListener('click', () => navigateTo('tracker'));

    // Modal closing
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    el.cartDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === el.cartDrawerBackdrop) closeModal('cart');
    });

    el.callSheetBackdrop.addEventListener('click', (e) => {
      if (e.target === el.callSheetBackdrop) closeModal('call');
    });

    el.cartConfirmBtn.addEventListener('click', () => {
      closeModal('cart');
      navigateTo('tracker');
      showToast('Order updated — Barista notified');
    });

    el.dialNowBtn.addEventListener('click', () => {
      closeModal('call');
      showToast('Calling GOOD GIRL Matcha Lab...');
    });

    el.pingBaristaBtn.addEventListener('click', () => {
      closeModal('call');
      showToast('Barista support pinged for your order');
    });

    // Escape key closes active modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal('all');
    });
  }

  function init() {
    renderCatalog();
    renderProductScreen();
    renderPairingCarousel();
    renderOrderProgress();
    syncCartUI(false);
    bindEvents();
    setupProgressScrubber();
    setupDraggableSheets();
    setupSubtleDrinkMotion();
  }

  init();
})();
