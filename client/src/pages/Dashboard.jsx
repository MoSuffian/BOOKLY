import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

// Curated book & library quotes — always available offline
const FALLBACK_QUOTES = [
    { content: "A library is a place where history comes to life.", author: "Angela Davis" },
    { content: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
    { content: "Libraries are the wardrobes of literature, whence men, properly informed, might bring forth something for ornament, much for curiosity, and more for use.", author: "William Dyer" },
    { content: "So many books, so little time.", author: "Frank Zappa" },
    { content: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { content: "In the library I felt better, words you could trust and look at till you understood them.", author: "Jeanette Winterson" },
    { content: "A library is not a luxury but one of the necessities of life.", author: "Henry Ward Beecher" },
    { content: "Libraries store the energy that fuels the imagination.", author: "Sidney Sheldon" },
    { content: "Google can bring you back 100,000 answers. A librarian can bring you back the right one.", author: "Neil Gaiman" },
    { content: "I cannot live without books.", author: "Thomas Jefferson" },
    { content: "One must always be careful of books, and what is inside them, for words have the power to change us.", author: "Cassandra Clare" },
    { content: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
];

// ---- Mini cover fetcher for dashboard rows ----
function MiniCover({ title, author }) {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        if (!title) return;
        const fetch_ = async () => {
            try {
                const q = `intitle:${title}+inauthor:${author}`;
                const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1`);
                if (r.ok) {
                    const d = await r.json();
                    const thumb = d.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
                    if (thumb) { setUrl(thumb.replace("http:", "https:")); return; }
                }
                const r2 = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
                if (r2.ok) {
                    const d2 = await r2.json();
                    const cid = d2.docs?.[0]?.cover_i;
                    if (cid) setUrl(`https://covers.openlibrary.org/b/id/${cid}-S.jpg`);
                }
            } catch (_) {}
        };
        fetch_();
    }, [title, author]);

    return (
        <div className="mini-cover">
            {url
                ? <img src={url} alt={title} />
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            }
        </div>
    );
}

// ---- Mini card cover for Recently Added ----
function RecentCover({ title, author }) {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        if (!title) return;
        const fetch_ = async () => {
            try {
                const q = `intitle:${title}+inauthor:${author}`;
                const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1`);
                if (r.ok) {
                    const d = await r.json();
                    const thumb = d.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
                    if (thumb) { setUrl(thumb.replace("http:", "https:")); return; }
                }
                const r2 = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
                if (r2.ok) {
                    const d2 = await r2.json();
                    const cid = d2.docs?.[0]?.cover_i;
                    if (cid) setUrl(`https://covers.openlibrary.org/b/id/${cid}-M.jpg`);
                }
            } catch (_) {}
        };
        fetch_();
    }, [title, author]);

    return (
        <div className="recent-cover">
            {url
                ? <img src={url} alt={title} />
                : <div className="recent-cover-placeholder">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
            }
        </div>
    );
}

