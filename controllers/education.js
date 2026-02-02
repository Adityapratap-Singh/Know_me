const Education = require('../models/education');
const catchAsync = require('../utils/catchAsync');

module.exports.renderAddEducation = (req, res) => {
    res.render('inputs/updatingEducation', { action: 'add', currentPage: 'update-education' });
};

module.exports.addEducation = catchAsync(async (req, res) => {
    const newEducation = new Education(req.body);
    await newEducation.save();
    if (req.body.save_action === 'save_and_add_another') {
        return res.redirect('/updating/education/add');
    }
    res.redirect('/updating/education/view');
});

module.exports.renderEditEducation = catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundEducation = await Education.findById(id);
    if (!foundEducation) {
        return res.status(404).render('error', { message: 'Education record not found.' });
    }
    res.render('inputs/updatingEducation', { data: foundEducation, action: 'edit', currentPage: 'update-education' });
});

module.exports.editEducation = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedEducation = await Education.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedEducation) {
        return res.status(404).render('error', { message: 'Education record not found.' });
    }
    res.redirect('/updating/education/view');
});

module.exports.deleteEducation = catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedEducation = await Education.findByIdAndDelete(id);

    if (!deletedEducation) {
        return res.status(404).render('error', { message: 'Education record not found.' });
    }
    res.redirect('/updating/education/view');
});

module.exports.deleteBatchEducation = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        await Education.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/updating/education/view');
});

module.exports.renderDeleteEducation = catchAsync(async (req, res) => {
    const educationRecords = await Education.find({});
    res.render('inputs/updatingEducation', { data: educationRecords, action: 'delete', currentPage: 'update-education' });
});
