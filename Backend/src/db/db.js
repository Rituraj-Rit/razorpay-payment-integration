const mongoose = require('mongoose');


async function ConnectToDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connect To DB")
    }catch(err){
        console.log("DB Error", err)
    }
}

module.exports = ConnectToDB;