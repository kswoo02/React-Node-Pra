const { User } = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.x_auth; // 쿠키 이름 일치시키기
    if (!token) {
      return res.status(401).json({ isAuth: false, message: "토큰 없음" });
    }

    const user = await User.findByToken(token);
    if (!user) {
      return res.status(401).json({ isAuth: false, message: "유저 없음" });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ isAuth: false, message: "인증 실패" });
  }
};

module.exports = { auth };
