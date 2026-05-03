import type { AuthSession, AuthUser } from "@/types";

type StoredUser = AuthUser & {
  password: string;
};

type AuthDatabase = {
  users: StoredUser[];
  sessions: Record<string, string>;
};

const globalForAuth = globalThis as unknown as {
  gradpilotAuthDb?: AuthDatabase;
};

function createInitialDb(): AuthDatabase {
  return {
    users: [
      {
        id: "demo-user-1",
        name: "Shreya",
        email: "shreya@gradpilot.ai",
        password: "gradpilot123",
        createdAt: new Date().toISOString(),
      },
    ],
    sessions: {},
  };
}

const db = globalForAuth.gradpilotAuthDb ?? createInitialDb();

if (!globalForAuth.gradpilotAuthDb) {
  globalForAuth.gradpilotAuthDb = db;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function encodeUserForToken(user: StoredUser) {
  const safeUser = sanitizeUser(user);
  return Buffer.from(JSON.stringify(safeUser)).toString("base64url");
}

function decodeUserFromToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    const encodedUser = parts[1];

    if (!encodedUser) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(encodedUser, "base64url").toString("utf-8")
    ) as AuthUser;

    if (!decoded.id || !decoded.email || !decoded.name) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

function createToken(user: StoredUser) {
  return `gp.${encodeUserForToken(user)}.${crypto.randomUUID()}`;
}

function createSession(user: StoredUser): AuthSession {
  const token = createToken(user);
  db.sessions[token] = user.id;

  return {
    token,
    user: sanitizeUser(user),
  };
}

export function signupUser(input: {
  name: string;
  email: string;
  password: string;
}): AuthSession {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!name || name.length < 2) {
    throw new Error("Please enter a valid name.");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const existingUser = db.users.find((user) => user.email === email);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);

  return createSession(user);
}

export function loginUser(input: {
  email: string;
  password: string;
}): AuthSession {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  const user = db.users.find((item) => item.email === email);

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }

  return createSession(user);
}

export function getUserFromToken(token: string): AuthUser | null {
  const userId = db.sessions[token];

  if (userId) {
    const user = db.users.find((item) => item.id === userId);

    if (user) {
      return sanitizeUser(user);
    }
  }

  const decodedUser = decodeUserFromToken(token);

  if (decodedUser) {
    const existingUser = db.users.find(
      (user) => user.email === decodedUser.email
    );

    if (!existingUser) {
      db.users.push({
        ...decodedUser,
        password: "gradpilot123",
      });
    }

    db.sessions[token] = decodedUser.id;
    return decodedUser;
  }

  if (token.startsWith("gp_demo-user-1_")) {
    const demoUser = db.users.find((item) => item.id === "demo-user-1");

    if (demoUser) {
      db.sessions[token] = demoUser.id;
      return sanitizeUser(demoUser);
    }
  }

  return null;
}

export function logoutUser(token: string) {
  delete db.sessions[token];
}
