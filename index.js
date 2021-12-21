const express = require('express');
const socket = require('socket.io');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, ()=>{
    console.log('Server running on port', PORT);
});

io = require('socket.io')(server, {
  cors: {
    origin: "*",    
    methods: ["GET", "POST"]  
  }
});

io.on('connection', (socket) =>{
  socket.on('soldProperty', (room)=>{
    socket.to(room).emit('receive_soldItem', true);
  })

  socket.on('doneCard', (room)=>{
    socket.to(room).emit('receive_doneCard', true);
  })

  socket.on('passed_start', (room)=>{
    socket.to(room).emit('receive_start', true);
  })

  socket.on('boardToJail', (room)=>{
    socket.to(room).emit('receive_toJail', true);
  })

  socket.on('rolledDice', (data)=>{
    socket.to(data.room).emit('receive_rolledDice', data.diceNumber)
  })

  socket.on('playerTurn', (data)=>{
    socket.to(data.room).emit('receive_playerTurn',data.turnPlayer);
  })

  socket.on('end_game', (room)=>{
    socket.to(room).emit('end_game');
  })

  socket.on('pay_player', (data)=>{
    socket.to(data.room).emit('receive_payPlayer', data.details)
  })

  socket.on('turnNextPlayer', (data)=>{
    io.in(data.room).emit('receive_turnNextPlayer', data.player_data);
  })

  socket.on('readPlayerCreate', (room)=>{
    socket.to(room).emit('receive_readPlayerCreate', true);
  })

  socket.on('send_timer', (data)=>{
    socket.to(data.room).emit('receive_timer', data.seconds)
  })

  socket.on('start_game', (room)=>{
    io.in(room).emit('start_game');
  })

  socket.on('join_room', async (room)=>{
    const rooms = io.sockets.adapter.rooms;
        if(rooms.get(room) !== undefined){
            const clients = io.sockets.adapter.rooms.get(room);
            const numClients = clients ? clients.size : 0;
            if(numClients >= 1){
                await socket.join(room);
                const clients = io.sockets.adapter.rooms.get(room);
                let numClients = clients ? clients.size : 0;
                if(numClients === 4){numClients--}
                else if(numClients === 6){numClients = numClients-2}
                else if(numClients === 8){numClients = numClients-3}
                await io.in(room).emit('successful_connection', numClients);
            }
            else{
              //Room not found
              socket.emit('roomNotFound');
            }  
        }
        else{
          //Room not found
          socket.emit('roomNotFound');
        }
  })

  socket.on('create_room', (room)=>{
      if(room){
        socket.join(room);
      }
  })

  socket.on('disconnecting', function(){
    io.emit('user_left');
  })
})

