const { default: mongoose } = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv");
const http = require('http');
const { initSocket } = require('./socket');

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const PORT = process.env.PORT || 3000;

mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});











// const { default: mongoose } = require("mongoose");
// const app = require("./app");
// const dotenv = require("dotenv");

// dotenv.config({ path: "./config.env" });

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );

// const PORT = process.env.PORT || 3000;

// mongoose.connect(DB).then(() => {
//   console.log("DB connection successful!");
//   app.listen(PORT, () => {
//     console.log(`Server is runnng on port ${PORT}`);
//   });
// });







