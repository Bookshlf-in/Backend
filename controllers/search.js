const Books = require("../models/books");
const SellerProfiles = require("../models/sellerProfiles.js");
const CartItems = require("../models/cartItems");
const WishlistItems = require("../models/wishlistItems");

exports.search = async (req, res) => {
  try {
    if (!req.query?.q) {
      return res.status(400).json({ error: "Query required" });
    }
    const userId = req.auth?._id;
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

    if (req.query.q.substr(0, 4) === "tag:") {
      const tag = req.query.q.substr(4).trim();
      let findObj = {
        isAvailable: true,
        tags: {
          $elemMatch: {
            $regex: `^${tag}$`,
            $options: "i",
          },
        },
      };
      if (tag === "ALL") findObj = { isAvailable: true };
      const dataCount = await Books.countDocuments(findObj);
      const books = await Books.find(findObj)
        .skip((page - 1) * noOfBooksInOnePage)
        .limit(noOfBooksInOnePage)
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
          language: 1,
          photos: { $slice: 1 },
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
      return res.json({
        totalPages: Math.ceil(dataCount / noOfBooksInOnePage),
        data,
      });
    }

    let searchResults = await Books.aggregate([
      {
        $search: {
          index: "Books",
          text: { query: req.query.q, path: { wildcard: "*" } },
        },
      },
    ]);
    let bookCount = 0;
    searchResults = searchResults
      .map((obj) => {
        if (obj.isAvailable) {
          const newObj = {
            _id: obj._id,
            title: obj.title,
            MRP: obj.MRP,
            price: obj.price,
            editionYear: obj.editionYear,
            author: obj.author,
            updatedAt: obj.updatedAt,
            sellerName: obj.sellerName,
            sellerId: obj.sellerId,
            language: obj.language,
            photo: obj.photos.length > 0 ? obj.photos[0] : "",
          };
          return newObj;
        }
      })
      .filter((e) => {
        if (e == undefined) return false;
        bookCount++;
        if (
          bookCount > (page - 1) * noOfBooksInOnePage &&
          bookCount <= page * noOfBooksInOnePage
        )
          return true;
        return false;
      });

    const data = await Promise.all(
      searchResults.map(async (book) => {
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
    res.json({ totalPages: Math.ceil(bookCount / noOfBooksInOnePage), data });
  } catch (error) {
    console.log("Error occurred searching book ", error);
    return res.status(500).json({ error: "Some error occurred" });
  }
};
