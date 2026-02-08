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
   mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        // এখানে প্রসেস এক্সিট না করে এররটি প্রিন্ট করবে
    });

}

// User Model
const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

// Authorization Middleware
const verifyToken = (req, res, next) => {
    let token = req.query.token || req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "Access Denied! Token Missing." });

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or Expired Token!" });
    }
};

// Routes
// ১. হোম পেজে ইন্টারফেস (index.html) লোড করা
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ২. রেজিস্ট্রেশন রুট
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

// ৩. লগইন রুট (JWT সহ)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Password!" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ৪. প্রাইভেট ড্যাশবোর্ড
app.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: "Welcome to your private dashboard!", userId: req.user.id });
});

// Port Binding (Render এর জন্য খুবই গুরুত্বপূর্ণ)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
