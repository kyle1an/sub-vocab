const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const vocabRouter = require('./routes/vocab');
const authRouter = require('./routes/auth');
const app = express();
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://10.207.1.106:3000',
    'https://subvocab.netlify.app',
    'https://sub-vocab.vercel.app',
  ],
  credentials: true,
  exposedHeaders: ['set-cookie'],
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());
// let static middleware do its job
// app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', vocabRouter);
app.post('/api/queryWords', vocabRouter.queryWords)
app.post('/api/acquaint', vocabRouter.acquaint)
app.post('/api/revokeWord', vocabRouter.revokeWord)
app.post('/login', authRouter.login)
app.post('/register', authRouter.register)
app.post('/changeUsername', authRouter.changeUsername)
app.post('/changePassword', authRouter.changePassword)
app.post('/logoutToken', authRouter.logout)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
