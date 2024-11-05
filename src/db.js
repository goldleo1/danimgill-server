const mongoose = require("mongoose");
const Users = require("./models/user");

require("dotenv").config();

const connect = async () => {
  const uri = `mongodb+srv://${process.env.MONGODB_GUEST_USERNAME}:${process.env.MONGODB_GUEST_PASSWORD}@cluster0.qs7dp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  await mongoose.connect(uri);

  mongoose.connection.on("error", () => {
    console.log("DB Connection Failed!");
  });
  mongoose.connection.once("open", () => {
    console.log("DB Connected!");
  });
};

const existUsername = (username) => {
  return Users.findOne({ username: username });
};

const createUser = async (username, password, admin = false) => {
  Users.init();
  const user = new Users({
    username,
    password,
    admin,
  });

  return await user.save();
};

const loginUser = async (username, password) => {
  const user = await Users.findOne({ username: username });

  if (!user) return false;

  if (user.comparePassword(password)) return user;

  return false;
};

module.exports = {
  connect,
  createUser,
  existUsername,
  loginUser,
};
