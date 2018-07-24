module.exports = {
    port : process.env.PORT || 3000 ,
    SECRET_TOKEN: "/asdlkjslkakjlslkdslkklsaklaslkdlkskljasklaj,ksajkasdkjasjksdkjsjkaslkasjaslkjaslkjaslk" ,
   /* sql:{
        "dialect" :"mssql"     ,
        "server"  :"sqlinstance.c4x7fyajw7xo.us-west-1.rds.amazonaws.com" ,
        "instanceName": "sqlinstance.c4x7fyajw7xo.us-west-1.rds.amazonaws.com",
        "database":"DB_ORDENA"      ,
        "username":"master_sa"         ,
        "password":"sys_master"
    }*/
    sql:{
        "dialect" :"mssql"     ,
        "server"  :"localhost" ,
        "instanceName": "DENILSONSERVER",
        "database":"DB_ORDENA"      ,
        "username":"sa"         ,
        "password":"123"
    }
}