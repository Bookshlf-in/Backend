const mongoose = require("mongoose");
const Books = require("../models/books");
const SellerProfiles = require("../models/sellerProfiles");

const isValidISBN = (isbn) => {
  let n = isbn.length;
  if (n != 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = isbn[i] - "0";
    if (0 > digit || 9 < digit) return false;
    sum += digit * (10 - i);
  }

  let last = isbn[9];
  if (last != "X" && (last < "0" || last > "9")) return false;
  sum += last == "X" ? 10 : last - "0";
  return sum % 11 == 0;
};

exports.addBook = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.pickupAddressId)) {
    return res.status(400).json({
      errors: [{ error: "Invalid address", param: "pickupAddressId" }],
    });
  }
  req.body.ISBN = req.body.ISBN.replace(/-/g, "");
  if (!isValidISBN(req.body.ISBN)) {
    return res
      .status(400)
      .json({ errors: [{ error: "Invalid ISBN", param: "ISBN" }] });
  }

  req.body.sellerId = req.auth.sellerId;
  const query = SellerProfiles.findOne({ _id: req.auth.sellerId }).select({
    _id: 0,
    name: 1,
  });
  query.exec((error, sellerProfile) => {
    if (error) {
      console.log("Error finding seller in /addNewBook", error);
      return res.status(500).json({
        error: "Not able to add book",
      });
    }
    req.body.sellerName = sellerProfile.name;
    const book = new Books(req.body);
    book.save((error, book) => {
      if (error) {
        console.log("Error adding book in /addNewBook", error);
        return res.status(500).json({
          error: "Not able to add book",
        });
      }
      res.json({ ...book._doc, msg: "Book Added" });
    });
  });
};

exports.getBookDetails = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.query.bookId)) {
    return res.status(400).json({ error: "Book does not exist" });
  }
  Books.findOne({ _id: req.query.bookId }, (error, book) => {
    if (error || !book) {
      if (error) {
        console.log("Error finding book in /getBookDetails", error);
      }
      return res.status(400).json({
        error: "Book does not exists",
      });
    }
    return res.json(book);
  });
};

exports.getBookList = (req, res) => {
  const query = Books.find({
    sellerId: req.auth.sellerId,
    status: { $ne: "Deleted" },
  });
  query.exec((error, books) => {
    if (error) {
      if (error) {
        console.log("Error finding books in /getBookList", error);
      }
      return res.status(500).json({
        error: "No book found",
      });
    }
    return res.json(books);
  });
};

exports.deleteBook = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.bookId)) {
    return res.status(400).json({ error: "Book does not exist" });
  }
  const query = Books.findOne({ _id: req.body.bookId }).select({
    _id: 0,
    sellerId: 1,
  });
  query.exec((error, book) => {
    if (error || !book || book.status == "Deleted") {
      if (error) {
        console.log("Error finding book in /deleteBook", error);
      }
      return res.status(400).json({
        error: "Book does not exist",
      });
    } else if (!book.sellerId.equals(req.auth.sellerId)) {
      return res.status(401).json({
        error: "You are not authorized to delete this book",
      });
    } else {
      Books.updateOne(
        { _id: req.body.bookId },
        { status: "Deleted", isAvailable: false },
        (error, book) => {
          if (error || !book) {
            if (error) {
              console.log("Error deleting Book in /deleteBook", error);
            }
            return res.status(400).json({
              error: "Book does not exist",
            });
          }
          return res.json({ msg: "Book deleted" });
        }
      );
    }
  });
};
