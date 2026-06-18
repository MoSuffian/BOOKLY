const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },

    borrowDate: {
        type: Date,
        default: Date.now
    },

    dueDate: {
        type: Date,
        required: true
    },

    returned: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Borrow", borrowSchema);