require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// মিডলওয়্যার (ভুল করবেন না এখানে)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ডাটাবেস কানেকশন
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Connection Error:", err));

// মডেল
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String
}));

// রুটসমূহ
app.get('/', (req, res) => {
    res.send(`
        <h2>Add User to MongoDB</h2>
        <form action="/add-user" method="POST">
            <input type="text" name="name" placeholder="Name" required><br><br>
            <input type="email" name="email" placeholder="Email" required><br><br>
            <button type="submit">Submit</button>
        </form>
        <br><a href="/users">View All Users</a>
    `);
});

app.post('/add-user', async (req, res) => {
    try {
        const newUser = new User({ name: req.body.name, email: req.body.email });
        await newUser.save();
        res.send('<h3>User Saved Successfully!</h3><a href="/">Go Back</a>');
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
