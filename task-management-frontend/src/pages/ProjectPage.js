import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, createTask, updateTaskStatus } from "../features/tasks/tasksSlice";
import { fetchProjects } from "../features/projects/projectsSlice";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import ListView from "../components/ListView";
import Overview from "../components/Overview";
import ProjectNavigation from "../components/ProjectNavigation";
import EditTaskModal from "../components/EditTaskModal";
import { getProjectById } from "../api/projects";
import { getSections } from "../api/sections";
import { getUsers } from "../api/users";
import { useKeycloak } from '@react-keycloak/web';

function ProjectPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  const { list: tasks, loading, error } = useSelector((state) => state.tasks);
  const { list: projects, loading: projectsLoading, error: projectsError } = useSelector((state) => state.projects);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [activeView, setActiveView] = useState("list"); // Default to board view
  const [collapsed, setCollapsed] = useState(false);
  const [sections, setSections] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchProjectName = async () => {
    try {
      const project = await getProjectById(id, keycloak.token);
      setProjectName(project.name);
    } catch (err) {
      setProjectName("");
    }
  };

  useEffect(() => {
    if (keycloak.authenticated) {
      dispatch(fetchTasks({ projectId: id, token: keycloak.token }));
      if (projects.length === 0) {
        dispatch(fetchProjects(keycloak.token));
      }
    }
  }, [dispatch, id, keycloak, projects.length]);

  useEffect(() => {
    fetchProjectName();
    // eslint-disable-next-line
  }, [id, keycloak.token]);

  // Fetch sections for this project
  const fetchSections = async () => {
    if (!keycloak.token) return;
    try {
      const data = await getSections(id, keycloak.token);
      setSections(data);
    } catch {
      setSections([]);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line
  }, [id, keycloak.token]);

  useEffect(() => {
    if (keycloak && keycloak.token) {
      getUsers(keycloak.token).then(setUsers).catch(() => setUsers([]));
    }
  }, [keycloak]);

  // Group tasks by sectionId
  const groupedSections = React.useMemo(() => {
    if (!sections || sections.length === 0) {
      return [
        { name: 'Main Section', tasks: tasks.filter(t => !t.sectionId) }
      ];
    }
    return sections.map(section => ({
      name: section.name,
      id: section.id,
      tasks: tasks.filter(t => t.sectionId === section.id)
    }));
  }, [sections, tasks]);

  const handleAddTask = async (task) => {
    // If task is an event (from Add Task button), ignore
    if (typeof task?.preventDefault === 'function') return;
    // Ensure projectId and sectionId are set
    const payload = { ...task, projectId: id };
    await dispatch(createTask({ task: payload, projectId: id, token: keycloak.token }));
    // Optionally, refresh tasks after creation
    dispatch(fetchTasks({ projectId: id, token: keycloak.token }));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ taskId, newStatus, projectId: id, token: keycloak.token }));
  };

  const handleAddTaskClick = () => {
    navigate(`/project/${id}/add-task`);
  };
  const handleFilter = () => alert('Filter (to be implemented)');
  const handleSort = () => alert('Sort (to be implemented)');
  const handleSearch = () => {};
  const handleOptions = () => alert('Options (to be implemented)');

  const renderView = () => {
    if (loading) {
      return <p className="text-center">Loading tasks...</p>;
    }
    
    if (error) {
      return <p className="text-danger text-center">{error}</p>;
    }

    switch (activeView) {
      case "overview":
        return <Overview tasks={tasks} projectName={projectName} />;
      case "list":
        return <ListView
          tasks={tasks}
          projectName={projectName}
          onStatusChange={handleStatusChange}
          onAddTask={handleAddTask}
          onFilter={handleFilter}
          onSort={handleSort}
          onSearch={handleSearch}
          onOptions={handleOptions}
          sections={groupedSections}
          projectId={id}
          onSectionCreated={fetchSections}
          users={users}
        />;
      case "board":
        return <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />;
      default:
        return <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />;
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e", color: "white" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} projects={projects} loading={projectsLoading} error={projectsError} showProjects={true}
        sections={sections.map(s => ({ id: s.id, name: s.name }))}
      />

      <div className="flex-grow-1 p-4">
        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
          <ProjectNavigation 
            activeView={activeView} 
            onViewChange={setActiveView} 
            projectName={projectName}
          />

          {/* Add Task button row, left-aligned */}
          <div className="d-flex align-items-center mb-3">
            <button className="btn btn-success" onClick={handleAddTaskClick}>
              <i className="bi bi-plus-lg me-2"></i> Add Task
            </button>
          </div>

          {renderView()}
        </div>
      </div>
      {/* Edit Task Modal */}
      <EditTaskModal users={users} sections={sections} />
    </div>
  );
}

export default ProjectPage;