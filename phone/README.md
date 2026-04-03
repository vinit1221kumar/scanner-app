# Phone (PWA-style Scanner App)

React + Vite phone scanner interface opened via QR/session URL.

## Features

- Reads `sessionId` from query param
- Connects to Socket.IO server as phone client
- Uses native `getUserMedia` (rear camera preferred)
- Captures pages to base64 using canvas
- Multi-page flow with retake/delete and clear-all
- Sends captured pages to paired laptop
- Handles camera permission denial and socket disconnect states

## Scripts

```bash
npm run dev --workspace phone
npm run build --workspace phone
npm run preview --workspace phone
```

## Environment variables

- `VITE_SERVER_URL` (default: `http://localhost:4000`)

## Open

- `http://localhost:5173`
- Must include `sessionId` in URL when opened directly, for example:
  - `http://localhost:5173/?sessionId=your-session-id`
