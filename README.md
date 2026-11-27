# GOOD GIRL — Full-Stack Botanical Café Ordering & Live POS Ecosystem

Super-rounded **Fresh White & Matcha Green** + **Dark Obsidian iOS Liquid Glass** full-responsive café ordering web app and **4-Workspace Live Barista, Cashier & Stock POS Terminal**, benchmarked against real café apps (Starbucks Mobile Order & Pay, Fore Coffee, Kopi Kenangan, and Moka/ESB QR Order).

Features **23 transparent RGBA studio PNG assets**, **per-item adaptive dual-tone glass backdrops**, **real-time multi-device sync via Node.js REST + Server-Sent Events (`server.js`)**, and automatic seamless fallback to `localStorage` + `BroadcastChannel` for static hosting (e.g. GitHub Pages).

## Highlights

### 1. Customer Responsive Web & Mobile App (`index.html`)
- **Full-Responsive Layout**:
  - **Desktop / Tablet (`> 680px`)**: Full-width 3–4 column concave-notched glass menu grid, 2-column Bag / Promo / Orders / Me layouts, centered floating adaptive Product Detail modal, floating top liquid-glass toolbar, and a toggleable **`Phone View`** (`404px` iPhone Glass Frame) button.
  - **Mobile (`<= 680px`)**: Native edge-to-edge mobile layout with floating 5-tab liquid-glass bottom dock (`Menu`, `Promo`, `Bag`, `Orders`, `Me`) and zero fake status bars.
- **Dual Synced Themes**: Default **Fresh White & Matcha Green** (`data-theme="light"`) ↔ **Dark Obsidian Liquid Glass** (`data-theme="dark"`), synced live across customer & POS screens.
- **23-Item Catalog Across 6 Categories**:
  - `Signature Blends` (4): Matcha Nitro, Blue Cloud Latte, Yuzu Matcha Fizz, Hojicha Oat Cloud
  - `Coffee` (5): Iced Americano, Aren Palm Latte, Caramel Macchiato, Vanilla Cinnamon Latte, Biscoff Choco Frappe
  - `Non-Coffee & Tea` (4): Strawberry Matcha Cloud, Belgian Dark Choco, Lychee Rose Tea, Thai Milk Tea
  - `Food & Brunch` (3): Butter Croissant, Truffle Egg Brioche, Smoked Beef Panini
  - `Pastry & Dessert` (4): Spirulina Cake, Matcha Mochi, Blueberry Tart, Yuzu Matcha Roll
  - `Merch & Beans` (3): Emerald Glass Tumbler, Ceremonial Uji Matcha Tin, House Blend Espresso Beans
- **Real Café Ordering Features**:
  - **Outlet Selector**: Senopati Flagship, SCBD Botanical Bar, Kemang Garden Lab — plus **QR Table URL Auto-Detection** (`/?table=09&outlet=scbd`).
  - **3 Fulfillment Modes**: `Dine-In` (Table Picker + Merge into Active Table Order), `Pick Up` (Time Slots: Now / +15m / +30m / +45m), and `Delivery` (Address + transparent outlet delivery fee).
  - **Pro Customizer**: Style (`Ice`/`Hot`), sliding liquid-glass Size capsule (`Small`/`Medium`/`Large`), **Milk Choice** (`Fresh Dairy`, `Oatside Oat`, `Almond`, `Soy`), **Paid Add-Ons** (`Extra Espresso Shot`, `Ceremonial Matcha Shot`, `Sea Salt Cheese Foam`, `Espresso Jelly`, `Whipped Cream`, `Caramel Drizzle`), Sugar/Ice levels, kcal & caffeine badges, Quantity, and Barista Note.
  - **Order Again & Smart Bag Upsell**: 1-tap reorder strip on Home + smart pastry/brunch pairing upsells inside My Bag.
  - **Loyalty, Stamp Card & Rewards Store**: 5-Brew Stamp Card Mission (`Free Drink` voucher unlock), Redeemable Points Store (`200 / 250 / 380 pts`), Vouchers (`MATCHA20`, `FIRSTBREW`, `FREEPASTRY`, `GGVIP10`), and holographic Member Card.
  - **Indonesian Payment Gateway**: `QRIS` (SVG QR + live countdown), E-Wallet/Handpay (`GoPay`, `OVO`, `DANA`, `ShopeePay`, `Apple Pay`), Bank Virtual Accounts (`BCA VA`, `Mandiri VA`, `BNI VA`), and `GG Member Pay` (balance + points redemption + 2× points).
  - **Live Order Tracking, Cancel Window & 5★ Rating**: Real-time 4-stage sync (`Received` → `Preparing` → `Ready` → `Complete`), Cancel Order button while `Received`, Digital Receipt + inspectable POS Payload JSON, and post-serve 5-star rating synced back to POS.

### 2. Live 4-Workspace Barista, Cashier & Stock POS (`pos.html`)
- **Tab 1 — Kitchen Kanban**: 4-stage live dispatch board (`1. Order Received` → `2. Preparing` → `3. Ready to Serve` → `4. Completed`) with customer order isolation, itemized milk/add-ons/notes, `COUNTER POS` vs Web badges, 5★ customer ratings, JSON Payload Inspector, and `+ Simulate Web Order`.
- **Tab 2 — Counter Cashier**: Full walk-in cashier register to ring up counter guests (`Cash`, `QRIS`, `EDC Debit`, `GoPay`) and dispatch directly into the live Kitchen Kanban.
- **Tab 3 — Menu & Stock 86**: 1-click **In Stock / Sold Out (86)** toggle for all 23 menu items — updates every connected customer device live via SSE and blocks Sold Out items from being ordered.
- **Tab 4 — Sales & QR**: Live revenue breakdown by payment method, top-selling items ranking, and a ready-to-scan **Wi-Fi Table QR Link** for cross-device phone testing.

## Project Structure

- `server.js` — Zero-dependency Node.js HTTP + REST API + Server-Sent Events (`/api/events`) backend with atomic `data/store.json` persistence
- `index.html` / `styles.css` / `app.js` — Full-responsive customer ordering web app
- `pos.html` / `pos.css` / `pos.js` — 4-workspace live Barista, Cashier & Stock POS terminal
- `menu-data.js` — Unified 23-item catalog, outlets, milk/add-ons, rewards store, vouchers & per-item color palettes
- `pos-bridge.js` — Hybrid REST + SSE real-time bridge with automatic `localStorage` + `BroadcastChannel` static fallback
- `assets/` — 23 transparent-background RGBA (`800×800`) product PNGs

## Run Locally (Full-Stack Multi-Device Wi-Fi Mode)

Requires only Node.js (`v18+`) — **zero `npm install` needed**:

```bash
node server.js
```

- **Customer Web App**: `http://127.0.0.1:8765/`
- **Customer QR Table Shortcut**: `http://127.0.0.1:8765/?table=07&outlet=senopati`
- **Live Barista POS Terminal**: `http://127.0.0.1:8765/pos.html`
- **Phone on Same Wi-Fi**: Check the LAN URL printed in your terminal (or inside POS → `Sales & QR`).

> **Static Fallback**: Opening via any static server or GitHub Pages automatically falls back to `BroadcastChannel` + `localStorage` cross-tab live sync.
