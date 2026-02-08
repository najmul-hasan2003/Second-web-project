require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ MONGO_URI is missing in Render Environment Variables!");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("✅ MongoDB Connected Successfully"))
        .catch(err => console.log("❌ DB Connection Error:", err.message));
}

// User Model
const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

// Routes
// ১. হোম পেজে ইন্টারফেস (index.html) লোড করা
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ২. রেজিস্ট্রেশন রুট (JSON Response)
app.post('/add-user', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: "Registration Successful!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ৩. লগইন রুট (JWT Token সহ)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Password!" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ৪. ইউজার লিস্ট দেখার রুট (JSON)
app.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // পাসওয়ার্ড ছাড়া ডাটা দেখাবে
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


const Message = mongoose.model('Message', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    from: String,
    content: String,
    time: { type: Date, default: Date.now }
}));


app.get('/api/messages', verifyToken, async (req, res) => {
    const messages = await Message.find({ userId: req.user.id }).sort({ time: -1 });
    res.json(messages);
});



// Port Binding (Render এর জন্য)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
