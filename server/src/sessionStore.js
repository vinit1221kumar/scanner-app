const sessions = new Map();
const socketSessions = new Map();

function createEmptySession(sessionId) {
  return {
    sessionId,
    laptopSocketId: null,
    phoneSocketId: null,
  };
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, createEmptySession(sessionId));
  }

  return sessions.get(sessionId);
}

export function registerDevice(socket, sessionId, role) {
  const session = getSession(sessionId);
  const previousSessionId = socketSessions.get(socket.id);

  if (previousSessionId && previousSessionId !== sessionId) {
    releaseSocket(socket);
  }

  if (role === 'laptop') {
    session.laptopSocketId = socket.id;
  }

  if (role === 'phone') {
    session.phoneSocketId = socket.id;
  }

  socketSessions.set(socket.id, sessionId);
  socket.data.sessionId = sessionId;
  socket.data.role = role;

  return session;
}

export function getSessionForSocket(socket) {
  const sessionId = socket.data.sessionId || socketSessions.get(socket.id);
  if (!sessionId) {
    return null;
  }

  return sessions.get(sessionId) || null;
}

export function getPeerSocketId(sessionId, role) {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (role === 'laptop') {
    return session.phoneSocketId;
  }

  if (role === 'phone') {
    return session.laptopSocketId;
  }

  return null;
}

export function releaseSocket(socket) {
  const sessionId = socket.data.sessionId || socketSessions.get(socket.id);
  const role = socket.data.role;

  if (!sessionId) {
    socketSessions.delete(socket.id);
    return null;
  }

  const session = sessions.get(sessionId);
  if (session) {
    if (role === 'laptop' && session.laptopSocketId === socket.id) {
      session.laptopSocketId = null;
    }

    if (role === 'phone' && session.phoneSocketId === socket.id) {
      session.phoneSocketId = null;
    }

    if (!session.laptopSocketId && !session.phoneSocketId) {
      sessions.delete(sessionId);
    }
  }

  socketSessions.delete(socket.id);
  return sessionId;
}

export function hasPairedDevices(sessionId) {
  const session = sessions.get(sessionId);
  return Boolean(session?.laptopSocketId && session?.phoneSocketId);
}

export function snapshotSessions() {
  return Array.from(sessions.values()).map((session) => ({ ...session }));
}
