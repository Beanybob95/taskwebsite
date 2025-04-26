# Testing Documentation

This document explains how the testing framework is set up for this project and how to create and run tests.

## Testing Stack

This project uses the following testing tools:

- **Jest**: Core testing framework
- **Supertest**: For testing HTTP requests
- **mongodb-memory-server**: For creating an in-memory MongoDB database during tests

## Running Tests

The following npm scripts are available for running tests:

- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode (automatically re-runs when files change)
- `npm run test:coverage`: Run tests with coverage reporting

## Test Structure

The tests are organized into the following structure:

```
tests/
├── all-tests.test.js         # Integration tests covering full task lifecycle
├── error-handling.test.js    # Tests for error handling scenarios
├── models/                   # Tests for data models
│   └── task.test.js          # Tests for the Task model
├── routes/                   # Tests for route handlers
│   ├── index.test.js         # Tests for main routes
│   └── task-operations.test.js # Tests for task CRUD operations
└── utils/                    # Test utilities
    └── db-handler.js         # Database setup/teardown utilities
```

### Test Categories

#### Integration Tests
- **all-tests.test.js**: Contains end-to-end integration tests that verify the full task lifecycle (create, read, update, delete) works correctly. Also tests pagination and clearing completed tasks.

#### Error Handling Tests
- **error-handling.test.js**: Tests how the application handles various error scenarios including:
  - Not found errors (404)
  - Validation errors
  - Database errors
  - Invalid ID errors
  - Error propagation through middleware

#### Model Tests
- **models/task.test.js**: Tests the Task model functionality including:
  - Creating and saving tasks
  - Default values
  - Validation
  - Querying tasks
  - Updating tasks
  - Deleting tasks

#### Route Tests
- **routes/index.test.js**: Tests the main routes including:
  - GET / (index page with pagination)
  - GET /newtask (new task form)
  - POST /newtask (create new task)
  - GET /task/:id (view task details)

- **routes/task-operations.test.js**: Tests task operation routes including:
  - GET /task/:id/edit (edit task form)
  - PUT /task/:id (update task)
  - DELETE /task/:id (delete task)
  - DELETE /clearcompleted (clear all completed tasks)

### Test Utilities

- **utils/db-handler.js**: Provides utilities for database operations in tests:
  - `connect()`: Sets up an in-memory MongoDB server and connects to it
  - `closeDatabase()`: Drops the database, closes the connection, and stops the MongoDB server
  - `clearDatabase()`: Clears all collections in the database

## Test Patterns

### Database Testing
Tests use mongodb-memory-server to create an in-memory MongoDB database, which provides:
- Isolation between tests
- No need for a real MongoDB instance
- Fast test execution

### Mocking
Many tests use Jest's mocking capabilities to:
- Mock the Task model for route tests
- Mock database operations
- Simulate error conditions

### HTTP Request Testing
Supertest is used to simulate HTTP requests to the Express application, allowing tests to:
- Make GET, POST, PUT, DELETE requests
- Check response status codes
- Verify response content
- Test redirects

## Writing New Tests

When writing new tests:

1. Place them in the appropriate directory based on what they're testing
2. Use the existing patterns for setup/teardown
3. For model tests, use the db-handler utility
4. For route tests, consider whether to use mocks or integration testing
