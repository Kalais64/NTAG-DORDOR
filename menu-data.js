/* ==========================================================================
   KOTA COFFEE — Unified 23-Item Café Catalog, Outlets, Add-Ons, Rewards & Themes
   Shared by Customer App (index.html), Live POS (pos.html) & Backend Sync
   ========================================================================== */

(function (global) {
  'use strict';

  function formatRp(amount) {
    const n = Math.round(Number(amount) || 0);
    return 'Rp' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  const OUTLETS = [
    {
      id: 'senopati',
      name: 'Senopati Flagship',
      area: 'Jl. Senopati No. 42, Jakarta',
      distance: '0.4 km',
      prepTime: '~5 min',
      status: 'Open • Normal',
      deliveryFee: 12000,
    },
    {
      id: 'scbd',
      name: 'SCBD Botanical Bar',
      area: 'Ashta District 8, GF',
      distance: '1.2 km',
      prepTime: '~8 min',
      status: 'Open • Busy',
      deliveryFee: 15000,
    },
    {
      id: 'kemang',
      name: 'Kemang Garden Lab',
      area: 'Jl. Kemang Raya No. 18',
      distance: '2.8 km',
      prepTime: '~4 min',
      status: 'Open • Fast',
      deliveryFee: 18000,
    },
  ];

  const PICKUP_SLOTS = [
    { id: 'now', label: 'Now (~5 min)' },
    { id: '15m', label: 'In 15 min' },
    { id: '30m', label: 'In 30 min' },
  ];

  const MILK_OPTIONS = [
    { id: 'dairy', label: 'Fresh Dairy', price: 0 },
    { id: 'oat', label: 'Oatside Oat', price: 10000 },
    { id: 'almond', label: 'Almond Milk', price: 10000 },
    { id: 'soy', label: 'Organic Soy', price: 7000 },
  ];

  const ADDONS = [
    { id: 'double-shot', label: 'Extra Espresso Shot', price: 8000, forCategories: ['coffee', 'signature'] },
    { id: 'extra-matcha', label: 'Extra Uji Matcha Scoop', price: 12000, forCategories: ['signature', 'non-coffee'] },
    { id: 'cheese-foam', label: 'Sea Salt Cheese Foam', price: 9000, forCategories: ['signature', 'coffee', 'non-coffee'] },
    { id: 'brown-boba', label: 'Brown Sugar Boba', price: 7000, forCategories: ['coffee', 'non-coffee'] },
    { id: 'whip-cream', label: 'Whipped Cream Crown', price: 6000, forCategories: ['coffee', 'non-coffee'] },
    { id: 'biscoff-crumble', label: 'Biscoff Crumble', price: 8000, forCategories: ['coffee', 'non-coffee', 'pastry'] },
    { id: 'truffle-butter', label: 'Extra Truffle Butter', price: 9000, forCategories: ['food'] },
    { id: 'warm-cheese', label: 'Melted Gruyere Add-on', price: 10000, forCategories: ['food'] },
  ];

  const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'signature', label: 'Signature Blends' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'non-coffee', label: 'Non-Coffee & Tea' },
    { id: 'food', label: 'Food & Brunch' },
    { id: 'pastry', label: 'Pastry & Dessert' },
    { id: 'merch', label: 'Merch & Beans' },
  ];

  const MENU_ITEMS = [
    /* ===================== SIGNATURE BLENDS (4) ===================== */
    {
      id: 'matcha-nitro',
      skuPrefix: 'SIG-MNT',
      name: 'MATCHA NITRO',
      shortName: 'Matcha Nitro',
      category: 'signature',
      categoryLabel: 'Signature Blends',
      badge: 'Best Seller',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: false,
      kcal: 145,
      caffeine: 'Medium',
      image: 'assets/matcha-nitro.png',
      shortDesc:
        'A smooth, layered drink that combines ceremonial matcha with nitrogen-infused botanical base. Velvety texture,...',
      fullDesc:
        'A smooth, layered drink that combines first-harvest Kyoto ceremonial Uji matcha with a chilled nitrogen-infused butterfly-pea botanical base. Velvety micro-foam texture, zero refined sugar, and a crisp floral mineral finish.',
      tags: [
        { label: 'CREAMY', note: 'Nitrogen-whipped ceremonial Uji matcha micro-foam.' },
        { label: 'FLORAL', note: 'Subtle butterfly-pea blossom & botanical essence.' },
        { label: 'SILKY', note: 'Cold-infused velvety body with zero bitterness.' },
        { label: 'EARTHY', note: 'First-harvest stone-ground Kyoto shade-grown leaves.' },
      ],
      styles: [
        { id: 'ice', label: 'Nitro Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot Whisked', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 36000 },
        medium: { label: 'Medium', volume: '250 ML', price: 42000 },
        large: { label: 'Large', volume: '350 ML', price: 49000 },
      },
      theme: {
        topBg: '#a9db4c',
        topBg2: '#73ab2a',
        sheetTop: 'rgba(15, 23, 12, 0.78)',
        sheetMid: 'rgba(9, 34, 34, 0.64)',
        sheetBot: 'rgba(4, 30, 48, 0.84)',
        glowTop: 'rgba(164, 236, 56, 0.34)',
        glowBot: 'rgba(18, 128, 214, 0.48)',
        accent: '#c3fb52',
        cardTint: 'rgba(148, 224, 62, 0.16)',
      },
    },
    {
      id: 'blue-cloud-latte',
      skuPrefix: 'SIG-BCL',
      name: 'BLUE CLOUD LATTE',
      shortName: 'Blue Cloud Latte',
      category: 'signature',
      categoryLabel: 'Signature Blends',
      badge: 'Signature',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 180,
      caffeine: 'Caffeine-Free',
      image: 'assets/blue-cloud-latte.png',
      shortDesc:
        'Velvety sky-blue spirulina cold foam suspended above chilled barista oat milk with botanical sapphire swirls,...',
      fullDesc:
        'Velvety sky-blue spirulina cold foam suspended above chilled organic barista milk with delicate botanical sapphire swirls and cold-steeped Madagascar vanilla bean.',
      tags: [
        { label: 'CLOUDY', note: 'Whipped blue spirulina cold cloud foam.' },
        { label: 'OAT', note: 'Pairs seamlessly with Oatside oat milk.' },
        { label: 'VANILLA', note: 'Cold-steeped Madagascar vanilla pod infusion.' },
        { label: 'SMOOTH', note: 'Naturally caffeine-free restorative sip.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 34000 },
        medium: { label: 'Medium', volume: '250 ML', price: 40000 },
        large: { label: 'Large', volume: '350 ML', price: 47000 },
      },
      theme: {
        topBg: '#9ed4fa',
        topBg2: '#569ad4',
        sheetTop: 'rgba(12, 26, 42, 0.76)',
        sheetMid: 'rgba(20, 40, 58, 0.62)',
        sheetBot: 'rgba(42, 54, 68, 0.78)',
        glowTop: 'rgba(124, 204, 255, 0.38)',
        glowBot: 'rgba(232, 242, 252, 0.26)',
        accent: '#8ee6ff',
        cardTint: 'rgba(124, 204, 255, 0.16)',
      },
    },
    {
      id: 'yuzu-matcha-fizz',
      skuPrefix: 'SIG-YMF',
      name: 'YUZU MATCHA FIZZ',
      shortName: 'Yuzu Matcha Fizz',
      category: 'signature',
      categoryLabel: 'Signature Blends',
      badge: 'Refreshing',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: false,
      kcal: 115,
      caffeine: 'Medium',
      image: 'assets/yuzu-matcha-fizz.png',
      shortDesc:
        'Bright emerald ceremonial matcha layered cleanly over sparkling Japanese yuzu citrus botanical tonic,...',
      fullDesc:
        'Bright emerald ceremonial matcha layered cleanly over sparkling Kochi yuzu citrus botanical tonic with crisp micro-effervescent bubbles and an uplifting aromatic finish.',
      tags: [
        { label: 'BRIGHT', note: 'Fresh-pressed aromatic Kochi yuzu peel.' },
        { label: 'SPARKLING', note: 'High-carbonation chilled botanical tonic.' },
        { label: 'CRISP', note: 'Clean, refreshing citrus palate cleanser.' },
        { label: 'MATCHA', note: 'Hand-whisked ceremonial emerald top layer.' },
      ],
      styles: [
        { id: 'ice', label: 'Sparkling Ice', icon: 'ice' },
        { id: 'hot', label: 'Warm Citrus', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 33000 },
        medium: { label: 'Medium', volume: '250 ML', price: 38000 },
        large: { label: 'Large', volume: '350 ML', price: 45000 },
      },
      theme: {
        topBg: '#bae654',
        topBg2: '#89b328',
        sheetTop: 'rgba(15, 28, 14, 0.78)',
        sheetMid: 'rgba(28, 36, 16, 0.65)',
        sheetBot: 'rgba(48, 36, 10, 0.84)',
        glowTop: 'rgba(140, 224, 62, 0.34)',
        glowBot: 'rgba(242, 186, 40, 0.44)',
        accent: '#daf95c',
        cardTint: 'rgba(220, 206, 62, 0.16)',
      },
    },
    {
      id: 'hojicha-oat-cloud',
      skuPrefix: 'SIG-HOC',
      name: 'HOJICHA OAT CLOUD',
      shortName: 'Hojicha Oat Cloud',
      category: 'signature',
      categoryLabel: 'Signature Blends',
      badge: 'New',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 190,
      caffeine: 'Low',
      image: 'assets/hojicha-oat-cloud.png',
      shortDesc:
        'Charcoal-roasted Kyoto hojicha tea cloud whisked silky over chilled oat milk with toasted chestnut aroma,...',
      fullDesc:
        'Slow-roasted Kyoto stem hojicha whisked into a velvety toasted-chestnut micro-foam layered above silky iced milk. Naturally low caffeine with warm caramel-smoky comfort.',
      tags: [
        { label: 'ROASTED', note: 'Charcoal-roasted Uji green tea stems.' },
        { label: 'NUTTY', note: 'Warm toasted chestnut & caramel aroma.' },
        { label: 'LOW CAF', note: 'Gentle evening-friendly roasted tea.' },
        { label: 'VELVET', note: 'Whipped hojicha cold cloud crown.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 34000 },
        medium: { label: 'Medium', volume: '250 ML', price: 39000 },
        large: { label: 'Large', volume: '350 ML', price: 46000 },
      },
      theme: {
        topBg: '#d8b48a',
        topBg2: '#9a6e42',
        sheetTop: 'rgba(34, 24, 15, 0.80)',
        sheetMid: 'rgba(50, 36, 23, 0.66)',
        sheetBot: 'rgba(42, 34, 28, 0.82)',
        glowTop: 'rgba(216, 166, 108, 0.38)',
        glowBot: 'rgba(244, 230, 212, 0.28)',
        accent: '#f2cb96',
        cardTint: 'rgba(212, 166, 114, 0.16)',
      },
    },

    /* ===================== COFFEE (5) ===================== */
    {
      id: 'aren-palm-latte',
      skuPrefix: 'COF-ARN',
      name: 'AREN PALM LATTE',
      shortName: 'Aren Palm Latte',
      category: 'coffee',
      categoryLabel: 'Coffee',
      badge: 'Top Order',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 210,
      caffeine: 'High',
      image: 'assets/aren-palm-latte.png',
      shortDesc:
        'Signature Kopi Susu Gula Aren crafted with single-origin espresso, organic Banten palm nectar & creamy milk,...',
      fullDesc:
        'Our elevated Indonesian Kopi Susu Gula Aren: slow-simmered organic Banten dark palm sugar syrup layered with cold-textured milk and double-shot Flores specialty espresso crema.',
      tags: [
        { label: 'GULA AREN', note: 'Organic slow-reduced dark Banten palm nectar.' },
        { label: 'DOUBLE SHOT', note: 'House Flores & Aceh Gayo espresso blend.' },
        { label: 'CREAMY', note: 'Balanced sweet-bold Jakarta café favorite.' },
        { label: 'SILKY', note: 'Smooth caramel-brown sugar aftertaste.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 27000 },
        medium: { label: 'Medium', volume: '250 ML', price: 32000 },
        large: { label: 'Large', volume: '350 ML', price: 38000 },
      },
      theme: {
        topBg: '#dfa96d',
        topBg2: '#9a5d26',
        sheetTop: 'rgba(38, 22, 12, 0.80)',
        sheetMid: 'rgba(54, 34, 18, 0.66)',
        sheetBot: 'rgba(42, 30, 22, 0.82)',
        glowTop: 'rgba(228, 152, 72, 0.38)',
        glowBot: 'rgba(248, 232, 210, 0.26)',
        accent: '#ffc47c',
        cardTint: 'rgba(218, 148, 76, 0.16)',
      },
    },
    {
      id: 'iced-americano',
      skuPrefix: 'COF-AMR',
      name: 'ICED AMERICANO',
      shortName: 'Iced Americano',
      category: 'coffee',
      categoryLabel: 'Coffee',
      badge: 'Classic',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: false,
      kcal: 15,
      caffeine: 'High',
      image: 'assets/iced-americano.png',
      shortDesc:
        'Double-shot single-origin Flores & Ethiopia espresso poured over crystal ice with velvety golden crema,...',
      fullDesc:
        'Double-shot single-origin Flores & Ethiopia washed espresso pulled at 9 bars and poured gently over crystal-clear ice for a clean roasted-cocoa aroma, bright stone-fruit clarity, and silky golden crema.',
      tags: [
        { label: 'ROASTED', note: 'Medium-dark specialty Arabica double espresso.' },
        { label: 'CRISP', note: 'Zero bitterness, chilled mineral water balance.' },
        { label: 'COCOA', note: 'Dark nib chocolate undertones on the finish.' },
        { label: '15 KCAL', note: 'Pure clean espresso energy.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 24000 },
        medium: { label: 'Medium', volume: '250 ML', price: 28000 },
        large: { label: 'Large', volume: '350 ML', price: 33000 },
      },
      theme: {
        topBg: '#dfd0c0',
        topBg2: '#9a7758',
        sheetTop: 'rgba(32, 20, 14, 0.82)',
        sheetMid: 'rgba(46, 33, 24, 0.68)',
        sheetBot: 'rgba(62, 54, 48, 0.78)',
        glowTop: 'rgba(176, 114, 68, 0.36)',
        glowBot: 'rgba(246, 238, 230, 0.28)',
        accent: '#f4d6b0',
        cardTint: 'rgba(196, 148, 108, 0.16)',
      },
    },
    {
      id: 'caramel-macchiato',
      skuPrefix: 'COF-CRM',
      name: 'CARAMEL MACCHIATO',
      shortName: 'Caramel Macchiato',
      category: 'coffee',
      categoryLabel: 'Coffee',
      badge: 'Popular',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 240,
      caffeine: 'High',
      image: 'assets/caramel-macchiato.png',
      shortDesc:
        'Layered vanilla milk marked with bold house espresso, silky micro-foam & sea-salt caramel criss-cross drizzle,...',
      fullDesc:
        'Chilled Madagascar vanilla milk layered beneath rich signature espresso, crowned with cloud micro-foam and house-torched golden sea-salt caramel drizzle.',
      tags: [
        { label: 'CARAMEL', note: 'House-torched buttery sea-salt caramel.' },
        { label: 'LAYERED', note: 'Classic marked espresso macchiato pour.' },
        { label: 'VANILLA', note: 'Silky sweet vanilla bean milk foundation.' },
        { label: 'SMOOTH', note: 'Crowd-pleasing café gold standard.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 32000 },
        medium: { label: 'Medium', volume: '250 ML', price: 37000 },
        large: { label: 'Large', volume: '350 ML', price: 44000 },
      },
      theme: {
        topBg: '#f0cc96',
        topBg2: '#c0823c',
        sheetTop: 'rgba(38, 26, 14, 0.80)',
        sheetMid: 'rgba(54, 38, 22, 0.66)',
        sheetBot: 'rgba(48, 40, 32, 0.80)',
        glowTop: 'rgba(244, 184, 92, 0.38)',
        glowBot: 'rgba(252, 240, 224, 0.28)',
        accent: '#ffd48e',
        cardTint: 'rgba(238, 182, 98, 0.16)',
      },
    },
    {
      id: 'biscoff-choco-frappe',
      skuPrefix: 'COF-BCF',
      name: 'BISCOFF CHOCO FRAPPE',
      shortName: 'Biscoff Choco Frappe',
      category: 'coffee',
      categoryLabel: 'Coffee',
      badge: 'New',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 360,
      caffeine: 'Medium',
      image: 'assets/biscoff-choco-frappe.png',
      shortDesc:
        'Velvety Belgian dark chocolate and house espresso blended smooth with salted caramel & Lotus Biscoff,...',
      fullDesc:
        'Velvety Belgian dark chocolate and double house espresso blended silky smooth with salted caramel ribbons, whipped cream crown, dark cocoa crumble, and a crisp caramelized Lotus Biscoff biscuit.',
      tags: [
        { label: 'CHOCO', note: '70% Belgian dark cocoa ganache swirl.' },
        { label: 'BISCOFF', note: 'Spiced caramelized speculoos biscuit crunch.' },
        { label: 'CARAMEL', note: 'House-torched sea salt caramel drizzle.' },
        { label: 'INDULGENT', note: 'Rich dessert-grade blended espresso.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice Frappe', icon: 'ice' },
        { id: 'hot', label: 'Hot Mocha', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '240 ML', price: 34000 },
        medium: { label: 'Medium', volume: '300 ML', price: 39000 },
        large: { label: 'Large', volume: '400 ML', price: 46000 },
      },
      theme: {
        topBg: '#e4b278',
        topBg2: '#a66832',
        sheetTop: 'rgba(38, 20, 12, 0.82)',
        sheetMid: 'rgba(56, 32, 18, 0.68)',
        sheetBot: 'rgba(30, 17, 11, 0.86)',
        glowTop: 'rgba(232, 162, 78, 0.40)',
        glowBot: 'rgba(148, 80, 40, 0.44)',
        accent: '#ffc980',
        cardTint: 'rgba(222, 152, 82, 0.16)',
      },
    },
    {
      id: 'vanilla-cinnamon-latte',
      skuPrefix: 'COF-VCL',
      name: 'VANILLA CINNAMON LATTE',
      shortName: 'Vanilla Cinnamon Latte',
      category: 'coffee',
      categoryLabel: 'Coffee',
      badge: 'Favorite',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 205,
      caffeine: 'High',
      image: 'assets/vanilla-cinnamon-latte.png',
      shortDesc:
        'Silky house espresso cascaded over chilled Madagascar vanilla milk with warm Ceylon cinnamon dusting,...',
      fullDesc:
        'Silky house espresso cascaded gently over chilled Madagascar vanilla bean milk, finished with micro-foam and aromatic warm Ceylon cinnamon dusting.',
      tags: [
        { label: 'VANILLA', note: 'Real Madagascar vanilla bean pod syrup.' },
        { label: 'SPICED', note: 'Warm sweet Ceylon cinnamon aroma.' },
        { label: 'CREAMY', note: 'Micro-textured velvety milk body.' },
        { label: 'COZY', note: 'Balanced low-acid specialty espresso.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 30000 },
        medium: { label: 'Medium', volume: '250 ML', price: 35000 },
        large: { label: 'Large', volume: '350 ML', price: 42000 },
      },
      theme: {
        topBg: '#eddcc4',
        topBg2: '#be9568',
        sheetTop: 'rgba(38, 28, 20, 0.78)',
        sheetMid: 'rgba(54, 42, 30, 0.64)',
        sheetBot: 'rgba(46, 40, 35, 0.80)',
        glowTop: 'rgba(236, 198, 146, 0.36)',
        glowBot: 'rgba(252, 244, 232, 0.26)',
        accent: '#ffe2b8',
        cardTint: 'rgba(232, 198, 152, 0.16)',
      },
    },

    /* ===================== NON-COFFEE & TEA (4) ===================== */
    {
      id: 'strawberry-matcha-cloud',
      skuPrefix: 'NCF-SMC',
      name: 'STRAWBERRY MATCHA CLOUD',
      shortName: 'Strawberry Matcha',
      category: 'non-coffee',
      categoryLabel: 'Non-Coffee & Tea',
      badge: 'Trending',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 215,
      caffeine: 'Medium',
      image: 'assets/strawberry-matcha-cloud.png',
      shortDesc:
        'Triple-layered ruby strawberry compote, chilled silky milk, and ceremonial emerald matcha foam cloud,...',
      fullDesc:
        'Triple-layered house-macerated ruby strawberry compote, chilled creamy milk over crystal ice, crowned with lush stone-ground emerald Uji matcha micro-foam.',
      tags: [
        { label: 'BERRY', note: 'Fresh-macerated Bandung ruby strawberries.' },
        { label: 'MATCHA', note: 'Ceremonial Kyoto emerald top cloud.' },
        { label: 'LAYERED', note: 'Stir slowly for marbled pink-green harmony.' },
        { label: 'FRESH', note: 'Light natural fruit sweetness.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Warm', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 34000 },
        medium: { label: 'Medium', volume: '250 ML', price: 39000 },
        large: { label: 'Large', volume: '350 ML', price: 45000 },
      },
      theme: {
        topBg: '#a8dc58',
        topBg2: '#6da830',
        sheetTop: 'rgba(16, 30, 15, 0.78)',
        sheetMid: 'rgba(38, 22, 28, 0.66)',
        sheetBot: 'rgba(60, 14, 28, 0.84)',
        glowTop: 'rgba(144, 224, 68, 0.34)',
        glowBot: 'rgba(238, 70, 112, 0.48)',
        accent: '#ff96b6',
        cardTint: 'rgba(232, 92, 128, 0.16)',
      },
    },
    {
      id: 'belgian-dark-choco',
      skuPrefix: 'NCF-BDC',
      name: 'BELGIAN DARK CHOCOLATE',
      shortName: 'Belgian Dark Choco',
      category: 'non-coffee',
      categoryLabel: 'Non-Coffee & Tea',
      badge: 'Rich 70%',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 295,
      caffeine: 'Caffeine-Free',
      image: 'assets/belgian-dark-choco.png',
      shortDesc:
        'Single-origin 70% Callebaut Belgian dark chocolate whisked velvety over ice with cocoa cold foam,...',
      fullDesc:
        'Decadent 70% Callebaut Belgian dark couverture chocolate melted into silky chilled milk over crystal ice, crowned with airy dark cocoa foam and dusted nibs.',
      tags: [
        { label: '70% DARK', note: 'Authentic Belgian couverture chocolate.' },
        { label: 'VELVETY', note: 'Thick silky ganache mouthfeel.' },
        { label: 'NO COFFEE', note: 'Pure indulgent chocolate comfort.' },
        { label: 'COCOA FOAM', note: 'Whipped cold dark chocolate crown.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 32000 },
        medium: { label: 'Medium', volume: '250 ML', price: 37000 },
        large: { label: 'Large', volume: '350 ML', price: 44000 },
      },
      theme: {
        topBg: '#a67b60',
        topBg2: '#5c3624',
        sheetTop: 'rgba(30, 16, 12, 0.84)',
        sheetMid: 'rgba(46, 24, 18, 0.72)',
        sheetBot: 'rgba(24, 14, 12, 0.88)',
        glowTop: 'rgba(182, 114, 78, 0.36)',
        glowBot: 'rgba(116, 62, 42, 0.42)',
        accent: '#e8b496',
        cardTint: 'rgba(164, 102, 72, 0.16)',
      },
    },
    {
      id: 'lychee-rose-tea',
      skuPrefix: 'NCF-LRT',
      name: 'LYCHEE ROSE TEA',
      shortName: 'Lychee Rose Tea',
      category: 'non-coffee',
      categoryLabel: 'Non-Coffee & Tea',
      badge: 'Floral',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: false,
      kcal: 95,
      caffeine: 'Low',
      image: 'assets/lychee-rose-tea.png',
      shortDesc:
        'Cold-brewed jasmine & Damascus rose botanical tea infused with whole sweet lychee fruit & crystal ice,...',
      fullDesc:
        'Luminous rose-blush cold-steeped jasmine green tea infused with Damascus rose petals and served with two plump whole sweet lychees over crystal ice.',
      tags: [
        { label: 'FLORAL', note: 'Fragrant Damascus rose & jasmine infusion.' },
        { label: 'LYCHEE', note: 'Served with juicy whole sweet lychees.' },
        { label: 'LIGHT', note: 'Only 95 kcal ultra-refreshing iced tea.' },
        { label: 'BOTANICAL', note: '12-hour cold-steeped tea clarity.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot Pot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '220 ML', price: 27000 },
        medium: { label: 'Medium', volume: '280 ML', price: 32000 },
        large: { label: 'Large', volume: '380 ML', price: 38000 },
      },
      theme: {
        topBg: '#f6a8c0',
        topBg2: '#cf6488',
        sheetTop: 'rgba(42, 16, 28, 0.78)',
        sheetMid: 'rgba(58, 22, 38, 0.66)',
        sheetBot: 'rgba(44, 18, 30, 0.82)',
        glowTop: 'rgba(248, 146, 178, 0.40)',
        glowBot: 'rgba(255, 212, 226, 0.28)',
        accent: '#ffb0cb',
        cardTint: 'rgba(244, 144, 178, 0.16)',
      },
    },
    {
      id: 'thai-milk-tea',
      skuPrefix: 'NCF-TMT',
      name: 'THAI MILK TEA',
      shortName: 'Thai Milk Tea',
      category: 'non-coffee',
      categoryLabel: 'Non-Coffee & Tea',
      badge: 'House Brew',
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 225,
      caffeine: 'Medium',
      image: 'assets/thai-milk-tea.png',
      shortDesc:
        'Slow-steeped Chiang Mai spiced black tea layered with velvety condensed cream over crisp crystal ice,...',
      fullDesc:
        'Slow-steeped Chiang Mai spiced black tea with star anise, toasted vanilla, and crushed cardamom, layered smoothly with chilled evaporated & condensed cream over crystal ice.',
      tags: [
        { label: 'AROMATIC', note: 'Star anise, vanilla bean & Assam black tea.' },
        { label: 'SILKY', note: 'Swirled sweet cream richness.' },
        { label: 'AMBER', note: 'Deep golden-terracotta slow brew.' },
        { label: 'CLASSIC', note: 'Beloved iced café comfort elevated.' },
      ],
      styles: [
        { id: 'ice', label: 'Ice', icon: 'ice' },
        { id: 'hot', label: 'Hot', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '200 ML', price: 25000 },
        medium: { label: 'Medium', volume: '250 ML', price: 29000 },
        large: { label: 'Large', volume: '350 ML', price: 35000 },
      },
      theme: {
        topBg: '#f4ab64',
        topBg2: '#cc6d2b',
        sheetTop: 'rgba(46, 22, 10, 0.80)',
        sheetMid: 'rgba(64, 34, 16, 0.66)',
        sheetBot: 'rgba(54, 40, 28, 0.82)',
        glowTop: 'rgba(248, 148, 62, 0.42)',
        glowBot: 'rgba(252, 230, 198, 0.28)',
        accent: '#ffbc75',
        cardTint: 'rgba(244, 152, 68, 0.16)',
      },
    },

    /* ===================== FOOD & BRUNCH (3) ===================== */
    {
      id: 'butter-croissant',
      skuPrefix: 'FOD-CRS',
      name: 'BUTTER CROISSANT',
      shortName: 'Butter Croissant',
      category: 'food',
      categoryLabel: 'Food & Brunch',
      badge: 'Fresh Baked',
      itemType: 'food',
      hasLevels: false,
      hasMilk: false,
      kcal: 310,
      caffeine: null,
      image: 'assets/butter-croissant.png',
      shortDesc:
        'Hand-laminated 27-layer French AOP Isigny butter croissant baked golden every morning with honeycomb crumb,...',
      fullDesc:
        'Hand-laminated 27-layer French AOP Isigny cultured butter croissant fermented 48 hours and baked fresh every morning for shatteringly crisp golden pastry and tender honeycomb crumb.',
      tags: [
        { label: 'AOP BUTTER', note: '100% French Isigny cultured butter.' },
        { label: 'FLAKY', note: '27 crisp golden laminated pastry layers.' },
        { label: 'WARM', note: 'Served oven-warmed on request.' },
        { label: 'MORNING', note: 'Perfect match for Iced Americano.' },
      ],
      styles: [
        { id: 'warm', label: 'Oven Warmed', icon: 'hot' },
        { id: 'room', label: 'Room Temp', icon: 'box' },
      ],
      sizes: {
        small: { label: '1 Piece', volume: '85 g', price: 28000 },
        medium: { label: 'Duo (2)', volume: '170 g', price: 52000 },
        large: { label: 'Box (4)', volume: '340 g', price: 98000 },
      },
      theme: {
        topBg: '#f2ca7e',
        topBg2: '#c28836',
        sheetTop: 'rgba(40, 28, 14, 0.80)',
        sheetMid: 'rgba(56, 40, 20, 0.66)',
        sheetBot: 'rgba(42, 32, 20, 0.82)',
        glowTop: 'rgba(246, 198, 108, 0.38)',
        glowBot: 'rgba(222, 162, 74, 0.30)',
        accent: '#ffe099',
        cardTint: 'rgba(242, 194, 106, 0.16)',
      },
    },
    {
      id: 'truffle-egg-brioche',
      skuPrefix: 'FOD-TEB',
      name: 'TRUFFLE EGG BRIOCHE',
      shortName: 'Truffle Egg Brioche',
      category: 'food',
      categoryLabel: 'Food & Brunch',
      badge: 'Brunch Hit',
      itemType: 'food',
      hasLevels: false,
      hasMilk: false,
      kcal: 440,
      caffeine: null,
      image: 'assets/truffle-egg-brioche.png',
      shortDesc:
        'Toasted Hokkaido butter brioche stacked with silky truffle soft-scrambled eggs, aged cheddar & chives,...',
      fullDesc:
        'Thick-cut toasted Hokkaido milk brioche overflowing with silky Japanese soft-scrambled organic eggs folded with black truffle butter, melted red cheddar glaze, and fresh chives.',
      tags: [
        { label: 'TRUFFLE', note: 'Aromatic Italian black truffle butter.' },
        { label: 'BRIOCHE', note: 'Griddle-toasted Hokkaido milk bread.' },
        { label: 'SILKY EGG', note: 'Soft-folded free-range scrambled eggs.' },
        { label: 'SAVORY', note: 'All-day café brunch bestseller.' },
      ],
      styles: [
        { id: 'warm', label: 'Served Hot', icon: 'hot' },
        { id: 'cut', label: 'Cut in Half', icon: 'box' },
      ],
      sizes: {
        small: { label: 'Regular', volume: '220 g', price: 54000 },
        medium: { label: '+ Fries', volume: '340 g', price: 68000 },
        large: { label: 'Brunch Duo', volume: '440 g', price: 102000 },
      },
      theme: {
        topBg: '#f6d57c',
        topBg2: '#c8922e',
        sheetTop: 'rgba(38, 28, 12, 0.80)',
        sheetMid: 'rgba(54, 42, 18, 0.68)',
        sheetBot: 'rgba(34, 28, 16, 0.84)',
        glowTop: 'rgba(248, 206, 88, 0.38)',
        glowBot: 'rgba(136, 184, 78, 0.28)',
        accent: '#ffe382',
        cardTint: 'rgba(244, 202, 92, 0.16)',
      },
    },
    {
      id: 'smoked-beef-panini',
      skuPrefix: 'FOD-SBP',
      name: 'SMOKED BEEF PANINI',
      shortName: 'Smoked Beef Panini',
      category: 'food',
      categoryLabel: 'Food & Brunch',
      badge: 'Chef Special',
      itemType: 'food',
      hasLevels: false,
      hasMilk: false,
      kcal: 510,
      caffeine: null,
      image: 'assets/smoked-beef-panini.png',
      shortDesc:
        'Crisp grill-pressed sourdough panini filled with hickory smoked beef brisket, melted gruyere & wild arugula,...',
      fullDesc:
        'Artisanal country sourdough pressed golden on the panini grill with slow-smoked beef brisket, caramelized balsamic onion, melted Swiss gruyere cheese, honey mustard aioli, and peppery baby arugula.',
      tags: [
        { label: 'BRISKET', note: '12-hour hickory smoked sliced beef.' },
        { label: 'GRUYERE', note: 'Nutty melted Swiss artisanal cheese.' },
        { label: 'SOURDOUGH', note: 'Crisp naturally leavened grill bread.' },
        { label: 'HEARTY', note: 'Satisfying lunch & coffee pairing.' },
      ],
      styles: [
        { id: 'warm', label: 'Pressed Hot', icon: 'hot' },
        { id: 'box', label: 'Takeaway Wrap', icon: 'box' },
      ],
      sizes: {
        small: { label: 'Half', volume: '160 g', price: 42000 },
        medium: { label: 'Full Panini', volume: '290 g', price: 64000 },
        large: { label: '+ Salad', volume: '380 g', price: 78000 },
      },
      theme: {
        topBg: '#d8a878',
        topBg2: '#8a5434',
        sheetTop: 'rgba(34, 22, 16, 0.82)',
        sheetMid: 'rgba(48, 30, 22, 0.68)',
        sheetBot: 'rgba(26, 30, 20, 0.84)',
        glowTop: 'rgba(216, 152, 96, 0.36)',
        glowBot: 'rgba(116, 178, 86, 0.30)',
        accent: '#f2c292',
        cardTint: 'rgba(204, 142, 88, 0.16)',
      },
    },

    /* ===================== PASTRY & DESSERT (4) ===================== */
    {
      id: 'spirulina-cake',
      skuPrefix: 'PST-SPC',
      name: 'SPIRULINA CAKE',
      shortName: 'Spirulina Cake',
      category: 'pastry',
      categoryLabel: 'Pastry & Dessert',
      badge: 'Pairing Pick',
      itemType: 'pastry',
      hasLevels: false,
      hasMilk: false,
      kcal: 340,
      caffeine: null,
      image: 'assets/spirulina-cake.png',
      shortDesc:
        'Chilled marbled sky-blue spirulina mousse & coconut-vanilla cream atop golden toasted oat biscuit crust,...',
      fullDesc:
        'Chilled artisanal cheesecake featuring marbled sky-blue blue-spirulina mousse, silky coconut-vanilla cream center, and a crisp golden toasted oat-almond biscuit base. Crafted to pair with Matcha Nitro.',
      tags: [
        { label: 'SPIRULINA', note: 'Natural ocean-blue superfood marbling.' },
        { label: 'CHILLED', note: 'Light mousse-like no-bake texture.' },
        { label: 'COCONUT', note: 'Delicate creamy vanilla middle layer.' },
        { label: 'CRUNCH', note: 'Toasted honey oat & almond crust.' },
      ],
      styles: [
        { id: 'chilled', label: 'Chilled', icon: 'ice' },
        { id: 'gift', label: 'Gift Box', icon: 'box' },
      ],
      sizes: {
        small: { label: '1 Slice', volume: '250 g', price: 38000 },
        medium: { label: 'Duo (2)', volume: '500 g', price: 72000 },
        large: { label: 'Box (4)', volume: '1 kg', price: 138000 },
      },
      theme: {
        topBg: '#a0d4fa',
        topBg2: '#6aa4d6',
        sheetTop: 'rgba(12, 26, 42, 0.78)',
        sheetMid: 'rgba(18, 36, 54, 0.64)',
        sheetBot: 'rgba(42, 36, 26, 0.80)',
        glowTop: 'rgba(132, 200, 255, 0.38)',
        glowBot: 'rgba(222, 186, 132, 0.30)',
        accent: '#98deff',
        cardTint: 'rgba(134, 202, 255, 0.16)',
      },
    },
    {
      id: 'matcha-mochi',
      skuPrefix: 'PST-MMC',
      name: 'MATCHA MOCHI',
      shortName: 'Matcha Mochi',
      category: 'pastry',
      categoryLabel: 'Pastry & Dessert',
      badge: 'Best Seller',
      itemType: 'pastry',
      hasLevels: false,
      hasMilk: false,
      kcal: 220,
      caffeine: 'Low',
      image: 'assets/matcha-mochi.png',
      shortDesc:
        'Pillow-soft pastel matcha daifuku stuffed with whipped cream, molten Uji matcha ganache & berry bits,...',
      fullDesc:
        'Pillow-soft hand-pounded pastel matcha daifuku mochi filled with airy vanilla cream, a glossy molten Uji ceremonial matcha ganache center, pistachio crumble base, and freeze-dried ruby raspberry garnish.',
      tags: [
        { label: 'MOLTEN', note: 'Oozing dark ceremonial Uji matcha core.' },
        { label: 'CHEWY', note: 'Freshly steamed silky Japanese mochi skin.' },
        { label: 'CREAMY', note: 'Light Hokkaido-style whipped chantilly.' },
        { label: 'BERRY', note: 'Tangy freeze-dried raspberry crown.' },
      ],
      styles: [
        { id: 'chilled', label: 'Chilled', icon: 'ice' },
        { id: 'gift', label: 'Gift Box', icon: 'box' },
      ],
      sizes: {
        small: { label: 'Single', volume: '150 g', price: 28000 },
        medium: { label: 'Box (3)', volume: '450 g', price: 78000 },
        large: { label: 'Box (6)', volume: '900 g', price: 148000 },
      },
      theme: {
        topBg: '#c5e69e',
        topBg2: '#87b85e',
        sheetTop: 'rgba(18, 30, 18, 0.78)',
        sheetMid: 'rgba(24, 42, 24, 0.64)',
        sheetBot: 'rgba(16, 32, 22, 0.82)',
        glowTop: 'rgba(176, 228, 118, 0.34)',
        glowBot: 'rgba(222, 86, 114, 0.28)',
        accent: '#c8f587',
        cardTint: 'rgba(168, 228, 114, 0.16)',
      },
    },
    {
      id: 'blueberry-tart',
      skuPrefix: 'PST-BBT',
      name: 'BLUEBERRY TART',
      shortName: 'Blueberry Tart',
      category: 'pastry',
      categoryLabel: 'Pastry & Dessert',
      badge: 'Artisanal',
      itemType: 'pastry',
      hasLevels: false,
      hasMilk: false,
      kcal: 330,
      caffeine: null,
      image: 'assets/blueberry-tart.png',
      shortDesc:
        'Velvety indigo blueberry cheesecake tart on roasted cocoa crust finished with lavender marble glaze,...',
      fullDesc:
        'Velvety wild indigo-blueberry cheesecake tart resting on a dark roasted cocoa biscuit crust, crowned with glossy marbled lavender glaze and fresh glazed blueberries.',
      tags: [
        { label: 'INDIGO', note: 'Wild mountain blueberry compote mousse.' },
        { label: 'COCOA', note: 'Crisp dark chocolate-butter crust.' },
        { label: 'GLAZED', note: 'Mirror lavender-cream swirl topping.' },
        { label: 'TANGY', note: 'Bright sweet-tart berry finish.' },
      ],
      styles: [
        { id: 'chilled', label: 'Chilled', icon: 'ice' },
        { id: 'gift', label: 'Gift Box', icon: 'box' },
      ],
      sizes: {
        small: { label: '1 Slice', volume: '250 g', price: 36000 },
        medium: { label: 'Duo (2)', volume: '500 g', price: 68000 },
        large: { label: 'Box (4)', volume: '1 kg', price: 130000 },
      },
      theme: {
        topBg: '#b8a4f2',
        topBg2: '#6d58b5',
        sheetTop: 'rgba(24, 16, 44, 0.80)',
        sheetMid: 'rgba(34, 22, 58, 0.68)',
        sheetBot: 'rgba(38, 24, 26, 0.84)',
        glowTop: 'rgba(166, 138, 248, 0.38)',
        glowBot: 'rgba(110, 84, 218, 0.42)',
        accent: '#cbb8ff',
        cardTint: 'rgba(162, 132, 246, 0.16)',
      },
    },
    {
      id: 'yuzu-matcha-roll',
      skuPrefix: 'PST-YMR',
      name: 'YUZU MATCHA ROLL',
      shortName: 'Yuzu Matcha Roll',
      category: 'pastry',
      categoryLabel: 'Pastry & Dessert',
      badge: 'Chef Pick',
      itemType: 'pastry',
      hasLevels: false,
      hasMilk: false,
      kcal: 270,
      caffeine: 'Low',
      image: 'assets/yuzu-matcha-roll.png',
      shortDesc:
        'Fluffy Japanese ceremonial matcha sponge rolled around silky cream and bright golden yuzu citrus curd,...',
      fullDesc:
        'Cloud-light Japanese ceremonial matcha chiffon sponge rolled tightly around velvety fresh cream and a vibrant golden Kochi yuzu citrus curd center, dusted with matcha sugar.',
      tags: [
        { label: 'FLUFFY', note: 'Cloud-soft Japanese chiffon sponge.' },
        { label: 'YUZU', note: 'Zesty golden yuzu curd heart.' },
        { label: 'MATCHA', note: 'Fragrant Kyoto ceremonial green tea.' },
        { label: 'LIGHT', note: 'Delicate sweetness ideal with coffee.' },
      ],
      styles: [
        { id: 'chilled', label: 'Chilled', icon: 'ice' },
        { id: 'gift', label: 'Gift Box', icon: 'box' },
      ],
      sizes: {
        small: { label: '1 Slice', volume: '180 g', price: 32000 },
        medium: { label: 'Half Roll', volume: '360 g', price: 60000 },
        large: { label: 'Whole Roll', volume: '720 g', price: 115000 },
      },
      theme: {
        topBg: '#b8df68',
        topBg2: '#7faa36',
        sheetTop: 'rgba(18, 30, 14, 0.78)',
        sheetMid: 'rgba(32, 40, 18, 0.64)',
        sheetBot: 'rgba(48, 38, 14, 0.82)',
        glowTop: 'rgba(146, 216, 74, 0.34)',
        glowBot: 'rgba(252, 202, 52, 0.40)',
        accent: '#f8e16c',
        cardTint: 'rgba(202, 224, 74, 0.16)',
      },
    },

    /* ===================== MERCH & BEANS (3) ===================== */
    {
      id: 'glass-tumbler',
      skuPrefix: 'MRC-TMB',
      name: 'KOTA EMERALD TUMBLER',
      shortName: 'Glass Tumbler',
      category: 'merch',
      categoryLabel: 'Merch & Beans',
      badge: 'Limited Merch',
      itemType: 'merch',
      hasLevels: false,
      hasMilk: false,
      kcal: null,
      caffeine: null,
      image: 'assets/glass-tumbler.png',
      shortDesc:
        'Double-walled emerald-tinted borosilicate glass tumbler with obsidian grip & reusable glass straw,...',
      fullDesc:
        'Signature KOTA Coffee & Botanical Bar double-walled frosted emerald borosilicate glass tumbler with matte-obsidian silicone grip sleeve, spill-resistant lid, and reusable borosilicate straw. Bring it in-store for Rp5.000 off every drink.',
      tags: [
        { label: 'BOROSILICATE', note: 'Thermal-shock resistant insulated double wall.' },
        { label: 'REUSABLE', note: 'Includes borosilicate straw & cleaning brush.' },
        { label: 'ECO PERK', note: 'Save Rp5.000 every time you bring it in.' },
        { label: 'LIMITED', note: 'Botanical Lab Season 02 edition.' },
      ],
      styles: [
        { id: 'standard', label: 'Standard', icon: 'box' },
        { id: 'gift', label: 'Gift Wrap', icon: 'gift' },
      ],
      sizes: {
        small: { label: '350 ML', volume: '350 ML', price: 185000 },
        medium: { label: '480 ML', volume: '480 ML', price: 225000 },
        large: { label: 'Duo Set', volume: '2×480 ML', price: 410000 },
      },
      theme: {
        topBg: '#7fdcc9',
        topBg2: '#2d8b82',
        sheetTop: 'rgba(10, 28, 30, 0.80)',
        sheetMid: 'rgba(12, 38, 42, 0.66)',
        sheetBot: 'rgba(6, 20, 24, 0.86)',
        glowTop: 'rgba(104, 228, 206, 0.36)',
        glowBot: 'rgba(42, 158, 178, 0.36)',
        accent: '#7ef5de',
        cardTint: 'rgba(102, 224, 202, 0.16)',
      },
    },
    {
      id: 'uji-matcha-tin',
      skuPrefix: 'MRC-UJI',
      name: 'UJI CEREMONIAL TIN',
      shortName: 'Uji Matcha Tin',
      category: 'merch',
      categoryLabel: 'Merch & Beans',
      badge: 'First Harvest',
      itemType: 'merch',
      hasLevels: false,
      hasMilk: false,
      kcal: null,
      caffeine: 'Medium',
      image: 'assets/uji-matcha-tin.png',
      shortDesc:
        'Stone-ground first-harvest Kyoto Uji ceremonial matcha sealed in a matte-obsidian airtight caddy tin,...',
      fullDesc:
        'Single-cultivar Samidori first-harvest Kyoto Uji ceremonial matcha stone-milled to 5 microns and nitrogen-sealed inside our signature matte-obsidian airtight aluminum caddy with neon-lime accent seal.',
      tags: [
        { label: 'UJI KYOTO', note: 'Shade-grown 28 days before spring harvest.' },
        { label: 'AIRTIGHT', note: 'UV-blocking matte-obsidian aluminum tin.' },
        { label: 'UMAMI', note: 'Zero bitterness, vibrant jade foam.' },
        { label: '25 SERVES', note: 'Yields 25 café-grade bowls or lattes.' },
      ],
      styles: [
        { id: 'standard', label: 'Tin Only', icon: 'box' },
        { id: 'gift', label: '+ Bamboo Whisk', icon: 'gift' },
      ],
      sizes: {
        small: { label: '30 g', volume: '30 g', price: 165000 },
        medium: { label: '50 g', volume: '50 g', price: 245000 },
        large: { label: '100 g', volume: '100 g', price: 440000 },
      },
      theme: {
        topBg: '#bfe95a',
        topBg2: '#638822',
        sheetTop: 'rgba(16, 18, 16, 0.84)',
        sheetMid: 'rgba(22, 28, 18, 0.72)',
        sheetBot: 'rgba(10, 14, 12, 0.88)',
        glowTop: 'rgba(188, 248, 68, 0.30)',
        glowBot: 'rgba(120, 182, 82, 0.24)',
        accent: '#c9fb46',
        cardTint: 'rgba(186, 244, 72, 0.14)',
      },
    },
    {
      id: 'espresso-beans-bag',
      skuPrefix: 'MRC-BNS',
      name: 'HOUSE BLEND BEANS',
      shortName: 'House Blend Beans',
      category: 'merch',
      categoryLabel: 'Merch & Beans',
      badge: 'Fresh Roast',
      itemType: 'merch',
      hasLevels: false,
      hasMilk: false,
      kcal: null,
      caffeine: 'High',
      image: 'assets/espresso-beans-bag.png',
      shortDesc:
        'Small-batch roasted Flores Manggarai & Ethiopia Guji specialty whole beans — dark cocoa & bergamot notes,...',
      fullDesc:
        'Roasted weekly in small batches at our Senopati roastery. A velvety 60/40 blend of washed Flores Manggarai and natural Ethiopia Guji Arabica delivering dark chocolate, roasted hazelnut, and bright bergamot finish.',
      tags: [
        { label: 'ARABICA', note: '100% specialty grade single-lot blend.' },
        { label: 'MEDIUM ROAST', note: 'Ideal for espresso, pour-over & moka.' },
        { label: 'COCOA NOTES', note: 'Dark chocolate, hazelnut & bergamot.' },
        { label: 'FREE GRIND', note: 'Request Espresso or V60 grind in Note.' },
      ],
      styles: [
        { id: 'whole', label: 'Whole Beans', icon: 'box' },
        { id: 'ground', label: 'Espresso Grind', icon: 'gift' },
      ],
      sizes: {
        small: { label: '250 g', volume: '250 g', price: 135000 },
        medium: { label: '500 g', volume: '500 g', price: 245000 },
        large: { label: '1 kg Barista', volume: '1 kg', price: 450000 },
      },
      theme: {
        topBg: '#9bd8a2',
        topBg2: '#2c683a',
        sheetTop: 'rgba(14, 22, 18, 0.84)',
        sheetMid: 'rgba(20, 32, 24, 0.72)',
        sheetBot: 'rgba(10, 16, 14, 0.88)',
        glowTop: 'rgba(114, 212, 128, 0.30)',
        glowBot: 'rgba(164, 114, 72, 0.26)',
        accent: '#9cf58c',
        cardTint: 'rgba(98, 198, 116, 0.16)',
      },
    },

    /* ===================== NEW SEASONAL SERIES: BERRY CHEESECAKE (3) ===================== */
    {
      id: 'strawberry-cheesecake-frappe',
      skuPrefix: 'EVT-SCF',
      name: 'STRAWBERRY CHEESECAKE FRAPPE',
      shortName: 'Strawberry Cheesecake',
      category: 'non-coffee',
      categoryLabel: 'Non-Coffee & Tea',
      badge: 'NEW DROP',
      isNew: true,
      eventId: 'berry-cheesecake-series',
      originalPrice: 42000,
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 310,
      caffeine: 'Caffeine-Free',
      image: 'assets/strawberry-cheesecake-frappe.png',
      shortDesc:
        'Velvety cream-cheese frappe swirled with ruby-red strawberry compote, whipped cream & golden biscuit crumble,...',
      fullDesc:
        'Limited-edition Berrylicious Series favorite: rich New York cheesecake cream base blended icy-smooth with ruby strawberry compote ribbons, crowned with fluffy chantilly cream, crushed graham biscuit crumbs, and a fresh strawberry slice.',
      tags: [
        { label: 'NEW SERIES', note: 'Limited-edition Cheesecake Berrylicious drop.' },
        { label: 'CHEESECAKE', note: 'Velvety mascarpone & cream-cheese swirl.' },
        { label: 'RUBY BERRY', note: 'House-simmered fresh strawberry compote.' },
        { label: 'CRUMBLE', note: 'Topped with toasted golden graham crumbs.' },
      ],
      styles: [
        { id: 'frappe', label: 'Ice Blended', icon: 'ice' },
        { id: 'ice', label: 'Over Ice', icon: 'ice' },
      ],
      sizes: {
        small: { label: 'Small', volume: '250 ML', price: 29000 },
        medium: { label: 'Medium', volume: '350 ML', price: 34000 },
        large: { label: 'Large', volume: '450 ML', price: 40000 },
      },
      theme: {
        topBg: '#ff96b4',
        topBg2: '#b22058',
        sheetTop: 'rgba(42, 12, 26, 0.86)',
        sheetMid: 'rgba(62, 16, 40, 0.72)',
        sheetBot: 'rgba(26, 8, 20, 0.90)',
        glowTop: 'rgba(255, 118, 158, 0.40)',
        glowBot: 'rgba(224, 48, 102, 0.44)',
        accent: '#ff8fb6',
        cardTint: 'rgba(248, 108, 152, 0.18)',
      },
    },
    {
      id: 'blueberry-cheesecake-frappe',
      skuPrefix: 'EVT-BCF',
      name: 'BLUEBERRY CHEESECAKE FRAPPE',
      shortName: 'Blueberry Cheesecake',
      category: 'non-coffee',
      categoryLabel: 'Non-Coffee & Tea',
      badge: 'NEW DROP',
      isNew: true,
      eventId: 'berry-cheesecake-series',
      originalPrice: 42000,
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 305,
      caffeine: 'Caffeine-Free',
      image: 'assets/blueberry-cheesecake-frappe.png',
      shortDesc:
        'Creamy chilled cheesecake frappe marbled with wild royal blueberry compote & golden graham biscuit crumble,...',
      fullDesc:
        'Silky mascarpone cheesecake frappe swirled with tangy-sweet wild blueberry reduction, finished with airy whipped cream, buttery graham biscuit crumbs, and glistening whole blueberries.',
      tags: [
        { label: 'NEW SERIES', note: 'Part of Cheesecake Berrylicious seasonal drop.' },
        { label: 'WILD BERRY', note: 'Rich royal violet blueberry compote ribbons.' },
        { label: 'CREAMY', note: 'Whipped mascarpone cheesecake body.' },
        { label: 'DESSERT CUP', note: 'Tastes like a chilled slice of berry cheesecake.' },
      ],
      styles: [
        { id: 'frappe', label: 'Ice Blended', icon: 'ice' },
        { id: 'ice', label: 'Over Ice', icon: 'ice' },
      ],
      sizes: {
        small: { label: 'Small', volume: '250 ML', price: 29000 },
        medium: { label: 'Medium', volume: '350 ML', price: 34000 },
        large: { label: 'Large', volume: '450 ML', price: 40000 },
      },
      theme: {
        topBg: '#b698ff',
        topBg2: '#5a32a8',
        sheetTop: 'rgba(26, 14, 46, 0.86)',
        sheetMid: 'rgba(42, 22, 68, 0.72)',
        sheetBot: 'rgba(18, 10, 34, 0.90)',
        glowTop: 'rgba(176, 138, 255, 0.42)',
        glowBot: 'rgba(112, 68, 222, 0.44)',
        accent: '#c8b2ff',
        cardTint: 'rgba(156, 122, 246, 0.18)',
      },
    },
    {
      id: 'creamy-cheesecake-latte',
      skuPrefix: 'EVT-CCL',
      name: 'CREAMY CHEESECAKE LATTE',
      shortName: 'Cheesecake Latte',
      category: 'coffee',
      categoryLabel: 'Coffee',
      badge: 'NEW DROP',
      isNew: true,
      eventId: 'berry-cheesecake-series',
      originalPrice: 39000,
      itemType: 'drink',
      hasLevels: true,
      hasMilk: true,
      kcal: 245,
      caffeine: 'High',
      image: 'assets/creamy-cheesecake-latte.png',
      shortDesc:
        'Double-shot house espresso cascading over chilled oat milk, velvety mascarpone cream & graham dust,...',
      fullDesc:
        'For coffee lovers who adore dessert notes: freshly pulled Flores-Ethiopia double espresso poured over chilled milk and whipped salted mascarpone cheesecake cream, topped with toasted golden graham dust.',
      tags: [
        { label: 'NEW SERIES', note: 'Limited Cheesecake Berrylicious coffee highlight.' },
        { label: 'ESPRESSO', note: 'Double-shot KOTA House Blend Arabica.' },
        { label: 'MASCARPONE', note: 'Savory-sweet whipped cream cheese layer.' },
        { label: 'VELVETY', note: 'Balanced roast depth with creamy finish.' },
      ],
      styles: [
        { id: 'ice', label: 'Iced Latte', icon: 'ice' },
        { id: 'hot', label: 'Hot Latte', icon: 'hot' },
      ],
      sizes: {
        small: { label: 'Small', volume: '220 ML', price: 28000 },
        medium: { label: 'Medium', volume: '300 ML', price: 32000 },
        large: { label: 'Large', volume: '400 ML', price: 38000 },
      },
      theme: {
        topBg: '#f0c488',
        topBg2: '#8a5224',
        sheetTop: 'rgba(34, 20, 12, 0.86)',
        sheetMid: 'rgba(54, 34, 20, 0.72)',
        sheetBot: 'rgba(20, 12, 8, 0.90)',
        glowTop: 'rgba(246, 198, 126, 0.40)',
        glowBot: 'rgba(156, 94, 46, 0.44)',
        accent: '#ffd28e',
        cardTint: 'rgba(232, 174, 102, 0.18)',
      },
    },
  ];

  const VOUCHERS = [
    {
      code: 'BERRY15',
      title: '15% Off Cheesecake Berry Series',
      desc: 'Special launch promo • Up to Rp20.000 off • No min. spend',
      type: 'percent',
      value: 15,
      maxDiscount: 20000,
      minSpend: 0,
      badge: 'NEW EVENT',
    },
    {
      code: 'MATCHA20',
      title: '20% Off Botanical Brew',
      desc: 'Up to Rp25.000 off • Min. order Rp40.000',
      type: 'percent',
      value: 20,
      maxDiscount: 25000,
      minSpend: 40000,
      badge: 'POPULAR',
    },
    {
      code: 'FIRSTBREW',
      title: 'Rp15.000 Off Any Order',
      desc: 'Instant mobile ordering perk • Min. Rp35.000',
      type: 'flat',
      value: 15000,
      maxDiscount: 15000,
      minSpend: 35000,
      badge: 'NEW USER',
    },
    {
      code: 'FREEPASTRY',
      title: 'Rp20.000 Pastry & Brunch Pairing',
      desc: 'Valid when bag includes any Pastry or Food item',
      type: 'pastry_flat',
      value: 20000,
      maxDiscount: 20000,
      minSpend: 30000,
      badge: 'PAIRING',
    },
    {
      code: 'GGVIP10',
      title: 'Emerald Member 10% Off',
      desc: 'Exclusive member reward • No minimum purchase',
      type: 'percent',
      value: 10,
      maxDiscount: 35000,
      minSpend: 0,
      badge: 'MEMBER',
    },
  ];

  const REWARDS_STORE = [
    {
      id: 'rew-mochi',
      cost: 200,
      title: 'Free Matcha Mochi Voucher',
      desc: 'Rp28.000 instant voucher toward any pastry or order',
      voucher: {
        code: 'REWARD-MOCHI',
        title: 'Redeemed Free Matcha Mochi',
        desc: 'Rp28.000 off from Stars Rewards Store',
        type: 'flat',
        value: 28000,
        maxDiscount: 28000,
        minSpend: 0,
        badge: 'REDEEMED',
      },
    },
    {
      id: 'rew-americano',
      cost: 250,
      title: 'Free Iced Americano Voucher',
      desc: 'Rp30.000 instant voucher for your daily coffee fix',
      voucher: {
        code: 'REWARD-AMERICANO',
        title: 'Redeemed Free Americano',
        desc: 'Rp30.000 off from Stars Rewards Store',
        type: 'flat',
        value: 30000,
        maxDiscount: 30000,
        minSpend: 0,
        badge: 'REDEEMED',
      },
    },
    {
      id: 'rew-sig',
      cost: 380,
      title: 'Free Signature Nitro Brew',
      desc: 'Rp45.000 off any Signature Blend drink',
      voucher: {
        code: 'REWARD-NITRO',
        title: 'Redeemed Free Signature Brew',
        desc: 'Rp45.000 off from Stars Rewards Store',
        type: 'flat',
        value: 45000,
        maxDiscount: 45000,
        minSpend: 0,
        badge: 'VIP REWARD',
      },
    },
  ];

  const EVENTS = [
    {
      id: 'berry-cheesecake-series',
      badge: 'NEW LAUNCH',
      kicker: 'LIMITED SEASONAL DROP',
      title: 'Cheesecake Berrylicious Series',
      subtitle: 'Creamy mascarpone cheesecake bertemu strawberry & wild blueberry — mulai dari Rp28rb!',
      period: '27 Nov – 31 Des • Semua Outlet',
      priceTag: 'Mulai Rp28rb',
      cta: 'Lihat Seri Baru',
      voucherCode: 'BERRY15',
      heroImages: [
        'assets/strawberry-cheesecake-frappe.png',
        'assets/blueberry-cheesecake-frappe.png',
        'assets/creamy-cheesecake-latte.png',
      ],
      itemIds: [
        'strawberry-cheesecake-frappe',
        'blueberry-cheesecake-frappe',
        'creamy-cheesecake-latte',
        'strawberry-matcha-cloud',
      ],
      gradient: 'linear-gradient(135deg, #4b0d2c 0%, #8e1e54 52%, #cf3b78 100%)',
      accent: '#ffb5d2',
      story:
        'Seri dessert-in-a-cup terbaru dari KOTA Coffee! Perpaduan lembut krim mascarpone cheesecake, saus beri segar, dan taburan graham biscuit renyah — tersedia dalam varian Strawberry Frappe, Blueberry Frappe, hingga Creamy Cheesecake Espresso Latte.',
    },
    {
      id: 'botanical-nitro-lab',
      badge: 'SIGNATURE EVENT',
      kicker: 'KYOTO MATCHA FESTIVAL',
      title: 'Gratis Upsize & 20% Off Signature Nitro',
      subtitle: 'Ceremonial Uji Matcha & Blue Spirulina dingin menyegarkan dengan kode MATCHA20.',
      period: 'Senin – Minggu • Kuota Harian',
      priceTag: 'Hemat 20%',
      cta: 'Cek Promo Matcha',
      voucherCode: 'MATCHA20',
      heroImages: [
        'assets/matcha-nitro.png',
        'assets/blue-cloud-latte.png',
        'assets/yuzu-matcha-fizz.png',
      ],
      itemIds: ['matcha-nitro', 'blue-cloud-latte', 'yuzu-matcha-fizz', 'hojicha-oat-cloud', 'spirulina-cake'],
      gradient: 'linear-gradient(135deg, #103b22 0%, #1d6f3d 52%, #146a9c 100%)',
      accent: '#c9fb46',
      story:
        'Nikmati kesegaran First-Harvest Kyoto Uji Matcha yang di-infuse nitrogen halus dan butterfly-pea botanical. Berlaku untuk Dine-In, Pick Up, dan Delivery di seluruh outlet KOTA Coffee.',
    },
    {
      id: 'brunch-coffee-bundle',
      badge: 'MORNING BUNDLE',
      kicker: 'ALL-DAY BRUNCH PAIRING',
      title: 'Bundle Brunch + Kopi Aren Hemat Rp20rb',
      subtitle: 'Pesan Truffle Brioche, Croissant, atau Panini bersama kopi favoritmu pakai FREEPASTRY.',
      period: 'Setiap Hari • 07:00 – 18:00 WIB',
      priceTag: 'Diskon Rp20rb',
      cta: 'Pilih Paket Brunch',
      voucherCode: 'FREEPASTRY',
      heroImages: [
        'assets/truffle-egg-brioche.png',
        'assets/aren-palm-latte.png',
        'assets/butter-croissant.png',
      ],
      itemIds: ['truffle-egg-brioche', 'butter-croissant', 'smoked-beef-panini', 'aren-palm-latte', 'biscoff-choco-frappe'],
      gradient: 'linear-gradient(135deg, #4a2a12 0%, #864d20 52%, #bd7a34 100%)',
      accent: '#ffe09e',
      story:
        'Mulai harimu lebih bertenaga dengan roti panggang hangat buatan oven pagi kami dan espresso gula aren house blend. Otomatis hemat Rp20.000 saat dipasangkan dengan voucher FREEPASTRY.',
    },
  ];

  /* Direct Vertical Payment Options (Inspired by Clean E-Wallet Checkout List) */
  const DIRECT_PAY_OPTIONS = [
    {
      id: 'qris',
      methodId: 'qris',
      name: 'QRIS Instant',
      sub: 'Scan pakai semua bank & e-wallet • Bebas biaya',
      badge: 'FASTEST',
      color: '#1f7a34',
      iconText: 'QR',
    },
    {
      id: 'ovo',
      methodId: 'gopay',
      subProvider: 'OVO',
      name: 'OVO',
      sub: 'Balance: Rp223.000 • Bayar langsung',
      badge: '0% FEE',
      color: '#4c3494',
      iconText: 'OVO',
    },
    {
      id: 'gopay',
      methodId: 'gopay',
      subProvider: 'GoPay',
      name: 'GoPay / GoPayLater',
      sub: 'Balance: Rp150.000 • Instan via Gojek',
      badge: 'POPULAR',
      color: '#00aed6',
      iconText: 'GP',
    },
    {
      id: 'dana',
      methodId: 'gopay',
      subProvider: 'DANA',
      name: 'DANA',
      sub: 'Balance: Rp95.000 • Cepat & aman',
      badge: '',
      color: '#118eea',
      iconText: 'DN',
    },
    {
      id: 'shopeepay',
      methodId: 'gopay',
      subProvider: 'ShopeePay',
      name: 'ShopeePay',
      sub: 'Cashback 20% maks. Rp12rb',
      badge: 'CASHBACK',
      color: '#ee4d2d',
      iconText: 'SP',
    },
    {
      id: 'va-bca',
      methodId: 'va',
      vaBank: 'BCA VA',
      name: 'BCA Virtual Account',
      sub: 'Verifikasi otomatis • Bisa Mandiri / BNI VA',
      badge: 'AUTO',
      color: '#005baa',
      iconText: 'VA',
    },
    {
      id: 'ggpay',
      methodId: 'ggpay',
      name: 'KOTA Member Pay',
      sub: '2× Points + Tukar 200 pts (-Rp10rb)',
      badge: '2× PTS',
      color: '#1b6e2d',
      iconText: 'KT',
    },
  ];

  const SPECIAL_DEAL_IDS = [
    'strawberry-cheesecake-frappe',
    'blueberry-cheesecake-frappe',
    'creamy-cheesecake-latte',
    'matcha-nitro',
    'aren-palm-latte',
    'truffle-egg-brioche',
  ];

  const PROMO_BANNERS = [
    {
      id: 'banner-biscoff',
      kicker: "What's New?",
      title: 'Discover Choco-Coffee & Biscoff',
      cta: 'Try it Today',
      itemId: 'biscoff-choco-frappe',
      image: 'assets/biscoff-choco-frappe.png',
      gradient:
        'linear-gradient(135deg, rgba(168, 108, 54, 0.88) 0%, rgba(56, 30, 18, 0.92) 65%, rgba(30, 16, 10, 0.96) 100%)',
      accent: '#ffc980',
    },
    {
      id: 'banner-nitro',
      kicker: 'Signature Lab',
      title: 'Matcha Nitro + Spirulina 20% Off',
      cta: 'Use MATCHA20',
      itemId: 'matcha-nitro',
      voucherCode: 'MATCHA20',
      image: 'assets/matcha-nitro.png',
      gradient:
        'linear-gradient(135deg, rgba(46, 134, 52, 0.9) 0%, rgba(16, 78, 104, 0.92) 65%, rgba(8, 34, 54, 0.96) 100%)',
      accent: '#c9fb46',
    },
    {
      id: 'banner-brunch',
      kicker: 'All-Day Brunch',
      title: 'Truffle Egg Brioche & Aren Latte',
      cta: 'Order Brunch',
      itemId: 'truffle-egg-brioche',
      voucherCode: 'FREEPASTRY',
      image: 'assets/truffle-egg-brioche.png',
      gradient:
        'linear-gradient(135deg, rgba(176, 128, 38, 0.9) 0%, rgba(64, 44, 18, 0.92) 68%, rgba(36, 24, 12, 0.96) 100%)',
      accent: '#ffe382',
    },
    {
      id: 'banner-merch',
      kicker: 'Limited Merch',
      title: 'Emerald Tumbler • Save Rp5k/Brew',
      cta: 'Explore Merch',
      itemId: 'glass-tumbler',
      image: 'assets/glass-tumbler.png',
      gradient:
        'linear-gradient(135deg, rgba(36, 136, 118, 0.9) 0%, rgba(14, 58, 66, 0.92) 65%, rgba(8, 28, 34, 0.96) 100%)',
      accent: '#7ef5de',
    },
  ];

  const PAYMENT_METHODS = [
    {
      id: 'qris',
      group: 'Instant QR',
      name: 'QRIS',
      subtitle: 'Scan with any bank or e-wallet',
      badge: 'FASTEST',
    },
    {
      id: 'gopay',
      group: 'E-Wallet / Handpay',
      name: 'GoPay / OVO / DANA',
      subtitle: 'One-tap digital wallet & Handpay',
      badge: '0% FEE',
      providers: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'Apple Pay'],
    },
    {
      id: 'va',
      group: 'Bank Transfer',
      name: 'Virtual Account',
      subtitle: 'Auto-verified BCA, Mandiri, BNI',
      badge: 'AUTO',
      providers: ['BCA VA', 'Mandiri VA', 'BNI VA'],
    },
    {
      id: 'ggpay',
      group: 'Membership',
      name: 'GG Member Pay',
      subtitle: 'Member balance + 2× Points',
      badge: '2× PTS',
    },
  ];

  /* Per-item Dual-Tone Card Backdrops (Top + Bottom glow matched to every menu photo!) */
  const CARD_DUAL_TONES = {
    'matcha-nitro': { top: 'rgba(154, 238, 48, 0.44)', bot: 'rgba(20, 134, 236, 0.46)' },
    'blue-cloud-latte': { top: 'rgba(88, 190, 255, 0.42)', bot: 'rgba(48, 122, 224, 0.30)' },
    'yuzu-matcha-fizz': { top: 'rgba(132, 224, 54, 0.40)', bot: 'rgba(248, 186, 28, 0.44)' },
    'hojicha-oat-cloud': { top: 'rgba(222, 174, 112, 0.38)', bot: 'rgba(156, 98, 46, 0.36)' },
    'aren-palm-latte': { top: 'rgba(242, 202, 148, 0.36)', bot: 'rgba(152, 84, 34, 0.42)' },
    'iced-americano': { top: 'rgba(222, 182, 142, 0.32)', bot: 'rgba(112, 62, 30, 0.42)' },
    'caramel-macchiato': { top: 'rgba(250, 192, 92, 0.42)', bot: 'rgba(164, 92, 38, 0.38)' },
    'biscoff-choco-frappe': { top: 'rgba(232, 158, 72, 0.42)', bot: 'rgba(118, 58, 28, 0.44)' },
    'vanilla-cinnamon-latte': { top: 'rgba(244, 210, 158, 0.38)', bot: 'rgba(176, 112, 58, 0.36)' },
    'strawberry-matcha-cloud': { top: 'rgba(134, 224, 64, 0.40)', bot: 'rgba(238, 68, 114, 0.46)' },
    'belgian-dark-choco': { top: 'rgba(178, 112, 74, 0.38)', bot: 'rgba(96, 46, 28, 0.44)' },
    'lychee-rose-tea': { top: 'rgba(252, 152, 184, 0.42)', bot: 'rgba(224, 72, 118, 0.38)' },
    'thai-milk-tea': { top: 'rgba(252, 194, 128, 0.38)', bot: 'rgba(232, 104, 24, 0.44)' },
    'butter-croissant': { top: 'rgba(250, 204, 106, 0.40)', bot: 'rgba(196, 128, 48, 0.36)' },
    'truffle-egg-brioche': { top: 'rgba(250, 208, 82, 0.42)', bot: 'rgba(122, 178, 68, 0.36)' },
    'smoked-beef-panini': { top: 'rgba(238, 174, 92, 0.38)', bot: 'rgba(184, 78, 56, 0.36)' },
    'spirulina-cake': { top: 'rgba(104, 196, 255, 0.42)', bot: 'rgba(214, 168, 104, 0.36)' },
    'matcha-mochi': { top: 'rgba(158, 228, 96, 0.40)', bot: 'rgba(226, 86, 118, 0.34)' },
    'blueberry-tart': { top: 'rgba(168, 138, 252, 0.40)', bot: 'rgba(98, 68, 214, 0.44)' },
    'yuzu-matcha-roll': { top: 'rgba(138, 218, 68, 0.40)', bot: 'rgba(252, 196, 42, 0.42)' },
    'glass-tumbler': { top: 'rgba(92, 228, 202, 0.40)', bot: 'rgba(34, 148, 168, 0.40)' },
    'uji-matcha-tin': { top: 'rgba(176, 244, 62, 0.40)', bot: 'rgba(58, 148, 64, 0.38)' },
    'espresso-beans-bag': { top: 'rgba(98, 208, 118, 0.38)', bot: 'rgba(148, 92, 48, 0.40)' },
    'strawberry-cheesecake-frappe': { top: 'rgba(255, 138, 174, 0.42)', bot: 'rgba(222, 46, 98, 0.44)' },
    'blueberry-cheesecake-frappe': { top: 'rgba(182, 148, 255, 0.42)', bot: 'rgba(104, 62, 214, 0.44)' },
    'creamy-cheesecake-latte': { top: 'rgba(248, 206, 138, 0.40)', bot: 'rgba(148, 86, 38, 0.42)' },
  };

  const ORIGINAL_PRICE_OVERRIDES = {
    'matcha-nitro': 48000,
    'aren-palm-latte': 38000,
    'truffle-egg-brioche': 62000,
  };

  MENU_ITEMS.forEach((item) => {
    const dt = CARD_DUAL_TONES[item.id];
    item.theme.cardTop = (dt && dt.top) || item.theme.glowTop;
    item.theme.cardBot = (dt && dt.bot) || item.theme.glowBot;
    if (!item.originalPrice && ORIGINAL_PRICE_OVERRIDES[item.id]) {
      item.originalPrice = ORIGINAL_PRICE_OVERRIDES[item.id];
    }
  });

  function getItemById(id) {
    return MENU_ITEMS.find((item) => item.id === id) || MENU_ITEMS[0];
  }

  function getOutletById(id) {
    return OUTLETS.find((o) => o.id === id) || OUTLETS[0];
  }

  function getAddonsForItem(item) {
    return ADDONS.filter((a) => a.forCategories.includes(item.category));
  }

  function getDefaultSizeKey(item) {
    if (item.itemType === 'drink') return 'medium';
    return 'small';
  }

  function getBasePrice(item) {
    return item.sizes[getDefaultSizeKey(item)].price;
  }

  function getAllVouchers(member) {
    const unlocked = (member && Array.isArray(member.unlockedRewards)) ? member.unlockedRewards : [];
    return [...unlocked, ...VOUCHERS];
  }

  function calculateVoucherDiscount(voucherCode, cartItems, subtotal, member) {
    if (!voucherCode) return { valid: false, discount: 0, reason: '' };
    const allV = getAllVouchers(member);
    const v = allV.find((x) => x.code === voucherCode);
    if (!v) return { valid: false, discount: 0, reason: 'Voucher not found' };

    if (subtotal < (v.minSpend || 0)) {
      return { valid: false, discount: 0, reason: `Min. spend ${formatRp(v.minSpend)}` };
    }

    if (v.type === 'pastry_flat') {
      const hasPairing = cartItems.some((c) => {
        const ref = getItemById(c.itemId);
        return ref && (ref.category === 'pastry' || ref.category === 'food');
      });
      if (!hasPairing) {
        return { valid: false, discount: 0, reason: 'Add any Pastry or Brunch item first' };
      }
      return { valid: true, discount: Math.min(v.value, subtotal), voucher: v };
    }

    if (v.type === 'percent') {
      const raw = Math.round((subtotal * v.value) / 100);
      return { valid: true, discount: Math.min(raw, v.maxDiscount, subtotal), voucher: v };
    }

    return { valid: true, discount: Math.min(v.value, subtotal), voucher: v };
  }

  global.GOOD_GIRL_DATA = {
    formatRp,
    OUTLETS,
    PICKUP_SLOTS,
    MILK_OPTIONS,
    ADDONS,
    CATEGORIES,
    MENU_ITEMS,
    EVENTS,
    SPECIAL_DEAL_IDS,
    DIRECT_PAY_OPTIONS,
    VOUCHERS,
    REWARDS_STORE,
    PROMO_BANNERS,
    PAYMENT_METHODS,
    getItemById,
    getOutletById,
    getAddonsForItem,
    getDefaultSizeKey,
    getBasePrice,
    getAllVouchers,
    calculateVoucherDiscount,
  };
})(window);
