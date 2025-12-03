const Project = require('../models/project');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).render('error', { message: 'We had trouble uploading your image. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddProjectForm = (req, res) => {
    try {
        res.render('inputs/updatingProject', { action: 'add', currentPage: 'update-project' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load add project form.' });
    }
};

module.exports.addProject = async (req, res) => {
    try {
        const { technologies, strengths, isVisible, ...rest } = req.body;
        const newProject = new Project({
            ...rest,
            technologies: (technologies || '').split(',').map(t => t.trim()).filter(t => t.length > 0),
            strengths: (strengths || '').split(',').map(s => s.trim()).filter(s => s.length > 0),
            isVisible: typeof isVisible !== 'undefined' ? (isVisible === 'true' || isVisible === 'on') : true
        });

        if (req.file) {
            const uniqueFilename = `project_images/${Date.now()}-${req.file.originalname}`;
            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(uniqueFilename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data: urlData, error: urlError } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(uniqueFilename);
            if (urlError) {
                throw urlData;
            }
            newProject.image = { url: urlData.publicUrl, filename: req.file.originalname };
        }

        await newProject.save();
        res.redirect('/updating/project/view');
    } catch (err) {
        console.error('Error adding project:', err);
        res.status(500).render('error', { message: 'Failed to add project.' });
    }
};

module.exports.renderEditProjectForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundProject = await Project.findById(id);
        if (!foundProject) {
            return res.status(404).render('error', { message: 'Project not found.' });
        }
        res.render('inputs/updatingProject', { data: foundProject, action: 'edit', currentPage: 'update-project' });
    } catch (err) {
        console.error('Error rendering edit project form:', err);
        res.status(500).render('error', { message: 'Failed to load edit project form.' });
    }
};

module.exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { technologies, strengths, isVisible, ...rest } = req.body;

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            {
                ...rest,
                technologies: (technologies || '').split(',').map(t => t.trim()).filter(t => t.length > 0),
                strengths: (strengths || '').split(',').map(s => s.trim()).filter(s => s.length > 0),
                isVisible: typeof isVisible !== 'undefined' ? (isVisible === 'true' || isVisible === 'on') : false
            },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).render('error', { message: 'Project not found.' });
        }

        if (req.file) {
            if (updatedProject.image && updatedProject.image.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`project_images/${updatedProject.image.filename}`]);
            }

            const uniqueFilename = `project_images/${Date.now()}-${req.file.originalname}`;
            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(uniqueFilename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data: urlData, error: urlError } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(uniqueFilename);
            if (urlError) {
                throw urlData;
            }
            updatedProject.image = { url: urlData.publicUrl, filename: req.file.originalname };
            await updatedProject.save();
        } else if (req.body.deleteImage === 'true') {
            if (updatedProject.image && updatedProject.image.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`project_images/${updatedProject.image.filename}`]);
            }
            updatedProject.image = undefined;
            await updatedProject.save();
        }

        res.redirect('/updating/project/view');
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).render('error', { message: 'Failed to update project.' });
    }
};

module.exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).render('error', { message: 'Project not found.' });
        }

        if (deletedProject.image && deletedProject.image.filename) {
            await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`project_images/${deletedProject.image.filename}`]);
        }

        res.redirect('/updating/project/view');
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).render('error', { message: 'Failed to delete project.' });
    }
};

module.exports.viewProjects = async (req, res) => {
    try {
        const projects = await Project.find({});
        res.render('inputs/updatingProject', { data: projects, action: 'delete', currentPage: 'update-project' });
    } catch (err) {
        console.error('Error viewing projects:', err);
        res.status(500).render('error', { message: 'Failed to retrieve projects.' });
    }
};

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;
