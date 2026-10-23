import { randomUUID } from 'crypto';
import { requireAuth, requireAdmin, type AuthedRequest } from './src/auth.ts';

app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
app.use('/api', requireAuth);               // everything under /api needs a login

// small helper replaces 4 copy-pasted blocks
const audit = (req: AuthedRequest, e: {
  action: string; facilityId: string; facilityName: string; details: string; severity: string;
}) => createDbActivityLog({
  id: randomUUID(),
  timestamp: new Date().toISOString(),
  userId: req.user!.uid,
  userName: req.user!.name,
  userRole: req.user!.role,
  ipAddress: req.ip ?? 'unknown',
  ...e,
});

// POST: whitelist fields, identity from the token, not the body
app.post('/api/reservations', async (req: AuthedRequest, res) => {
  const { facilityId, title, startTime, endTime, dossierRef } = req.body ?? {};
  if (!facilityId || !title || !startTime || !endTime)
    return res.status(400).json({ error: 'Missing required fields' });
  try {
    const reservation = await createDbReservation({
      facilityId, title, startTime, endTime, dossierRef,
      userId: req.user!.uid, status: 'pending',   // clients can no longer self-approve
    });
    await audit(req, { action: 'RESERVATION_CREATED', facilityId, facilityName: reservation.facilityName ?? facilityId,
      details: `Created reservation ${reservation.dossierRef} "${title}".`, severity: 'info' });
    res.status(201).json(reservation);
  } catch (err) {
    console.error('POST /api/reservations', err);
    res.status(500).json({ error: 'Failed to save reservation' });   // no internals leaked
  }
});

// Approving or deleting is admin-only
app.put('/api/reservations/:id', requireAdmin, /* ...same pattern, whitelist updates, fix action name */);
app.delete('/api/reservations/:id', requireAdmin, /* ... */);
