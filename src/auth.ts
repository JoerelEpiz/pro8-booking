import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

if (!getApps().length) initializeApp({ credential: applicationDefault() });

export type AuthUser = { uid: string; name: string; role: 'admin' | 'user' };
export type AuthedRequest = Request & { user?: AuthUser };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const d = await getAuth().verifyIdToken(token);
    req.user = { uid: d.uid, name: d.name || d.email || d.uid, role: d.role === 'admin' ? 'admin' : 'user' };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}