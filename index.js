// ------------------------------
// 📦 기본 설정
// ------------------------------
const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const cookieParser = require("cookie-parser");
// const auth = require("./middleware/auth");
const { auth } = require("./middleware/auth");

const config = require("./config/key");

// ------------------------------
// 🧩 미들웨어 설정
// ------------------------------
app.use(bodyParser.urlencoded({ extended: true }));

// aplication/json
app.use(bodyParser.json());
app.use(cookieParser());

// ------------------------------
// 🌿 MongoDB 연결
// ------------------------------
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------------------
// 🏠 기본 라우트
// ------------------------------
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ------------------------------
// 👤 회원가입
// ------------------------------
app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Register Error:", err);
    return res.status(400).json({ success: false, err });
  }
});

// ------------------------------
// 🔐 로그인
// ------------------------------
app.post("/api/users/login", async (req, res) => {
  try {
    // 1️⃣ 이메일로 사용자 찾기
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    // 2️⃣ 비밀번호 확인
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다.",
      });
    }
    
    // 3️⃣ 토큰 생성
    const token = await user.generateToken();
    return res
      .cookie("x_auth", user.token)
      .status(200)
      .json({ loginSuccess: true, userId: user._id });

    // 4️⃣ 로그인 성공 응답
    return res.status(200).json({
      loginSuccess: true,
      userId: user._id,
      token: token,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/api/users/auth", auth, (req, res) =>{
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말
  res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image
  });   
})

app.get("/api/users/logout", auth, async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.user._id }, { token: "" });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(404).json({ success: false, err });

   }
});


// ------------------------------
// 🚀 서버 실행
// ------------------------------
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
