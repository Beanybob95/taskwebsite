# Task Management Application

A full-featured task management web application built with Node.js, Express, and MongoDB. The application allows users to create, view, edit, and delete tasks with a clean, intuitive interface using the GOV.UK Design System.

## Features

- Create new tasks with title, description, due date, and priority
- View all tasks with pagination (8 tasks per page)
- Edit existing task details
- Delete individual tasks
- Clear all completed tasks at once
- Automatic sorting of tasks (incomplete tasks first, then by due date)
- Responsive design using GOV.UK Frontend

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates, GOV.UK Frontend framework
- **Other tools**: Method-override for PUT/DELETE requests, Morgan for logging

## Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB (local instance or MongoDB Atlas)
- npm package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure MongoDB connection:
   - Ensure MongoDB is running
   - Update the connection string in `app.js` if needed

4. Start the application:
   ```bash
   npm start
   ```

5. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage

### Creating a Task
- Click on "New Task" button from the home page
- Fill in the task details (title, description, due date, priority)
- Click "Create Task" to save

### Viewing Tasks
- All tasks are listed on the home page with pagination
- Tasks are sorted with incomplete tasks first, then by due date

### Editing a Task
- Click on a task to view its details
- Click "Edit" to modify the task
- Save changes with the "Update Task" button

### Deleting Tasks
- Individual tasks can be deleted from their detail page
- Use the "Clear Completed Tasks" button to remove all completed tasks at once

## Project Structure

- `/models` - Database models (Task schema)
- `/routes` - Express routes for handling requests
- `/views` - EJS templates for rendering pages
- `/public` - Static assets (CSS, JavaScript, images)
- `app.js` - Main application entry point

## License

This project is licensed under the MIT License

## Acknowledgments

- GOV.UK Design System for the frontend components
- Express.js community for the excellent documentation
