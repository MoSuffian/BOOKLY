const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const mongoose = require("mongoose");

const addBook = async (req, res) => {
    try {

        const book = await Book.create(req.body);

        res.status(201).json(book);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getBooks = async (req, res) => {
    try {

        const books = await Book.find();

        res.json(books);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const updateBook = async (req, res) => {
    try {

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(book);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteBook = async (req, res) => {
    try {

        await Book.findByIdAndDelete(req.params.id);

        res.json({
            message: "Book Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getUserBorrowingAnalytics = async (req, res) => {
    try {

        const userId = req.user.id;

        const analytics = await Borrow.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId) // ✅ FIXED
                }
            },
            {
                $lookup: {
                    from: "books",
                    localField: "bookId",
                    foreignField: "_id",
                    as: "book"
                }
            },
            {
                $unwind: "$book"
            },
            {
                $group: {
                    _id: "$book.category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    genre: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json(analytics);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};

const getLandingStats = async (req, res) => {
    try {
        const totalTitles = await Book.countDocuments();
        const totalBorrowings = await Borrow.countDocuments();
        const activeBorrowings = await Borrow.countDocuments({ returned: false });
        
        const returnRate = totalBorrowings > 0 
            ? Math.round(((totalBorrowings - activeBorrowings) / totalBorrowings) * 100) 
            : 0;

        const sampleBooks = await Book.find().sort({ createdAt: -1 }).limit(6);

        res.json({
            totalTitles,
            totalBorrowings,
            activeBorrowings,
            returnRate,
            sampleBooks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addBook,
    getBooks,
    updateBook,
    deleteBook,
    getUserBorrowingAnalytics,
    getLandingStats
};