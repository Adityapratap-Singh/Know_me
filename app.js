try {
    const express = require('express');
    const app = express();
    const mongoose = require('mongoose');
    require('dotenv').config();
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
        secret: process.env.SESSION_SECRET,
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

    // MongoDB
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log("MongoDB connected"))
        .catch(err => console.log(err));

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

    // HOME
    app.get('/', (req, res) => {
    res.redirect("/profile");
});

    // PROFILE
    app.get('/profile', async (req, res) => {
        try {
            const Wid = await whatDoIDo.find();
            const testi = await testimonial.find();
            res.render('profile/profile', { whatDoIDo: Wid, testimonials: testi, currentPage: 'profile' });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // RESUME
    app.get('/resume', async (req, res) => {
        try {
            const edu = await education.find();
            const exp = await experience.find();
            const skl = await skill.find();
            res.render('profile/resume', { education: edu, experience: exp, skills: skl, currentPage: 'resume' });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // PORTFOLIO
    app.get('/portfolio', async (req, res) => {
        try {
            const proj = await project.find();
            res.render('profile/portfolio', { projects: proj, currentPage: 'portfolio' });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // BLOG
    app.get('/blog', (req, res) => {
        res.render('profile/blog', { currentPage: 'blog' });
    });

    // CONTACT
    app.get('/contact', (req, res) => {
        res.render('profile/contact', { currentPage: 'contact' });
    });

    app.post('/contact', (req, res) => {
        console.log(req.body);
        res.redirect('/profile');
    });

    // UPDATE MAIN PAGE
    app.get('/updating', (req, res) => {
        res.render('inputs/updating/updating');
    });

    // UPDATE AUTH HANDLER
    app.post('/updating', (req, res) => {
        const { secret } = req.body;
        if (secret == process.env.secretkey) {
            req.session.isAuthenticated = true;
            req.session.isUpdating = true; // Set the session variable
            return res.redirect('/updatings');
        }
        console.log('Invalid Secret Code');
        res.status(400).send('Invalid action');
    });

    // UPDATE OPTIONS PAGE
    app.get('/updatings', isAuthenticated, isUpdatingVerified, (req, res) => {
        res.render('inputs/updating/updatings');
    });

    // UPDATE OPTIONS HANDLER
    app.post('/updatings', isAuthenticated, isUpdatingVerified, (req, res) => {
        const { updates, action } = req.body;
        if (action === 'add') {
            return res.redirect(`/updating/${updates}/add`);
        }
        if (action === 'delete') {
            return res.redirect(`/updating/${updates}/delete`);
        }
        res.status(400).send('Invalid action');
    });

    // LOGOUT
    app.post('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/updating');
    });

    /* ---------------------- ADD ROUTES ---------------------- */

    app.get('/updating/contact/add', isAuthenticated, (req, res) => {
        res.render('inputs/updatingContact', { action: 'add' });
    });

    app.get('/updating/whatDoIDo/add', isAuthenticated, (req, res) => {
        res.render('inputs/updatingWhatdoIdo', { action: 'add' });
    });

    app.get('/updating/education/add', isAuthenticated, (req, res) => {
        res.render('inputs/updatingEducation', { action: 'add' });
    });

    app.get('/updating/experience/add', isAuthenticated, (req, res) => {
        res.render('inputs/updatingExperience', { action: 'add' });
    });

    app.get('/updating/skill/add', isAuthenticated, (req, res) => {
        res.render('inputs/updatingSkills', { action: 'add' });
    });

    app.get('/updating/project/add', isAuthenticated, (req, res) => {
        res.render('inputs/updatingProject', { action: 'add' });
    });

    app.get('/updating/testimonial/add', isAuthenticated, (req, res) => {
        res.render('inputs/updatingTestimonials', { action: 'add' });
    });

    /* ---------------------- EDIT ROUTES ---------------------- */

    app.get('/updating/project/edit/:id', isAuthenticated, async (req, res) => {
        const data = await project.findById(req.params.id);
        res.render('inputs/updatingProject', { action: 'edit', data });
    });

    app.get('/updating/education/edit/:id', isAuthenticated, async (req, res) => {
        const data = await education.findById(req.params.id);
        res.render('inputs/updatingEducation', { action: 'edit', data });
    });

    /* ---------------------- DELETE ROUTES ---------------------- */

    app.get('/updating/contact/delete', isAuthenticated, async (req, res) => {
        const data = await contact.find();
        res.render('inputs/updatingContact', { action: 'delete', data });
    });

    app.get('/updating/whatDoIDo/delete', isAuthenticated, async (req, res) => {
        const data = await whatDoIDo.find();
        res.render('inputs/updatingWhatdoIdo', { action: 'delete', data });
    });

    app.get('/updating/education/delete', isAuthenticated, async (req, res) => {
        const data = await education.find();
        res.render('inputs/updatingEducation', { action: 'delete', data });
    });

    app.get('/updating/experience/delete', isAuthenticated, async (req, res) => {
        const data = await experience.find();
        res.render('inputs/updatingExperience', { action: 'delete', data });
    });

    app.get('/updating/skill/delete', isAuthenticated, async (req, res) => {
        const data = await skill.find();
        res.render('inputs/updatingSkills', { action: 'delete', data });
    });

    app.get('/updating/project/delete', isAuthenticated, async (req, res) => {
        const data = await project.find();
        res.render('inputs/updatingProject', { action: 'delete', data });
    });

    app.get('/updating/testimonial/delete', isAuthenticated, async (req, res) => {
        const data = await testimonial.find();
        res.render('inputs/updatingTestimonials', { action: 'delete', data });
    });

    /* ---------------------- POST ADD ROUTES ---------------------- */

    app.post('/updating/project/add', isAuthenticated, upload.single('image'), async (req, res) => {
        const { category, title, link, description, technologies } = req.body;

        const techArray = technologies.split(',').map(t => t.trim());

        const newProject = new project({ category, title, link, description, technologies: techArray });
        if (req.file) {
            newProject.image = { url: req.file.path, filename: req.file.filename };
        }

        await newProject.save();
        res.redirect('/portfolio');
    });

    app.post('/updating/education/add', isAuthenticated, async (req, res) => {
        const newEducation = new education(req.body);
        await newEducation.save();
        res.redirect('/resume');
    });

    app.put('/updating/project/edit/:id', isAuthenticated, upload.single('image'), async (req, res) => {
        const { id } = req.params;
        const { category, title, link, description, technologies } = req.body;
        const techArray = technologies.split(',').map(t => t.trim());
        const updatedProject = await project.findByIdAndUpdate(id, { category, title, link, description, technologies: techArray });
        if (req.file) {
            if (updatedProject.image && updatedProject.image.filename) {
                await cloudinary.uploader.destroy(updatedProject.image.filename);
            }
            updatedProject.image = { url: req.file.path, filename: req.file.filename };
            await updatedProject.save();
        }
        res.redirect('/portfolio');
    });

    app.post('/updating/testimonial/add', isAuthenticated, upload.single('image'), async (req, res) => {
        const { name, position, testimonial: testimonialBody } = req.body;
        const newTestimonial = new testimonial({ name, position, testimonial: testimonialBody });
        if (req.file) {
            newTestimonial.image = { url: req.file.path, filename: req.file.filename };
        }
        await newTestimonial.save();
        res.redirect('/profile');
    });

    app.post('/updating/whatDoIDo/add', isAuthenticated, upload.single('icon'), async (req, res) => {
        const { title, description } = req.body;
        const newWhatDoIDo = new whatDoIDo({ title, description });
        if (req.file) {
            newWhatDoIDo.icon = { url: req.file.path, filename: req.file.filename };
        }
        await newWhatDoIDo.save();
        res.redirect('/profile');
    });

    /* ---------------------- POST DELETE ROUTES ---------------------- */

    app.delete('/updating/project/delete/:id', isAuthenticated, async (req, res) => {
        const { id } = req.params;
        const deletedProject = await project.findByIdAndDelete(id);
        if (deletedProject.image && deletedProject.image.filename) {
            await cloudinary.uploader.destroy(deletedProject.image.filename);
        }
        res.redirect('/portfolio');
    });

    app.delete('/updating/testimonial/delete/:id', isAuthenticated, async (req, res) => {
        const { id } = req.params;
        const deletedTestimonial = await testimonial.findByIdAndDelete(id);
        if (deletedTestimonial.image && deletedTestimonial.image.filename) {
            await cloudinary.uploader.destroy(deletedTestimonial.image.filename);
        }
        res.redirect('/profile');
    });

    app.delete('/updating/whatDoIDo/delete/:id', isAuthenticated, async (req, res) => {
        const { id } = req.params;
        const deletedWhatDoIDo = await whatDoIDo.findByIdAndDelete(id);
        if (deletedWhatDoIDo.icon && deletedWhatDoIDo.icon.filename) {
            await cloudinary.uploader.destroy(deletedWhatDoIDo.icon.filename);
        }
        res.redirect('/profile');
    });

    app.post('/updating/education/delete/:id', isAuthenticated, async (req, res) => {
        await education.findByIdAndDelete(req.params.id);
        res.redirect('/resume');
    });

    // SERVER
    const port = process.env.PORT;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
} catch (e) {
    console.error("Unhandled exception:", e);
}