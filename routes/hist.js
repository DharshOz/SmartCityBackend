const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// MongoDB URI for smartCityDB
const mongoURI = 'mongodb+srv://dharaneeshrajendran2004:LOPljtBufUwSBsJK@cluster0.uzi1r.mongodb.net/smartCityDB?retryWrites=true&w=majority&appName=Cluster0';

// Connect to the database
mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('✅ Hist.js MongoDB connected to smartCityDB'))
  .catch(err => console.error('❌ Hist.js MongoDB connection error:', err));

// Define HistoricalData schema
const historicalSchema = new mongoose.Schema({
  Location: String,
  Temperature: Number,
  'Gas Emission Value': Number,
  Threshold: Number,
  Analog: Number,
  Timestamp: Date,
  Date: String
});

// Create HistoricalData model using the schema
const HistoricalData = mongoose.model('HistoricalData', historicalSchema);

// Route to fetch historical data
router.get('/historical-data', async (req, res) => {
  try {
    const data = await HistoricalData.find({}, { 
      _id: 0,
      __v: 0 
    })
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
    console.error('Error fetching historical data:', error);
    res.status(500).json({ 
      message: 'Error fetching historical data',
      error: error.message
    });
  }
});

module.exports = router;
