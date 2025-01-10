//Import required modules
const express = require("express");
const path = require("path");
const cors = require("cors");
//const { createProxyMiddleware } = require('http-proxy-middleware');

require("dotenv").config();
//Create a instance of the Express application
const app = express();
const myPort = process.env.UI_PORT || 3000;

//Enable CORS middleware to allow cross-origin requests
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

//app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Start the server
app.listen(myPort, () => {
  console.log(`App started on port ${myPort}`);
});
