import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import "./Books.css";

import BookCover from "../components/BookCover";

// ---- Main component ----
function Books() {

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const initialSearch = params.get("search") || "";

    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState(initialSearch);
    const [borrowingId, setBorrowingId] = useState(null);

    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {
        try {
            const response = await API.get("/books");
            setBooks(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const borrowBook = async (bookId) => {
        setBorrowingId(bookId);
        try {
            const response = await API.post(
                "/borrow",
                { bookId, dueDate: "2026-06-15" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data.message);
            fetchBooks();
        } catch (error) {
            alert(error.response?.data?.message || "Error borrowing book");
        } finally {
            setBorrowingId(null);
        }
    };

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="books-container">

            {/* Header */}
            <div className="catalog-header">
                <div>
                    <h1 className="books-title">Library Catalog</h1>
                    <p className="catalog-subtitle">
                        Browse and borrow from our collection of {books.length} titles.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="search-row">
                <div className="search-wrapper">
                    <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by title, author, or category..."
                        className="search-box"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
                {search && (
                    <p className="results-count">
                        {filteredBooks.length} result{filteredBooks.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
                    </p>
                )}
            </div>

            {/* Grid */}
            {filteredBooks.length === 0 ? (
                <div className="no-results">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p>No books match your search.</p>
                </div>
            ) : (
                <div className="books-grid">
                    {filteredBooks.map((book) => (
                        <div key={book._id} className="book-card">

                            <BookCover title={book.title} author={book.author} />

                            <div className="book-card-body">
                                <h3 className="book-title">{book.title}</h3>
                                <p className="book-meta"><span className="meta-label">Author</span> · {book.author}</p>
                                <p className="book-meta"><span className="meta-label">Category</span> · {book.category}</p>

                                <div className="book-card-footer">
                                    {book.availableCopies > 0 ? (
                                        <span className="available">{book.availableCopies} available</span>
                                    ) : (
                                        <span className="unavailable">Out of stock</span>
                                    )}

                                    {(role === "student" || role === "admin") && book.availableCopies > 0 && (
                                        <button
                                            className="borrow-btn"
                                            onClick={() => borrowBook(book._id)}
                                            disabled={borrowingId === book._id}
                                        >
                                            {borrowingId === book._id ? "Borrowing..." : "Borrow"}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Books;
