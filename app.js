const express = require('express');
const app = express();
require('dotenv').config();

// Connect DB
const connectDB = require('./middleware/database');
connectDB();

// Middleware
app.use(express.json());

// All Models from one place
const Models = require('./models/index');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
