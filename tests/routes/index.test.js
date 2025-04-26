const request = require('supertest');
const express = require('express');
const path = require('path');
const Task = require('../../models/Task');

// Mock dependencies
jest.mock('../../models/Task');

// Create a simplified express app for testing
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add mock render method since we don't want to test actual view rendering
app.response.render = function(view, locals) {
  this.send(`Rendered ${view} with ${JSON.stringify(locals)}`);
};

// Import the router
const indexRouter = require('../../routes/index');
app.use('/', indexRouter);

// Add error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message
    }
  });
});

describe('Index Routes', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should render the index page with tasks', async () => {
      // Mock the Tasks.find() chain
      const mockTasks = [
        { _id: '123', title: 'Task 1', status: 'incomplete', dueDate: new Date() },
        { _id: '456', title: 'Task 2', status: 'completed', dueDate: new Date() }
      ];
      
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockTasks)
      });
      
      Task.countDocuments.mockResolvedValue(2);
      
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Rendered index');
      expect(Task.find).toHaveBeenCalled();
      expect(Task.countDocuments).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock the Tasks.find() chain to throw an error
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      const response = await request(app).get('/');
      
      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe('Database error');
    });
    
    it('should use pagination parameters from query', async () => {
      // Mock the Tasks.find() chain
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });
      
      Task.countDocuments.mockResolvedValue(20);
      
      await request(app).get('/?page=2');
      
      // Test that skip was called with the correct value (8 items for page 2)
      expect(Task.find().skip).toHaveBeenCalledWith(8);
      expect(Task.find().limit).toHaveBeenCalledWith(8);
    });
  });

  describe('GET /newtask', () => {
    it('should render the newtask page', async () => {
      const response = await request(app).get('/newtask');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Rendered newtask');
    });
  });

  describe('POST /newtask', () => {
    it('should create a new task and redirect', async () => {
      // Mock the Task save method
      Task.prototype.save = jest.fn().mockResolvedValue({ 
        _id: '789', 
        title: 'New Task' 
      });
      
      const response = await request(app)
        .post('/newtask')
        .send({ task: { title: 'New Task', description: 'New Description' } });
      
      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toBe('/');
      expect(Task.prototype.save).toHaveBeenCalled();
    });
    
    it('should handle missing task data', async () => {
      const response = await request(app)
        .post('/newtask')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Task data is required');
    });
    
    it('should handle validation errors', async () => {
      // Mock the Task save method to throw a validation error
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      
      Task.prototype.save = jest.fn().mockRejectedValue(validationError);
      
      const response = await request(app)
        .post('/newtask')
        .send({ task: { title: '' } });
      
      expect(response.status).toBe(500);
      expect(response.body.error.message).toContain('Validation error');
    });
  });

  describe('GET /task/:id', () => {
    it('should render the showtask page with task details', async () => {
      // Mock the Task.findById method
      const mockTask = { 
        _id: '123', 
        title: 'Test Task', 
        description: 'Test Description',
        status: 'incomplete',
        dueDate: new Date()
      };
      
      Task.findById.mockResolvedValue(mockTask);
      
      const response = await request(app).get('/task/123');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Rendered showtask');
      expect(Task.findById).toHaveBeenCalledWith('123');
    });
    
    it('should handle task not found', async () => {
      // Mock the Task.findById method to return null
      Task.findById.mockResolvedValue(null);
      
      const response = await request(app).get('/task/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Task not found');
    });
  });
});
