const Project = require('../models/project');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const catchAsync = require('../utils/catchAsync');

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).render('error', { message: 'We had trouble uploading your image. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddProject = (req, res) => {
    res.render('inputs/updatingProject', { action: 'add', currentPage: 'update-project' });
};

module.exports.addProject = catchAsync(async (req, res) => {
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
    if (req.body.save_action === 'save_and_add_another') {
        return res.redirect('/updating/project/add');
    }
    res.redirect('/updating/project/view');
});

module.exports.renderEditProject = catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundProject = await Project.findById(id);
    if (!foundProject) {
        return res.status(404).render('error', { message: 'Project not found.' });
    }
    res.render('inputs/updatingProject', { data: foundProject, action: 'edit', currentPage: 'update-project' });
});

module.exports.editProject = catchAsync(async (req, res) => {
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
});

module.exports.deleteProject = catchAsync(async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
        return res.status(404).render('error', { message: 'Project not found.' });
    }

    if (project.image && project.image.filename) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`project_images/${project.image.filename}`]);
    }

    await Project.findByIdAndDelete(id);
    res.redirect('/updating/project/view');
});

module.exports.deleteBatchProject = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        // Fetch projects to delete images
        const projects = await Project.find({ _id: { $in: ids } });
        for (const project of projects) {
            if (project.image && project.image.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`project_images/${project.image.filename}`]);
            }
        }
        await Project.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/updating/project/view');
});

module.exports.renderDeleteProject = catchAsync(async (req, res) => {
    const projects = await Project.find({});
    res.render('inputs/updatingProject', { data: projects, action: 'delete', currentPage: 'update-project' });
});

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;
