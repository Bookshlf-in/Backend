"use strict";
require("dotenv").config();

const { Storage } = require("@google-cloud/storage");

const CLOUD_BUCKET = process.env.CLOUD_BUCKET;

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT,
  keyFilename: process.env.GCLOUD_KEYFILE_PATH,
});
const bucket = storage.bucket(CLOUD_BUCKET);

const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
};

exports.sendUploadToGCS = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const gcsname = `${req.body.folder}/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on("error", (err) => {
      req.file.cloudStorageError = err;
      next(err);
    });

    stream.on("finish", () => {
      req.file.cloudStorageObject = gcsname;
      file.makePublic().then(() => {
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
        next();
      });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.log("Error occurred in file upload (sendUploadToGCS): ", error);
    res.json({ error: "Some error occurred" });
  }
};

exports.uploadFile = (req, res) => {
  try {
    res.json({
      msg: "File successfully uploaded",
      link: req.file.cloudStoragePublicUrl,
    });
  } catch (error) {
    console.log("Error occurred in file upload: ", error);
    res.json({ error: "Some error occurred" });
  }
};
