const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { generateVeilInsight } = require('./lib/insights');
const { sendVeilEmail } = require('./lib/veilMail');

// Load environment variables
require('dotenv').config();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const app = express();

// CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Serve React build static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Data directory and files
const dataDir = path.join(__dirname, 'data');
const emailFile = path.join(dataDir, 'emails.json');
const moodFile = path.join(dataDir, 'moods.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper functions to load and save data
const loadEmails = () => {
  if (fs.existsSync(emailFile)) {
    return JSON.parse(fs.readFileSync(emailFile, 'utf8'));
  }
  return [];
};

const saveEmails = (emails) => {
  fs.writeFileSync(emailFile, JSON.stringify(emails, null, 2));
};

const loadMoods = () => {
  if (fs.existsSync(moodFile)) {
    return JSON.parse(fs.readFileSync(moodFile, 'utf8'));
  }
  return [];
};

const saveMoods = (moods) => {
  fs.writeFileSync(moodFile, JSON.stringify(moods, null, 2));
};

// In-memory storage
let moodLog = loadMoods();
let emailList = loadEmails();

// Mood check-in endpoint
app.post('/api/mood', (req, res) => {
  const { mood, reflection, userId } = req.body;
  if (mood) {
    const entry = { mood, reflection, userId: userId || null, timestamp: Date.now() };
    moodLog.push(entry);
    saveMoods(moodLog);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Missing mood' });
  }
});

// Email collection endpoint (for The Veil feature)
app.post('/api/email', async (req, res) => {
  const { email, mood, userId } = req.body;
  if (email) {
    // Avoid duplicates — update userId link if email already exists
    const existing = emailList.find(e => e.email === email);
    if (existing) {
      existing.userId = userId || existing.userId;
    } else {
      emailList.push({ email, mood, userId: userId || null, timestamp: Date.now(), veilSentCount: 0, lastVeilAt: null });
    }
    saveEmails(emailList);

    // Send internal notification (best-effort, non-blocking)
    try {
      await transporter.sendMail({
        from: `"Mirror App" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_EMAIL,
        subject: `New Veil Subscriber: ${email}`,
        html: `
          <div style="font-family: Georgia, serif; background: #0a0a0a; color: #e0e0e0; padding: 2em; border-radius: 8px;">
            <h2 style="color: #a8a8a8; letter-spacing: 2px;">MIRROR — New Subscriber</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mood:</strong> ${mood || 'not specified'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #a8a8a8; margin-top: 2em; font-size: 0.9em;">Total subscribers: ${emailList.length}</p>
          </div>
        `
      });
    } catch (err) {
      console.error('Failed to send notification email:', err.message);
    }

    res.json({ success: true, message: 'Email saved. The Veil awaits.' });
  } else {
    res.status(400).json({ success: false, error: 'Missing email' });
  }
});

// Get personalized insight for a specific user (The Veil — on-demand preview)
app.get('/api/insights', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    res.json({ insight: 'No data yet. Keep reflecting.' });
    return;
  }

  const result = generateVeilInsight(moodLog, userId);

  if (!result) {
    res.json({
      insight: 'The Veil has not lifted yet. Keep showing up — it reveals itself after a week of honesty.',
      ready: false
    });
    return;
  }

  res.json({ ...result, ready: true });
});

// Check whether the current user has unlocked The Veil and not yet been emailed
app.get('/api/veil/status', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const result = generateVeilInsight(moodLog, userId);
  const subscriber = emailList.find(e => e.userId === userId);

  res.json({
    ready: !!result,
    insight: result || null,
    subscribed: !!subscriber,
    veilSentCount: subscriber ? (subscriber.veilSentCount || 0) : 0
  });
});

// Privacy policy page
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mirror - Privacy Policy</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Georgia, serif; background: #0a0a0a; color: #e0e0e0; padding: 2em; max-width: 700px; margin: 0 auto; line-height: 1.8; }
        h1 { color: #a8a8a8; letter-spacing: 3px; font-weight: 300; text-transform: uppercase; }
        h2 { color: #a8a8a8; font-weight: 300; margin-top: 2em; }
        p, li { color: #c0c0c0; }
        a { color: #a8a8a8; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated: February 12, 2026</strong></p>

      <h2>Overview</h2>
      <p>Mirror is a minimalist mood tracking application that collects mood check-ins and optional email addresses for personalized philosophical insights.</p>

      <h2>Data We Collect</h2>
      <ul>
        <li><strong>Mood Data:</strong> Your mood selections are stored on our servers with timestamps to generate insights.</li>
        <li><strong>Email Addresses:</strong> If you provide an email, it is stored to enable "The Veil" — our monthly philosophical insights feature.</li>
        <li><strong>Device Storage:</strong> Check-in counts and preferences are stored locally on your device using localStorage.</li>
      </ul>

      <h2>How We Use Your Data</h2>
      <ul>
        <li>Mood data is used to generate personalized philosophical insights.</li>
        <li>Email addresses are used solely to send monthly personalized mood analysis.</li>
        <li>We do not sell, share, or distribute your data to third parties.</li>
        <li>We do not serve ads or use your data for advertising purposes.</li>
      </ul>

      <h2>Data Storage & Security</h2>
      <ul>
        <li>All data is stored securely on our servers hosted by Render.</li>
        <li>Local device data is stored in your browser's localStorage.</li>
        <li>We use HTTPS encryption for all data transmission.</li>
      </ul>

      <h2>Your Rights</h2>
      <ul>
        <li>You can request deletion of your data at any time.</li>
        <li>You can opt out of The Veil emails at any time.</li>
        <li>You may use the app without providing an email address.</li>
      </ul>

      <h2>Children's Privacy</h2>
      <p>Mirror is not directed at children under 13. We do not knowingly collect data from children under 13.</p>

      <h2>Contact</h2>
      <p>For privacy concerns, contact: <a href="mailto:kytiasystems@gmail.com">kytiasystems@gmail.com</a></p>

      <h2>Changes to This Policy</h2>
      <p>We may update this privacy policy. Continued use of Mirror constitutes acceptance of any changes.</p>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Mirror is watching.' });
});

// --- The Veil: daily check for users who earned their insight ---
async function runVeilCheck() {
  let sentCount = 0;

  for (const subscriber of emailList) {
    if (!subscriber.userId || !subscriber.email) continue;

    const result = generateVeilInsight(moodLog, subscriber.userId);
    if (!result) continue;

    // Re-send roughly every 14 days at most, to keep it rare
    const now = Date.now();
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    if (subscriber.lastVeilAt && now - subscriber.lastVeilAt < fourteenDays) continue;

    try {
      await sendVeilEmail(
        transporter,
        process.env.FROM_EMAIL || process.env.SMTP_USER,
        subscriber.email,
        result
      );
      subscriber.veilSentCount = (subscriber.veilSentCount || 0) + 1;
      subscriber.lastVeilAt = now;
      sentCount++;
    } catch (err) {
      console.error(`Failed to send Veil to ${subscriber.email}:`, err.message);
    }
  }

  if (sentCount > 0) {
    saveEmails(emailList);
    console.log(`The Veil: sent ${sentCount} email(s)`);
  }
}

// Runs once a day at 09:00 server time
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  cron.schedule('0 9 * * *', () => {
    runVeilCheck().catch(err => console.error('Veil check failed:', err));
  });
} else {
  console.warn('The Veil: SMTP not configured — daily email check disabled.');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mirror running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
