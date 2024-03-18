
let socket;
let userName;
let roomID;

// Function to join the chat room
function joinChat() {
  userName = document.getElementById('nameInput').value.trim();
  roomID = document.getElementById('roomInput').value.trim();

  if (userName && roomID) {
    document.getElementById('joinForm').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'block';

    // Connect to Socket.io server
    socket = io();

    // Emit 'join' event to server
    socket.emit('join', { userName, roomID });

    // Update UI with username and roomID
    document.getElementById('usernameDisplay').innerText = `UserName: ${userName}`; // Update the username display
    document.getElementById('roomIDDisplay').innerText = `Room ID: ${roomID}`;

    // Listen for 'userList' event from server
    socket.on('userList', (users) => {
      updateUserList(users);
    });

    // Listen for incoming chat messages
    socket.on('chat-message', (data) => {
      const { sender, message } = data;
      console.log('Received message:', data);
      displayMessage(`${sender}: ${message}`);
    });
  }
}

// Event listener for form submission
document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();

  const message = document.getElementById('input').value.trim();
  if (message) {
    // Emit 'chat message' event to server with sender and receiver information
    socket.emit('chat-message', { sender: userName, receiver: roomID, message });
    document.getElementById('input').value = '';
  }
});

// Function to leave the room
function leaveRoom() {
  // Reload the page
  window.location.reload();
}

function updateUserList(users) {
  const userListElement = document.getElementById('userList');
  userListElement.innerHTML = ''; // Clear previous user list

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.classList.add('user-item');
    userItem.classList.add(user.status === 'online' ? 'online' : 'offline');

    const userStatus = document.createElement('span');
    userStatus.classList.add('user-status');
    userStatus.style.backgroundColor = user.status === 'online' ? 'green' : 'red';

    const username = document.createElement('span');
    username.classList.add('username');
    username.textContent = user.name; // Use 'name' instead of 'userName'

    userItem.appendChild(userStatus);
    userItem.appendChild(username);

    userListElement.appendChild(userItem);
  });
}


function displayMessage(msg) {
  console.log('Received message:', msg);

  const item = document.createElement('li');
  item.textContent = msg;

  const messageList = document.getElementById('messages');
  if (messageList) {
    messageList.appendChild(item);
  } else {
    console.error('Message list not found');
  }
}

