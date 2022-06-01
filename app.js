const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();
const cors = require('cors');
const config = require('./config/connection');
const sql = require('./lib/sql');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://10.207.1.106:3000',
    'https://subvocab.netlify.app',
    'https://sub-vocab.vercel.app',
  ]
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.post('/api/queryWords', usersRouter.api.queryWords)
app.post('/api/acquaint', usersRouter.api.acquaint)
app.post('/api/revokeWord', usersRouter.api.revokeWord)
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

const mysql = require('mysql')
const connection = mysql.createConnection(config)

connection.connect()
connection.query(sql.wordsQuery, (err, rows, fields) => {
  if (err) throw err;
  console.log('The solution is: ', rows)
})
connection.end()
