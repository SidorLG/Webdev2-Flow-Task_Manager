
// Import React hooks for state management and loading tasks when the component starts.
import { useEffect, useState } from 'react';
import './App.css';

// API endpoint used to communicate with the Express backend.
const API_URL = 'http://localhost:5000/api/tasks';

export default function App() {
  // Store the tasks and form values, and track whether tasks are loading.
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [loading, setLoading] = useState(true);

  // Define the colours used for each task category badge.
  const categoryColors = {
    Work: {
      bg: '#eff6ff',
      text: '#2563eb',
      border: '#bfdbfe'
    },
    Study: {
      bg: '#f0fdf4',
      text: '#16a34a',
      border: '#bbf7d0'
    },
    Personal: {
      bg: '#faf5ff',
      text: '#9333ea',
      border: '#e9d5ff'
    }
  };

  // Load tasks from the Express server when the component first renders.
  useEffect(() => {
    fetchTasks();
  }, []);

  // Request the current task list from the backend.
  async function fetchTasks() {
    try {
      const response = await fetch(API_URL);

      // Handle unsuccessful HTTP responses.
      if (!response.ok) {
        throw new Error('Could not load tasks');
      }

      // Convert the JSON response and save the tasks in React state.
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      // Log errors to help with debugging.
      console.error('Error loading tasks:', error);
    } finally {
      // Stop displaying the loading message after the request finishes.
      setLoading(false);
    }
  }

  // Validate and send a new task to the backend.
  async function handleAddTask(e) {
    // Prevent the form from refreshing the page.
    e.preventDefault();

    // Do not create a task if the title is empty or contains only spaces.
    if (!title.trim()) {
      return;
    }

    try {
      // Send the new task data to the Express API using POST.
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          category
        })
      });

      if (!response.ok) {
        throw new Error('Could not create task');
      }

      // Read the created task returned by the server.
      const newTask = await response.json();

      // Add the new task to the beginning of the current task list.
      setTasks((currentTasks) => [
        newTask,
        ...currentTasks
      ]);

      // Reset the form to its default values.
      setTitle('');
      setCategory('Work');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  // Toggle a task's completion status through the backend.
  async function toggleComplete(id) {
    try {
      // Send a PATCH request for the selected task.
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Could not update task');
      }

      // Read the updated task returned by the server.
      const updatedTask = await response.json();

      // Replace the old task with its updated version in React state.
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  // Delete one task using its unique ID.
  async function deleteTask(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Could not delete task');
      }

      // Remove the deleted task from the displayed list.
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  // Delete all tasks from the backend and clear the interface.
  async function clearAllTasks() {
    try {
      const response = await fetch(API_URL, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Could not clear tasks');
      }

      // Update the interface after the server confirms the request.
      setTasks([]);
    } catch (error) {
      console.error('Error clearing tasks:', error);
    }
  }

  return (
    <div className="app-container">

      {/* Display the application title and subtitle. */}
      <header className="app-header">
        <h1>Task Flow Manager</h1>
        <p>React + Express Task Manager</p>
      </header>

      <main className="app-body">

        {/* Form for creating a new task. */}
        <section className="form-card">
          <h2>Create New Task</h2>

          <form onSubmit={handleAddTask}>

            <label htmlFor="task-title">
              Task Title
            </label>

            {/* Controlled input: its value is managed by React state. */}
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Complete UI Mockup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="task-category">
              Category
            </label>

            {/* Let the user choose one of the available categories. */}
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
            </select>

            {/* Submit the form to create a task. */}
            <button type="submit">
              Add Task
            </button>

          </form>
        </section>

        {/* Dashboard showing the current tasks and available actions. */}
        <section className="list-card">

          <div className="dashboard-header">
            <h2>Task Dashboard</h2>

            {/* Show Clear All only when at least one task exists. */}
            {tasks.length > 0 && (
              <button onClick={clearAllTasks}>
                Clear All
              </button>
            )}
          </div>

          {/* Display loading, empty-list or task-list content as appropriate. */}
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks added yet.</p>
          ) : (
            <div className="task-list">

              {/* Render each task with its own controls and category badge. */}
              {tasks.map((task) => {
                // Use the task category's colours, with Work as a fallback.
                const badgeStyle =
                  categoryColors[task.category] ||
                  categoryColors.Work;

                return (
                  <div
                    className="task"
                    key={task.id}
                  >

                    <div className="task-info">

                      {/* Checkbox updates the task's completion status. */}
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          toggleComplete(task.id)
                        }
                      />

                      {/* Apply the completed class when the task is finished. */}
                      <span
                        className={
                          task.completed
                            ? 'completed'
                            : ''
                        }
                      >
                        {task.title}
                      </span>

                    </div>

                    <div className="task-actions">

                      {/* Display the category using its assigned colours. */}
                      <span
                        className="category-badge"
                        style={{
                          backgroundColor:
                            badgeStyle.bg,
                          color:
                            badgeStyle.text,
                          border:
                            `1px solid ${badgeStyle.border}`
                        }}
                      >
                        {task.category}
                      </span>

                      {/* Delete this task from the list and backend. */}
                      <button
                        onClick={() =>
                          deleteTask(task.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}
