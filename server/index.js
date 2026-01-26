// server/index.js
import express from 'express';
import cors from 'cors';
import { executeQuery } from './db_connector.js';
import { startScheduler } from './sync_service.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.send('🚀 Shinwoo Valve QMS - Gateway Middleware Running');
});

// Start the Sync Scheduler
startScheduler();

// API Step 1: Manual Trigger to sync data (or just fetch for 'View')
app.get('/api/view/:viewName', async (req, res) => {
  const { viewName } = req.params;
  try {
    const data = await executeQuery(viewName);
    res.json({ success: true, view: viewName, count: data.length, data });
  } catch (error) {
    console.error("❌ [Server] Error fetching data:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🏎️  [Gateway] Middleware Server listening on port ${PORT}`);
  console.log(`    -> Health Check: http://localhost:${PORT}`);
  console.log(`    -> Test Data:    http://localhost:${PORT}/api/view/V_QMS_INBOUND\n`);
});
