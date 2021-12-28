"use strict";
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");

const dir = "/tmp";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
const gcKeyPath = path.join(dir, "/gcloud-key.json");
fs.writeFileSync(gcKeyPath, process.env.GCLOUD_JSON_KEY);

const gcKeyFile = JSON.parse(process.env.GCLOUD_JSON_KEY);
const GCLOUD_BUCKET = process.env.GCLOUD_BUCKET;

const storage = new Storage({
  projectId: gcKeyFile.project_id,
  keyFilename: gcKeyPath,
});

const bucket = storage.bucket(GCLOUD_BUCKET);

const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/${GCLOUD_BUCKET}/${filename}`;
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
