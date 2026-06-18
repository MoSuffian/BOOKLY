import { useEffect, useState } from "react";
import API from "../services/api";
import "./ManageBooks.css";

// ---- BookCover sub-component ----
function BookCover({ title, author }) {
    const [coverUrl, setCoverUrl] = useState(null);

    useEffect(() => {
        const fetchCover = async () => {
            try {
                const googleQuery = `intitle:${title}+inauthor:${author}`;
                const googleResponse = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=1`
                );

                if (googleResponse.ok) {
                    const googleData = await googleResponse.json();
                    if (googleData.items && googleData.items.length > 0) {
                        const imageLinks = googleData.items[0].volumeInfo?.imageLinks;
                        if (imageLinks?.thumbnail) {
                            setCoverUrl(imageLinks.thumbnail.replace("http:", "https:"));
                            return;
                        }
                    }
                }

                const openLibResponse = await fetch(
                    `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`
                );

                if (openLibResponse.ok) {
                    const openLibData = await openLibResponse.json();
                    if (openLibData.docs && openLibData.docs.length > 0 && openLibData.docs[0].cover_i) {
                        setCoverUrl(`https://covers.openlibrary.org/b/id/${openLibData.docs[0].cover_i}-M.jpg`);
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch cover for ${title}`, error);
            }
        };

        fetchCover();
    }, [title, author]);

    return (
        <div className="cover-wrapper">
            {coverUrl ? (
                <img src={coverUrl} alt={`${title} cover`} />
            ) : (
                <div className="cover-placeholder">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>No cover</span>
                </div>
            )}
        </div>
    );
}

// ---- Main component ----
function ManageBooks() {

    const emptyForm = {
        title: "",
        author: "",
        isbn: "",
        category: "",
        totalCopies: "",
        availableCopies: ""
    };

    const [bookData, setBookData] = useState(emptyForm);
    const [message, setMessage] = useState({ text: "", isError: false });
    const [books, setBooks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const handleChange = (e) =>
        setBookData({ ...bookData, [e.target.name]: e.target.value });

    const handleEditChange = (e) =>
        setEditData({ ...editData, [e.target.name]: e.target.value });

    const fetchBooks = async () => {
        try {
            const response = await API.get("/books");
            setBooks(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await API.post("/books", bookData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: `"${response.data.title}" added successfully.`, isError: false });
            setBookData(emptyForm);
            fetchBooks();
        } catch (error) {
            setMessage({ text: error.response?.data?.message || "Error adding book.", isError: true });
        }
    };

    const deleteBook = async (id) => {
        if (!window.confirm("Delete this book? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`/books/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: "Book deleted.", isError: false });
            fetchBooks();
        } catch (error) {
            setMessage({ text: error.response?.data?.message || "Error deleting book.", isError: true });
        }
    };

    const startEdit = (book) => {
        setEditingId(book._id);
        setEditData(book);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const updateBook = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await API.put(`/books/${id}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: "Book updated successfully.", isError: false });
            setEditingId(null);
            setEditData({});
            fetchBooks();
        } catch (error) {
            setMessage({ text: error.response?.data?.message || "Error updating book.", isError: true });
        }
    };

    return (
        <div className="manage-container">

            {/* Page header */}
            <div className="manage-header">
                <h1 className="manage-title">Manage Books</h1>
                <p className="manage-subtitle">Add new titles to the catalog or edit existing entries.</p>
            </div>

            {/* Add book form */}
            <div className="add-book-panel">
                <h2 className="panel-title">Add New Book</h2>

                {message.text && (
                    <p className={`feedback-msg${message.isError ? " error" : ""}`}>
                        {message.text}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Title</label>
                            <input className="form-input" type="text" name="title" placeholder="e.g. Atomic Habits" value={bookData.title} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Author</label>
                            <input className="form-input" type="text" name="author" placeholder="e.g. James Clear" value={bookData.author} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">ISBN</label>
                            <input className="form-input" type="text" name="isbn" placeholder="e.g. 978-0-525-57922-3" value={bookData.isbn} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Category</label>
                            <input className="form-input" type="text" name="category" placeholder="e.g. Self-Help" value={bookData.category} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Total Copies</label>
                            <input className="form-input" type="number" name="totalCopies" placeholder="e.g. 5" value={bookData.totalCopies} onChange={handleChange} required min="1" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Available Copies</label>
                            <input className="form-input" type="number" name="availableCopies" placeholder="e.g. 5" value={bookData.availableCopies} onChange={handleChange} required min="0" />
                        </div>
                    </div>

                    <button type="submit" className="btn-add">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Book
                    </button>
                </form>
            </div>

            {/* Books grid */}
            <div className="manage-grid-header">
                <h2 className="manage-section-title">All Books</h2>
                <span className="book-count-badge">{books.length} titles</span>
            </div>

            <div className="manage-books-grid">
                {books.map((book) => (
                    <div key={book._id} className="manage-book-card">

                        <BookCover title={book.title} author={book.author} />

                        {editingId === book._id ? (

                            <div className="edit-form">
                                <p className="edit-form-title">Editing</p>
                                <input className="edit-input" type="text" name="title" value={editData.title} onChange={handleEditChange} placeholder="Title" />
                                <input className="edit-input" type="text" name="author" value={editData.author} onChange={handleEditChange} placeholder="Author" />
                                <input className="edit-input" type="text" name="category" value={editData.category} onChange={handleEditChange} placeholder="Category" />
                                <input className="edit-input" type="number" name="totalCopies" value={editData.totalCopies} onChange={handleEditChange} placeholder="Total Copies" />
                                <input className="edit-input" type="number" name="availableCopies" value={editData.availableCopies} onChange={handleEditChange} placeholder="Available Copies" />

                                <div className="edit-actions">
                                    <button className="btn-save" onClick={() => updateBook(book._id)}>Save</button>
                                    <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                                </div>
                            </div>

                        ) : (

                            <div className="card-body">
                                <h3 className="card-book-title">{book.title}</h3>
                                <p className="card-meta"><strong>Author</strong> · {book.author}</p>
                                <p className="card-meta"><strong>Category</strong> · {book.category}</p>

                                <div className="copies-row">
                                    <span className="copy-badge available">{book.availableCopies} available</span>
                                    <span className="copy-badge total">{book.totalCopies} total</span>
                                </div>

                                <div className="card-actions">
                                    <button className="btn-edit" onClick={() => startEdit(book)}>Edit</button>
                                    <button className="btn-delete" onClick={() => deleteBook(book._id)}>Delete</button>
                                </div>
                            </div>

                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}

export default ManageBooks;