require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // পাসওয়ার্ড এনক্রিপশনের জন্য
const app = express();
const jwt = require('jsonwebtoken');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ডাটাবেস কানেকশন
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// ইউজার মডেল
const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

// ১. হোম পেজ (রেজিস্ট্রেশন ও লগইন ফর্ম)
app.get('/', (req, res) => {
    res.send(`
        <h2>Registration</h2>
        <form action="/add-user" method="POST">
            <input type="text" name="name" placeholder="Name" required><br><br>
            <input type="email" name="email" placeholder="Email" required><br><br>
            <input type="password" name="password" placeholder="Password" required><br><br>
            <button type="submit">Register</button>
        </form>
        <hr>
        <h2>Login</h2>
        <form action="/login" method="POST">
            <input type="email" name="email" placeholder="Email" required><br><br>
            <input type="password" name="password" placeholder="Password" required><br><br>
            <button type="submit">Login</button>
        </form>
        <br><a href="/users">View JSON Data</a>
    `);
});

// ২. রেজিস্ট্রেশন রুট (পাসওয়ার্ড হ্যাশ করা হবে)
app.post('/add-user', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.send('<h3>Registration Successful!</h3><a href="/">Go Back</a>');
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// লগইন রুট আপডেট (JWT সহ)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("User not found!");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid Password!");

        // ১. টোকেন তৈরি করা (এটি ১ ঘণ্টা স্থায়ী থাকবে)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // ২. ব্রাউজারে টোকেনটি পাঠানো (ভবিষ্যতে ফ্রন্টএন্ড এটি ব্যবহার করবে)
        res.send(`
            <h3>Welcome, ${user.name}! Login Successful.</h3>
            <p>Your Token: <b>${token.substring(0, 20)}...</b></p>
            <a href="/">Go Back</a>
        `);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});


// ৪. ইউজার লিস্ট দেখার রুট
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
