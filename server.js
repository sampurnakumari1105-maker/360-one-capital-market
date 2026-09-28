const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// Force Node.js to resolve DNS using IPv4 first (Fixes querySrv ECONNREFUSED error)
dns.setDefaultResultOrder('ipv4first');

// Ensure .env is loaded from the exact project directory
const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Root route fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});

// Debugging .env loading
console.log('--- MONGO ATLAS CONNECTION DEBUGGER ---');
if (dotenvResult.error) {
  console.error('[1] .env File Status: FAILED TO LOAD (.env file missing or invalid)');
} else {
  console.log('[1] .env File Status: OK (loaded successfully)');
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('[2] MONGO_URI Status: NOT FOUND in process.env');
  console.error('     Fix: Ensure MONGO_URI=mongodb+srv://<username>:<password>@cluster0.tqfpiaw.mongodb.net/Trade is present in .env');
} else if (MONGO_URI.includes('USERNAME:PASSWORD') || MONGO_URI.includes('<username>')) {
  console.warn('[2] MONGO_URI Status: PLACEHOLDER DETECTED');
  console.warn('     Fix: Replace "USERNAME" and "PASSWORD" in .env with your real MongoDB Atlas database credentials.');
} else {
  // Mask password for safe logging
  const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
  console.log(`[2] MONGO_URI Status: OK (Reading from .env)`);
  console.log(`     Target URI: ${maskedUri}`);

  console.log('[3] Attempting Mongoose connection to MongoDB Atlas...');
  
  // Connection with IPv4 options added
  mongoose.connect(MONGO_URI, {
    family: 4, // Force IPv4 to bypass DNS issues
    serverSelectionTimeoutMS: 5000
  })
    .then(() => {
      console.log('----------------------------------------------------');
      console.log(' SUCCESS: Connected to MongoDB Atlas database (Trade)');
      console.log('----------------------------------------------------');
    })
    .catch((err) => {
      console.error('----------------------------------------------------');
      console.error(' CONNECTION FAILED! Detailed Diagnostic Report:');
      console.error(` Error Name: ${err.name}`);
      console.error(` Error Code: ${err.code || 'N/A'}`);
      console.error(` Message: ${err.message}`);

      if (err.message.includes('bad auth') || err.message.includes('Authentication failed') || err.name === 'MongoServerError') {
        console.error('\n REASON: Authentication Failed!');
        console.error(' -> 1. Check your Atlas Database Username and Password.');
        console.error(' -> 2. If your password has special characters (@, #, %, :, /, ?, &, +), URL-encode them.');
      } else if (err.message.includes('querySrv ETIMEOUT') || err.message.includes('ECONNREFUSED') || err.name === 'MongooseServerSelectionError') {
        console.error('\n REASON: IP Address or Network Access Blocked!');
        console.error(' -> 1. Go to MongoDB Atlas -> Network Access.');
        console.error(' -> 2. Add IP Address -> Choose "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).');
        console.error(' -> 3. Ensure your firewall or proxy is not blocking outbound port 27017.');
      }
      console.error('----------------------------------------------------');
    });
}

app.listen(PORT, () => {
  console.log(`360 ONE CAPITAL MARKET server running on port ${PORT}`);
  console.log(`Access application at: http://localhost:${PORT}`);
});