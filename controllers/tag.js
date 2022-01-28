const Tags = require("../models/tags");
const { searchTagCache } = require("../functions/cache");

exports.searchTag = async (req, res) => {
  try {
    const tag = req.query?.q?.trim();
    if (!tag) {
      return res.json([]);
    }
    let tagList = await searchTagCache.get(tag);
    if (tagList) {
      return res.json(tagList);
    }
    tagList = await Tags.find({
      tag: {
        $regex: tag,
        $options: "i",
      },
    }).select({ _id: 0, tag: 1 });
    searchTagCache.set(tag, tagList);
    return res.json(tagList);
  } catch (error) {
    console.log("Error occurred in /getTags ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
