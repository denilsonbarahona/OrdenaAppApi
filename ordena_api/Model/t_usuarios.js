const Sequelize = require("sequelize")
var t_usuarios
var conn_error = false;


function crear_esquema(conexion){
     this.t_usuarios = conexion.define("T_USUARIOS",
     {
        Us_Codigo:{
            primaryKey:true ,
            type:Sequelize.INTEGER ,
            allowNull:false ,
            autoIncrement: true 
        } ,
        Us_Correo_Electronico:{
            type:Sequelize.STRING ,
            allowNull:false
        } ,
        Us_Nombre:{
            type:Sequelize.STRING ,
            allowNull:false
        } ,
        Us_Telefono:{
            type:Sequelize.STRING ,
            allowNull:false
        } ,
        Us_Estado:{
            type:Sequelize.STRING ,
            allowNull:false
        }
     }, {  timestamps: false ,  paranoid: true ,  underscored: true, freezeTableName: true });
}


module.exports = { t_usuarios , crear_esquema }
