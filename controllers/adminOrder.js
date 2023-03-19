const Orders = require("../models/orders");
const SellerProfiles = require("../models/sellerProfiles");
const SellerTransactions = require("../models/sellerTransactions");
const Commissions = require("../models/commissions");
const Books = require("../models/books");
const Users = require("../models/users");
const Addresses = require("../models/addresses");
const mongoose = require("mongoose");

const { getShippingCharge } = require("../functions/charges");

exports.getOrderList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfOrdersInOnePage = Number(req.query.noOfOrdersInOnePage) || 10;
    const status = req.query.status;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfOrdersInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfOrdersInOnePage should be positive" });
    }
    let findObj = {};
    if (status) {
      findObj = { $expr: { $eq: [{ $last: "$status" }, status] } };
    }
    const orderCount = await Orders.countDocuments(findObj);
    const orderList = await Orders.find(findObj)
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * noOfOrdersInOnePage)
      .limit(noOfOrdersInOnePage)
      .exec();

    return res.json({
      totalPages: Math.ceil(orderCount / noOfOrdersInOnePage),
      data: orderList,
    });
  } catch (error) {
    console.log("Error in /admin-getOrderList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.query?.orderId;
    const order = await Orders.findOne({ _id: orderId });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    res.json(order);
  } catch (error) {
    console.log("Error in /admin-getOrderDetails ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({ _id: 1 });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    const updatedOrder = await Orders.updateOne({ _id: orderId }, req.body);
    if (updatedOrder.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to update order" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-updateOrder ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.changeOrderProgress = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const progress = req.body.progress;
    const order = await Orders.findOne({ _id: orderId }).select({ _id: 1 });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    const updatedOrder = await Orders.updateOne({ _id: orderId }, { progress });
    if (updatedOrder.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to change progress" });
    }
    res.json({ msg: "Order progress updated" });
  } catch (error) {
    console.log("Error in /admin-changeOrderProgress ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.addOrderStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const status = req.body.status;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == status) {
      return res
        .status(400)
        .json({ error: `Order's last status is already ${status}` });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { $push: { status: status } }
    );
    if (updatedOrder.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to update order" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-addOrderStatus ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsPacked = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Packed") {
      return res.status(400).json({ error: "Order already marked as packed" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { progress: 25, $push: { status: "Packed" } }
    );
    if (updatedOrder.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to mark as packed" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-markOrderAsPacked ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsShipped = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Shipped") {
      return res.status(400).json({ error: "Order already marked as shipped" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { progress: 50, $push: { status: "Shipped" } }
    );
    if (updatedOrder.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to mark as shipped" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-markOrderAsShipped ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsCompleted = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
      sellerId: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Delivered") {
      return res
        .status(400)
        .json({ error: "Order already marked as delivered" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { paymentStatus: "Paid", progress: 100, $push: { status: "Delivered" } }
    );
    if (updatedOrder.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to mark as delivered" });
    }
    await SellerProfiles.updateOne(
      { _id: order.sellerId },
      { $inc: { noOfBooksSold: 1 } }
    );
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-markOrderAsCompleted ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsCancelled = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
      bookId: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Cancelled") {
      return res
        .status(400)
        .json({ error: "Order already marked as cancelled" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { progress: 100, $push: { status: "Cancelled" } }
    );
    if (updatedOrder.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to mark as cancelled" });
    }
    if (req.body.markBookAsAvailable) {
      await Books.updateOne(
        { _id: order.bookId },
        { isAvailable: true, status: "Approved", $inc: { qty: 1 } }
      );
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-cancelOrder ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.sendSellerPayment = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      title: 1,
      price: 1,
      sellerId: 1,
      isSellerPaid: 1,
      purchaseQty: 1,
      bookId: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.isSellerPaid) {
      return res.status(400).json({ error: "Seller already paid" });
    }
    const price = order.price * order.purchaseQty;

    const commissionChart = await Commissions.find().sort({ priceLimit: 1 });
    let fixedCommission = 0;
    let percentCommission = 0;
    for (let i = 0; i < commissionChart.length; i++) {
      const obj = commissionChart[i];
      fixedCommission = obj.fixedCommission;
      percentCommission = obj.percentCommission;
      if (obj.priceLimit >= price) {
        break;
      }
    }
    const sellerEarning =
      ((price - fixedCommission) * (100 - percentCommission)) / 100;

    // Increment wallet amount
    const modifiedSellerProfile = await SellerProfiles.updateOne(
      { _id: order.sellerId },
      { $inc: { walletBalance: sellerEarning } }
    );
    if (modifiedSellerProfile.modifiedCount != 1) {
      return res
        .status(500)
        .json({ error: "Failed to add money to seller wallet" });
    }

    // New Transaion
    const transactionObj = {
      type: "CREDIT",
      title: `Sold ${order.title}`,
      amount: sellerEarning,
      sellerId: order.sellerId,
      bookId: order.bookId,
      orderId: order._id,
    };
    const sellerTransaction = new SellerTransactions(transactionObj);
    const newSellerTransaction = await sellerTransaction.save();

    // Update order to mark isSellerPaid as true
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { isSellerPaid: true, sellerTransactionId: newSellerTransaction._id }
    );

    res.json({ msg: `Paid ${price} to seller` });
  } catch (error) {
    console.log("Error in /admin-sendSellerPayment ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.purchaseBook = async (req, res) => {
  try {
    const { bookId, purchaseQty, customerId, customerAddressId } = req.body;
    const errors = [];
    let book, customer, customerAddress;
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
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      errors.push({
        error: "Customer does not exist",
        param: "customerId",
      });
    } else {
      customer = (
        await Users.findOne({
          _id: customerId,
        })
          .select({
            _id: 1,
            name: 1,
          })
          .exec()
      )?._doc;
      if (!customer) {
        errors.push({
          error: "Customer does not exist",
          param: "customerId",
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
        error: "Purchase qty cannot be greater than stock available",
        param: "purchaseQty",
      });
    }
    if (errors.length > 0) return res.status(400).json({ errors });
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
    const shippingCharges = getShippingCharge(book.price * purchaseQty);
    const orderTotal = purchaseQty * book.price + shippingCharges;
    const order = new Orders({
      customerName: customer.name,
      customerId: customer._id,
      ...book,
      purchaseQty,
      sellerAddress,
      customerAddress,
      shippingCharges,
      orderTotal,
      status: ["Order placed"],
      expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
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
    console.log("Error occurred in admin purchase book: ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
