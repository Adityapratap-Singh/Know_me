module.exports.isVerified = (req, res, next) => {
    if (req.session.isAuthenticated && req.session.isUpdating) {
        return next();
    }
    res.redirect('/updating');
};

module.exports.isContactsVerified = (req, res, next) => {
    if (req.session.isContactsVerified) {
        return next();
    }
    res.redirect('/verify-contacts');
};
