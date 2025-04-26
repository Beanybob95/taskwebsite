const express = require('express');
const router = express.Router();
const Tasks = require('../models/Task');

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
  res.render('newtask', { title: 'New Task' });
});




router.post('/newtask', async (req, res, next) => {
  try {
    const task = new Tasks(req.body.task);
    await task.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error creating task:', error);
    next(error);
  }
});



router.get('/task/:id', async (req, res, next) => {
  const task = await Tasks.findById(req.params.id);
  res.render('showtask', { title: 'Task Details', task });
});

router.get('/task/:id/edit', async (req, res, next) => {
  const task = await Tasks.findById(req.params.id);
  res.render('edittask', { title: 'edit Task', task });
});




router.put('/task/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
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
      return res.status(404).send('Task not found');
    }
    // Redirect to task details page instead of rendering index
    res.redirect(`/task/${task._id}`);

  } catch (error) {
    console.error('Error updating task:', error);
    next(error);
  }
});



router.delete('/task/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTask = await Tasks.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return res.status(404).send('Task not found');
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting task:', error);
    next(error);
  }
});




router.get('/clearcompleted', async (req, res, next) => {
  try {
    await Tasks.deleteMany({ status: 'completed' });
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    next(error);
  }
});
module.exports = router;