const express = require('express');
const router = express.Router();
const Accident = require('../models/accidentModel');

// GET all accident videos
router.get('/', async (req, res) => {
  try {
    const videos = await Accident.find().sort({ timestamp: -1 });
    console.log("Fetched videos:", videos);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching accident videos:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE a video by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Accident.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
