const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/loginSystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Import User model
const User = require('c:/models/User');

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password, mobile } = req.body;

    try {
        const user = await User.findOne({ username, password, mobile });
        if (user) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, mobile } = req.body;

    try {
        // Check if username or mobile number already exists
        const existingUser = await User.findOne({ $or: [{ username }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or mobile number already registered' });
        }

        // Create new user
        const user = new User({ username, password, mobile });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});