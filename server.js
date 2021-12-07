const express = require("express");
const app = express();
const server = require("http").Server(app); //för att köra socket behöver vi htt-paket
const io = require("socket.io")(server); // importera socket.io

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // inclodera URL in express

const rooms = {}; // array med tomt object i början

//skappa en router som vi ska använda i början
app.get("/", (req, res) => {
  res.render("index", { rooms: rooms }); //vi passerar har även  villka room
});
