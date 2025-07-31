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
app.use(express.json());

app.use(cors());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reviews", reviewRouter );
app.use("/api/v1/transactions", transactionRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
