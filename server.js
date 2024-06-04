const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('passport');
const flash = require('express-flash');
const bcrypt = require('bcrypt');
const db = require('./config/database');
const initializePassport = require('./config/passport-config');
const router = express.Router();
const notesRouter = require('./routes/notes');
const foldersRouter = require('./routes/folders');
const notificationsRouter = require('./routes/notifications'); // Añadir el router de notificaciones
dotenv.config();

// Inicializar Passport
initializePassport(passport);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware para pasar la información del usuario a las vistas
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.messages = req.flash();
  next();
});

// Configuración de la plantilla Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware para procesar archivos estáticos en la carpeta 'public'
app.use(express.static('public'));

// Crear la carpeta compartida al iniciar el servidor
const createSharedFolder = () => {
    db.query('SELECT * FROM folders WHERE name = "Notas compartidas"', (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            db.query('INSERT INTO folders (name, user_id) VALUES (?, ?)', ['Notas compartidas', null], (err, results) => {
                if (err) throw err;
                console.log('Carpeta "Notas compartidas" creada.');
            });
        }
    });
};

// Inicializar la carpeta compartida
createSharedFolder();

// Rutas para la página de inicio
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        db.query('SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE', [req.user.id], (err, notifications) => {
            if (err) throw err;
            res.render('index', { title: 'anote-tado', notifications });
        });
    } else {
        res.render('index', { title: 'anote-tado', notifications: [] });
    }
});

// Rutas para iniciar sesión
router.get('/iniciar-sesion', (req, res) => {
    res.render('iniciar-sesion', { title: 'Inicio de Sesión' });
});
router.post('/iniciar-sesion', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true
}));

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            req.flash('error', 'Hubo un error al cerrar la sesión.');
            return res.redirect('/');
        }
        req.flash('success', 'Has cerrado sesión correctamente.');
        res.redirect('/iniciar-sesion');
    });
});

// Rutas para registrarse
router.get('/registrarse', (req, res) => {
    res.render('registrarse', { title: 'Registrarse' });
});
router.post('/registrarse', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [req.body.username, hashedPassword, req.body.email], (err, results) => {
            if (err) {
                console.error(err);
                req.flash('error', 'Hubo un error al registrar el usuario.');
                res.redirect('/registrarse');
            } else {
                const userId = results.insertId;
                // Crear la carpeta "Todas las notas" para el nuevo usuario
                db.query('INSERT INTO folders (name, user_id) VALUES (?, ?)', ['Todas las notas', userId], (err, folderResults) => {
                    if (err) {
                        console.error(err);
                        req.flash('error', 'Hubo un error al crear la carpeta predeterminada.');
                        res.redirect('/registrarse');
                    } else {
                        req.flash('success', 'Usuario registrado con éxito. Por favor, inicia sesión.');
                        res.redirect('/iniciar-sesion');
                    }
                });
            }
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Hubo un error al registrar el usuario.');
        res.redirect('/registrarse');
    }
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal');
});

// Usar el router
app.use('/', router);
app.use('/notes', notesRouter);
app.use('/folders', foldersRouter);
app.use('/notifications', notificationsRouter); // Usar el router de notificaciones

// Puerto en el que escucha el servidor
const port = 3001;
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
