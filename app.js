const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


const indexRouter = require('./routes/index');


mongoose.connect('mongodb://localhost:27017/taskswebsite', {})
.then(() => console.log('MongoDB connection successful!'))
.catch(err => console.error('MongoDB connection error:', err));

const app = express();

// view engine setup
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  
  // Try to render the error page, fallback to plain text if that fails
  res.render('error', {title: 'Error'}, function(renderErr, html) {
    if (renderErr) {
      console.error('Error rendering error template:', renderErr);
      res.send(`<h1>Error: ${err.message}</h1><p>Additionally, there was an error rendering the error page.</p>`);
    } else {
      res.send(html);
    }
  });
});

module.exports = app;