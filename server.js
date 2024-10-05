const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://bansodajay516:Ajay1234@food.bkb9h.mongodb.net/?retryWrites=true&w=majority&appName=food';

// Connect to MongoDB
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});

// Order Schema
const orderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    items: [{ name: String, price: Number }],
    total: Number,
    status: { type: String, default: 'pending' }, // pending, accepted, prepared
    estimatedTime: Number, // Time in minutes
    orderDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// Register route
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const user = new User({ username, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error registering user', error });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).json({ message: 'Login successful', role: user.role });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error logging in', error });
    }
});

// Submit order route (customer places order)
app.post('/submit-order', async (req, res) => {
    const { username, items, total } = req.body;
    try {
        const order = new Order({ username, items, total, status: 'pending' });
        await order.save();
        res.status(201).json({ message: 'Order submitted! Waiting for owner confirmation.' });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting order', error });
    }
});

// Owner accepts the order and provides estimated preparation time
app.post('/accept-order', async (req, res) => {
    const { username, estimatedTime } = req.body;
    try {
        const order = await Order.findOne({ username, status: 'pending' });
        if (order) {
            order.status = 'accepted';
            order.estimatedTime = estimatedTime;
            await order.save();
            res.status(200).json({ message: 'Order accepted!', order });
        } else {
            res.status(400).json({ message: 'Order not found or already accepted' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error accepting order', error });
    }
});

// Mark order as prepared by the owner
app.post('/order-prepared', async (req, res) => {
    const { username } = req.body;
    try {
        const order = await Order.findOne({ username, status: 'accepted' });
        if (order) {
            order.status = 'prepared';
            await order.save();
            res.status(200).json({ message: 'Order marked as prepared!' });
        } else {
            res.status(400).json({ message: 'Order not found or already prepared' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error marking order as prepared', error });
    }
});

// Get pending and accepted orders for restaurant owner
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find({ status: { $in: ['pending', 'accepted'] } });
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching orders', error });
    }
});

// Get order status for the customer
app.get('/order-status/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const order = await Order.findOne({ username });
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error fetching order status', error });
    }
});

// Server listening on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
