// config/passport-config.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database');

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                const user = results[0];
                try {
                    if (await bcrypt.compare(password, user.password)) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Contraseña incorrecta.' });
                    }
                } catch (e) {
                    return done(e);
                }
            } else {
                return done(null, false, { message: 'Usuario no existente, intentelo de nuevo.' });
            }
        });
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            if (err) throw err;
            return done(null, results[0]);
        });
    });
}

module.exports = initialize;
