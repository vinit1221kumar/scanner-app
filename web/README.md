# Web (Laptop App)

Next.js dashboard used on the laptop side.

## Features

- Generates session ID and QR code for phone pairing
- Connects to Socket.IO server as laptop client
- Shows connection/pairing status
- Displays incoming scanned pages
- Export options:
  - Download PDF (all pages)
  - Download all images
  - Download individual image

## Scripts

```bash
npm run dev --workspace web
npm run build --workspace web
npm run start --workspace web
```

## Environment variables

- `NEXT_PUBLIC_SERVER_URL` (default: `http://localhost:4000`)
- `NEXT_PUBLIC_PHONE_APP_URL` (default: `http://localhost:5173`)

## Open

- `http://localhost:3000`
