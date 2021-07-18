const Books = require("../models/books");
const WishlistItems = require("../models/wishlistItems");
const mongoose = require("mongoose");

exports.getWishlist = async (req, res) => {
  try {
    const wishlistItems = await WishlistItems.find({
      userId: req.auth._id,
    }).exec();
    const wishList = await Promise.all(
      wishlistItems.map(async ({ _id, bookId, createdAt }) => {
        const book = await Books.findOne({ _id: bookId })
          .select({
            _id: 1,
            title: 1,
            MRP: 1,
            price: 1,
            editionYear: 1,
            author: 1,
            sellerName: 1,
            photos: { $slice: 1 },
          })
          .exec();
        book._doc.bookId = book._doc._id;
        delete book._doc._id;
        book._doc.photo =
          book._doc.photos?.length > 0 ? book._doc.photos[0] : "";
        delete book._doc.photos;
        return { ...book._doc, _id, createdAt };
      })
    );
    res.json(wishList);
  } catch (error) {
    console.log("Error occurred in /getWishlist", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.addWishlistItem = async (req, res) => {
  try {
    const bookId = req.body.bookId;
    const userId = req.auth._id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Book does not exist" });
    }
    const book = await Books.findOne({ _id: bookId }).select({ _id: 1 }).exec();
    if (!book) return res.status(400).json({ error: "Book does not exist" });

    const wishlistItem = await WishlistItems.findOne({ bookId, userId })
      .select({ _id: 1 })
      .exec();
    if (wishlistItem)
      return res
        .status(400)
        .json({ error: "Book already present in wishlist" });

    const newWishlistItem = new WishlistItems({ bookId, userId });
    newWishlistItem.save((error, wishlistItem) => {
      if (error) {
        return res.status(500).json({ error: "Some error occurred" });
      }
      res.json({ msg: "Book added to wishlist" });
    });
  } catch (error) {
    console.log("Error occurred adding book to wishlist", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.deleteWishlistItem = async (req, res) => {
  try {
    const bookId = req.body.bookId;
    const userId = req.auth._id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Book does not exist" });
    }
    const wishlistItem = await WishlistItems.findOne({ bookId, userId })
      .select({ _id: 1 })
      .exec();
    if (!wishlistItem)
      return res.status(400).json({ error: "Book not present in wishlist" });
    const deletedItem = await WishlistItems.deleteOne({ bookId, userId })
      .select({ _id: 1 })
      .exec();
    if (deletedItem.deletedCount < 1) {
      return res.json({ msg: "Failed to remove book from wishlist" });
    }
    res.json({ msg: "Book removed from wishlist" });
  } catch (error) {
    console.log("Error occurred deleting book from wishlist", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.countWishlistItems = async (req, res) => {
  try {
    const userId = req.auth._id;
    const count = await WishlistItems.countDocuments({ userId });
    res.json({ count });
  } catch (error) {
    console.log("Error occurred in countWishlistItems", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
