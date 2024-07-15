const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 6001;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Apply CORS middleware
const corsOptions = {
  origin: 'https://foodi-client-b9e3c.web.app',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
//app.use(cors());
app.use(express.json());

// MongoDB configuration using mongoose
mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@demo-foodi-client.l7vxx3g.mongodb.net/demo-foodi-client?retryWrites=true&w=majority&appName=demo-foodi-client`)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((error) => console.log('Error connecting to MongoDB', error));

// JWT authentication
app.post('/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.send({ token });
});

// Import routes
const menuRoutes = require('./api/routes/menuRoutes');
const cartRoutes = require('./api/routes/cartRoutes');
const userRoutes = require('./api/routes/userRoutes');
const paymentRoutes = require('./api/routes/paymentRoutes');

app.use('/menu', menuRoutes);
app.use('/carts', cartRoutes);
app.use('/users', userRoutes);
app.use('/payments', paymentRoutes);

// Stripe payment
app.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount = price * 100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get('/', (req, res) => {
  res.send('Hello Foodi Client Server!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

