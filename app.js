require('dotenv').config();
try {
    const express = require('express');
    const app = express();
    const mongoose = require('mongoose');
    const path = require('path');
    const ejsMate = require('ejs-mate');
    const methodOverride = require('method-override');
    const session = require('express-session');

    // EJS + Views
    app.engine('ejs', ejsMate);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));
    app.use(session({
        secret: process.env.SESSION_SECRET || 'a very long and random secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }));

    const { storage, cloudinary } = require('./cloudinary');
    const multer = require('multer');
    const upload = multer({ storage });

    // Models
    const whatDoIDo = require('./models/whatDoIDo');
    const testimonial = require('./models/testimonials');
    const education = require('./models/education');
    const experience = require('./models/experience');
    const skill = require('./models/skill');
    const project = require('./models/project');
    const contact = require('./models/contact');
    const collection = require('./models/collection');

    const skipDb = process.env.SKIP_DB === 'true';
    if (!skipDb) {
        const dbUsername = process.env.db_username;
        const dbPassword = process.env.db_password;
        const dbUriTemplate = process.env.MONGODB_URI;
        const dbUrl = dbUriTemplate ? dbUriTemplate.replace('<db_username>', dbUsername).replace('<db_password>', dbPassword) : '';
        mongoose.set('bufferCommands', false);
        mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 20000,
            family: 4
        })
            .then(() => {
                console.log("MongoDB connected");
            })
            .catch(err => {
                console.log("MongoDB connection error:", err);
            });
    } else {
        console.log("Skipping MongoDB connection (SKIP_DB=true)");
    }

    // Middleware to check if user is authenticated
    const isAuthenticated = (req, res, next) => {
        if (req.session.isAuthenticated) {
            return next();
        }
        res.redirect('/updating');
    };

    // Middleware to check if updating is verified
    const isUpdatingVerified = (req, res, next) => {
        if (req.session.isUpdating) {
            return next();
        }
        res.redirect('/updating');
    };

    const profileRoutes = require('./routes/profile');
    app.use('/', profileRoutes);

    const contactRoutes = require('./routes/contact');
    app.use('/', contactRoutes);

    const updatingRoutes = require('./routes/updating');
    app.use('/updating', updatingRoutes);

    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Server is running on port ${port}`));

} catch (e) {
    console.error("Unhandled exception:", e);
}
