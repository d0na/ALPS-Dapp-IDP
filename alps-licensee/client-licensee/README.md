# ALPS Licensee DApp

## Changelog (New Branch)

While configuring the project on **macOS ARM64 (M3 Pro)** using **Node.js v20.18.3**, several compatibility issues arose. To ensure successful compilation and execution of the client application, the following changes were made:

- Removed:
    - `"nivo": "^0.31.0"` (due to issues with native dependencies on M1/M2/M3 Macs)
    - `"node-sass": "4.14.1"` (incompatible with Node 20 and ARM-based macOS)

- Added:
    - `"sass": "^1.32.0"` — a drop-in replacement for `node-sass`, fully compatible with the latest Node.js versions and ARM64 architecture

> All steps tested using **npm** (not `yarn`)

---

## Setup Instructions

These are the necessary steps to compile and run the ALPS Licensee project locally:

### 1. Clone the repository

```bash
git clone https://github.com/d0na/ALPS-Dapp-IDP.git
cd alps-licensee
```

### 2. Install Ganache CLI (globally)

```bash
npm install -g ganache
```

### 3. Start Ganache

```bash
ganache --port 8545
```

### 4. Compile and migrate contracts

Make sure `truffle` is installed globally:

```bash
npm install -g truffle
```

Then:

```bash
cd alps-licensee
truffle compile --all
truffle migrate --reset --network development
```

> This will generate the contracts in `client-licensee/src/contracts`.

### 5. Install client dependencies

```bash
cd client-licensee
npm install
```

> If you're using `npm`, ensure you're using `node >= 20` and switch to `sass` as the CSS preprocessor.

### 6. Install WebSocket dependency and start the backend server

```bash
cd server
npm install ws
node ./server.js
```

This assumes that your WebSocket server is located at `server/server.js`. Adjust the path if needed.

### 7. Start the client DApp

```bash
npm start
```

> The app will run at `http://localhost:3000`.

---

## Notes

- Make sure you have a MetaMask wallet configured with a **custom RPC** at `http://127.0.0.1:8545` to connect to Ganache.
- If you encounter any `sass-loader` issues, ensure that `sass` is installed and `node-sass` is fully removed.
- If Drizzle or WebSocket fails to connect, ensure your WebSocket server (if used) is available on `ws://localhost:3030`.

---

## Tech Stack

- **Frontend**: React + Drizzle + Web3
- **Smart Contracts**: Solidity (Truffle)
- **Blockchain**: Local Ganache instance (port 8545)

---

## Troubleshooting

If compilation fails with errors related to placeholders like `&::placeholder`, ensure that SCSS mixins are not invoked at the top level and are properly wrapped inside selectors.

---

## Tested on

- macOS 14.x ARM64 (Apple Silicon)
- Node.js v20.18.3
- npm v10.8.x
- Truffle v5.9.x
- Ganache v7.x

---
