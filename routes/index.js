const express = require('express');
const router = express.Router();
const Tasks = require('../models/Task');
const createError = require('http-errors');

/* GET home page. */
router.get('/', async (req, res, next) => {
  // This includes some code that console.logs the results so that I can see if data is being sent through
  console.log('Home route handler called');
  try {
    // Get page from query params or default to page 1
    const page = parseInt(req.query.page) || 1;
    const tasksPerPage = 8;

    // Count total tasks for pagination
    const totalTasks = await Tasks.countDocuments();
    const totalPages = Math.ceil(totalTasks / tasksPerPage);

    // Get paginated tasks sorted by status (incomplete first) and then by due date
    const tasks = await Tasks.find()
      .sort({ status: -1, dueDate: 1 }) // Primary: status (-1 for descending), Secondary: dueDate (1 for ascending - older to newer)
      .skip((page - 1) * tasksPerPage)
      .limit(tasksPerPage);

    console.log('Tasks retrieved:', tasks);
    res.render('index', { 
      title: 'Tasks', 
      tasks,
      currentPage: page,
      totalPages,
      tasksPerPage,
      totalTasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    next(error);
  }
});


router.get('/newtask', async (req, res, next) => {
  try {
    res.render('newtask', { title: 'New Task' });
  } catch (error) {
    console.error('Error rendering new task form:', error);
    next(error);
  }
});




router.post('/newtask', async (req, res, next) => {
  try {
    // Check if task data exists
    if (!req.body.task) {
      return next(createError(400, 'Task data is required'));
    }
    
    const task = new Tasks(req.body.task);
    await task.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      // Pass validation errors to the error handler
      return next(new Error(`Validation error: ${error.message}`));
    }
    
    next(error);
  }
});



router.get('/task/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Tasks.findById(id);
    
    if (!task) {
      const err = createError(404, 'Task not found');
      return next(err);
    }
    
    res.render('showtask', { title: 'Task Details', task });
  } catch (error) {
    console.error('Error retrieving task details:', error);
    next(error);

  }
});

router.get('/task/:id/edit', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Tasks.findById(id);
    
    if (!task) {
      return next(new Error('Task not found'));
    }
    
    res.render('edittask', { title: 'Edit Task', task });
  } catch (error) {
    console.error('Error retrieving task for editing:', error);
    next(error);
  }
});




router.put('/task/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if task data exists
    if (!req.body.task) {
      return next(createError(400, 'Task data is required'));
    }
    
    // Use findByIdAndUpdate with proper syntax and options
    const task = await Tasks.findByIdAndUpdate(
        id,
        req.body.task,
        {
          new: true,       // Return the updated document
          runValidators: true  // Run schema validators on update
        }
    );
    
    if (!task) {
      // Handle case where task is not found
      return next(new Error('Task not found'));
    }
    
    // Redirect to home page
    res.redirect('/');

  } catch (error) {
    console.error('Error updating task:', error);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      return next(createError(400, `Validation error: ${error.message}`));
    }
    
    next(error);
  }
});



router.delete('/task/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate id format before attempting deletion
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(createError(400, 'Invalid task ID format'));
    }
    
    const deletedTask = await Tasks.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return next(new Error('Task not found'));
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting task:', error);
    next(error);
  }
});




router.delete('/clearcompleted', async (req, res, next) => {
  try {
    const result = await Tasks.deleteMany({ status: 'completed' });
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    next(error);
  }
});
module.exports = router;