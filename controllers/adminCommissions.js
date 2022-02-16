const Commissions = require("../models/commissions");

exports.getCommissionChart = async (req, res) => {
  try {
    const commissionChart = await Commissions.find().sort({ priceLimit: 1 });
    res.json(commissionChart);
  } catch (error) {
    console.log("Error in /admin-getCommissionChart ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.addNewCommissionRow = async (req, res) => {
  try {
    const { priceLimit, fixedCommission, percentCommission } = req.body;
    const commissionRow = new Commissions({
      priceLimit,
      fixedCommission,
      percentCommission,
    });
    const newCommissionRow = await commissionRow.save();
    res.json({ msg: "New row added", ...newCommissionRow._doc });
  } catch (error) {
    console.log("Error in /admin-addNewCommissionRow ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.updateCommissionRow = async (req, res) => {
  try {
    const rowId = req.body.rowId;

    const updatedCommision = await Commissions.updateOne(
      { _id: rowId },
      req.body
    );
    if (updatedCommision.modifiedCount != 1) {
      return res.status(500).json({ error: "Failed to update row" });
    }

    res.json({ msg: "Row updated successfully" });
  } catch (error) {
    console.log("Error in /admin-updateCommissionRow ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.deleteCommissionRow = async (req, res) => {
  try {
    const deletedCommission = await Commissions.deleteOne({
      _id: req.body.rowId,
    });
    if (deletedCommission.deletedCount != 1) {
      return res.status(500).json({ error: "Failed to delete row" });
    }

    res.json({ msg: "Row deleted successully" });
  } catch (error) {
    console.log("Error in /admin-deleteCommissionRow ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
