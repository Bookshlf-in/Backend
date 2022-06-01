const axios = require("axios");

exports.proxy = async (req, res) => {
  try {
    const targetURL = req.url?.substr(7);
    if (!targetURL) {
      return res.send(400, { error: "Target URL required" });
    }
    let obj = {
      method: req.method,
      url: targetURL,
      responseType: "stream",
    };
    if (req.header("Authorization")) {
      obj["headers"] = { Authorization: req.header("Authorization") };
    }
    if (JSON.stringify(req.body) !== "{}") {
      obj.data = req.body;
    }
    axios(obj).then(function (response) {
      response.data.pipe(res);
    });
  } catch (error) {
    console.log("Error occurred in /proxy ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
