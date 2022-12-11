const Books = require("../models/books");
const SellerProfiles = require("../models/sellerProfiles");
const Addresses = require("../models/addresses");

exports.lucknowData = async (req, res) => {
  try {
    const skip = Number(req.query.skip) || 0;
    const limit = Number(req.query.limit) || 500;
    const books = await Books.find({isAvailable: true}).skip(skip).limit(limit);
    let data = await Promise.all(books.map(async (book) => {
        const obj = book._doc;
        const pickupAddressId = book.pickupAddressId;
        const address = await Addresses.findOne({_id: pickupAddressId, city: {$regex: /kanpur/i }});
        if(!address) return null;
        obj.address = address;
        const seller = await SellerProfiles.findOne({_id: book.sellerId});
        obj.seller = seller;
        return obj;
    }));
    data = data.filter(d => (!!d));
    res.json(data);
  } catch (error) {
    console.log("Error occurred in /temp ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
