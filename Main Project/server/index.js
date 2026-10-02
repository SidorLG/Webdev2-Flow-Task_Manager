const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Temporary in-memory task storage
let tasks = [];

// Test route
app.get('/', (req, res) => {
  res.send('Task Flow API is running');
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// CREATE task
app.post('/api/tasks', (req, res) => {
  const { title, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: 'Task title is required'
    });
  }

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    category: category || 'Work',
    completed: false
  };

  tasks.unshift(newTask);

  res.status(201).json(newTask);
});

// UPDATE completed status
app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  task.completed = !task.completed;

  res.json(task);
});

// DELETE one task
app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  tasks = tasks.filter((task) => task.id !== id);

  res.json({
    message: 'Task deleted'
  });
});

// DELETE all tasks
app.delete('/api/tasks', (req, res) => {
  tasks = [];

  res.json({
    message: 'All tasks deleted'
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});