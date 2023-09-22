const functions = require('./functions')




const handleGameEvents = async(socket) => {
    const io = socket.server

    const { GamesDB } = require('./server');
    

    socket.on('createGame',(data)=>{
        
        let colorBrightness = functions.getColorBrightness(data.gameColor) < 128 ? 'white' : 'black';


        let temp ={
            _id:'g_'+functions.generateRandomString(),
            name:data.gameName,
            creator:data.userName,
            dateCreated:new Date(),
            media:data.media,
            color:data.gameColor,
            active:data.status,
            textColor:colorBrightness
        }
        const addGameToDB = async (game) =>{
            console.log('adding game to db...')
            try {
                await GamesDB.create(game)

                const result = JSON.stringify({'msg':'createGameSuccess', 'id':game._id });

                console.log(`${game.name} by ${game.creator} added!`)

                socket.emit('message',result)

                const list = await GamesDB.find({'active':'open'})

                socket.broadcast.emit('gameList',{'list': list })

                socket.join(game._id)

                console.log(`${socket.id} is in rooms:`,socket.rooms)


    
              } catch (err) {
                const result = JSON.stringify({'msg':'createGameError', 'error': err });

                socket.emit('message',result)
              }
        }
    
        addGameToDB(temp)
    })

    socket.on('retireGame',(data)=>{
    
        let temp ={
            name:data.gameName,
            id:data.gameId,
        }
        const deactivateGame = async(game)=>{
            try {
                await GamesDB.updateOne({'name':game.name, '_id':game.id},{$set:{'active':'closed'}})
      
                
                console.log(`${game.name} by ${game.creator} is now inactive!`)

                const result = JSON.stringify({'msg':'retireGameSuccess' });
                
                socket.emit('message',result)

                const list = await GamesDB.find({'active':'open'})

                socket.broadcast.emit('gameList',{'list': list })

                socket.leave(game.id)

                console.log('current rooms after leaving:',socket.rooms)


              } catch (err) {
                const result = JSON.stringify({'msg':'retireGameError', 'error': err });
                
                socket.emit('message',result)
              }
        }
        deactivateGame(temp)
    })


    socket.on('getGameList',async ()=>{

        console.log('fetching the list...')

        const list = await GamesDB.find({'active':'open'})

        socket.emit('gameList',{'list': list })
        
    })

    socket.on('playerJoin', async(data) => {
        try{
        if(io.sockets.adapter.rooms.get(data).size < 2){
        console.log(`${socket.id} is joining the game: ${data}`)

        socket.join(data)

        socket.to(data).emit('playersWaiting',io.sockets.adapter.rooms.get(data).size - 1)

        // socket.broadcast.emit('occupiedGame',(data))

        await GamesDB.updateOne({'_id':data},{$set:{'active':'occupied'}})

        const list = await GamesDB.find({'active':'open'})

        socket.broadcast.emit('gameList',{'list': list })

        }
        else{
          socket.to(socket.id).emit('occupiedGame',(data))
        }
      }catch(err){
        console.log("ERROR:",err)
      }
  
      });

      socket.on('playerLeave',async (data)=>{

        console.log('data is:',data)


        
        await GamesDB.updateOne({'_id':data},{$set:{'active':'open'}})

        const list = await GamesDB.find({'active':'open'})

        socket.broadcast.emit('gameList',{'list': list })

        socket.leave(data)

        console.log(`${socket.id} is in rooms:`,socket.rooms)

        try{
        io.to(data).emit('playersWaiting',io.sockets.adapter.rooms.get(data).size - 1)
        socket.broadcast.emit('freeGame',(data))
        }catch(err){
          console.log("ERROR:",err)

        }

        
      })

      socket.on('cancelGame',(data)=>{
        socket.to(data).emit('gameIsCancelled',(data))
      })

      socket.on('roomDisconnect',(data)=>{
        socket.leave(data)
      })

      socket.on('startGame',async(data)=>{
        console.log('attempting to connect to room:',data.id)
        try{
        if(io.sockets.adapter.rooms.get(data.id).size > 1){
          io.to(data.id).emit('gameReady',(data.symbol))
          await GamesDB.updateOne({'_id':data.id},{$set:{'active':'closed'}})
        }else{
          socket.to(socket.id).emit('playersWaiting',io.sockets.adapter.rooms.get(data).size - 1)
        }
      }catch(error){
        console.log(error)
        await GamesDB.updateOne({'_id':data.id},{$set:{'active':'open'}})
        socket.emit('playersWaiting',0)
      }
      })

      socket.on('sendPlayer',(data)=>{

        socket.to(data.id).emit('getOpponentData',data.name)
      })
      
      socket.on('switchTurn',(data)=>{
        socket.to(data.id).emit('yourMove',({'square':data.block, 'symbol':data.symbol}))
      })


      socket.on('roundWin',(data)=>{
        socket.to(data.id).emit('winner',({'symbolA':data.sym1,'symbolB':data.sym2,'symbolC':data.sym3}))

      })

      socket.on('roundSend',(data)=>{
        socket.to(data.id).emit('whatRound',data.round)
      })

      socket.on('tieReport',(data)=>{
        socket.to(data).emit('tieGame')
      })

      socket.on('endGame',(data)=>{
        socket.to(data.id).emit('finishGame',data.winner)
      })

      socket.on('stopGame',(data)=>{
        socket.to(data).emit('haltGame')
      })

  };


  


module.exports = handleGameEvents
                  


  