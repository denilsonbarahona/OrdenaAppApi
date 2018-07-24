const jwt = require("jwt-simple")
const moment = require("moment")
const config = require("../Config")

function createToken(user_id){
    const payload={
        sub: user_id ,
        iat: moment().unix() ,
        exp: moment().add(2 ,"days").unix()
    }

   return jwt.encode(payload , config.SECRET_TOKEN)
}

module.exports = { createToken }
