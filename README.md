# Scanner App (Phone-as-Scanner)

A full-stack document scanning system where a phone camera sends scanned pages to a laptop in real time.

## Project structure

- `server/` — Node.js + Express + Socket.IO backend for pairing and image relay
- `web/` — Next.js laptop dashboard (QR pairing, incoming scans, PDF/image downloads)
- `phone/` — React + Vite phone scanner app (camera capture, multi-page flow)

## Tech stack

- Backend: Node.js, Express, Socket.IO, CORS
- Laptop app: Next.js (App Router), Tailwind CSS, socket.io-client, qrcode, pdf-lib
- Phone app: React + TypeScript (Vite), Zustand, socket.io-client, getUserMedia

## Prerequisites

- Node.js 20+ (Node.js 22 recommended)
- npm 10+

## Install dependencies

From repo root:

```bash
npm install
```

## Run locally (3 terminals)

From repo root:

```bash
npm run dev:server
npm run dev:web
npm run dev:phone
```

Default URLs:

- Server: `http://localhost:4000`
- Laptop web app: `http://localhost:3000`
- Phone app: `http://localhost:5173`

## Environment variables

### Server (`server`)

- `PORT` (default: `4000`)
- `CLIENT_ORIGIN` (default: `http://localhost:3000`)

### Laptop app (`web`)

- `NEXT_PUBLIC_SERVER_URL` (default: `http://localhost:4000`)
- `NEXT_PUBLIC_PHONE_APP_URL` (default: `http://localhost:5173`)

### Phone app (`phone`)

- `VITE_SERVER_URL` (default: `http://localhost:4000`)

## How it works

1. Open laptop app and get a generated session + QR code.
2. Scan QR from phone to open phone app with `sessionId`.
3. Phone joins session, captures pages, and sends images.
4. Laptop receives pages live and lets you:
   - Download individual images
   - Download all images
   - Convert all pages to a PDF and download

## Build

From repo root:

```bash
npm run build --workspace web
npm run build --workspace phone
```

## Start server in production mode

From repo root:

```bash
npm run start:server
```
# scanner-app
