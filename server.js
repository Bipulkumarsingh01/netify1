
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Store room-based user lists
const roomUsers = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  // Listen for 'join' event
  socket.on('join', ({ userName, roomID }) => {
    socket.join(roomID); // Join the specified room

    // Add user to the room's user list
    if (!roomUsers[roomID]) {
      roomUsers[roomID] = [];
    }
    roomUsers[roomID].push({ name: userName, status: 'online' });

    // Emit the updated user list for the room to all clients in the room
    io.to(roomID).emit('userList', roomUsers[roomID]);

    console.log(`${userName} joined room ${roomID}`);
  });

  // Listen for 'chat message' event with sender and receiver information
  socket.on('chat-message', ({ sender, receiver, message }) => {
    // Broadcast the chat message to the specified room
    io.to(receiver).emit('chat-message', { sender, message });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('a user disconnected');

    // Remove the user from the appropriate room's user list
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomID) => {
      if (roomID !== socket.id && roomUsers[roomID]) {
        const userIndex = roomUsers[roomID].findIndex((user) => user.name === socket.userName);
        if (userIndex !== -1) {
          roomUsers[roomID].splice(userIndex, 1);
          io.to(roomID).emit('userList', roomUsers[roomID]); // Update user list for all clients in the room
        }
      }
    });
  });
});

// Serve the static files from the 'public' directory
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
