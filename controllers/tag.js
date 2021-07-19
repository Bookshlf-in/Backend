const Tags = require("../models/tags");

exports.searchTag = async (req, res) => {
  try {
    const tag = req.query?.q?.trim();
    if (!tag) {
      return res.json([]);
    }
    const result = await Tags.find({
      tag: {
        $regex: tag,
        $options: "i",
      },
    }).select({ _id: 0, tag: 1 });
    return res.json(result);
  } catch (error) {
    console.log("Error occurred in /getTags ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
