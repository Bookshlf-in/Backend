const Books = require("../models/books");
const SellerProfiles = require("../models/sellerProfiles.js");
const CartItems = require("../models/cartItems");
const WishlistItems = require("../models/wishlistItems");

exports.search = async (req, res) => {
  try {
    const userId = req.auth?._id;
    const books = await Books.find({ isAvailable: true })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select({
        _id: 1,
        title: 1,
        MRP: 1,
        price: 1,
        editionYear: 1,
        author: 1,
        updatedAt: 1,
        sellerName: 1,
        sellerId: 1,
        photos: { $slice: 1 },
        language: 1,
      })
      .exec();
    const data = await Promise.all(
      books.map(async (book) => {
        book = book._doc;
        book.photo = book.photos?.length > 0 ? book.photos[0] : "";
        delete book.photos;
        const seller = (
          await SellerProfiles.findOne({ _id: book.sellerId }).select({
            _id: 0,
            rating: 1,
          })
        )?._doc;
        book.sellerRating = seller.rating;
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
        return book;
      })
    );
    res.json(data);
  } catch (error) {
    console.log("Error searching books in /search", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

// db.collections.find().sort(key:value).limit(int value).skip(some int value);
