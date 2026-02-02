const Experience = require('../models/experience');
const catchAsync = require('../utils/catchAsync');

module.exports.renderAddExperience = (req, res) => {
    res.render('inputs/updatingExperience', { action: 'add', currentPage: 'update-experience' });
};

module.exports.addExperience = catchAsync(async (req, res) => {
    const { responsibilities, ...rest } = req.body;
    const newExperience = new Experience({
        ...rest,
        responsibilities: responsibilities.split('\n').map(r => r.trim()).filter(r => r.length > 0)
    });
    await newExperience.save();
    if (req.body.save_action === 'save_and_add_another') {
        return res.redirect('/updating/experience/add');
    }
    res.redirect('/updating/experience/view');
});

module.exports.renderEditExperience = catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundExperience = await Experience.findById(id);
    if (!foundExperience) {
        return res.status(404).render('error', { message: 'Experience record not found.' });
    }
    res.render('inputs/updatingExperience', { data: foundExperience, action: 'edit', currentPage: 'update-experience' });
});

module.exports.editExperience = catchAsync(async (req, res) => {
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
});

module.exports.deleteExperience = catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedExperience = await Experience.findByIdAndDelete(id);

    if (!deletedExperience) {
        return res.status(404).render('error', { message: 'Experience record not found.' });
    }
    res.redirect('/updating/experience/view');
});

module.exports.deleteBatchExperience = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        await Experience.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/updating/experience/view');
});

module.exports.renderDeleteExperience = catchAsync(async (req, res) => {
    const experienceRecords = await Experience.find({});
    res.render('inputs/updatingExperience', { data: experienceRecords, action: 'delete', currentPage: 'update-experience' });
});
