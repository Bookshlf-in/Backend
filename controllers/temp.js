const { enabled } = require("express/lib/application");
const Books = require("../models/books");
const Tags = require("../models/tags");

exports.getBestSellingBooks = async (req, res) => {
  try {
    const bookList = [
      "624d4e64715eb8bc116f1fd4",
      "623ebb154e45bc5d1c7c5876",
      "6263ac3e9b0d2d10e5cc58dd",
      "61ed232478169e0020c792ae",
      "620cb3ad4901e9000a4dc44f",
      "61ebcefcb72be500207f8d16",
      "620764a7171b06000a58ffa4",
    ];
    const data = await Promise.all(bookList.map(async (bookId) => {
        const book = await Books.findOne({_id: bookId});
        return book;
    }));
    res.json(data);
  } catch (error) {
    console.log("Error occurred in /getBestSellingBooks ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

// exports.getUserRecommendedBooks = async (req, res) => {
//   try {
//   } catch (error) {
//     console.log("Error occurred in /getBestSellingBooks ", error);
//     res.status(500).json({ error: "Some error occurred" });
//   }
// };

// exports.getRecommendedBooks = async (req, res) => {
//   try {
//     // const bookId = req.bookId;
//     // const book = await Books.findOne({ _id: bookId });
//     // const tagArr = book.tags[0];
//     // const recommendedBooks = await Books.find({ tags: { $in: tagArr } });
//   } catch (error) {
//     console.log("Error occurred in /getBestSellingBooks ", error);
//     res.status(500).json({ error: "Some error occurred" });
//   }
// };
