const jwt = require("jwt-simple")
const moment = require("moment")
const config = require("../Config")

function isAuth(req , res , next){
    
    token = (req.params.token)?req.params.token:req.body.token

    if(!token){  
        console.log("error 1")
        return res.status(401).send({mensaje:"no tienes authorización" , status:401})
    }
    try{
        payload = jwt.decode(token,config.SECRET_TOKEN)
    }catch(e){        
        if(e.message =="Token expired"){
            console.log("error 2")
            return res.status(401).send({mensaje:"el token ha expirado", status:401})
        }
        else {
            console.log("error 3")
            return res.status(401).send({mensaje:"error en el servidor, token no valido" , status:401})
        }                
    }

    if(payload.exp  < moment().unix()){
        console.log("token ex")
        return res.status(401).send({mensaje:"el token ha expirado" , status:401})
    }

    req.user = payload.sub
    next()
}

module.exports = { isAuth }
