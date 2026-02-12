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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Mirror is watching.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mirror running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
