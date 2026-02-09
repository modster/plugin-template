// JavaScript Data Loader Example
// This loader processes task data from a JSON file

// Load tasks from file
// In a real scenario, you would use FileAttachment
const tasks = [
  { id: 1, task: "Task 1", status: "completed", priority: "high" },
  { id: 2, task: "Task 2", status: "in-progress", priority: "medium" },
  { id: 3, task: "Task 3", status: "completed", priority: "low" }
];

// Calculate statistics
const stats = {
  total: tasks.length,
  completed: tasks.filter(t => t.status === 'completed').length,
  inProgress: tasks.filter(t => t.status === 'in-progress').length,
  byPriority: tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {})
};

// Return the processed data
return {
  tasks,
  stats
};
