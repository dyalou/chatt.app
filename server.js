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
// router till room med namne av varje room och ueser och även vi check för att bli säker att roommet är tomt
app.post("/room", (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect("/");
  }
  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);
  // skicka meddelande till den nya room
  io.emit("room-created", req.body.room);
});
// en router med dynamik parameter room, varje room namne ska skickas här på valfri router
app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/"); // om rummet är inte tommt vi returen till hemsida sidan
  }
  res.render("room", { roomName: req.params.room });
});
//lysnarr för port 3000
server.listen(3000);
console.log("listen på :3000");

//idenifiera varje person som join chat romm med en id och även namnet på den personen som join
io.on("connection", (socket) => {
  console.log("En klient anslöt sig till servern!");
  socket.on("new-user", (room, name) => {
    //hantera användars namne med romet
    socket.join(room);
    rooms[room].users[socket.id] = name;
    socket.to(room).emit("user-connected", name);
  });
  //lyssna på händelsen och även från vilken room
  socket.on("send-chat-message", (room, message) => {
    socket.to(room).emit("chat-message", {
      // se till att vi bara sänder till specifika personer och ingen användare utifrån roomet
      message: message,
      name: rooms[room].users[socket.id],
    });
  });
  // händelse som triggas när en användare avslutar uppkopplingen
  socket.on("disconnect", () => {
    // anroppa getuserrooms funktion
    getUserRooms(socket).forEach((room) => {
      socket.to(room).emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id]; // ta bort användren som lämnar från arry object
    });
  });
});
// funktion för att få alla rom som användare finns för närvarande med loop
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []); //default namne variabel
}
