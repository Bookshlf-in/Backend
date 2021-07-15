const mongoose = require("mongoose");
const Users = require("../models/users");
const Books = require("../models/books");
const Addresses = require("../models/addresses");
const Orders = require("../models/orders");
const CartItems = require("../models/cartItems");

exports.purchaseBook = async (req, res) => {
  try {
    const { bookId, purchaseQty, customerAddressId } = req.body;
    const errors = [];
    let book, customerAddress;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      errors.push({
        error: "Book does not exist",
        param: "bookId",
      });
    } else {
      book = (
        await Books.findOne({ _id: bookId, isAvailable: true })
          .select({
            _id: 1,
            title: 1,
            photos: { $slice: 1 },
            author: 1,
            MRP: 1,
            price: 1,
            weightInGrams: 1,
            pickupAddressId: 1,
            sellerId: 1,
            sellerName: 1,
            qty: 1,
          })
          .exec()
      )?._doc;
      if (!book) {
        errors.push({
          error: "Book does not exist",
          param: "bookId",
        });
      }
    }
    if (!mongoose.Types.ObjectId.isValid(customerAddressId)) {
      errors.push({
        error: "Address does not exist",
        param: "customerAddressId",
      });
    } else {
      customerAddress = (
        await Addresses.findOne({
          _id: customerAddressId,
        })
          .select({
            _id: 1,
            address: 1,
            city: 1,
            state: 1,
            zipCode: 1,
            countryCode: 1,
            phoneNo: 1,
          })
          .exec()
      )?._doc;
      if (!customerAddress) {
        errors.push({
          error: "Address does not exist",
          param: "customerAddressId",
        });
      }
    }
    if (book && purchaseQty > book.qty) {
      errors.push({
        error: "Purchase qty cannot be greater than stock",
        param: "purchaseQty",
      });
    }
    if (errors.length > 0) return res.status(400).json({ errors });
    const customerName = (
      await Users.findOne({ _id: req.auth._id }).select({ name: 1 }).exec()
    )?.name;
    const sellerAddress = (
      await Addresses.findOne({
        _id: book.pickupAddressId,
      })
        .select({
          _id: 1,
          address: 1,
          city: 1,
          state: 1,
          zipCode: 1,
          countryCode: 1,
          phoneNo: 1,
        })
        .exec()
    )?._doc;
    delete book.pickupAddressId;
    book.bookId = book._id;
    delete book._id;
    book.photo = book.photos.length > 0 ? book.photos[0] : "";
    delete book.photos;
    const order = new Orders({
      customerName,
      customerId: req.auth._id,
      ...book,
      purchaseQty,
      sellerAddress,
      customerAddress,
      status: ["Order placed"],
      expectedDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    });
    order.save((error, order) => {
      if (error) {
        throw error;
      }
      const newQty = book.qty - order.purchaseQty;
      let updateObj = {};
      if (newQty <= 0) {
        updateObj = {
          qty: newQty,
          isAvailable: false,
          status: "Sold",
        };
      } else {
        updateObj = {
          qty: newQty,
        };
      }
      Books.updateOne({ _id: order.bookId }, updateObj).exec(
        (error, updatedBook) => {
          if (error) {
            Orders.deleteOne({ _id: order._id });
            throw error;
          }
          res.json({ msg: "Order placed" });
        }
      );
    });
  } catch (error) {
    console.log("Error occurred in purchase book: ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.purchaseCart = async (req, res) => {
  try {
    const customerAddressId = req.body.customerAddressId;
    if (!mongoose.Types.ObjectId.isValid(customerAddressId)) {
      return res.status(400).json({
        errors: [
          {
            error: "Address does not exist",
            param: "customerAddressId",
          },
        ],
      });
    }
    const customerAddress = (
      await Addresses.findOne({
        _id: customerAddressId,
      })
        .select({
          _id: 1,
          address: 1,
          city: 1,
          state: 1,
          zipCode: 1,
          countryCode: 1,
          phoneNo: 1,
        })
        .exec()
    )?._doc;
    if (!customerAddress) {
      return res.status(400).json({
        errors: [
          {
            error: "Address does not exist",
            param: "customerAddressId",
          },
        ],
      });
    }
    const customerName = (
      await Users.findOne({ _id: req.auth._id }).select({ name: 1 }).exec()
    )?.name;
    const obj = {
      customerName,
      customerId: req.auth._id,
      customerAddress,
      status: ["Order placed"],
      expectedDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    };
    const cartItems = await CartItems.find({ userId: req.auth._id }).exec();
    if (cartItems.length == 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    let error = "";
    const orderObj = await Promise.all(
      cartItems.map(async ({ bookId, purchaseQty }) => {
        const book = (
          await Books.findOne({ _id: bookId })
            .select({
              _id: 1,
              title: 1,
              photos: { $slice: 1 },
              author: 1,
              MRP: 1,
              price: 1,
              weightInGrams: 1,
              pickupAddressId: 1,
              sellerId: 1,
              sellerName: 1,
              qty: 1,
            })
            .exec()
        )?._doc;
        if (book.qty <= 0) error = "Book not available";
        else if (book.qty < purchaseQty)
          error = "Purchase qty cannot be greater than stock";
        const sellerAddress = (
          await Addresses.findOne({
            _id: book.pickupAddressId,
          })
            .select({
              _id: 1,
              address: 1,
              city: 1,
              state: 1,
              zipCode: 1,
              countryCode: 1,
              phoneNo: 1,
            })
            .exec()
        )?._doc;
        delete book.pickupAddressId;
        book.bookId = book._id;
        delete book._id;
        book.photo = book.photos.length > 0 ? book.photos[0] : "";
        delete book.photos;
        const newObj = { ...obj, ...book, purchaseQty, sellerAddress };
        return newObj;
      })
    );
    if (error != "") return res.status(400).json({ error });
    await Promise.all(
      orderObj.map(async (obj) => {
        const order = new Orders(obj);
        await order.save((error, order) => {
          if (error) {
            throw error;
          }
          const newQty = obj.qty - order.purchaseQty;
          let updateObj = {};
          if (newQty <= 0) {
            updateObj = {
              qty: newQty,
              isAvailable: false,
              status: "Sold",
            };
          } else {
            updateObj = {
              qty: newQty,
            };
          }
          Books.updateOne({ _id: order.bookId }, updateObj).exec(
            (error, updatedBook) => {
              if (error) {
                Orders.deleteOne({ _id: order._id });
                throw error;
              }
            }
          );
        });
        return order;
      })
    );
    await CartItems.deleteMany({ userId: req.auth._id });
    res.json({ msg: "Order placed" });
  } catch (error) {
    console.log("Error occurred in purchase cart: ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
