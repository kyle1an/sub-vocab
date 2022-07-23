const createError = require('http-errors');
import express from 'express'

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
import vocabRouter from './routes/vocab'
import authRouter from './routes/auth'

const app = express();
const cors = require('cors');
app.use(cors({
  origin: [
    /.*localhost.*$/,
    /.*127.0.0.1.*$/,
    'http://10.207.1.106:3000',
    /.*subvocab.netlify.app/,
    /.*sub-vocab.*.vercel.app/,
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
app.use('/api', vocabRouter);
app.use('/', authRouter);

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

const { pool } = require('./config/connection');
pool.getConnection((err, connection) => {
  connection.query(`CALL stem_derivation_map();
    `, (err, rows, fields) => {
    connection.release();
    if (err) throw err;
    console.log(rows);
  })
})
