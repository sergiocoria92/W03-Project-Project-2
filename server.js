// trabajando en semana 4: cargamos variables de entorno desde .env
require('dotenv').config();

const carsRoutes = require('./routes/cars');
const motorcyclesRoutes = require('./routes/motorcycles');
const mongo = require('./db/conn');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const express = require('express');
const app = express();

// trabajando en semana 4: paquetes para manejar sesiones y OAuth con GitHub
const session = require('express-session'); // maneja la cookie de sesión del usuario
const passport = require('passport'); // middleware de autenticación
const GitHubStrategy = require('passport-github2').Strategy; // estrategia específica de GitHub

const port = process.env.PORT || 3000;

// configuración básica
app.use(cors());
app.use(express.json());

// trabajando en semana 4: configuración de sesión (usa SESSION_SECRET de .env)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // clave para firmar la cookie de sesión
    resave: false, // no re-guardar la sesión si no hubo cambios
    saveUninitialized: false, // no crear sesiones vacías
  })
);

// trabajando en semana 4: inicializar passport para usar la sesión
app.use(passport.initialize()); // conecta passport con express
app.use(passport.session()); // permite que passport use la sesión de express

// trabajando en semana 4: configuración de la estrategia de GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID, // valor tomado de .env
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // valor tomado de .env
      callbackURL: '/auth/github/callback', // debe coincidir con el callback registrado en GitHub
    },
    (accessToken, refreshToken, profile, done) => {
      // aquí podrías guardar el usuario en BD; para el proyecto basta con un objeto simple
      const user = {
        id: profile.id,
        username: profile.username,
      };
      return done(null, user); // indica a passport que la autenticación fue exitosa
    }
  )
);

// trabajando en semana 4: cómo guardar el usuario en la sesión
passport.serializeUser((user, done) => {
  // guarda el usuario completo (o solo el id) dentro de la sesión
  done(null, user);
});

// trabajando en semana 4: cómo recuperar el usuario desde la sesión
passport.deserializeUser((user, done) => {
  // aquí podrías buscar al usuario en BD; usamos el mismo objeto que guardamos
  done(null, user);
});

// trabajando en semana 4: middleware para proteger rutas
function ensureAuthenticated(req, res, next) {
  // req.isAuthenticated() lo agrega passport; indica si el usuario ya inició sesión
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res
    .status(401)
    .json({ message: 'No autorizado. Inicia sesión con GitHub en /auth/github.' });
}

// trabajando en semana 4: rutas para login/logout con GitHub

// inicia el flujo de OAuth con GitHub
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// URL de callback que GitHub llama después del login
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // si llegó aquí, el login fue exitoso
    res.send('Login exitoso con GitHub. Ya puedes usar las rutas protegidas.');
  }
);

// se usa si falla la autenticación
app.get('/auth/failure', (req, res) => {
  res.status(401).send('Error al iniciar sesión con GitHub.');
});

// cierra la sesión del usuario
app.get('/logout', (req, res, next) => {
  // req.logout lo agrega passport
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.send('Sesión cerrada.');
  });
});

// aquí empieza tu configuración original de rutas

// ahora las rutas de cars y motorcycles quedan protegidas por ensureAuthenticated
app.use('/cars', ensureAuthenticated, carsRoutes); // trabajando en semana 4: esta colección requiere login
app.use('/motorcycles', ensureAuthenticated, motorcyclesRoutes); // trabajando en semana 4: esta colección también

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((req, res) => {
  res.status(404).json('Sorry, page not found');
});

mongo.connectToServer((err) => {
  if (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
});
