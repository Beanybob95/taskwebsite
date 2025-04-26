const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');

// Import the Task model directly (not mocked)
const Task = require('../models/Task');

// Create a test app
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Add mock render method for tests
app.response.render = function(view, locals) {
  this.send(`Rendered ${view} with ${JSON.stringify(locals)}`);
};

// Import actual router (not mocked)
const indexRouter = require('../routes/index');
app.use('/', indexRouter);

// Error handlers
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

// Connect to an in-memory database for testing
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Full Task Lifecycle Integration Tests', () => {
  it('should allow creating, viewing, updating, and deleting a task', async () => {
    // 1. Create a new task
    const createResponse = await request(app)
      .post('/newtask')
      .send({
        task: {
          title: 'Integration Test Task',
          description: 'Testing the full task lifecycle',
          status: 'incomplete',
          dueDate: new Date('2023-12-31')
        }
      });
    
    expect(createResponse.status).toBe(302); // Redirect after creation
    expect(createResponse.headers.location).toBe('/');
    
    // 2. Verify task was created in the database
    const tasks = await Task.find();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Integration Test Task');
    
    const taskId = tasks[0]._id.toString();
    
    // 3. Get the task details
    const getResponse = await request(app).get(`/task/${taskId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.text).toContain('Integration Test Task');
    
    // 4. Update the task
    const updateResponse = await request(app)
      .put(`/task/${taskId}`)
      .send({
        task: {
          title: 'Updated Task Title',
          description: 'Updated task description',
          status: 'completed'
        }
      });
    
    expect(updateResponse.status).toBe(302); // Redirect after update
    
    // 5. Verify the task was updated
    const updatedTask = await Task.findById(taskId);
    expect(updatedTask.title).toBe('Updated Task Title');
    expect(updatedTask.status).toBe('completed');
    
    // 6. Delete the task
    const deleteResponse = await request(app).delete(`/task/${taskId}`);
    expect(deleteResponse.status).toBe(302); // Redirect after deletion
    
    // 7. Verify the task was deleted
    const taskAfterDeletion = await Task.findById(taskId);
    expect(taskAfterDeletion).toBeNull();
  });
  
  it('should handle clearing all completed tasks', async () => {
    // 1. Create multiple tasks with different statuses
    await Task.create([
      { title: 'Task 1', status: 'incomplete' },
      { title: 'Task 2', status: 'completed' },
      { title: 'Task 3', status: 'completed' },
      { title: 'Task 4', status: 'incomplete' }
    ]);
    
    // 2. Verify tasks were created
    const tasksBeforeClear = await Task.find();
    expect(tasksBeforeClear.length).toBe(4);
    
    // 3. Clear completed tasks
    const clearResponse = await request(app).delete('/clearcompleted');
    expect(clearResponse.status).toBe(302); // Redirect after clearing
    
    // 4. Verify only incomplete tasks remain
    const tasksAfterClear = await Task.find();
    expect(tasksAfterClear.length).toBe(2);
    expect(tasksAfterClear.every(task => task.status === 'incomplete')).toBe(true);
  });
  
  it('should handle pagination correctly', async () => {
    // Create more tasks than will fit on a single page (8 items per page)
    const taskPromises = [];
    for (let i = 1; i <= 15; i++) {
      taskPromises.push(
        Task.create({
          title: `Task ${i}`,
          description: `Description ${i}`,
          status: i % 3 === 0 ? 'completed' : 'incomplete', // Mix of completed and incomplete
          dueDate: new Date(2023, 11, i) // Different dates in December 2023
        })
      );
    }
    await Promise.all(taskPromises);
    
    // Test first page
    const firstPageResponse = await request(app).get('/');
    expect(firstPageResponse.status).toBe(200);
    expect(firstPageResponse.text).toContain('"currentPage":1');
    expect(firstPageResponse.text).toContain('"totalPages":2');
    
    // Test second page
    const secondPageResponse = await request(app).get('/?page=2');
    expect(secondPageResponse.status).toBe(200);
    expect(secondPageResponse.text).toContain('"currentPage":2');
  });
  
  it('should handle error when task is not found', async () => {
    // Use a valid MongoDB ID that doesn't exist in the database
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const response = await request(app).get(`/task/${nonExistentId}`);
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
  });
});
