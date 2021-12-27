const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const Multer = require("multer");

const { uploadFile, sendUploadToGCS } = require("../controllers/uploadFile");
const { isSignedIn } = require("../controllers/auth");
const { handleValidationError } = require("../functions/validator");
const multer = Multer({
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/uploadFile",
  isSignedIn,
  multer.single("file"),
  [
    check("folder").notEmpty().withMessage("Specify folder name"),
  ],
  handleValidationError,
  sendUploadToGCS,
  uploadFile
);

module.exports = router;
