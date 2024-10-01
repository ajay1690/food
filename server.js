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

// Submit order route
app.post('/submit-order', async (req, res) => {
    const { username, items, total } = req.body;
    try {
        const order = new Order({ username, items, total });
        await order.save();
        res.status(201).json({ message: 'Order submitted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting order', error });
    }
});

// Orders route for restaurant owners
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching orders', error });
    }
});

// Server listening on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
