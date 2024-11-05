const { v4: uuidv4 } = require("uuid");
var mongoose = require("mongoose");
const crypto = require("crypto");

const createSalt = () => {
  const buf = crypto.randomBytes(64);
  return buf.toString("base64");
};

const saltRounds = 10;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: { type: String, required: true, trim: true },
  salt: { type: String },
  admin: {
    type: Boolean,
    default: false,
  },
  _id: {
    type: mongoose.Schema.Types.UUID,
    default: () => uuidv4(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // short time
  try {
    const user = this;
    const salt = createSalt();
    const key = crypto.pbkdf2Sync(user.password, salt, 1000, 64, "sha256");
    user.password = key.toString("base64");
    user.salt = salt;
    next();
  } catch (e) {
    return next(e);
  }
});

userSchema.methods.comparePassword = function (comparePassword) {
  const user = this;
  const key = crypto.pbkdf2Sync(comparePassword, user.salt, 1000, 64, "sha256");
  return key.toString("base64") == user.password;
};

var Users = mongoose.model("userSchema", userSchema);

module.exports = Users;
