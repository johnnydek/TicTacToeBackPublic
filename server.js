const express = require('express')

const app = express()

const bodyParser = require('body-parser');

const http = require('http')

const {Server} = require('socket.io')

const cors = require('cors')

const db = require('mongoose');

require('dotenv').config()


const username = process.env.MONGO_USERNAME

const password = process.env.MONGO_PASSWORD

const corsOptions = {
    origin: process.env.CLIENT_URL 
  };

app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())

const server = http.createServer(app)


const io = new Server(server,{
    cors:{
        origin:process.env.CLIENT_URL,
        methods:["GET","POST"]
    }
})


db.connect(`mongodb+srv://${username}:${password}@cluster0.my8dlei.mongodb.net/tictac`)



const UsersSchema = new db.Schema({
    username: String,
    password:String,
    wins:Number,
    losses:Number
  }, { versionKey: false })

const GamesSchema = new db.Schema({
    _id:String,
    name:String,
    creator:String,
    dateCreated:String,
    media:String,
    active:String,
    color:String,
    textColor:String
}, { versionKey: false })

const UsersDB = db.model('users', UsersSchema, 'users');

const GamesDB = db.model('games', GamesSchema, 'games');

module.exports = {
  UsersDB,
  GamesDB
}

const handleGameEvents = require('./game');


io.on("connection",(socket)=>{
  
    console.log('A client has connected:',socket.id)

    handleGameEvents(socket);


    socket.on('close', () => {
        console.log('A client disconnected:',socket.id);
      });


      socket.on('preGame-disconnect', () => {
        socket.emit('cancelGame',(props.game.id))
      });
})


const userRoutes = require('./user');

app.use('/user', userRoutes);

server.listen(8080, () => { console.log('server works on port 8080!'); })