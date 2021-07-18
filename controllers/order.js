const mongoose = require("mongoose");
const Users = require("../models/users");
const Books = require("../models/books");
const Addresses = require("../models/addresses");
const Orders = require("../models/orders");
const CartItems = require("../models/cartItems");

exports.getOrderList = async (req, res) => {
  try {
    const customerId = req.auth._id;
    const orderList = await Orders.find({ customerId })
      .select({
        _id: 1,
        photo: 1,
        title: 1,
        price: 1,
        status: 1,
        purchaseQty: 1,
        bookId: 1,
        sellerName: 1,
        author: 1,
        orderTotal: 1,
      })
      .exec();
    res.json(orderList);
  } catch (error) {
    console.log("Error occurred in /getOrderList", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (!mongoose.isValidObjectId(orderId)) {
      res
        .status(400)
        .json({ errors: [{ error: "Order not found", param: "orderId" }] });
    }
    const order = await Orders.findOne({ _id: orderId })
      .select({
        _id: 1,
        status: 1,
        paymentMode: 1,
        paymentStatus: 1,
        shippingCharges: 1,
        progress: 1,
        customerName: 1,
        customerId: 1,
        title: 1,
        MRP: 1,
        price: 1,
        author: 1,
        sellerId: 1,
        sellerName: 1,
        bookId: 1,
        photo: 1,
        purchaseQty: 1,
        customerAddress: 1,
        expectedDeliveryDate: 1,
        createdAt: 1,
        updatedAt: 1,
        orderTotal: 1,
      })
      .exec();
    if (!order) {
      return res
        .status(400)
        .json({ errors: [{ error: "Order not found", param: "orderId" }] });
    }
    if (!order.customerId.equals(req.auth._id)) {
      return res.status(400).json({
        errors: {
          error: "You are not authorized to see other user's orders",
          param: "orderId",
        },
      });
    }
    res.json(order);
  } catch (error) {
    console.log("Error occurred in /getOrderDetails", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

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
          error: "Book not available",
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
    book.weightInGrams = book.weightInGrams * purchaseQty;
    const shippingCharges = 40;
    const orderTotal = purchaseQty * book.price + shippingCharges;
    const order = new Orders({
      customerName,
      customerId: req.auth._id,
      ...book,
      purchaseQty,
      sellerAddress,
      customerAddress,
      shippingCharges,
      orderTotal,
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
        if (error !== "") return {};
        const book = (
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
        if (!book || book.qty <= 0) {
          error = `Book not available (${bookId})`;
          return {};
        }
        if (book.qty < purchaseQty) {
          error = `Purchase qty cannot be greater than stock (${bookId})`;
          return {};
        }
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
        book.weightInGrams = book.weightInGrams * purchaseQty;
        const shippingCharges = 40;
        const orderTotal = purchaseQty * book.price + shippingCharges;
        const newObj = {
          ...obj,
          ...book,
          purchaseQty,
          sellerAddress,
          shippingCharges,
          orderTotal,
        };
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

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    if (!mongoose.isValidObjectId(orderId))
      return res.status(400).json({ error: "Order not found" });
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      progress: 1,
      status: { $slice: -1 },
      customerId: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order not found" });
    } else if (!order.customerId.equals(req.auth._id)) {
      return res
        .status(400)
        .json({ error: "You are not authorized to cancel this order" });
    } else if (order.status[0] == "Delivered") {
      return res.status(400).json({ error: "Book already delivered" });
    } else if (order.status[0] == "Cancelled") {
      return res.status(400).json({ error: "Order already cacelled" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { progress: 100, $push: { status: "Cancelled" } }
    ).exec();
    if (updatedOrder.nModified != 1)
      return res.json({ error: "Some error occurred" });
    res.json({ msg: "Order cancelled" });
  } catch (error) {
    console.log("Error occurred in cancelOrder: ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
