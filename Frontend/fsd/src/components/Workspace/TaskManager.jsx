import React, { useEffect, useState } from "react";
import { DJANGO_BASE_URL } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle, AlertCircle, Edit, Trash, Plus, X, CheckSquare, Square } from 'lucide-react';

// Custom Progress Bar Component
const ProgressBar = ({ value, className }) => {
  return (
    <div className={`relative w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

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
        console.log("Fetched tasks:", data);
        setTasks(data.tasks || []);
        calculateProgress(data.tasks || []);
      } catch (err) {
        console.error(err.message);
        toast.error("Could not fetch tasks. Please try again later.");
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
        toast.error("Could not fetch team members. Please try again later.");
      }
    };

    fetchTasks();
    fetchTeamMembers();
  }, [teamId]);

  const calculateProgress = (tasks) => {
    if (tasks.length === 0) {
      setProgress(0);
      return;
    }
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

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: !isCompleted } : task
      );
      
      setTasks(updatedTasks);
      calculateProgress(updatedTasks);
      toast.success(`Task marked as ${!isCompleted ? 'complete' : 'incomplete'}`);
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to update task status. Please try again.");
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
      const updatedTasks = [...tasks, { 
        ...newTask, 
        id: data.task_id, 
        is_completed: false,
        assigned_to: newTask.assignedTo
      }];
      
      setTasks(updatedTasks);
      setNewTask({ title: "", description: "", assignedTo: "" });
      calculateProgress(updatedTasks);
      toast.success("Task created successfully!");
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to create task. Please try again.");
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

      const updatedTasks = tasks.map((task) => 
        (task.id === editingTask.id ? editingTask : task)
      );
      
      setTasks(updatedTasks);
      setEditingTask(null);
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to update task. Please try again.");
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

      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      calculateProgress(updatedTasks);
      toast.success("Task deleted successfully!");
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen p-6">
      <ToastContainer position="top-right" theme="dark" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold mb-8 text-white text-center"
        >
          Task Manager
        </motion.h2>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-200">Task Completion</span>
            <span className="text-sm font-medium text-blue-300">{progress.toFixed(0)}%</span>
          </div>
          <ProgressBar value={progress} className="h-2 bg-blue-900/40" />
        </div>

        {/* Task List */}
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 mb-8"
        >
          {tasks.length === 0 ? (
            <motion.p 
              variants={itemVariants}
              className="text-center text-blue-300/70 py-8 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl"
            >
              No tasks yet. Create your first task below!
            </motion.p>
          ) : (
            tasks.map((task) => (
              <motion.li
                key={task.id}
                variants={itemVariants}
                className={`backdrop-blur-md border rounded-xl p-5 transition-all duration-300 ${
                  task.is_completed ? "bg-green-900/10 border-green-500/30" : "bg-white/5 border-blue-500/20"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.is_completed)}
                      className={`mt-1 flex-shrink-0 ${task.is_completed ? "text-green-400" : "text-blue-300"}`}
                    >
                      {task.is_completed ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </button>
                    <div>
                      <h3 className={`font-bold text-lg ${task.is_completed ? "text-green-300" : "text-white"}`}>
                        {task.title}
                      </h3>
                      <p className="text-blue-100/70 mt-1">{task.description}</p>
                      <p className="text-xs text-blue-200/50 mt-2">
                        Assigned to: {task.assigned_to || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))
          )}
        </motion.ul>

        {/* Create/Edit Task Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-5">
            {editingTask ? "Update Task" : "Create New Task"}
          </h3>
          
          <form onSubmit={editingTask ? handleEditTask : handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Title</label>
              <input
                type="text"
                value={editingTask ? editingTask.title : newTask.title}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, title: e.target.value })
                    : setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-700/50 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Description</label>
              <textarea
                value={editingTask ? editingTask.description : newTask.description}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, description: e.target.value })
                    : setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-700/50 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter task description"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Assign To</label>
              <select
                value={editingTask ? editingTask.assigned_to : newTask.assignedTo}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, assigned_to: e.target.value })
                    : setNewTask({ ...newTask, assignedTo: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-blue-900/40 border border-blue-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {editingTask ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Update Task
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Task
                  </>
                )}
              </button>
              
              {editingTask && (
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-3 bg-red-500/20 text-red-300 border border-red-500/20 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TaskManager;