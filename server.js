const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// Force Node.js to resolve DNS using IPv4 first
dns.setDefaultResultOrder('ipv4first');

// Load .env from project directory
const dotenvResult = require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Render provides PORT automatically
const PORT = process.env.PORT || 5000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


// ===============================
// HOME ROUTE
// ===============================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});


// ===============================
// STATIC FRONTEND FILES
// ===============================

app.use(express.static(path.join(__dirname)));


// ===============================
// API ROUTES
// ===============================

app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);


// ===============================
// MONGODB ATLAS CONNECTION
// ===============================

console.log('--- MONGO ATLAS CONNECTION DEBUGGER ---');

if (dotenvResult.error) {

  console.error(
    '[1] .env File Status: FAILED TO LOAD'
  );

  console.error(
    'Render environment variables will be used instead.'
  );

} else {

  console.log(
    '[1] .env File Status: OK'
  );

}


const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI;


if (!MONGO_URI) {

  console.error(
    '[2] MONGO_URI Status: NOT FOUND'
  );

  console.error(
    'Please add MONGO_URI in Render Environment Variables.'
  );

} else {

  // Mask password before printing URI
  const maskedUri = MONGO_URI.replace(
    /:([^@]+)@/,
    ':****@'
  );

  console.log(
    '[2] MONGO_URI Status: OK'
  );

  console.log(
    `Target URI: ${maskedUri}`
  );


  console.log(
    '[3] Attempting Mongoose connection to MongoDB Atlas...'
  );


  mongoose.connect(MONGO_URI, {

    family: 4,

    serverSelectionTimeoutMS: 5000

  })

    .then(() => {

      console.log(
        '----------------------------------------------------'
      );

      console.log(
        'SUCCESS: Connected to MongoDB Atlas database'
      );

      console.log(
        '----------------------------------------------------'
      );

    })

    .catch((err) => {

      console.error(
        '----------------------------------------------------'
      );

      console.error(
        'CONNECTION FAILED! Detailed Diagnostic Report:'
      );

      console.error(
        `Error Name: ${err.name}`
      );

      console.error(
        `Error Code: ${err.code || 'N/A'}`
      );

      console.error(
        `Message: ${err.message}`
      );


      // Authentication error
      if (
        err.message.includes('bad auth') ||
        err.message.includes('Authentication failed') ||
        err.name === 'MongoServerError'
      ) {

        console.error(
          '\nREASON: Authentication Failed!'
        );

        console.error(
          'Check MongoDB Atlas username and password.'
        );

      }

      // Network / IP error
      else if (
        err.message.includes('querySrv ETIMEOUT') ||
        err.message.includes('ECONNREFUSED') ||
        err.name === 'MongooseServerSelectionError'
      ) {

        console.error(
          '\nREASON: IP Address or Network Access Blocked!'
        );

        console.error(
          'Go to MongoDB Atlas → Network Access.'
        );

        console.error(
          'Add 0.0.0.0/0 for testing.'
        );

      }


      console.error(
        '----------------------------------------------------'
      );

    });

}


// ===============================
// START SERVER
// ===============================

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `360 ONE CAPITAL MARKET server running on port ${PORT}`
  );

});