const express = require('express');
const router = express.Router();
const LiveData = require('./models/LiveData');

// Save data after prediction
router.post('/', async (req, res) => {
  try {
    const newEntry = new LiveData(req.body);
    await newEntry.save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving data', error });
  }
});

// Fetch latest entry
router.get('/latest', async (req, res) => {
  try {
    const latest = await LiveData.findOne().sort({ Timestamp: -1 });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest data', error });
  }
});

module.exports = router;
