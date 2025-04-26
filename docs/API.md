# API Documentation

This document provides information about the API endpoints available in this application.

## Base URL

All endpoints are relative to your base URL, e.g., `http://localhost:3000`.

## Task Endpoints

### Get All Tasks (Paginated)

Retrieves a paginated list of tasks sorted by status (incomplete first) and then by due date.

- **URL**: `/`
- **Method**: `GET`
- **URL Parameters**:
    - `page` (optional): The page number to retrieve (default: 1)
- **Success Response**:
    - **Code**: 200
    - **Content**: HTML page with tasks list and pagination
- **Example**: `GET /?page=2`

### Create New Task Form

Displays the form to create a new task.

- **URL**: `/newtask`
- **Method**: `GET`
- **Success Response**:
    - **Code**: 200
    - **Content**: HTML form for creating a new task

### Create New Task

Creates a new task with the provided information.

- **URL**: `/newtask`
- **Method**: `POST`
- **Data Parameters**:
    - `task`: Object containing task properties
        - Required properties depend on Task model validation
- **Success Response**:
    - **Code**: 302 (Redirect)
    - **Redirect**: `/` (Home page with task list)
- **Error Response**:
    - **Code**: 400
    - **Content**: Error message when validation fails
- **Example**:
  ```
  POST /newtask
  {
    "task": {
      "title": "Complete documentation",
      "description": "Create API documentation for the project",
      "dueDate": "2023-10-30",
      "priority": "high",
      "status": "pending"
    }
  }
  ```

### Get Task Details

Retrieves detailed information about a specific task.

- **URL**: `/task/:id`
- **Method**: `GET`
- **URL Parameters**:
    - `id`: MongoDB ObjectId of the task
- **Success Response**:
    - **Code**: 200
    - **Content**: HTML page with task details
- **Error Response**:
    - **Code**: 404
    - **Content**: Error message when task is not found
- **Example**: `GET /task/615df123a891c23456789012`

### Edit Task Form

Displays the form to edit an existing task.

- **URL**: `/task/:id/edit`
- **Method**: `GET`
- **URL Parameters**:
    - `id`: MongoDB ObjectId of the task
- **Success Response**:
    - **Code**: 200
    - **Content**: HTML form for editing the task
- **Error Response**:
    - **Code**: 404
    - **Content**: Error message when task is not found
- **Example**: `GET /task/615df123a891c23456789012/edit`

### Update Task

Updates an existing task with new information.

- **URL**: `/task/:id`
- **Method**: `PUT`
- **URL Parameters**:
    - `id`: MongoDB ObjectId of the task
- **Data Parameters**:
    - `task`: Object containing task properties to update
- **Success Response**:
    - **Code**: 302 (Redirect)
    - **Redirect**: `/` (Home page with task list)
- **Error Response**:
    - **Code**: 400
    - **Content**: Error message when validation fails
    - **Code**: 404
    - **Content**: Error message when task is not found
- **Example**:
  ```
  PUT /task/615df123a891c23456789012
  {
    "task": {
      "status": "completed",
      "priority": "medium"
    }
  }
  ```

### Delete Task

Deletes a specific task.

- **URL**: `/task/:id`
- **Method**: `DELETE`
- **URL Parameters**:
    - `id`: MongoDB ObjectId of the task
- **Success Response**:
    - **Code**: 302 (Redirect)
    - **Redirect**: `/` (Home page with task list)
- **Error Response**:
    - **Code**: 400
    - **Content**: Error message when ID format is invalid
    - **Code**: 404
    - **Content**: Error message when task is not found
- **Example**: `DELETE /task/615df123a891c23456789012`

### Clear Completed Tasks

Deletes all tasks that have a status of "completed".

- **URL**: `/clearcompleted`
- **Method**: `DELETE`
- **Success Response**:
    - **Code**: 302 (Redirect)
    - **Redirect**: `/` (Home page with task list)
- **Example**: `DELETE /clearcompleted`

## User Endpoints

### Get Users

Retrieves user resources.

- **URL**: `/users`
- **Method**: `GET`
- **Success Response**:
    - **Code**: 200
    - **Content**: "respond with a resource"

## Notes

1. This API uses EJS templates for rendering HTML responses
2. Error handling is standardized throughout the application
3. Method Override is used to support PUT and DELETE methods from HTML forms
4. All database operations are performed using Mongoose for MongoDB

## Common Error Codes

- **400 Bad Request**: Invalid request parameters or task data
- **404 Not Found**: Requested resource was not found
- **500 Internal Server Error**: Server-side error occurred

## Authentication

Currently, this API does not implement authentication. All endpoints are publicly accessible.