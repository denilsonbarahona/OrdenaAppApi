const Sequelize = require("sequelize");
var conexion 
var conf = require("../Config")


function AbrirConexion(){
    /*
    this.conexion = new Sequelize(conf.sql.database,conf.sql.username,conf.sql.password,
        {
            host:conf.sql.server , 
            dialect: conf.sql.dialect, 
            operatorsAliases: false
        }); */

        this.conexion = new Sequelize(conf.sql.database,conf.sql.username,conf.sql.password,
            {
                host:conf.sql.server , 
                dialect: conf.sql.dialect, 
                operatorsAliases: false ,                                    
                dialectOptions: {                                              
                    instanceName: conf.sql.instanceName ,
                    multipleStatements: true
                } 
            });
}

module.exports = { conexion , AbrirConexion }
