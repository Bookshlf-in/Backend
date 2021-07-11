const Books = require("../models/books");
exports.search = async (req, res) => {
  try {
    //TODO: { isAvailable: true }
    const books = await Books.find()
      .select({
        _id: 1,
        title: 1,
        MRP: 1,
        price: 1,
        editionYear: 1,
        author: 1,
        updatedAt: 1,
        sellerName: 1,
        photos: { $slice: 1 },
      })
      .exec();
    res.json(books);
  } catch (error) {
    console.log("Error searching books in /search", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