// ---- Main component ----
function Dashboard() {

    const [history, setHistory] = useState([]);
    const [books, setBooks] = useState([]);
    const [heroSearch, setHeroSearch] = useState("");
    // Lazy init: pick a random fallback immediately so the banner always shows
    const [quote, setQuote] = useState(
        () => FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
    );

    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const endpoint = role === "admin" ? "/borrow" : "/borrow/my";
                const response = await API.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [role]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await API.get("/books");
                setBooks(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchBooks();
    }, []);

    useEffect(() => {
        // Try to fetch a fresh quote from the API; silently fall back to
        // the already-set local quote if the network call fails.
        const fetchQuote = async () => {
            try {
                const r = await fetch(
                    "https://api.quotable.io/random?tags=books%7Creading%7Cliterature&maxLength=160"
                );
                if (r.ok) {
                    const d = await r.json();
                    if (d.content && d.author) {
                        setQuote({ content: d.content, author: d.author });
                    }
                }
            } catch (_) {
                // Network error — local quote already displayed, nothing to do
            }
        };
        fetchQuote();
    }, []);

    const totalBorrowings = history.length;
    const returnedBooks = history.filter((r) => r.returned).length;
    const activeBorrowings = history.filter((r) => !r.returned).length;

    // Take last 5 books as "recently added"
    const recentBooks = [...books].reverse().slice(0, 5);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    const handleHeroSearch = (e) => {
        e.preventDefault();
        if (heroSearch.trim()) {
            navigate(`/books?search=${encodeURIComponent(heroSearch.trim())}`);
        } else {
            navigate("/books");
        }
    };

    return (
        <div className="dashboard-container">

            {/* Hero Banner */}
            <div
                className="hero-banner"
                style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-bg.png)` }}
            >
                <div className="hero-content">
                    <p className="hero-greeting">{greeting()}, {name}</p>
                    <h1 className="hero-title">Welcome back!</h1>
                    <p className="hero-subtitle">Here's what's happening in your library today.</p>

                    <form className="hero-search-form" onSubmit={handleHeroSearch}>
                        <div className="hero-search-wrapper">
                            <svg className="hero-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="hero-search-input"
                                placeholder="Search by title, author, ISBN or category..."
                                value={heroSearch}
                                onChange={(e) => setHeroSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="hero-search-btn">Search</button>
                    </form>
                </div>
            </div>

            {/* Stats row */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon stat-icon--total">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Borrowings</p>
                        <h2 className="stat-value">{totalBorrowings}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Active Borrowings</p>
                        <h2 className="stat-value">{activeBorrowings}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--returned">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Returned Books</p>
                        <h2 className="stat-value">{returnedBooks}</h2>
                    </div>
                </div>
            </div>

            {/* Bottom two-column section */}
            <div className="bottom-row">

                {/* Left — Recently Added Books */}
                <div className="panel panel-left">
                    <div className="panel-header">
                        <h2 className="panel-title">Recently Added Books</h2>
                        <button className="view-all-btn" onClick={() => navigate("/books")}>View all</button>
                    </div>

                    {recentBooks.length === 0 ? (
                        <div className="empty-state">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c4a882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                            <p>No books in catalog yet.</p>
                        </div>
                    ) : (
                        <div className="recent-books-row">
                            {recentBooks.map((book) => (
                                <div key={book._id} className="recent-book-card" onClick={() => navigate("/books")}>
                                    <RecentCover title={book.title} author={book.author} />
                                    <p className="recent-book-title">{book.title}</p>
                                    <p className="recent-book-author">{book.author}</p>
                                    <p className="recent-book-category">{book.category}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right — Borrow History (scrollable) */}
                <div className="panel panel-right">
                    <div className="panel-header">
                        <h2 className="panel-title">
                            {role === "admin" ? "Borrowed Books" : "My Borrowings"}
                        </h2>
                        <span className="panel-count">{history.length} records</span>
                    </div>

                    {history.length === 0 ? (
                        <div className="empty-state">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c4a882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                            <p>No borrowing records found.</p>
                        </div>
                    ) : (
                        <div className="history-scroll">
                            <table className="records-table">
                                <thead>
                                    <tr>
                                        <th>Book</th>
                                        {role === "admin" && <th>Member</th>}
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record) => (
                                        <tr key={record._id}>
                                            <td>
                                                <div className="td-book-cell">
                                                    <MiniCover title={record.bookId?.title} author={record.bookId?.author} />
                                                    <div>
                                                        <p className="td-book">{record.bookId?.title}</p>
                                                        <p className="td-author">{record.bookId?.author}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {role === "admin" && (
                                                <td>
                                                    <p className="td-name">{record.userId?.name}</p>
                                                    <p className="td-id">{record.userId?.email?.split("@")[0]}</p>
                                                </td>
                                            )}
                                            <td className="td-date">
                                                {new Date(record.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td>
                                                <span className={record.returned ? "status-badge status-returned" : "status-badge status-borrowed"}>
                                                    {record.returned ? "Returned" : "Borrowed"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* Quote Banner */}
            {quote.content && (
                <div
                    className="quote-banner"
                    style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/quote-bg.png)` }}
                >
                    <div className="quote-banner-overlay" />
                    <div className="quote-body">
                        <span className="quote-mark">&ldquo;&rdquo;</span>
                        <div className="quote-text-wrap">
                            <p className="quote-text">{quote.content}</p>
                            <p className="quote-author">&mdash; {quote.author}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Dashboard;
