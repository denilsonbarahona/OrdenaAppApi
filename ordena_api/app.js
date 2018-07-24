var api = require("./Routes/routes");
var express = require("Express");
var body = require("body-parser");

var app = express();
 
app.use(body.urlencoded({limit: "50mb", extended: false,parameterLimit:50000}));
app.use(body.json({limit:"50mb"}));


app.use((req , res , next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","X-API-KEY, Origin , X-Requested-With , Content-Type , Accept , Access-Control-Request-Methos");
    res.header("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header("Allow","GET, POST, OPTIONS, PUT, PATCH, DELETE");

    next();
});

app.use("/api" , api);

module.exports = app;
