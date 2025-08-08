const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const express = require("express");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./util/appError");
const cors = require("cors");
const app = express();
const appointmentRouter = require("./routes/appointmentRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const transactionRouter = require("./routes/transactionRoutes");
const chatGroupRouter = require("./routes/chatGroupRoutes");
const messagesRouter = require("./routes/messagesRoutes");
const path = require("path");
const adminRouter = require("./routes/adminRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const passport = require("passport");
const calenderRouter = require("./routes/calenderRoutes");

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(passport.initialize());

require("./util/passport")();

app.use("/public", express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/chat-groups", chatGroupRouter);
app.use("/api/v1/messages", messagesRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/calender", calenderRouter);  

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
