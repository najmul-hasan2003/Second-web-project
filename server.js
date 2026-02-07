// (মূল সার্ভার ফাইল)

require('dotenv').config(); // ১. সবার আগে dotenv
const express = require('express'); // ২. এক্সপ্রেস ইমপোর্ট করুন

const app = express(); // ৩. অ্যাপ তৈরি করুন (এই লাইনটি listen এর আগে থাকতে হবে)




require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// ১. মিডলওয়্যার (Middleware) - এটি অবশ্যই রুটের উপরে থাকতে হবে
app.app.use(express.json()); 

// ২. ডাটাবেস কানেকশন (এখানে আপনার MONGO_URI ব্যবহার হবে)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ৩. ডাটা মডেল (Schema)
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String
}));

// --- এখান থেকে আপনার নতুন কোড শুরু ---

// ৪. ডাটা সেভ করার রুট (POST)
app.post('/add-user', async (req, res) => {
    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email
        });
        await newUser.save();
        // ডাটা সেভ হওয়ার পর আবার হোম পেজে পাঠিয়ে দেবে
        res.send('<h3>User Saved Successfully!</h3><a href="/">Go Back</a>');
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});






// ৫. আগের তৈরি করা GET রুট (ঐচ্ছিক)
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// --- কোড শেষ ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});








const PORT = process.env.PORT || 3000;

// ৪. আপনার অন্যান্য রাউট (Routes) এখানে থাকবে
app.get('/', (req, res) => res.send('Server is running!'));






// হোম পেজে একটি ছোট ফর্ম দেখাবে ডাটা পাঠানোর জন্য
app.get('/', (req, res) => {
    res.send(`
        <h2>Add User to MongoDB</h2>
        <form action="/add-user" method="POST">
            <input type="text" name="name" placeholder="Name" required><br><br>
            <input type="email" name="email" placeholder="Email" required><br><br>
            <button type="submit">Submit</button>
        </form>
        <br>
        <a href="/users">View All Users</a>
    `);
});

// ডাটা গ্রহণ করার জন্য মিডলওয়্যার (এটি অবশ্যই app.post এর উপরে থাকতে হবে)
app.use(express.urlencoded({ extended: true })); 







// ৫. সবার শেষে listen কল করুন
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
