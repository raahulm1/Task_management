   import React, { useEffect, useState } from "react";
   import KanbanBoard from "../components/KanbanBoard";
   import TaskForm from "../components/TaskForm";
   import { useParams } from "react-router-dom";
   import { getTasks, addTask } from "../api/tasks";

   function ProjectPage() {
     const { id } = useParams();
     const [showForm, setShowForm] = useState(false);
     const [tasks, setTasks] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem("token");
          const data = await getTasks(id, token); // Pass the token here
          setTasks(data);
        } catch (err) {
          setError("Failed to load tasks");
        } finally {
          setLoading(false);
        }
      };

     useEffect(() => {
       fetchTasks();
       // eslint-disable-next-line
     }, [id]);

      const handleAddTask = async (task) => {
        try {
          const token = localStorage.getItem("token");
          await addTask({ ...task, projectId: id }, token); // Pass the token here
          fetchTasks();
        } catch (err) {
          setError("Failed to add task");
        }
        setShowForm(false);
      };

     const handleStatusChange = (taskId, newStatus) => {
       setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
       // Optionally, call updateTask API here if you want to persist status changes
     };

     if (loading) return <div>Loading tasks...</div>;
     if (error) return <div>{error}</div>;

     return (
       <div style={{ maxWidth: 900, margin: "2rem auto" }}>
         <h2>Project {id} - Kanban Board</h2>
         <button onClick={() => setShowForm(true)}>Add Task</button>
         {showForm && <TaskForm onAdd={handleAddTask} onClose={() => setShowForm(false)} />}
         <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
       </div>
     );
   }

   export default ProjectPage;