const mqtt = require('mqtt');
const LiveData = require('../models/LiveData');
const moment = require('moment');
const client = mqtt.connect('mqtt://broker.hivemq.com'); // or your broker URL

client.on('connect', () => {
  console.log('MQTT connected');
  client.subscribe('esp32/data'); // change topic if needed
});

client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    // simulate prediction using dummy model
    const threshold = predictThreshold(payload); // Use actual model in real app

    const data = {
      Location: payload.location || "Unknown",
      Temperature: parseFloat(payload.temperature),
      "Gas Emission Value": parseFloat(payload.gas),
      Threshold: parseFloat(threshold.toFixed(2)),
      Analog: parseInt(payload.analog),
      Timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      Date: moment().format('YYYY-MM-DD')
    };

    const entry = new LiveData(data);
    await entry.save();
    console.log('Data saved:', data);
  } catch (error) {
    console.error('MQTT error:', error.message);
  }
});

function predictThreshold(payload) {
  // Simulated threshold logic (replace with your model)
  return payload.temperature > 50 || payload.gas > 500 ? 1 : 0;
}
