const socket = io.connect(); // anropa socket.io:s konstruktor
const messageContainer = document.getElementById("message-container"); // skapa message-container
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input"); // skapa messageinput
//checka om messageContainer är existerar  då är roomet upptagen så vi får inte promt message
if (messageForm != null) {
  const name = prompt("What is your name?"); // ge varje användre ett namne med prompt
  socket.emit("register", name);
  appendMessage("You joined"); // anroppa funktionen med message "you joined"
  socket.emit("new-user", roomName, name); //skicka message till vår server
  //addig eventlistener för vår message
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", roomName, message); //skicka message från kilnet till server med emit
    messageInput.value = ""; // för att toma message varje gång vi skicaka message
  });
}
//hantera romm med olika element
socket.on("room-created", (room) => {
  const roomElement = document.createElement("div"); //roomname
  roomElement.innerText = room;
  const roomLink = document.createElement("a"); //link till room
  roomLink.href = `/${room}`;
  roomLink.innerText = "join"; //
  roomContainer.append(roomElement); //appened rommelement
  roomContainer.append(roomLink); //appened room link
});
// Ta emot meddelande från servern
socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});
// Ta emot user-connected från servern
socket.on("user-connected", (name) => {
  appendMessage(`${name} connected`);
});
// Ta emot user-disconnected från servern
socket.on("user-disconnected", (name) => {
  appendMessage(`${name} disconnected`);
});

// funkution för appendding messages till våra indexfil
function appendMessage(message) {
  const messageElement = document.createElement("div"); // great element med div
  messageElement.innerText = message; // sätta value
  messageContainer.append(messageElement);
}
