module.exports.isVerified = (req, res, next) => {
    try {
        if (req.session.isAuthenticated && req.session.isUpdating) {
            return next();
        }
        res.redirect('/updating');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Session verification failed.' });
    }
};

module.exports.isContactsVerified = (req, res, next) => {
    try {
        if (req.session.isContactsVerified) {
            return next();
        }
        res.redirect('/verify-contacts');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Contacts verification failed.' });
    }
};
