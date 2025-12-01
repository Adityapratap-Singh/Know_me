const Skill = require('../models/skill');

module.exports.renderAddSkillForm = (req, res) => {
    try {
        res.render('inputs/updatingSkills', { action: 'add', currentPage: 'update-skills' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load add skill form.' });
    }
};

module.exports.addSkill = async (req, res) => {
    try {
        const { tools, ...rest } = req.body;
        const newSkill = new Skill({
            ...rest,
            tools: tools.split(',').map(t => t.trim()).filter(t => t.length > 0)
        });
        await newSkill.save();
        res.redirect('/updating/skill/view');
    } catch (err) {
        console.error('Error adding skill:', err);
        res.status(500).render('error', { message: 'Failed to add skill.' });
    }
};

module.exports.renderEditSkillForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundSkill = await Skill.findById(id);
        if (!foundSkill) {
            return res.status(404).render('error', { message: 'Skill not found.' });
        }
        res.render('inputs/updatingSkills', { data: foundSkill, action: 'edit', currentPage: 'update-skills' });
    } catch (err) {
        console.error('Error rendering edit skill form:', err);
        res.status(500).render('error', { message: 'Failed to load edit skill form.' });
    }
};

module.exports.updateSkill = async (req, res) => {
    try {
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
    } catch (err) {
        console.error('Error updating skill:', err);
        res.status(500).render('error', { message: 'Failed to update skill.' });
    }
};

module.exports.deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSkill = await Skill.findByIdAndDelete(id);

        if (!deletedSkill) {
            return res.status(404).render('error', { message: 'Skill not found.' });
        }
        res.redirect('/updating/skill/view');
    } catch (err) {
        console.error('Error deleting skill:', err);
        res.status(500).render('error', { message: 'Failed to delete skill.' });
    }
};

module.exports.viewSkills = async (req, res) => {
    try {
        const skills = await Skill.find({});
        res.render('inputs/updatingSkills', { data: skills, action: 'delete', currentPage: 'update-skills' });
    } catch (err) {
        console.error('Error viewing skills:', err);
        res.status(500).render('error', { message: 'Failed to retrieve skills.' });
    }
};