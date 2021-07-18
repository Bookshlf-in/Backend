const Books = require("../models/books");
const CartItems = require("../models/cartItems");
const mongoose = require("mongoose");

exports.getCartList = async (req, res) => {
  try {
    const cartItems = await CartItems.find({ userId: req.auth._id }).exec();
    const cartList = await Promise.all(
      cartItems.map(async ({ _id, bookId, createdAt, purchaseQty }) => {
        const book = (
          await Books.findOne({ _id: bookId })
            .select({
              _id: 1,
              title: 1,
              MRP: 1,
              price: 1,
              editionYear: 1,
              author: 1,
              sellerName: 1,
              qty: 1,
              photos: { $slice: 1 },
            })
            .exec()
        )?._doc;
        book.bookId = book._id;
        delete book._id;
        book.photo = book.photos.length > 0 ? book.photos[0] : "";
        delete book.photos;
        const obj = { ...book, _id, purchaseQty, createdAt };
        if (book.qty <= 0) {
          obj.error = "Boook sold out";
        } else if (book.qty < purchaseQty) {
          obj.error = `Only ${book.qty} books available`;
        }
        return obj;
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
    //TODO: isAvailable: true
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

exports.changeCartItemPurchaseQty = async (req, res) => {
  try {
    const cartItemId = req.body.cartItemId;
    const purchaseQty = req.body.purchaseQty;
    const userId = req.auth._id;
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({ error: "Book does not exist" });
    }
    const cartItem = await CartItems.findOne({ _id: cartItemId }).exec();
    if (!cartItem) {
      return res.status(400).json({ error: "Book does not exist" });
    } else if (!cartItem.userId.equals(userId)) {
      return res
        .status(400)
        .json({ error: "You are not authorized to access this item" });
    }
    const book = await Books.findOne({ _id: cartItem.bookId })
      .select({ _id: 0, qty: 1 })
      .exec();
    if (book.qty < purchaseQty) {
      return res
        .status(400)
        .json({ error: `Quantity cannot exceed ${book.qty}` });
    }
    const updatedItem = await CartItems.updateOne(
      { _id: cartItemId },
      { purchaseQty }
    ).exec();
    if (updatedItem.nModified != 1) {
      return res.status(500).json({ error: "Failed to update quantity" });
    }
    res.json({ msg: "Changed purchase quantity" });
  } catch (error) {
    console.log(
      "Error occurred changing purchase quantity in /changeCartItemPurchaseQty",
      error
    );
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.countCartItems = async (req, res) => {
  try {
    const userId = req.auth._id;
    const count = await CartItems.countDocuments({ userId });
    res.json({ count });
  } catch (error) {
    console.log("Error occurred in countCartItems", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
