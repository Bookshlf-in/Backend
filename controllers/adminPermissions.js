const Users = require("../models/users");
const AdminPermissions = require("../models/adminPermissions");

exports.getPermissionList = async (req, res) => {
  try {
    const adminUsers = await Users.find({ roles: { $in: ["admin"] } });
    const permissionList = await Promise.all(
      adminUsers.map(async (user) => {
        const permission = await AdminPermissions.findOne({ userId: user._id });
        return permission;
      })
    );
    res.json(permissionList);
  } catch (error) {
    console.log("Error in /admin-getPermissionList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const adminPermission = await AdminPermissions.findOne({ userId });
    if (!adminPermission) {
      const newAdminPermission = new AdminPermissions({ userId, permissions });
      await newAdminPermission.save();
      return res.json({ msg: "Successfully updated permission" });
    }
    const updatedAdminPermission = await AdminPermissions.updateOne(
      { userId },
      { permissions }
    );
    if (updatedAdminPermission.modifiedCount !== 1) {
      return res.status(500).json({ error: "Failed to update permission" });
    }
    return res.json({ msg: "Successfully updated permission" });
  } catch (error) {
    console.log("Error in /admin-updatePermission ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
