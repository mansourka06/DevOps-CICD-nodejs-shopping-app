// FILE: app.js

const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const session = require('express-session');
const MongoDbSessionStore = require('connect-mongodb-session')(session);

const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Controllers / utils
const errorController = require('./controllers/error');
const User = require('./models/user');
const { forwardError } = require('./utils');

const app = express();

/* ------------------------------------------------------------------
 * ENV & DATABASE
 * ------------------------------------------------------------------ */

// Local or Docker MongoDB (NO Atlas)
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/shop';

// Session store
const store = new MongoDbSessionStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

/* ------------------------------------------------------------------
 * FILE UPLOAD CONFIG (MULTER)
 * ------------------------------------------------------------------ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

/* ------------------------------------------------------------------
 * VIEW ENGINE
 * ------------------------------------------------------------------ */

app.set('view engine', 'ejs');
app.set('views', 'views');

/* ------------------------------------------------------------------
 * LOGGING & SECURITY
 * ------------------------------------------------------------------ */

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

/* ------------------------------------------------------------------
 * MIDDLEWARE
 * ------------------------------------------------------------------ */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage, fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(csrf());
app.use(flash());

/* ------------------------------------------------------------------
 * GLOBAL TEMPLATE VARIABLES
 * ------------------------------------------------------------------ */

app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session?.isLoggedIn);
  res.locals.csrfToken = req.csrfToken();
  next();
});

/* ------------------------------------------------------------------
 * USER LOADER
 * ------------------------------------------------------------------ */

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => forwardError(err, next));
});

/* ------------------------------------------------------------------
 * ROUTES
 * ------------------------------------------------------------------ */

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

/* ------------------------------------------------------------------
 * ERROR HANDLERS
 * ------------------------------------------------------------------ */

app.use(errorController.get404);
app.use(errorController.get500);

/* ------------------------------------------------------------------
 * DATABASE CONNECT & SERVER START
 * ------------------------------------------------------------------ */

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
