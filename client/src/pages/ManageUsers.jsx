import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./ManageUsers.css";

/* ---- helpers ---- */
function initials(name = "") {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/* ---- Toast component ---- */
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`mu-toast mu-toast--${type}`}>
            {type === "success" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            )}
            {message}
        </div>
    );
}

/* ---- Main page ---- */
export default function ManageUsers() {
    const navigate = useNavigate();
    const role     = localStorage.getItem("role");
    const myToken  = localStorage.getItem("token");

    // Decode current user id from JWT payload (to grey-out own row)
    const myId = (() => {
        try { return JSON.parse(atob(myToken.split(".")[1])).id; }
        catch { return null; }
    })();

    const [users,   setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [search,  setSearch]  = useState("");
    const [filter,  setFilter]  = useState("all"); // all | admin | student
    const [busy,    setBusy]    = useState({});     // userId → true while in-flight
    const [toast,   setToast]   = useState(null);   // { message, type }

    // Redirect non-admins
    useEffect(() => {
        if (role !== "admin") navigate("/dashboard");
    }, [role, navigate]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await API.get("/users", {
                headers: { Authorization: `Bearer ${myToken}` },
            });
            setUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load users.");
        } finally {
            setLoading(false);
        }
    }, [myToken]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const showToast = (message, type = "success") => setToast({ message, type });

    const handleRoleChange = async (userId, newRole) => {
        setBusy((b) => ({ ...b, [userId]: true }));
        try {
            const res = await API.patch(`/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${myToken}` },
            });
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? res.data.user : u))
            );
            showToast(res.data.message, "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Update failed.", "error");
        } finally {
            setBusy((b) => ({ ...b, [userId]: false }));
        }
    };

    /* ---- filtering ---- */
    const visible = users.filter((u) => {
        const matchRole   = filter === "all" || u.role === filter;
        const q           = search.toLowerCase();
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        return matchRole && matchSearch;
    });

    /* ---- render ---- */
    return (
        <div className="mu-page">

            {/* Page header */}
            <div className="mu-header">
                <h1 className="mu-title">Manage Users</h1>
                <p className="mu-subtitle">
                    Promote or demote member accounts — changes take effect immediately.
                </p>
            </div>

            {/* Search + filter toolbar */}
            <div className="mu-toolbar">
                <div className="mu-search-wrapper">
                    <svg className="mu-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        id="mu-search"
                        type="text"
                        className="mu-search-input"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    id="mu-filter"
                    className="mu-filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All roles</option>
                    <option value="admin">Admins only</option>
                    <option value="student">Students only</option>
                </select>

                <span className="mu-count-badge">
                    {visible.length} of {users.length} members
                </span>
            </div>

            {/* Section header + table card */}
            <div className="mu-section-header">
                <h2 className="mu-section-title">All Members</h2>
            </div>

            <div className="mu-card">
                {loading ? (
                    <div className="mu-state">
                        <div className="mu-spinner" />
                        <span>Loading members…</span>
                    </div>
                ) : error ? (
                    <div className="mu-state">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span style={{ color: "#c0392b" }}>{error}</span>
                        <button className="mu-action-btn mu-btn-promote" onClick={fetchUsers} style={{ marginTop: "4px" }}>
                            Retry
                        </button>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="mu-state">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c4a882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>No members found.</span>
                    </div>
                ) : (
                    <div className="mu-table-wrapper">
                        <table className="mu-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((user) => {
                                    const isSelf  = user._id === myId;
                                    const isAdmin = user.role === "admin";
                                    const isBusy  = !!busy[user._id];

                                    return (
                                        <tr key={user._id}>

                                            {/* Member name + email */}
                                            <td>
                                                <div className="mu-user-cell">
                                                    <div className={`mu-avatar mu-avatar--${user.role}`}>
                                                        {initials(user.name)}
                                                    </div>
                                                    <div>
                                                        <p className="mu-user-name">{user.name}</p>
                                                        <p className="mu-user-email">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role badge */}
                                            <td>
                                                <span className={`mu-role-badge mu-role-badge--${user.role}`}>
                                                    {isAdmin ? (
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5L12 1z" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                    )}
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>

                                            {/* Join date */}
                                            <td>
                                                <span className="mu-date">{formatDate(user.createdAt)}</span>
                                            </td>

                                            {/* Action */}
                                            <td>
                                                {isSelf ? (
                                                    <span className="mu-action-btn mu-btn-self">You</span>
                                                ) : isAdmin ? (
                                                    <button
                                                        id={`demote-${user._id}`}
                                                        className="mu-action-btn mu-btn-demote"
                                                        disabled={isBusy}
                                                        onClick={() => handleRoleChange(user._id, "student")}
                                                    >
                                                        {isBusy ? "Saving…" : "Demote to Student"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        id={`promote-${user._id}`}
                                                        className="mu-action-btn mu-btn-promote"
                                                        disabled={isBusy}
                                                        onClick={() => handleRoleChange(user._id, "admin")}
                                                    >
                                                        {isBusy ? "Saving…" : "Promote to Admin"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
