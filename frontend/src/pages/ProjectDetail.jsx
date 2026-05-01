import { useState, useEffect } from "react";
import { tasks, users, projects as projectsApi } from "../api";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["todo", "in_progress", "done"];
const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const DOT_CLASS = { todo: "dot-todo", in_progress: "dot-inprog", done: "dot-done" };

export default function ProjectDetail({ project, navigate }) {
  const { user } = useAuth();
  const [taskList, setTaskList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [members, setMembers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const emptyTask = { title: "", description: "", status: "todo", priority: "medium", assigned_to: "", due_date: "" };
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [memberForm, setMemberForm] = useState({ user_id: "", role: "member" });

  useEffect(() => {
    Promise.all([tasks.list(project.id), users.list(), projectsApi.getMembers(project.id)])
      .then(([t, u, m]) => { setTaskList(t); setUserList(u); setMembers(m); })
      .finally(() => setLoading(false));
  }, [project.id]);

  const handleCreateTask = async () => {
    if (!taskForm.title) { setError("Task title is required"); return; }
    try {
      const payload = {
        ...taskForm,
        project_id: project.id,
        assigned_to: user?.role === "admin"
          ? (taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null)
          : user?.id,
        due_date: taskForm.due_date || null,
      };
      if (editTask) {
        const updated = await tasks.update(editTask.id, payload);
        setTaskList(taskList.map((t) => (t.id === editTask.id ? updated : t)));
      } else {
        const newTask = await tasks.create(payload);
        setTaskList([...taskList, newTask]);
      }
      setShowTaskModal(false);
      setTaskForm(emptyTask);
      setEditTask(null);
      setError("");
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await tasks.delete(id);
    setTaskList(taskList.filter((t) => t.id !== id));
  };

  const handleStatusChange = async (task, newStatus) => {
    const updated = await tasks.update(task.id, { status: newStatus });
    setTaskList(taskList.map((t) => (t.id === task.id ? updated : t)));
  };

  const handleAddMember = async () => {
    if (!memberForm.user_id) { setError("Select a user"); return; }
    try {
      await projectsApi.addMember(project.id, { user_id: parseInt(memberForm.user_id), role: memberForm.role });
      const updated = await projectsApi.getMembers(project.id);
      setMembers(updated);
      setShowMemberModal(false);
      setMemberForm({ user_id: "", role: "member" });
      setError("");
    } catch (e) { setError(e.message); }
  };

  const openEdit = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description || "",
      status: task.status, priority: task.priority,
      assigned_to: task.assigned_to || "",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    });
    setShowTaskModal(true);
  };

  const now = new Date();
  if (loading) return <div style={{ color: "var(--text2)", padding: "48px" }}>Loading project...</div>;

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{ color: "var(--text2)", cursor: "pointer", fontSize: "0.85rem" }}
            onClick={() => navigate("projects")}
          >
            ← Projects
          </span>
          <span style={{ color: "var(--border2)" }}>/</span>
          <span className="topbar-title">{project.name}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {user?.role === "admin" && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
              + Add Member
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setTaskForm(emptyTask); setShowTaskModal(true); }}>
            + New Task
          </button>
        </div>
      </div>

      {/* Project header */}
      <div style={{ marginBottom: "24px" }}>
        <div className="page-title">{project.name}</div>
        <div className="page-subtitle">{project.description || "No description"}</div>
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: "24px", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: "600", fontSize: "0.82rem", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Team Members
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {members.map((m) => (
              <div key={m.user_id} className="user-chip">
                <div className="avatar sm">{m.name?.[0]?.toUpperCase()}</div>
                <span>{m.name}</span>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="task-board">
        {STATUSES.map((status) => {
          const col = taskList.filter((t) => t.status === status);
          return (
            <div key={status} className="task-column">
              <div className="column-header">
                <div className={`column-dot ${DOT_CLASS[status]}`} />
                <span className="column-title">{STATUS_LABELS[status]}</span>
                <span className="column-count">{col.length}</span>
              </div>

              {col.length === 0 && (
                <div style={{ color: "var(--muted)", fontSize: "0.8rem", textAlign: "center", padding: "24px 0" }}>
                  No tasks here
                </div>
              )}

              {col.map((task) => {
                const isOverdue = task.due_date && new Date(task.due_date) < now && task.status !== "done";
                return (
                  <div key={task.id} className="task-card">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {isOverdue && <span className="badge badge-high">Overdue</span>}
                    </div>

                    <div className="task-card-footer">
                      <span style={{ fontSize: "0.75rem", color: "var(--text2)", display: "flex", alignItems: "center", gap: "4px" }}>
                        {task.assignee ? (
                          <>
                            <div className="avatar sm">{task.assignee.name?.[0]?.toUpperCase()}</div>
                            {task.assignee.name}
                          </>
                        ) : "Unassigned"}
                      </span>
                      {task.due_date && (
                        <span style={{ fontSize: "0.72rem", color: isOverdue ? "var(--danger)" : "var(--muted)", fontFamily: "JetBrains Mono, monospace" }}>
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        style={{ flex: 1, fontSize: "0.75rem", padding: "5px 8px" }}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTask ? "Edit Task" : "Create New Task"}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <div className="form-group">
              <label>Task Title *</label>
              <input type="text" placeholder="What needs to be done?"
                value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={2} placeholder="Add more details..."
                value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label>Status</label>
                <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {user?.role === "admin" && (
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                  <option value="">— Unassigned</option>
                  {userList.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateTask}>
                {editTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Team Member</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <div className="form-group">
              <label>Select User</label>
              <select value={memberForm.user_id} onChange={(e) => setMemberForm({ ...memberForm, user_id: e.target.value })}>
                <option value="">— Choose a team member</option>
                {userList.filter((u) => !members.find((m) => m.user_id === u.id)).map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddMember}>Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}