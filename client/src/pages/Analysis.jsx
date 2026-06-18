import { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import API from "../services/api";
import "./Analysis.css";

/* ---- Warm colour palette, matching the app's brown/amber tones ---- */
const WARM_COLORS = [
    "#8b5e3c", // deep brown
    "#c4914f", // amber
    "#2d7a4a", // forest green
    "#6b4fa0", // muted purple
    "#b45309", // golden
    "#1e6fa8", // slate blue
    "#9c3a3a", // terracotta
    "#4a7a5e", // sage
];

/* ---- Custom Pie label ---- */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // skip tiny slices
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight="700" fontFamily="Inter, sans-serif">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/* ---- Custom Bar tooltip ---- */
const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: "1px solid #ede5d8", borderRadius: 8,
            padding: "10px 14px", boxShadow: "0 4px 16px rgba(60,40,20,0.1)",
            fontFamily: "Inter, sans-serif", fontSize: 12
        }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1c1410" }}>{label}</p>
            <p style={{ margin: 0, color: "#8b5e3c", fontWeight: 600 }}>
                {payload[0].value} borrow{payload[0].value !== 1 ? "s" : ""}
            </p>
        </div>
    );
};

/* ---- Custom Pie tooltip ---- */
const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: "1px solid #ede5d8", borderRadius: 8,
            padding: "10px 14px", boxShadow: "0 4px 16px rgba(60,40,20,0.1)",
            fontFamily: "Inter, sans-serif", fontSize: 12
        }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1c1410" }}>{payload[0].name}</p>
            <p style={{ margin: 0, color: "#8b5e3c", fontWeight: 600 }}>
                {payload[0].value} borrow{payload[0].value !== 1 ? "s" : ""}
            </p>
        </div>
    );
};

