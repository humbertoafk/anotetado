const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database');

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return done(err);
            if (results.length === 0) {
                return done(null, false, { message: 'Ningún usuario con ese email' });
            }

            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }
            });
        });
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            if (err) return done(err);
            return done(null, results[0]);
        });
    });
}

module.exports = initialize;
