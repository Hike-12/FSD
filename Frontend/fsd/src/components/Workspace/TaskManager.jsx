import React, { useEffect, useState } from "react";
import {DJANGO_BASE_URL} from "@/lib/utils";
import { useParams } from "react-router-dom";

const TaskManager = () => {
  const { teamId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "" });
  const [progress, setProgress] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/teams/${teamId}/tasks/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch tasks");

        const data = await response.json();
        console.log("Fetched tasks:", data); // Debugging line
        setTasks(data.tasks || []);
        calculateProgress(data.tasks || []);
      } catch (err) {
        console.error(err.message);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/teams/${teamId}/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch team members");

        const data = await response.json();
        setTeamMembers(data.members || []);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchTasks();
    fetchTeamMembers();
  }, [teamId]);

  const calculateProgress = (tasks) => {
    const completedTasks = tasks.filter((task) => task.is_completed).length;
    setProgress((completedTasks / tasks.length) * 100 || 0);
  };

  const handleToggleTaskStatus = async (taskId, isCompleted) => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/tasks/${taskId}/update-status/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: new URLSearchParams({ is_completed: !isCompleted }),
      });

      if (!response.ok) throw new Error("Failed to update task status");

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, is_completed: !isCompleted } : task
        )
      );
      calculateProgress(
        tasks.map((task) =>
          task.id === taskId ? { ...task, is_completed: !isCompleted } : task
        )
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/teams/${teamId}/tasks/create/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: new URLSearchParams({
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assignedTo,
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const data = await response.json();
      setTasks((prev) => [...prev, { ...newTask, id: data.task_id, is_completed: false }]);
      setNewTask({ title: "", description: "", assignedTo: "" });
      calculateProgress([...tasks, { ...newTask, is_completed: false }]);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/tasks/${editingTask.id}/edit/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: new URLSearchParams({
          title: editingTask.title,
          description: editingTask.description,
          assigned_to: editingTask.assigned_to,
        }),
      });

      if (!response.ok) throw new Error("Failed to edit task");

      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? editingTask : task))
      );
      setEditingTask(null);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/tasks/${taskId}/delete/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      calculateProgress(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Task Manager</h2>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-blue-500">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Task List */}
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`p-4 rounded-lg shadow ${
              task.is_completed ? "bg-green-100" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <p className="text-sm text-gray-500">
                  Assigned to: {task.assigned_to || "Unassigned"}
                </p>
              </div>
              <div className="flex space-x-2">

                {/* Toggle Task Completion */}
                <button
                onClick={() => handleToggleTaskStatus(task.id, task.is_completed)}
                className={`px-4 py-2 rounded-lg text-white ${
                  task.is_completed ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {task.is_completed ? "Mark Incomplete" : "Mark Complete"}
              </button>

                <button
                  onClick={() => setEditingTask(task)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Create/Edit Task Form */}
      <form onSubmit={editingTask ? handleEditTask : handleCreateTask} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={editingTask ? editingTask.title : newTask.title}
            onChange={(e) =>
              editingTask
                ? setEditingTask({ ...editingTask, title: e.target.value })
                : setNewTask({ ...newTask, title: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={editingTask ? editingTask.description : newTask.description}
            onChange={(e) =>
              editingTask
                ? setEditingTask({ ...editingTask, description: e.target.value })
                : setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assign To</label>
          <select
            value={editingTask ? editingTask.assigned_to : newTask.assignedTo}
            onChange={(e) =>
              editingTask
                ? setEditingTask({ ...editingTask, assigned_to: e.target.value })
                : setNewTask({ ...newTask, assignedTo: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {editingTask ? "Update Task" : "Create Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskManager;