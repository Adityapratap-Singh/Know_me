require('dotenv').config();
try {
    const express = require('express');
    const app = express();
    // trust proxy: 1 means trust the first proxy (common for Heroku, Render, etc.)
    // This fixes the ERR_ERL_PERMISSIVE_TRUST_PROXY error
    app.set('trust proxy', 1);
    const mongoose = require('mongoose');
    const path = require('path');
    const ejsMate = require('ejs-mate');
    const methodOverride = require('method-override');
    const session = require('express-session');
    const MongoStore = require('connect-mongo');
    const helmet = require('helmet');
    const mongoSanitize = require('express-mongo-sanitize');
    const compression = require('compression');
    const rateLimit = require('express-rate-limit');

    // EJS + Views
    app.engine('ejs', ejsMate);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));

    // Security & Performance Middleware
    app.use(helmet({
        contentSecurityPolicy: false, // Disabling CSP for now to avoid breaking scripts/images
    }));
    app.use(compression());

    // Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests from this IP, please try again after 15 minutes',
    });
    app.use(limiter);

    // Middleware
    const siteConfig = require('./config/siteConfig');
    app.use((req, res, next) => {
        res.locals.siteConfig = siteConfig;
        next();
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));
    
    // Custom middleware to avoid read-only property assignment in Express 5
    app.use((req, res, next) => {
        if (req.body) mongoSanitize.sanitize(req.body);
        if (req.params) mongoSanitize.sanitize(req.params);
        if (req.query) mongoSanitize.sanitize(req.query);
        next();
    });

    console.log("Middleware setup complete");

    const connectDB = require('./config/database');

    const dbUsername = process.env.db_username;
    const dbPassword = process.env.db_password;
    const dbUriTemplate = process.env.MONGODB_URI;
    const dbUrl = dbUriTemplate ? dbUriTemplate.replace('<db_username>', dbUsername).replace('<db_password>', dbPassword) : '';

    // Connect to Database
    connectDB(dbUrl);

    const sessionOptions = {
        secret: process.env.SESSION_SECRET || 'a very long and random secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    };
    if (process.env.SKIP_DB !== 'true' && dbUrl) {
        sessionOptions.store = MongoStore.create({ mongoUrl: dbUrl, ttl: 60 * 60 * 24 * 7 });
    }
    app.use(session(sessionOptions));

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

    const educationRoutes = require('./routes/education');
    app.use('/', educationRoutes);

    const experienceRoutes = require('./routes/experience');
    app.use('/', experienceRoutes);

    const projectRoutes = require('./routes/project');
    app.use('/', projectRoutes);

    const skillRoutes = require('./routes/skill');
    app.use('/', skillRoutes);

    const testimonialRoutes = require('./routes/testimonials');
    app.use('/', testimonialRoutes);

    const clientRoutes = require('./routes/client');
    app.use('/', clientRoutes);

    const whatDoIDoRoutes = require('./routes/whatDoIDo');
    app.use('/', whatDoIDoRoutes);

    const updatingRoutes = require('./routes/updating');
    app.use('/updating', updatingRoutes);
    console.log("Updating routes loaded");

    // Global Error Handler
    app.use((err, req, res, next) => {
        console.error("Global Error Handler:", err);
        const statusCode = err.statusCode || 500;
        const message = err.message || 'Something went wrong.';
        res.status(statusCode).render('error', { message });
    });

    const port = process.env.PORT || 8080;
    if (require.main === module) {
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    }
    
    module.exports = app;


} catch (e) {
    console.error("Unhandled exception:", e);
}
