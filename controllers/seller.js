const Users = require("../models/users");
const SellerProfiles = require("../models/sellerProfiles");

exports.sellerRegister = async (req, res) => {
  try {
    req.body.userId = req.auth._id;
    if (!req.body.name) {
      const user = await Users.findOne({ _id: req.body.userId })
        .select({ _id: 0, name: 1, roles: 1 })
        .exec();
      if (user.roles.includes("seller")) {
        return res.status(400).json({ error: "Already a seller" });
      }
      req.body.name = user.name;
    }

    const sellerProfile = new SellerProfiles(req.body);
    sellerProfile.save((error, sellerProfile) => {
      if (error) {
        return res.json({ error: "Failed to register" });
      }
      Users.updateOne(
        { _id: sellerProfile.userId },
        { $push: { roles: "seller" } }
      ).exec((error, user) => {
        if (error) {
          return res.json({ error: "Failed to register" });
        }
        res.json({ msg: "Registed as seller" });
      });
    });
  } catch (error) {
    console.log("Error occurred in sellerRegister", error);
    res.status(500).json({ error: "Registeration failed" });
  }
};
