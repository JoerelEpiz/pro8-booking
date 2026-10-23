import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import {
  getDbFacilities,
  getDbReservations,
  createDbReservation,
  updateDbReservation,
  deleteDbReservation,
  getDbActivityLogs,
  createDbActivityLog,
} from './src/db/queries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  // --- API Routes for PostgreSQL CRUD ---

  // 1. Get all facilities
  app.get('/api/facilities', async (req, res) => {
    try {
      const data = await getDbFacilities();
      res.json(data);
    } catch (error: any) {
      console.error('API /api/facilities error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch facilities' });
    }
  });

  // 2. Get all reservations
  app.get('/api/reservations', async (req, res) => {
    try {
      const data = await getDbReservations();
      res.json(data);
    } catch (error: any) {
      console.error('API /api/reservations error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch reservations' });
    }
  });

  // 3. Save / Create reservation
  app.post('/api/reservations', async (req, res) => {
    try {
      const body = req.body;
      const reservation = await createDbReservation(body);

      // Record activity log
      await createDbActivityLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: body.userId || 'usr-001',
        userName: body.officerName || 'Col. M. Reynolds',
        userRole: 'Director',
        action: 'RESERVATION_CREATED',
        facilityId: body.facilityId,
        facilityName: body.facilityName || 'Facility',
        details: `Saved new reservation ${body.dossierRef} "${body.title}" to PostgreSQL.`,
        ipAddress: req.ip || '10.240.12.4',
        severity: 'info',
      });

      res.status(201).json(reservation);
    } catch (error: any) {
      console.error('API POST /api/reservations error:', error);
      res.status(500).json({ error: error.message || 'Failed to save reservation' });
    }
  });

  // 4. Edit / Update reservation
  app.put('/api/reservations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await updateDbReservation(id, updates);

      if (!updated) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Record activity log
      await createDbActivityLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: updates.userId || 'usr-001',
        userName: updates.userName || 'Col. M. Reynolds',
        userRole: 'Director',
        action: updates.status === 'confirmed' ? 'RESERVATION_APPROVED' : 'RESERVATION_CREATED',
        facilityId: updated.facilityId,
        facilityName: updates.facilityName || 'Facility',
        details: `Updated reservation ${updated.dossierRef} in PostgreSQL. Status: ${updated.status}.`,
        ipAddress: req.ip || '10.240.12.4',
        severity: 'info',
      });

      res.json(updated);
    } catch (error: any) {
      console.error(`API PUT /api/reservations/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || 'Failed to update reservation' });
    }
  });

  // 5. Delete / Revoke reservation
  app.delete('/api/reservations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const reason = (req.query.reason as string) || 'Revoked via Command Console';
      const deleted = await deleteDbReservation(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Record activity log
      await createDbActivityLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: 'usr-001',
        userName: 'Col. M. Reynolds',
        userRole: 'Director',
        action: 'RESERVATION_CANCELLED',
        facilityId: deleted.facilityId,
        facilityName: 'Facility',
        details: `Deleted reservation ${deleted.dossierRef} "${deleted.title}" from PostgreSQL. Reason: ${reason}.`,
        ipAddress: req.ip || '10.240.12.4',
        severity: 'warning',
      });

      res.json({ success: true, deletedId: id });
    } catch (error: any) {
      console.error(`API DELETE /api/reservations/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || 'Failed to delete reservation' });
    }
  });

  // 6. Get Activity Logs
  app.get('/api/logs', async (req, res) => {
    try {
      const logs = await getDbActivityLogs();
      res.json(logs);
    } catch (error: any) {
      console.error('API /api/logs error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch activity logs' });
    }
  });

  // --- Vite Dev or Static Production Middleware ---
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Estate Operations] Full-stack Server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
