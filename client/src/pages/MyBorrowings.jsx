import { useEffect, useState } from "react";
import API from "../services/api";
import BookCover from "../components/BookCover";
import "./MyBorrowings.css";

function MyBorrowings() {
    const [borrowings, setBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);
    const [filter, setFilter] = useState("all"); // "all" | "active" | "returned"

    useEffect(() => {
        fetchBorrowings();
    }, []);

    const fetchBorrowings = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await API.get("/borrow/my", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBorrowings(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const returnBook = async (borrowId) => {
        setReturningId(borrowId);
        try {
            const token = localStorage.getItem("token");
            await API.put(`/borrow/${borrowId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBorrowings();
        } catch (error) {
            alert(error.response?.data?.message || "Return Failed");
        } finally {
            setReturningId(null);
        }
    };

    const isOverdue = (dueDate, returned) =>
        !returned && new Date(dueDate) < new Date();

    const active    = borrowings.filter(b => !b.returned);
    const returned  = borrowings.filter(b =>  b.returned);
    const overdue   = borrowings.filter(b => isOverdue(b.dueDate, b.returned));

    const filtered = filter === "all"
        ? borrowings
        : filter === "active"
        ? active
        : returned;

    if (loading) {
        return (
            <div className="mb-container">
                <div className="mb-loading">
                    <div className="mb-spinner" />
                    <span>Loading your borrowings…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-container">

            {/* Page header */}
            <div className="mb-header">
                <div>
                    <h1 className="mb-title">My Borrowings</h1>
                    <p className="mb-subtitle">
                        Track every book you've borrowed, active loans, and your return history.
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="mb-stats">
                <div className="mb-stat-card">
                    <div className="mb-stat-icon mb-icon--total">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                    </div>
                    <div className="mb-stat-content">
                        <p className="mb-stat-label">Total Borrowed</p>
                        <p className="mb-stat-value">{borrowings.length}</p>
                    </div>
                </div>
                <div className="mb-stat-card">
                    <div className="mb-stat-icon mb-icon--active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div className="mb-stat-content">
                        <p className="mb-stat-label">Currently Active</p>
                        <p className="mb-stat-value">{active.length}</p>
                    </div>
                </div>
                <div className="mb-stat-card">
                    <div className="mb-stat-icon mb-icon--returned">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div className="mb-stat-content">
                        <p className="mb-stat-label">Returned</p>
                        <p className="mb-stat-value">{returned.length}</p>
                    </div>
                </div>
                {overdue.length > 0 && (
                    <div className="mb-stat-card mb-stat-card--overdue">
                        <div className="mb-stat-icon mb-icon--overdue">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        </div>
                        <div className="mb-stat-content">
                            <p className="mb-stat-label">Overdue</p>
                            <p className="mb-stat-value">{overdue.length}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter tabs + table panel */}
            <div className="mb-panel">
                <div className="mb-panel-header">
                    <h2 className="mb-panel-title">Borrowing History</h2>
                    <div className="mb-filters">
                        {["all", "active", "returned"].map(f => (
                            <button
                                key={f}
                                className={`mb-filter-btn ${filter === f ? "active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === "all" ? "All" : f === "active" ? "Active" : "Returned"}
                                <span className="mb-filter-count">
                                    {f === "all" ? borrowings.length : f === "active" ? active.length : returned.length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="mb-empty">
                        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <p>No borrowings found.</p>
                    </div>
                ) : (
                    <div className="mb-table-scroll">
                        <table className="mb-table">
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>Category</th>
                                    <th>Borrowed On</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(item => {
                                    const over = isOverdue(item.dueDate, item.returned);
                                    return (
                                        <tr key={item._id}>
                                            <td>
                                                <div className="mb-book-cell">
                                                    <div className="mb-mini-cover">
                                                        <BookCover title={item.bookId?.title} author={item.bookId?.author} />
                                                    </div>
                                                    <div>
                                                        <p className="mb-book-title">{item.bookId?.title || "—"}</p>
                                                        <p className="mb-book-author">{item.bookId?.author || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="mb-category-badge">{item.bookId?.category || "—"}</span>
                                            </td>
                                            <td className="mb-date">
                                                {item.borrowDate
                                                    ? new Date(item.borrowDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                                                    : "—"}
                                            </td>
                                            <td className={`mb-date ${over ? "mb-date--overdue" : ""}`}>
                                                {new Date(item.dueDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                                {over && <span className="mb-overdue-tag">Overdue</span>}
                                            </td>
                                            <td>
                                                {item.returned ? (
                                                    <span className="mb-status mb-status--returned">Returned</span>
                                                ) : (
                                                    <span className="mb-status mb-status--active">Active</span>
                                                )}
                                            </td>
                                            <td>
                                                {!item.returned && (
                                                    <button
                                                        className="mb-return-btn"
                                                        onClick={() => returnBook(item._id)}
                                                        disabled={returningId === item._id}
                                                    >
                                                        {returningId === item._id ? "Returning…" : "Return"}
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
        </div>
    );
}

export default MyBorrowings;