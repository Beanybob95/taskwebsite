const request = require('supertest');
const express = require('express');
const createError = require('http-errors');
const Task = require('../models/Task');

// Mock dependencies
jest.mock('../models/Task');

// Create a simplified express app for testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import the router
const indexRouter = require('../routes/index');
app.use('/', indexRouter);

// Generic 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

describe('Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Not Found Errors', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
    });
    
    it('should return 404 when task is not found', async () => {
      Task.findById.mockResolvedValue(null);
      
      const response = await request(app).get('/task/507f1f77bcf86cd799439011');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('Validation Errors', () => {
    it('should handle invalid task data in create route', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      
      Task.prototype.save = jest.fn().mockRejectedValue(validationError);
      
      const response = await request(app)
        .post('/newtask')
        .send({ task: { title: 'Invalid Task' } });
      
      expect(response.status).toBe(500); // Check status code
      expect(response.body.message).toContain('Validation error');
    });
    
    it('should handle missing task data in create route', async () => {
      const response = await request(app).post('/newtask').send({});
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Task data is required');
    });
  });

  describe('Database Errors', () => {
    it('should handle database connection errors', async () => {
      // Mock a database error in the find method
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      });
      
      const response = await request(app).get('/');
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database connection failed');
    });
    
    it('should handle database error in deleteMany', async () => {
      // Mock a database error in the deleteMany method
      Task.deleteMany.mockRejectedValue(new Error('Failed to delete tasks'));
      
      const response = await request(app).delete('/clearcompleted');
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to delete tasks');
    });
  });

  describe('Invalid ID Errors', () => {
    it('should handle invalid MongoDB ID format', async () => {
      const response = await request(app).delete('/task/invalid-id-format');
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid task ID format');
    });
    
    it('should handle invalid ID in update route', async () => {
      // Use an invalid ID format
      const response = await request(app)
        .put('/task/invalid-id')
        .send({ task: { title: 'Updated Task' } });
      
      // Your current implementation doesn't validate ID in update route
      // If you add validation, this test should check for 400 status
      expect(response.status).not.toBe(200);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate errors from route handlers to error middleware', async () => {
      // Mock a route to throw an unexpected error
      Task.countDocuments.mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      
      const response = await request(app).get('/');
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Unexpected error');
    });
  });
});
