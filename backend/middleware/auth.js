import { getAuth } from '../config/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import log from '../config/logger.js';

export async function requireAuth(req, res, next) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (err) {
    log.error({ err }, 'Auth error');
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
