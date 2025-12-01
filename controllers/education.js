const Education = require('../models/education');

module.exports.renderAddEducationForm = (req, res) => {
    try {
        res.render('inputs/updatingEducation', { action: 'add', currentPage: 'update-education' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load add education form.' });
    }
};

module.exports.addEducation = async (req, res) => {
    try {
        const newEducation = new Education(req.body);
        await newEducation.save();
        res.redirect('/updating/education/view');
    } catch (err) {
        console.error('Error adding education:', err);
        res.status(500).render('error', { message: 'Failed to add education.' });
    }
};

module.exports.renderEditEducationForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundEducation = await Education.findById(id);
        if (!foundEducation) {
            return res.status(404).render('error', { message: 'Education record not found.' });
        }
        res.render('inputs/updatingEducation', { data: foundEducation, action: 'edit', currentPage: 'update-education' });
    } catch (err) {
        console.error('Error rendering edit education form:', err);
        res.status(500).render('error', { message: 'Failed to load edit education form.' });
    }
};

module.exports.updateEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEducation = await Education.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedEducation) {
            return res.status(404).render('error', { message: 'Education record not found.' });
        }
        res.redirect('/updating/education/view');
    } catch (err) {
        console.error('Error updating education:', err);
        res.status(500).render('error', { message: 'Failed to update education.' });
    }
};

module.exports.deleteEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEducation = await Education.findByIdAndDelete(id);

        if (!deletedEducation) {
            return res.status(404).render('error', { message: 'Education record not found.' });
        }
        res.redirect('/updating/education/view');
    } catch (err) {
        console.error('Error deleting education:', err);
        res.status(500).render('error', { message: 'Failed to delete education.' });
    }
};

module.exports.viewEducation = async (req, res) => {
    try {
        const educationRecords = await Education.find({});
        res.render('inputs/updatingEducation', { data: educationRecords, action: 'delete', currentPage: 'update-education' });
    } catch (err) {
        console.error('Error viewing education records:', err);
        res.status(500).render('error', { message: 'Failed to retrieve education records.' });
    }
};