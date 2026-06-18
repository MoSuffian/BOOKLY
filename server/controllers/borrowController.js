const Borrow = require("../models/Borrow");
const Book = require("../models/Book");

// Borrow Book
const borrowBook = async (req, res) => {
    try {

        const userId = req.user.id;
        const { bookId, dueDate } = req.body;

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({
                message: "No copies available"
            });
        }

        // Prevent duplicate borrow
        const existingBorrow = await Borrow.findOne({
            userId,
            bookId,
            returned: false
        });

        if (existingBorrow) {
            return res.status(400).json({
                message: "You already borrowed this book"
            });
        }

        const borrow = await Borrow.create({
            userId,
            bookId,
            dueDate,
            returned: false
        });

        book.availableCopies -= 1;
        await book.save();

        res.status(201).json({
            message: "Book borrowed successfully",
            borrow
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// Return Book
const returnBook = async (req, res) => {
    try {

        const borrow = await Borrow.findById(req.params.id);

        if (!borrow) {
            return res.status(404).json({
                message: "Borrow record not found"
            });
        }

        if (borrow.returned) {
            return res.status(400).json({
                message: "Book already returned"
            });
        }

        borrow.returned = true;
        await borrow.save();

        const book = await Book.findById(borrow.bookId);

        if (book) {
            book.availableCopies += 1;
            await book.save();
        }

        res.json({
            message: "Book Returned Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// Admin - View All Borrow History
const getBorrowHistory = async (req, res) => {
    try {

        const history = await Borrow.find()
            .populate("userId", "name email")
            .populate("bookId", "title author category");

        res.json(history);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// Student - View Only Own Borrowings
const getMyBorrowings = async (req, res) => {
    try {

        const borrowings = await Borrow.find({
            userId: req.user.id
        })
        .populate(
            "bookId",
            "title author category availableCopies"
        );

        res.json(borrowings);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    borrowBook,
    returnBook,
    getBorrowHistory,
    getMyBorrowings
};