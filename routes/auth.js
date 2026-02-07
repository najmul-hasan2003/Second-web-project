const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email, password });
        await user.save();
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        const token = jwt.sign({ id: user._id }, 'SECRET_KEY');
        res.json({ success: true, token });
    } else { res.status(401).json({ message: "Invalid credentials" }); }
});

router.get('/profile', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'SECRET_KEY');
    const user = await User.findById(decoded.id);
    res.json({ success: true, user });
});

module.exports = router;
