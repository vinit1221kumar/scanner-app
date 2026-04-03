# Server

Socket relay backend for Scanner App.

## Responsibilities

- Accept Socket.IO connections from laptop and phone
- Pair devices by `sessionId`
- Relay `scan-image` events from phone to paired laptop only
- Track join/disconnect and session pairing state

## Scripts

```bash
npm run dev --workspace server
npm run start --workspace server
```

## Environment variables

- `PORT` (default: `4000`)
- `CLIENT_ORIGIN`:
	- `*` to allow all origins (credentials disabled automatically)
	- or comma-separated allowlist (example: `http://localhost:3000,http://localhost:5173`)

## Health check

- `GET /health`
- Example: `http://localhost:4000/health`
