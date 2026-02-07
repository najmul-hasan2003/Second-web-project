// (মূল সার্ভার ফাইল)

require('dotenv').config(); // ১. সবার আগে dotenv
const express = require('express'); // ২. এক্সপ্রেস ইমপোর্ট করুন

const app = express(); // ৩. অ্যাপ তৈরি করুন (এই লাইনটি listen এর আগে থাকতে হবে)

const PORT = process.env.PORT || 3000;

// ৪. আপনার অন্যান্য রাউট (Routes) এখানে থাকবে
app.get('/', (req, res) => res.send('Server is running!'));

// ৫. সবার শেষে listen কল করুন
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
