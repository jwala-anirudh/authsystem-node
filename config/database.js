const mongoose = require("mongoose");

const MONGODB_URL = "";

exports.connect = () => {
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      usedUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to DB successfully!");
    })
    .catch((error) => {
      console.log("DB Connection failed!");
      console.log(error);
      process.exit(1);
    });
};
