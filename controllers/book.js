const mongoose = require("mongoose");
const Books = require("../models/books");
const SellerProfiles = require("../models/sellerProfiles");
const CartItems = require("../models/cartItems");
const WishlistItems = require("../models/wishlistItems");

const isValidISBN = (isbn) => {
  let n = isbn.length;
  if (n == 10) {
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
  } else if (n == 13) {
    let sum = 0,
      f = 0;
    for (let i = 0; i < 13; i++) {
      let digit = isbn[i] - "0";
      if (digit < 0 || digit > 9) {
        return false;
      }
      if (f & 1) {
        sum += 3 * digit;
      } else {
        sum += digit;
      }
      f = !f;
    }
    return sum % 10 == 0;
  }
  return false;
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

exports.getBookDetails = async (req, res) => {
  try {
    const userId = req.auth?._id;
    if (!mongoose.Types.ObjectId.isValid(req.query.bookId)) {
      return res.status(400).json({ error: "Book does not exist" });
    }
    const book = (
      await Books.findOne({ _id: req.query.bookId })
        .select({
          _id: 1,
          title: 1,
          description: 1,
          photos: 1,
          tags: 1,
          qty: 1,
          status: 1,
          MRP: 1,
          price: 1,
          editionYear: 1,
          author: 1,
          ISBN: 1,
          embedVideo: 1,
          sellerId: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .exec()
    )?._doc;
    if (!book) {
      return res.status(400).json({
        error: "Book does not exists",
      });
    }
    const seller = (
      await SellerProfiles.findOne({ _id: book.sellerId }).select({
        _id: 1,
        name: 1,
        rating: 1,
        noOfRatings: 1,
        noOfReiews: 1,
        isVerified: 1,
        createdAt: 1,
      })
    )?._doc;
    if (!seller) {
      return res.status(500).json({ error: "Seller does not exist" });
    }
    delete book.sellerId;
    book.seller = seller;
    book.wishlist = false;
    book.cart = false;
    if (userId) {
      const wishlistItem = await WishlistItems.findOne({
        userId,
        bookId: book._id,
      }).select({ _id: 1 });
      if (wishlistItem) book.wishlist = true;
      const cartItem = await CartItems.findOne({
        userId,
        bookId: book._id,
      }).select({ _id: 1 });
      if (cartItem) book.cart = true;
    }
    res.json(book);
  } catch (error) {
    console.log("Error finding book in /getBookDetails", error);
    res.status(500).json({ error: "Some error occurred" });
  }
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

exports.updateBook = (req, res) => {
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
        console.log("Error finding book in /updateBook", error);
      }
      return res.status(400).json({
        error: "Book does not exist",
      });
    } else if (!book.sellerId.equals(req.auth.sellerId)) {
      return res.status(401).json({
        error: "You are not authorized to update this book",
      });
    } else {
      Books.updateOne({ _id: req.body.bookId }, req.body, (error, book) => {
        if (error || !book) {
          if (error) {
            console.log("Error updating Book in /UpdateBook", error);
          }
          return res.status(400).json({
            error: "Book does not exist",
          });
        }
        return res.json({ msg: "Book updated" });
      });
    }
  });
};
