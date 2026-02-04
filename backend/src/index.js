require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const truckRoutes = require('./routes/trucks');
const testRecordRoutes = require('./routes/testRecords');
const reminderRoutes = require('./routes/reminders');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');

const { updateAllTruckStatuses, generateReminders } = require('./services/statusService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/test-records', testRecordRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Cron jobs
// Update truck statuses every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled status update...');
  try {
    await updateAllTruckStatuses();
    console.log('Status update completed');
  } catch (error) {
    console.error('Status update failed:', error);
  }
});

// Generate reminders daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running scheduled reminder generation...');
  try {
    await generateReminders();
    console.log('Reminder generation completed');
  } catch (error) {
    console.error('Reminder generation failed:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
