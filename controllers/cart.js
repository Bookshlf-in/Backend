const Books = require("../models/books");
const CartItems = require("../models/cartItems");
const mongoose = require("mongoose");

//TODO: add orderedQty, and Qty
exports.getCartList = async (req, res) => {
  try {
    const cartItems = await CartItems.find({ userId: req.auth._id })
      .select({ _id: 0, bookId: 1, createdAt: 1 })
      .exec();
    const cartList = await Promise.all(
      cartItems.map(async ({ bookId, createdAt }) => {
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
        book.createdAt = createdAt;
        return book;
      })
    );
    res.json(cartList);
  } catch (error) {
    console.log("Error occurred in /getCartList", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.addCartItem = async (req, res) => {
  try {
    const bookId = req.body.bookId;
    const userId = req.auth._id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Book does not exist" });
    }
    const book = await Books.findOne({ _id: bookId }).select({ _id: 1 }).exec();
    if (!book) return res.status(400).json({ error: "Book does not exist" });

    const cartItem = await CartItems.findOne({ bookId, userId })
      .select({ _id: 1 })
      .exec();
    if (cartItem)
      return res.status(400).json({ error: "Book already present in cart" });

    const newCartItem = new CartItems({ bookId, userId });
    newCartItem.save((error, cartItem) => {
      if (error) {
        return res.status(500).json({ error: "Some error occurred" });
      }
      res.json({ msg: "Book added to cart" });
    });
  } catch (error) {
    console.log("Error occurred adding book to cart", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const bookId = req.body.bookId;
    const userId = req.auth._id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Book does not exist" });
    }
    const cartItem = await CartItems.findOne({ bookId, userId })
      .select({ _id: 1 })
      .exec();
    if (!cartItem)
      return res.status(400).json({ error: "Book not present in cart" });
    const deletedItem = await CartItems.deleteOne({ bookId, userId })
      .select({ _id: 1 })
      .exec();
    if (deletedItem.deletedCount < 1) {
      return res.json({ msg: "Failed to remove book from cart" });
    }
    res.json({ msg: "Book removed from cart" });
  } catch (error) {
    console.log("Error occurred deleting book from cart", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

// change orderedQty route (purchaseQty)
