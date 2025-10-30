const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const userSchema = new mongoose.Schema({
  name: { type: String, maxlength: 50 },
  email: { type: String, trim: true, unique: 1 },
  password: { type: String, minlength: 5 },
  lastname: { type: String, maxlength: 50 },
  role: { type: Number, default: 0 },
  image: String,
  token: String,
  tokenExp: Number,
});

// 🔒 비밀번호 암호화
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// 🔐 비밀번호 비교
userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// 🧾 토큰 생성
userSchema.methods.generateToken = async function () {
  try {
    const user = this;
    const token = jwt.sign(
      { _id: user._id.toHexString() },
      process.env.JWT_SECRET || "secretToken",
      { expiresIn: "7d" }
    );

    user.token = token;
    await user.save();
    return token;
  } catch (err) {
    throw new Error(err);
  }
};

// 🔎 토큰으로 유저 찾기
userSchema.statics.findByToken = async function (token) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretToken"
    );
    const user = await this.findOne({ _id: decoded._id, token });
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
