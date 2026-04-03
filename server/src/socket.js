import { getPeerSocketId, registerDevice, releaseSocket } from './sessionStore.js';

function normalizeSessionId(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function registerRole(socket, role, payload, io) {
  const sessionId = normalizeSessionId(payload?.sessionId);

  if (!sessionId) {
    socket.emit('join-error', {
      role,
      message: 'sessionId is required',
    });
    return;
  }

  registerDevice(socket, sessionId, role);

  const partnerSocketId = getPeerSocketId(sessionId, role);
  socket.join(sessionId);

  socket.emit('joined', {
    role,
    sessionId,
    paired: Boolean(partnerSocketId),
  });

  io.to(sessionId).emit('session-update', {
    sessionId,
    paired: Boolean(partnerSocketId),
  });

  console.log(`[socket] ${role} joined session ${sessionId} (${socket.id})`);
}

export function setupSocketServer(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected ${socket.id}`);

    socket.on('join-laptop', (payload = {}) => {
      registerRole(socket, 'laptop', payload, io);
    });

    socket.on('join-phone', (payload = {}) => {
      registerRole(socket, 'phone', payload, io);
    });

    socket.on('scan-image', (payload = {}, ack) => {
      const sessionId = normalizeSessionId(payload?.sessionId || socket.data.sessionId);
      const role = socket.data.role;

      if (!sessionId || role !== 'phone') {
        const error = {
          message: 'Phone is not paired to a valid session',
        };

        if (typeof ack === 'function') {
          ack({ ok: false, ...error });
        }

        socket.emit('scan-error', error);
        return;
      }

      const laptopSocketId = getPeerSocketId(sessionId, 'phone');
      if (!laptopSocketId) {
        const error = { message: 'Laptop is not connected for this session' };

        if (typeof ack === 'function') {
          ack({ ok: false, ...error });
        }

        socket.emit('scan-error', error);
        return;
      }

      io.to(laptopSocketId).emit('scan-image', {
        sessionId,
        image: payload.image,
        fileName: payload.fileName || null,
        capturedAt: payload.capturedAt || new Date().toISOString(),
      });

      if (typeof ack === 'function') {
        ack({ ok: true });
      }

      console.log(`[socket] relayed scan-image for session ${sessionId} from ${socket.id} to ${laptopSocketId}`);
    });

    socket.on('disconnect', (reason) => {
      const sessionId = releaseSocket(socket);
      if (sessionId) {
        io.to(sessionId).emit('session-update', {
          sessionId,
          paired: false,
        });
      }

      console.log(`[socket] disconnected ${socket.id}: ${reason}`);
    });
  });
}
