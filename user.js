const express = require('express');
const router = express.Router();


router.post('/register', (req,res) =>{
    const { UsersDB} = require('./server');
    let temp = {
        'username':req.body.username,
        'password':req.body.password,
        'wins':0,
        'losses':0
    }

    const addUserToDB = async (user) =>{
        console.log('entered DB')
        try {
            await UsersDB.create(user)

            res.status(200).json({'msg':'user created succesfully!','userOutput':{'win':user.wins,'lose':user.losses,'username':user.username}})
            console.log(`user ${user.username} added!`)

          } catch (error) {
            res.status(500).json({'error':error});
          }
    }

    addUserToDB(temp)
})


router.post('/checkName', async (req,res)=>{
  const { UsersDB } = require('./server');
  try{
  let findname = await UsersDB.findOne({'username':req.body.name})
  
  if(findname !== null){
    res.status(200).json({'msg':'taken'})
  }
  else{
    res.status(200).json({'msg':'free'})
  }
}catch(err){
  res.status(500).json({'msg':err})
}
})

router.post('/login', (req,res) =>{
    const { UsersDB } = require('./server');
    let temp = {
        'username':req.body.username,
        'password':req.body.password
    }
    
    const searchUserInDB = async(user)=>{
        try {
            const result = await UsersDB.findOne({ 'username':user.username, 'password': user.password });
            
            if (result) {
              res.status(200).json({ 'msg': 'user found!','userOutput':{'win':result.wins,'lose':result.losses,'username':user.username} });
            } else {
              res.status(404).json({ 'msg': 'user not found!' });
            }
          } catch (error) {
            res.status(500).json({ msg: 'an error occurred', error: error });
          }
    }

    searchUserInDB(temp)
})


module.exports = router;