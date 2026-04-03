export const PORT = Number(process.env.PORT || 4000);
const DEFAULT_CLIENT_ORIGINS = [
	'http://localhost:3000',
	'http://localhost:5173',
];

const clientOriginValue = process.env.CLIENT_ORIGIN || DEFAULT_CLIENT_ORIGINS.join(',');

export const ALLOW_ALL_ORIGINS = clientOriginValue.trim() === '*';

export const CLIENT_ORIGINS = clientOriginValue
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

export const CORS_ORIGIN = ALLOW_ALL_ORIGINS ? '*' : CLIENT_ORIGINS;
export const CORS_CREDENTIALS = !ALLOW_ALL_ORIGINS;

export const SERVICE_NAME = 'scanner-app-server';
