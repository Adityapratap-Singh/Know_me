const Experience = require('../models/experience');

module.exports.renderAddExperienceForm = (req, res) => {
    try {
        res.render('inputs/updatingExperience', { action: 'add', currentPage: 'update-experience' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load add experience form.' });
    }
};

module.exports.addExperience = async (req, res) => {
    try {
        const { responsibilities, ...rest } = req.body;
        const newExperience = new Experience({
            ...rest,
            responsibilities: responsibilities.split('\n').map(r => r.trim()).filter(r => r.length > 0)
        });
        await newExperience.save();
        res.redirect('/updating/experience/view');
    } catch (err) {
        console.error('Error adding experience:', err);
        res.status(500).render('error', { message: 'Failed to add experience.' });
    }
};

module.exports.renderEditExperienceForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundExperience = await Experience.findById(id);
        if (!foundExperience) {
            return res.status(404).render('error', { message: 'Experience record not found.' });
        }
        res.render('inputs/updatingExperience', { data: foundExperience, action: 'edit', currentPage: 'update-experience' });
    } catch (err) {
        console.error('Error rendering edit experience form:', err);
        res.status(500).render('error', { message: 'Failed to load edit experience form.' });
    }
};

module.exports.updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const { responsibilities, ...rest } = req.body;
        const updatedExperience = await Experience.findByIdAndUpdate(
            id,
            {
                ...rest,
                responsibilities: responsibilities.split('\n').map(r => r.trim()).filter(r => r.length > 0)
            },
            { new: true, runValidators: true }
        );

        if (!updatedExperience) {
            return res.status(404).render('error', { message: 'Experience record not found.' });
        }
        res.redirect('/updating/experience/view');
    } catch (err) {
        console.error('Error updating experience:', err);
        res.status(500).render('error', { message: 'Failed to update experience.' });
    }
};

module.exports.deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExperience = await Experience.findByIdAndDelete(id);

        if (!deletedExperience) {
            return res.status(404).render('error', { message: 'Experience record not found.' });
        }
        res.redirect('/updating/experience/view');
    } catch (err) {
        console.error('Error deleting experience:', err);
        res.status(500).render('error', { message: 'Failed to delete experience.' });
    }
};

module.exports.viewExperience = async (req, res) => {
    try {
        const experienceRecords = await Experience.find({});
        res.render('inputs/updatingExperience', { data: experienceRecords, action: 'delete', currentPage: 'update-experience' });
    } catch (err) {
        console.error('Error viewing experience records:', err);
        res.status(500).render('error', { message: 'Failed to retrieve experience records.' });
    }
};