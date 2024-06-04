module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Por favor inicia sesión para ver esta página');
        res.redirect('/iniciar-sesion');
    }
};
