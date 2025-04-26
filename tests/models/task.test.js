const mongoose = require('mongoose');
const Task = require('../../models/Task');
const dbHandler = require('../utils/db-handler');

// Connect to a test database before running any tests
beforeAll(async () => await dbHandler.connect());

// Clear all test data after every test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after all tests
afterAll(async () => await dbHandler.closeDatabase());

describe('Task Model Tests', () => {
  /**
   * Test that a valid task can be created through the model
   */
  it('should create & save a task successfully', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'incomplete',
      dueDate: new Date('2023-12-31')
    };
    
    const validTask = new Task(taskData);
    const savedTask = await validTask.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe(taskData.title);
    expect(savedTask.description).toBe(taskData.description);
    expect(savedTask.status).toBe(taskData.status);
    
    // MongoDB returns date objects for dates, testing with toISOString for consistent comparison
    expect(savedTask.dueDate.toISOString().split('T')[0]).toBe('2023-12-31');
  });

  /**
   * Test that task creation uses the default status when not provided
   */
  it('should use default status when not provided', async () => {
    const taskWithoutStatus = new Task({
      title: 'Task without Status',
      description: 'This task does not have a status specified'
    });
    
    const savedTask = await taskWithoutStatus.save();
    expect(savedTask.status).toBe('incomplete');
  });

  /**
   * Test that task can be created with minimum required fields
   */
  it('should create task with only title', async () => {
    const taskMinimal = new Task({
      title: 'Minimal Task'
    });
    
    const savedTask = await taskMinimal.save();
    expect(savedTask.title).toBe('Minimal Task');
    expect(savedTask.description).toBeUndefined();
  });

  /**
   * Test that task creation fails with invalid status
   */
  it('should fail when using invalid status value', async () => {
    const taskWithInvalidStatus = new Task({
      title: 'Invalid Status Task',
      description: 'This task has an invalid status',
      status: 'invalid-status'
    });
    
    let error;
    try {
      await taskWithInvalidStatus.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
  });

  /**
   * Test that tasks can be queried from the database
   */
  it('should query tasks successfully', async () => {
    // Create test tasks
    await new Task({ title: 'Task 1', status: 'incomplete' }).save();
    await new Task({ title: 'Task 2', status: 'completed' }).save();
    await new Task({ title: 'Task 3', status: 'incomplete' }).save();
    
    // Query all tasks
    const allTasks = await Task.find();
    expect(allTasks.length).toBe(3);
    
    // Query by status
    const incompleteTasks = await Task.find({ status: 'incomplete' });
    expect(incompleteTasks.length).toBe(2);
    
    const completedTasks = await Task.find({ status: 'completed' });
    expect(completedTasks.length).toBe(1);
    expect(completedTasks[0].title).toBe('Task 2');
  });

  /**
   * Test that tasks can be updated
   */
  it('should update task successfully', async () => {
    // Create a test task
    const task = await new Task({ 
      title: 'Task to Update', 
      description: 'This will be updated',
      status: 'incomplete' 
    }).save();
    
    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      { 
        title: 'Updated Task',
        status: 'completed' 
      },
      { new: true } // Return the updated document
    );
    
    expect(updatedTask.title).toBe('Updated Task');
    expect(updatedTask.status).toBe('completed');
    // Description should remain unchanged
    expect(updatedTask.description).toBe('This will be updated');
  });

  /**
   * Test that tasks can be deleted
   */
  it('should delete task successfully', async () => {
    // Create a test task
    const task = await new Task({ title: 'Task to Delete' }).save();
    
    // Verify it exists
    let found = await Task.findById(task._id);
    expect(found).toBeTruthy();
    
    // Delete the task
    await Task.findByIdAndDelete(task._id);
    
    // Verify it's gone
    found = await Task.findById(task._id);
    expect(found).toBeNull();
  });
});
