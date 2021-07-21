const Books = require("../models/books");
const Tags = require("../models/tags");

exports.getBookList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfBooksInOnePage = Number(req.query.noOfBooksInOnePage) || 10;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfBooksInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfBooksInOnePage should be positive" });
    }
    const bookCount = await Books.countDocuments({
      status: { $ne: "Deleted" },
    });
    const books = await Books.find({ status: { $ne: "Deleted" } })
      .sort({ updatedAt: 1 })
      .skip((page - 1) * noOfBooksInOnePage)
      .limit(noOfBooksInOnePage)
      .exec();
    return res.json({
      totalPages: Math.ceil(bookCount / noOfBooksInOnePage),
      data: books,
    });
  } catch (error) {
    console.log("Error in /admin-getBookList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const book = await Books.findOne({ _id: req.query.bookId });
    if (!book) {
      return res.status(400).json({ error: "Book does not exist" });
    }
    res.json(book);
  } catch (error) {
    console.log("Error finding book details in /admin-getBookDetails ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.updateBookDetails = async (req, res) => {
  try {
    const bookId = req.body.bookId;
    const book = await Books.findOne({ _id: bookId }).select({ _id: 1 });
    if (!book) {
      return res.status(400).json({ error: "Book does not exists" });
    }
    const updatedBook = await Books.updateOne({ _id: bookId }, req.body);
    if (updatedBook.nModified != 1)
      return res.json({ error: "Failed to update book" });
    res.json({ msg: "Book updated" });
  } catch (error) {
    console.log(
      "Error updating book details in /admin-updateBookDetails ",
      error
    );
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.approveBook = async (req, res) => {
  try {
    const bookId = req.body.bookId;
    const book = await Books.findOne({ _id: bookId }).select({
      _id: 1,
      status: 1,
      weightInGrams: 1,
      tags: 1,
      isApproved: 1,
    });
    if (!book) {
      return res.status(400).json({ error: "Book does not exist" });
    } else if (book.status == "Deleted") {
      return res
        .status(400)
        .json({ error: "Deleted book cannot be marked as approved" });
    } else if (!book.weightInGrams || book.weightInGrams == 0) {
      return res.status(400).json({ error: "Weight of book is not defined" });
    } else if (book.isApproved) {
      return res.status(400).json({ error: "Book already approved" });
    }
    const updatedBook = await Books.updateOne(
      { _id: bookId },
      { isAvailable: true, isApproved: true, status: "Approved" }
    );
    if (updatedBook.nModified != 1) {
      return res.json({ error: "Failed to mark book as approved" });
    }
    await Promise.all(
      book.tags.map(async (tag) => {
        await Tags.updateOne({ tag }, { tag }, { upsert: true });
      })
    );
    res.json({ msg: "Book approved" });
  } catch (error) {
    console.log("Error occurred in /admin-approveBook ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.rejectBookApproval = async (req, res) => {
  try {
    const { bookId, message } = req.body;
    const book = await Books.findOne({ _id: bookId }).select({
      _id: 1,
      status: 1,
    });
    if (!book) {
      return res.status(400).json({ error: "Book does not exist" });
    } else if (book.status === "Approval rejected") {
      return res.status(400).json({ error: "Book already rejected" });
    }
    const updatedBook = await Books.updateOne(
      { _id: bookId },
      {
        isAvailable: false,
        isApproved: false,
        adminMessage: message,
        status: "Approval rejected",
      }
    );
    if (updatedBook.nModified != 1) {
      return res.json({ error: "Failed to mark book as approved" });
    }
    res.json({ msg: "Book approval rejected" });
  } catch (error) {
    console.log("Error occurred in /admin-rejectBookApproval ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.body.bookId;
    const book = await Books.findOne({ _id: bookId }).select({
      _id: 1,
      status: 1,
    });
    if (!book) {
      return res.status(400).json({ error: "Book does not exist" });
    } else if (book.status === "Deleted") {
      return res.status(400).json({ error: "Book already deleted" });
    }
    const updatedBook = await Books.updateOne(
      { _id: bookId },
      { isAvailable: false, status: "Deleted" }
    );
    if (updatedBook.nModified != 1) {
      return res.json({ error: "Failed to delete book" });
    }
    res.json({ msg: "Book deleted" });
  } catch (error) {
    console.log("Error occurred in /admin-deleteBook ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
