// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const nodemailer = require('nodemailer');
const User = require('./models/user');
const HistoricalData = require('./models/bookqs');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const accidentRoutes = require('./routes/accident');
app.use('/api/accidents', accidentRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// MQTT Setup
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');
const mqttTopic = 'esp32/sensor_data';

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  mqttClient.subscribe(mqttTopic, (err) => {
    if (!err) {
      console.log(`✅ Subscribed to topic "${mqttTopic}"`);
    } else {
      console.error('❌ MQTT subscribe error:', err);
    }
  });
});

// Email setup (nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smartcityprojectdl@gmail.com',
    pass: 'tbnrzmafuxxfnued'
  }
});

// Alert tracking
let alertCount = 0;
const ALERT_THRESHOLD = 3; // 5 continuous alerts

// When a message comes from ESP32
mqttClient.on('message', async (topic, message) => {
  console.log(`📩 MQTT message on ${topic}: ${message.toString()}`);

  const payload = message.toString().split(',');
  if (payload.length === 2) {
    const temperature = parseFloat(payload[0]);
    const gasValue = parseInt(payload[1]);

    const thresholdStatus = (temperature > 40 || gasValue > 400) ? 'Alert' : 'Normal';

    const sensorData = {
      Location: "Coimbatore, Peelamedu",
      Temperature: temperature,
      'Gas Emission Value': gasValue,
      Threshold: thresholdStatus,
      Analog: gasValue,
      Timestamp: new Date().toLocaleTimeString(),
      Date: new Date().toLocaleDateString()
    };

    // Emit live sensor data to frontend
    io.emit('sensorData', sensorData);

    // Track alert count
    if (thresholdStatus === 'Alert') {
      alertCount++;
    } else {
      alertCount = 0; // Reset if normal reading
    }

    console.log(`⚡ Alert Count: ${alertCount}`);

    // If 5 continuous alerts
    if (alertCount === ALERT_THRESHOLD) {
      console.log('🚨 5 continuous alerts detected! Sending emails...');

      try {
        // Find all users in Coimbatore (case insensitive match)
        const users = await User.find({ 'location.district': { $regex: /^coimbatore$/i } });

        if (users.length > 0) {
          const emailList = users.map(user => user.email);

          const mailOptions = {
            from: 'smartcityprojectdl@gmail.com',
            to: emailList, // Array of emails
            subject: '🚨 Emergency Alert - Smart City Monitoring',
            html: `
            <h2>🚨 Emergency Alert</h2>
            <p>High Temperature or Gas Emission levels have been <b>continuously detected</b> at location <strong>Coimbatore, Peelamedu</strong>.</p>
            <p>Please take necessary precautions immediately.</p>
          
            <p>
              <a href="https://67c49353f348579bb197ecd7--marvelous-gingersnap-04ec1e.netlify.app/" style="color: blue; text-decoration: underline;">
                🔗 Click here to view Danger Location
              </a>
            </p>
          
            <p><b>Stay Safe,</b><br/>Smart City Team</p>
          `
          
          };

          await transporter.sendMail(mailOptions);
          console.log('✅ Alert Email sent to all Coimbatore users');
        } else {
          console.log('⚠️ No users found in Coimbatore.');
        }
      } catch (error) {
        console.error('❌ Error sending alert email:', error);
      }

      // Reset alert counter after sending
      alertCount = 0;
    }
  }
});

// WebSocket (Socket.IO)
io.on('connection', (socket) => {
  console.log('⚡ New WebSocket client connected');

  socket.on('disconnect', () => {
    console.log('❌ WebSocket client disconnected');
  });
});

// API Route to fetch historical data
app.get('/api/historical-data', async (req, res) => {
  try {
    const data = await HistoricalData.find({}, { _id: 0, __v: 0 })
      .sort({ Timestamp: -1 })
      .lean();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No historical data found' });
    }

    const formattedData = data.map(record => ({
      Location: record.Location,
      Temperature: record.Temperature,
      'Gas Emission Value': record['Gas Emission Value'],
      Threshold: record.Threshold,
      Analog: record.Analog,
      Timestamp: record.Timestamp,
      Date: record.Date
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('❌ Error fetching historical data:', error);
    res.status(500).json({ 
      message: 'Error fetching data',
      error: error.message 
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
