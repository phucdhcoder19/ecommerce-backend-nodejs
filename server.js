const app = require("./src/app");
const config = require("./src/configs/config.mongodb");
console.log("config", config);
const server = app.listen(config.app.port, () => {
  console.log(`Server is running on port ${config.app.port}`);
});

// process.on("SIGINT", () => {
//   server.close(() => {
//     console.log("Server is shutting down");
//     process.exit(0);
//   });
// });