/* ---- Main component ---- */
function Analysis() {
    const [borrowData, setBorrowData]   = useState([]);
    const [books,      setBooks]        = useState([]);
    const [loading,    setLoading]      = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [borrowRes, booksRes] = await Promise.all([
                    API.get("/borrow",  { headers }),
                    API.get("/books"),
                ]);

                setBorrowData(borrowRes.data);
                setBooks(booksRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    /* ---- Derived stats ---- */
    const total    = borrowData.length;
    const active   = borrowData.filter((r) => !r.returned).length;
    const returned = borrowData.filter((r) =>  r.returned).length;
    const rate     = total > 0 ? Math.round((returned / total) * 100) : 0;

    /* ---- Category pie data ---- */
    const genreMap = {};
    borrowData.forEach((r) => {
        const g = r.bookId?.category || "Unknown";
        genreMap[g] = (genreMap[g] || 0) + 1;
    });
    const pieData = Object.entries(genreMap)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count);

    /* ---- Top borrowed books (bar chart + table) ---- */
    const bookMap = {};
    borrowData.forEach((r) => {
        if (!r.bookId) return;
        const id = r.bookId._id;
        if (!bookMap[id]) {
            bookMap[id] = { title: r.bookId.title, author: r.bookId.author, category: r.bookId.category, count: 0 };
        }
        bookMap[id].count++;
    });
    const topBooks = Object.values(bookMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    const maxCount = topBooks[0]?.count || 1;

    /* ---- Bar chart data (top 6 for readability) ---- */
    const barData = topBooks.slice(0, 6).map((b) => ({
        name: b.title.length > 20 ? b.title.slice(0, 18) + "…" : b.title,
        borrows: b.count,
    }));

    /* ---- Loading state ---- */
    if (loading) {
        return (
            <div className="analytics-container">
                <div className="an-state">
                    <div className="an-spinner" />
                    <span>Loading analytics…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-container">

            {/* Page header */}
            <div className="analytics-header">
                <h1 className="analytics-title">Borrowing Analytics</h1>
                <p className="analytics-subtitle">
                    A snapshot of library activity — borrowing trends, popular genres, and top titles.
                </p>
            </div>

            {/* Stat cards */}
            <div className="analytics-stats">

                <div className="an-stat-card">
                    <div className="an-stat-icon an-stat-icon--total">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                    </div>
                    <div>
                        <p className="an-stat-label">Total Borrowings</p>
                        <h2 className="an-stat-value">{total}</h2>
                    </div>
                </div>

                <div className="an-stat-card">
                    <div className="an-stat-icon an-stat-icon--active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div>
                        <p className="an-stat-label">Active</p>
                        <h2 className="an-stat-value">{active}</h2>
                    </div>
                </div>

                <div className="an-stat-card">
                    <div className="an-stat-icon an-stat-icon--returned">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div>
                        <p className="an-stat-label">Returned</p>
                        <h2 className="an-stat-value">{returned}</h2>
                    </div>
                </div>

                <div className="an-stat-card">
                    <div className="an-stat-icon an-stat-icon--rate">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div>
                        <p className="an-stat-label">Return Rate</p>
                        <h2 className="an-stat-value">{rate}%</h2>
                    </div>
                </div>

                <div className="an-stat-card">
                    <div className="an-stat-icon an-stat-icon--total">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                    </div>
                    <div>
                        <p className="an-stat-label">Titles in Catalog</p>
                        <h2 className="an-stat-value">{books.length}</h2>
                    </div>
                </div>

            </div>

            {/* Charts: Pie + Bar */}
            {total === 0 ? (
                <div className="an-state">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c4a882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span>No borrowing records yet — charts will appear once books are borrowed.</span>
                </div>
            ) : (
                <>
                    <div className="charts-grid">

                        {/* Pie chart — genre breakdown */}
                        <div className="chart-panel">
                            <div className="chart-panel-header">
                                <h2 className="chart-panel-title">Genre Breakdown</h2>
                                <p className="chart-panel-desc">Borrowings by book category</p>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="count"
                                        nameKey="genre"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        innerRadius={48}
                                        labelLine={false}
                                        label={renderPieLabel}
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={WARM_COLORS[i % WARM_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => (
                                            <span style={{ color: "#3d2e20", fontSize: 12, fontFamily: "Inter, sans-serif" }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar chart — top books */}
                        {barData.length > 0 && (
                            <div className="chart-panel">
                                <div className="chart-panel-header">
                                    <h2 className="chart-panel-title">Most Borrowed Titles</h2>
                                    <p className="chart-panel-desc">Top 6 books by borrow count</p>
                                </div>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart
                                        data={barData}
                                        margin={{ top: 4, right: 8, left: -18, bottom: 48 }}
                                        barCategoryGap="35%"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e8de" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 10, fill: "#8b7355", fontFamily: "Inter, sans-serif" }}
                                            angle={-35}
                                            textAnchor="end"
                                            interval={0}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 10, fill: "#8b7355", fontFamily: "Inter, sans-serif" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(139,94,60,0.06)" }} />
                                        <Bar dataKey="borrows" radius={[5, 5, 0, 0]}>
                                            {barData.map((_, i) => (
                                                <Cell key={i} fill={WARM_COLORS[i % WARM_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                    </div>

                    {/* Top books ranked table */}
                    {topBooks.length > 0 && (
                        <div className="top-books-panel">
                            <div className="chart-panel-header">
                                <h2 className="chart-panel-title">Top Borrowed Books</h2>
                                <p className="chart-panel-desc">Ranked by total borrow count across all members</p>
                            </div>
                            <table className="top-books-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Popularity</th>
                                        <th style={{ textAlign: "right" }}>Borrows</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topBooks.map((book, i) => (
                                        <tr key={i}>
                                            <td className="tb-rank">{i + 1}</td>
                                            <td>
                                                <p className="tb-title">{book.title}</p>
                                                <p className="tb-author">{book.author}</p>
                                            </td>
                                            <td>
                                                <span className="tb-category-badge">{book.category || "—"}</span>
                                            </td>
                                            <td className="tb-bar-cell">
                                                <div className="tb-bar-track">
                                                    <div
                                                        className="tb-bar-fill"
                                                        style={{ width: `${Math.round((book.count / maxCount) * 100)}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="tb-count">{book.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

export default Analysis;