const Skill = require('../models/skill');
const catchAsync = require('../utils/catchAsync');

module.exports.renderAddSkill = (req, res) => {
    res.render('inputs/updatingSkills', { action: 'add', currentPage: 'update-skills' });
};

module.exports.addSkill = catchAsync(async (req, res) => {
    const { tools, ...rest } = req.body;
    const newSkill = new Skill({
        ...rest,
        tools: tools.split(',').map(t => t.trim()).filter(t => t.length > 0)
    });
    await newSkill.save();
    if (req.body.save_action === 'save_and_add_another') {
        return res.redirect('/updating/skill/add');
    }
    res.redirect('/updating/skill/view');
});

module.exports.renderEditSkill = catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundSkill = await Skill.findById(id);
    if (!foundSkill) {
        return res.status(404).render('error', { message: 'Skill not found.' });
    }
    res.render('inputs/updatingSkills', { data: foundSkill, action: 'edit', currentPage: 'update-skills' });
});

module.exports.editSkill = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { tools, ...rest } = req.body;
    const updatedSkill = await Skill.findByIdAndUpdate(
        id,
        {
            ...rest,
            tools: tools.split(',').map(t => t.trim()).filter(t => t.length > 0)
        },
        { new: true, runValidators: true }
    );

    if (!updatedSkill) {
        return res.status(404).render('error', { message: 'Skill not found.' });
    }
    res.redirect('/updating/skill/view');
});

module.exports.deleteSkill = catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedSkill = await Skill.findByIdAndDelete(id);

    if (!deletedSkill) {
        return res.status(404).render('error', { message: 'Skill not found.' });
    }
    res.redirect('/updating/skill/view');
});

module.exports.deleteBatchSkill = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        await Skill.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/updating/skill/view');
});

module.exports.renderDeleteSkill = catchAsync(async (req, res) => {
    const skills = await Skill.find({});
    res.render('inputs/updatingSkills', { data: skills, action: 'delete', currentPage: 'update-skills' });
});
