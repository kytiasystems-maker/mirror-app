const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

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
  const { mood, reflection } = req.body;
  if (mood) {
    const entry = { mood, reflection, timestamp: Date.now() };
    moodLog.push(entry);
    saveMoods(moodLog);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Missing mood' });
  }
});

// Email collection endpoint (for The Veil feature)
app.post('/api/email', async (req, res) => {
  const { email, mood } = req.body;
  if (email) {
    const entry = { email, mood, timestamp: Date.now() };
    emailList.push(entry);
    saveEmails(emailList);

    // Send notification email
    try {
      await transporter.sendMail({
        from: `"Mirror App" <${process.env.SMTP_USER}>`,
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
      console.log(`Notification sent for new subscriber: ${email}`);
    } catch (err) {
      console.error('Failed to send notification email:', err.message);
    }

    res.json({ success: true, message: 'Email saved. The Veil awaits.' });
  } else {
    res.status(400).json({ success: false, error: 'Missing email' });
  }
});

// Get insights for premium users (The Veil)
app.get('/api/insights', (req, res) => {
  if (moodLog.length === 0) {
    res.json({ insight: 'No data yet. Keep reflecting.' });
    return;
  }

  // Analyze mood patterns
  const last30Days = moodLog.filter(
    entry => Date.now() - entry.timestamp < 30 * 24 * 60 * 60 * 1000
  );

  const moodCounts = last30Days.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const topMood = Object.keys(moodCounts).reduce((a, b) =>
    moodCounts[a] > moodCounts[b] ? a : b
  );

  const philosophicalInsights = {
    anxious: "You've faced uncertainty. Nietzsche would say this forges strength.",
    angry: "Anger reveals what matters to you. Marcus Aurelius teaches discernment.",
    calm: "Tranquility is rare and precious. Guard it.",
    sad: "Your suffering is testing your character. You're becoming stronger.",
    lost: "Not knowing is the first step to discovery.",
    confused: "Confusion precedes clarity. Jung understood this.",
    hopeful: "Hope keeps us caged. True freedom comes from acceptance.",
    neutral: "Observation without judgment is wisdom."
  };

  const insight = philosophicalInsights[topMood] || "Keep reflecting. Answers emerge in silence.";

  res.json({
    moodsTested: Object.keys(moodCounts),
    dominantMood: topMood,
    daysTracked: last30Days.length,
    insight
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mirror running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
