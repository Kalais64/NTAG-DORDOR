# GOOD GIRL — Mobile Café Ordering & Live POS System

Super-rounded dark **iOS Liquid Glass** mobile-first café ordering experience with **per-item adaptive dual-tone glass backdrops**, **14 transparent RGBA studio PNG assets**, **Indonesian Payment Gateway simulation (QRIS, E-Wallet/Handpay, Bank VA, GG Member Pay)**, **Vouchers & Membership Points**, **Digital Order Receipts**, and a **Real-Time Barista POS Kitchen Display (`pos.html`)**.

## Features

- **Customer Mobile Web App (`index.html`)**
  - **5-Tab Floating Liquid-Glass Dock**: `Menu`, `Promo`, `Bag`, `Orders`, `Me`.
  - **Menu Discovery**: Greeting, `Dine-In` (QR Table selector) vs `Pick Up`, live active-order banner, search bar, promo banner carousel, 5 categories (`Signature Blends`, `Coffee`, `Non-Coffee`, `Pastry & Dessert`, `Merch`), and 2-column **concave-notched glass cards** with clear `Rp` pricing.
  - **Per-Item Adaptive Product Detail**: Every item transforms the frosted glass sheet, ambient glow orbs, stacked modal top backdrop, and glowing accents to match its actual photo (e.g., neon matcha-lime + cobalt blue for `MATCHA NITRO`; roasted espresso brown + creamy ivory for `ICED AMERICANO`; velvet cocoa + caramel gold for `BISCOFF CHOCO FRAPPE`; emerald + ruby rose for `STRAWBERRY MATCHA CLOUD`).
  - **Full Customizer**: Style (`Ice` / `Hot`, `Chilled` / `Gift Box`), sliding liquid-glass Size capsule (`Small` / `Medium` / `Large`), Sugar & Ice levels, Quantity stepper, optional barista note, Favorite `♡`, and `Change` re-edit from My Bag.
  - **My Bag, Table Merge & Vouchers**: `MATCHA20`, `FIRSTBREW`, `FREEPASTRY`, `GGVIP10` + optional **Merge into active Dine-In Table order**.
  - **Interactive Payment Gateway**: `QRIS` (generated SVG QR + live countdown), E-Wallet/Handpay (`GoPay`, `OVO`, `DANA`, `ShopeePay`, `Apple Pay`), Bank Virtual Accounts (`BCA VA`, `Mandiri VA`, `BNI VA`), and `GG Member Pay` (balance + 200 pts redemption + 2× points).
  - **4-Stage Order Tracker & Digital Receipt**: Live sync (`Received` → `Preparing` → `Ready` → `Complete`), Digital Receipt + inspectable **POS Payload JSON**, `MATCH FOR YOUR MATCHA?` concave-notched pairing carousel, and Call Restaurant glass sheet.
  - **Membership (`Me`)**: Holographic Emerald/Obsidian tier card, live Points & GG Pay wallet balance, saved Favorite menu, and quick POS portal link.

- **Live Barista POS Kitchen Display (`pos.html`)**
  - Real-time bidirectional sync with `index.html` via `BroadcastChannel('good_girl_pos_v1')` + `localStorage` (`pos-bridge.js`).
  - 4-stage Kanban dispatch board (`1. Order Received` → `2. Preparing` → `3. Ready to Serve` → `4. Completed`) with live KPIs, itemized modifiers/notes, `JSON` payload inspector, and `+ Simulate Web Order`.

## Project Structure

- `index.html` / `styles.css` / `app.js` — Customer mobile ordering web app
- `pos.html` / `pos.css` / `pos.js` — Live barista/cashier POS kitchen display
- `menu-data.js` — Unified 14-item catalog, IDR pricing, vouchers, banners & per-item color themes
- `pos-bridge.js` — Customer ↔ POS order sync, table merging, and member store
- `assets/` — 14 RGBA transparent-background (`800×800`) product PNGs

## Run Locally

```bash
python3 -m http.server 8765
```

- Customer Mobile App: `http://127.0.0.1:8765/`
- Live Barista POS Display: `http://127.0.0.1:8765/pos.html`
