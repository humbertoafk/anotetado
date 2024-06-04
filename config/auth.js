module.exports = {
    // Middleware para asegurarse de que el usuario está autenticado
    ensureAuthenticated: function(req, res, next) {
        // Si el usuario está autenticado, continuar a la siguiente función/middleware
        if (req.isAuthenticated()) {
            return next();
        }
        // Si el usuario no está autenticado, mostrar un mensaje flash y redirigir a la página de inicio de sesión
        req.flash('error_msg', 'Por favor inicia sesión para ver esta página');
        res.redirect('/iniciar-sesion');
    }
};
