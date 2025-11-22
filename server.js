require('dotenv').config();

const carsRoutes = require('./routes/cars');
const motorcyclesRoutes = require('./routes/motorcycles');
const mongo = require('./db/conn');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const express = require('express');
const app = express();

const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        username: profile.username,
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res
    .status(401)
    .json({ message: 'No autorizado. Inicia sesión con GitHub en /auth/github.' });
}

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    res.send('Login exitoso con GitHub. Ya puedes usar las rutas protegidas.');
  }
);

app.get('/auth/failure', (req, res) => {
  res.status(401).send('Error al iniciar sesión con GitHub.');
});

app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (error) {
      if (error) {
        console.error('Error destroying session:', error);
      }
      res.send('Logout exitoso. Tu sesión ha sido cerrada.');
    });
  });
});

app.use('/cars', ensureAuthenticated, carsRoutes);
app.use('/motorcycles', ensureAuthenticated, motorcyclesRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((req, res) => {
  res.status(404).json('Sorry, page not found');
});

mongo.connectToServer((err) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
});
