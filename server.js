// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');
const app = express();
const { UPLOADS_DIR } = require("./config/constants");

const PORT = process.env.PORT || 4000;

const corsOptions = {
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
app.use("/api/products/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.use("/uploads", express.static(UPLOADS_DIR));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

app.post("/api/products/webhook", (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("Получен и проверен вебхук Stripe:", event);
    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Ошибка проверки вебхука Stripe:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.listen(PORT, () => {
  const ipAddress = getLocalIPAddress();
  console.log(`Server is running on http://${ipAddress}:${PORT}`);
});
