const request = require('supertest');
const express = require('express');
const path = require('path');
const Task = require('../../models/Task');
const methodOverride = require('method-override');

// Mock dependencies
jest.mock('../../models/Task');

// Create a simplified express app for testing
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Add mock render method
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

describe('Task Operations Routes', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /task/:id/edit', () => {
    it('should render the edit task page', async () => {
      // Mock the Task.findById method
      const mockTask = { 
        _id: '507f1f77bcf86cd799439011', 
        title: 'Test Task', 
        description: 'Test Description' 
      };
      
      Task.findById.mockResolvedValue(mockTask);
      
      const response = await request(app).get('/task/507f1f77bcf86cd799439011/edit');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Rendered edittask');
      expect(Task.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
    
    it('should handle task not found', async () => {
      // Mock the Task.findById method to return null
      Task.findById.mockResolvedValue(null);
      
      const response = await request(app).get('/task/999/edit');
      
      expect(response.status).toBe(500); // You might want to change this to 404 in your actual code
      expect(response.body.error.message).toBe('Task not found');
    });
  });

  describe('PUT /task/:id', () => {
    it('should update a task and redirect', async () => {
      // Mock the Task.findByIdAndUpdate method
      const updatedTask = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'completed'
      };
      
      Task.findByIdAndUpdate.mockResolvedValue(updatedTask);
      
      const response = await request(app)
        .put('/task/507f1f77bcf86cd799439011')
        .send({ 
          task: { 
            title: 'Updated Task',
            description: 'Updated Description',
            status: 'completed'
          }
        });
      
      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toBe('/');
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { 
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'completed'
        },
        { new: true, runValidators: true }
      );
    });
    
    it('should handle missing task data', async () => {
      const response = await request(app)
        .put('/task/507f1f77bcf86cd799439011')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Task data is required');
    });
    
    it('should handle task not found', async () => {
      // Mock the Task.findByIdAndUpdate method to return null
      Task.findByIdAndUpdate.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/task/999')
        .send({ task: { title: 'Updated Task' } });
      
      expect(response.status).toBe(500); // You might want to change this to 404 in your actual code
      expect(response.body.error.message).toBe('Task not found');
    });
    
    it('should handle validation errors', async () => {
      // Mock the Task.findByIdAndUpdate method to throw a validation error
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      
      Task.findByIdAndUpdate.mockRejectedValue(validationError);
      
      const response = await request(app)
        .put('/task/507f1f77bcf86cd799439011')
        .send({ task: { status: 'invalid-status' } });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Validation error');
    });
  });

  describe('DELETE /task/:id', () => {
    it('should delete a task and redirect', async () => {
      // Mock the Task.findByIdAndDelete method
      Task.findByIdAndDelete.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', title: 'Deleted Task' });
      
      const response = await request(app).delete('/task/507f1f77bcf86cd799439011');
      
      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toBe('/');
      expect(Task.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
    
    it('should handle invalid ID format', async () => {
      const response = await request(app).delete('/task/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid task ID format');
    });
    
    it('should handle task not found', async () => {
      // Mock the Task.findByIdAndDelete method to return null
      Task.findByIdAndDelete.mockResolvedValue(null);
      
      // Use a valid MongoDB ID format
      const response = await request(app).delete('/task/507f1f77bcf86cd799439011');
      
      expect(response.status).toBe(500); // You might want to change this to 404 in your actual code
      expect(response.body.error.message).toBe('Task not found');
    });
  });

  describe('DELETE /clearcompleted', () => {
    it('should delete all completed tasks and redirect', async () => {
      // Mock the Task.deleteMany method
      Task.deleteMany.mockResolvedValue({ deletedCount: 5 });
      
      const response = await request(app).delete('/clearcompleted');
      
      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toBe('/');
      expect(Task.deleteMany).toHaveBeenCalledWith({ status: 'completed' });
    });
    
    it('should handle database errors', async () => {
      // Mock the Task.deleteMany method to throw an error
      Task.deleteMany.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).delete('/clearcompleted');
      
      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe('Database error');
    });
  });
});
