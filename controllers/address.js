const Addresses = require("../models/addresses");
const mongoose = require("mongoose");

exports.addAddress = (req, res) => {
  req.body.userId = req.auth._id;
  try {
    const address = new Addresses(req.body);
    address.save((error, address) => {
      if (error) {
        return res.status(500).json({
          error: "Not able to add address",
        });
      }
      res.json({ ...address._doc, msg: "Address added successfully" });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getAddress = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.query.addressId)) {
    return res.status(400).json({ error: "Address does not exist" });
  }
  Addresses.findOne({ _id: req.query.addressId }, (error, address) => {
    if (error || !address) {
      if (error) {
        console.log("Error finding address in /getAddress", error);
      }
      return res.status(400).json({
        error: "Address does not exists",
      });
    }
    return res.json(address);
  });
};

exports.getAddressList = async (req, res) => {
  const query = Addresses.find({ userId: req.auth._id, visible: true }).select({
    userId: 0,
    visible: 0,
    __v: 0,
  });
  query.exec((error, address) => {
    if (error) {
      if (error) {
        console.log("Error finding address in /getAddressList", error);
      }
      return res.status(500).json({
        error: "No address found",
      });
    }
    return res.json(address);
  });
};

exports.deleteAddress = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.addressId)) {
    return res.status(400).json({ error: "Address does not exist" });
  }
  const query = Addresses.findOne({ _id: req.body.addressId }).select({
    _id: 0,
    userId: 1,
  });
  query.exec((error, address) => {
    if (error || !address) {
      if (error) {
        console.log("Error finding address in /deleteAddress", error);
      }
      return res.status(400).json({
        error: "Address does not exist",
      });
    } else if (address.userId != req.auth._id) {
      return res.status(401).json({
        error: "You are not authorized to delete this address",
      });
    } else {
      Addresses.updateOne(
        { _id: req.body.addressId },
        { visible: false },
        (error, address) => {
          if (error || !address) {
            if (error) {
              console.log("Error deleting address in /deleteAddress", error);
            }
            return res.status(400).json({
              error: "Address does not exist",
            });
          }
          return res.json({ msg: "Address deleted successfully" });
        }
      );
    }
  });
};
