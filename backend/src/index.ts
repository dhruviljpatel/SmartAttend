import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import subjectRoutes from './routes/subjectRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const getMlServiceUrl = (): string =>
  (process.env.ML_SERVICE_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');

// Middlewares with 50MB payload limit for classroom multi-photo submissions
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Primary /api routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);

// Fallback routes in case client omitted /api in base URL
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/subjects', subjectRoutes);
app.use('/attendance', attendanceRoutes);

// Health check routes with live ML service connectivity diagnostics
app.get(['/api/health', '/health'], async (req, res) => {
  const mlUrl = getMlServiceUrl();
  const mlStatus: Record<string, any> = {
    url: mlUrl,
    reachable: false,
  };

  try {
    const mlRes = await fetch(`${mlUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    mlStatus.statusCode = mlRes.status;
    mlStatus.reachable = mlRes.ok;
    if (mlRes.ok) {
      mlStatus.data = await mlRes.json().catch(() => null);
    } else {
      mlStatus.error = `ML service responded with HTTP ${mlRes.status}`;
      const rawText = await mlRes.text().catch(() => '');
      mlStatus.details = rawText.includes('<!DOCTYPE html>')
        ? 'Render 502 Bad Gateway HTML: ML service container failed to respond to Render proxy'
        : rawText.slice(0, 300);
    }
  } catch (err: any) {
    mlStatus.reachable = false;
    mlStatus.error = err.message || 'Connection failed';
  }

  res.json({
    status: 'ok',
    message: 'SmartAttend API is running',
    timestamp: new Date().toISOString(),
    mlService: mlStatus,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
