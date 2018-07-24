var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var auth = require("./auth")
var t_usuarios = require("../Model/t_usuarios")
var conexion = require("../Model/conexion")
var DateDiff = require('date-diff');

function EnviarPedido(req , res)
{
    JsonImagenesProducto = JSON.parse( req.body.adjuntos )
    JsonOrden = JSON.parse( req.body.orden )
    JsonDatos = JSON.parse( req.body.datos )
   
    conexion.AbrirConexion()
    conexion.conexion.query("exec P_REGISTRAR_PEDIDO "+req.user+" , "+JsonDatos.datos[0]+" , '"+JsonDatos.datos[1]+
                            "' , '"+JsonDatos.datos[2]+"' , "+1)
                     .spread((result , metadata)=>{                         
                            orden_id = result[0].PEDIDO
                            for(x = 0 ; x < JsonOrden.length ; x++ ){                                
                                query = "INSERT INTO DB_Ordena.DBO.T_Productos_Pedidos "+ 
                                                        " ( " +
                                                        "    Prod_Pedi_Producto , Prod_Pedi_Cantidad  , Prod_Pedi_Lugar_Compra , "+
                                                        "    Prod_Pedi_Img	     , Prod_Pedi_Comentario , Pedi_Codigo      , Prod_Pedi_Estado	 "+
                                                        " ) " +
                                                        " VALUES ( '"+JsonOrden[x][0]+"' , '"+JsonOrden[x][1]+"' , '"+JsonOrden[x][3]+"' , "
                                query+=( JsonImagenesProducto.images.length > 0)?"1":"0"
                                query+= ",'"+JsonOrden[x][2]+"' , "+orden_id+" , "+1+" ) "                              
                               conexion.conexion.query(query)              
                            }
                            
                            for(x = 0; x < JsonImagenesProducto.images.length; x++){        
                                for(y = 0; y <JsonImagenesProducto.images[x].imagenes.length ; y++){        
                                    base64_decode(JsonImagenesProducto.images[x].imagenes[y] , 
                                                "Resource/Ordenes/"+orden_id+"/"+JsonImagenesProducto.images[x].producto, 
                                                JsonImagenesProducto.images[x].producto+"_"+y+".jpg")
                                }       
                            }  
                            res.status(200).send({ mensaje:"Pedido Recibido" , status:200}); 
                     }).catch((error)=>{
                         res.status(500).send({ mensaje:"Error, no se pudo registrar el pedido" , status:500}); 
                     })       
}

function EnviarPedidoATM(req , res)
{
    JsonAtmDatos = JSON.parse(req.body.datos)
    conexion.AbrirConexion()
    conexion.conexion.query("exec P_REGISTRAR_PEDIDO "+req.user+" , "+JsonAtmDatos.address+" , '"+JsonAtmDatos.deliveryTo+
                            "' , '"+JsonAtmDatos.phone+"' , "+2)
                     .spread((result , metadata)=>{
                         conexion.conexion.query("INSERT INTO T_Pedido_Atm_Movil "+
                                                 " ( Ped_Atm_Cantidad , Ped_Codigo )" +
                                                 " VALUES (CAST('"+JsonAtmDatos.money.replace(",","")+"' AS FLOAT),"+result[0].PEDIDO+") ")
                        res.status(200).send({ mensaje:"Pedido ATM Recibido" , status:200});                          
                     }).catch((error)=>{
                        res.status(500).send({ mensaje:"Error del servidor, no se pudo registrar el pedido" , status:500}); 
                     })       
}

function EnviarPedidoProgramado(req , res)
{
    JsonDatos = JSON.parse(req.body.datos)
    JsonImagenesProducto = JSON.parse(req.body.adjuntos)
    JsonOrden = JSON.parse(req.body.orden)
    conexion.AbrirConexion()
    conexion.conexion.query("exec P_REGISTRAR_PEDIDO "+req.user+" , "+JsonDatos.datos[2]+" , '"+JsonDatos.datos[4]+
                            "' , '"+JsonDatos.datos[3]+"' , "+3)
                     .spread((result , metadata)=>{
                        orden_id = result[0].PEDIDO
                        
                        for(x = 0 ; x < JsonOrden.length ; x++ ){                                
                            query = "INSERT INTO DB_Ordena.DBO.T_Productos_Pedidos "+ 
                                                    " ( " +
                                                    "    Prod_Pedi_Producto , Prod_Pedi_Cantidad  , Prod_Pedi_Lugar_Compra , "+
                                                    "    Prod_Pedi_Img	     , Prod_Pedi_Comentario , Pedi_Codigo      , Prod_Pedi_Estado	 "+
                                                    " ) " +
                                                    " VALUES ( '"+JsonOrden[x][0]+"' , '"+JsonOrden[x][1]+"' , '"+JsonOrden[x][3]+"' , "
                            query+=( JsonImagenesProducto.images.length > 0)?"1":"0"
                            query+= ",'"+JsonOrden[x][2]+"' , "+orden_id+" , "+1+" ) "                              
                            conexion.conexion.query(query) 
                        }

                          /*---------------------------------------------------------------------------------------*/
                          conexion.conexion.query(" EXEC P_PROGRAMAR_ENTREGA "+orden_id+",'"+JsonDatos.datos[0]+"','"+JsonDatos.datos[1]+"',"+JsonDatos.datos[5] )                                                                                                                                               
                        
                          for(x = 0; x < JsonImagenesProducto.images.length; x++){        
                            for(y = 0; y <JsonImagenesProducto.images[x].imagenes.length ; y++){        
                                base64_decode(JsonImagenesProducto.images[x].imagenes[y] , 
                                            "Resource/Ordenes/"+orden_id+"/"+JsonImagenesProducto.images[x].producto, 
                                            JsonImagenesProducto.images[x].producto+"_"+y+".jpg")
                            }       
                        }
                     })     
    res.status(200).send({ mensaje:"Pedido programado" , status:200});     
}

function ListarOrdenes(req , res)
{
    conexion.AbrirConexion();
    conexion.conexion.query("EXEC P_LISTAR_ORDENES "+req.params.usuario+" , "+req.params.accion )
                     .spread((result , metadata)=>{
                        var ordenes = []                            
                        for(x = 0 ; x < result.length; x++)
                        {
                            ordenes.push({ orden_id:  result[x].Ped_Codigo  , direccion_entrega: result[x].Dir_Detalle ,
                                            estado_id: result[x].Ped_Estado , estado: result[x].Estado  , fecha: result[x].Ped_Fecha ,
                                            entrega_id: result[x].Ped_Entrega, diff: result[x].Ped_Diff } )                                                                             
                        }                          
                        res.status(200).send({ mensaje : ordenes , status: 200 });
                     })
                     .catch((error)=>{
                        res.status(500).send({ mensaje : "Error del servidor, no se puede listar las ordenes" , status: 500 });
                     })
}

function ListarOrdenesProgramadas(req , res){
    conexion.AbrirConexion()
    conexion.conexion.query("EXEC P_LISTAR_PROGRAMACION_ORDENES "+req.params.usuario)
                    .spread((result , metadata)=>{                          
                            var Ordenes = [ ] 
                            for(x = 0 ; x < result.length ; x++){
                                Ordenes.push({  orden_id : result[x].Ped_Codigo , direccion_entrega : result[x].Dir_Detalle , 
                                                proximaEntrega: result[x].Proxima_Entrega , entrega_id: result[x].Ped_Entrega  })
                            }
                            res.status(200).send({ mensaje : Ordenes , status: 200 });
                    }).catch((error)=>{
                        res.status(500).send({ mensaje : "Error del servidor" , status: 500 });
                    })        
}

function DatosOrdenProgramadaSeleccionada(req , res){

    conexion.AbrirConexion()
    conexion.conexion.query("SELECT A.PED_RECIBE  , A.Ped_Telefono_Recibe ,                                                " +               
                            "            CASE                                                                            " +   
                            "                WHEN D.Progra_Dias = 1  THEN 1                                              " +
                            "                WHEN D.Progra_Dias = 7  THEN 2                                              " +   
                            "                WHEN D.Progra_Dias = 30 THEN 3                                              " + 
                            "                ELSE 4				                                                         " +   
                            "            END Ped_Progra_Cod ,                                                            " +
                            "            CASE                                                                            " +
                            "                WHEN D.Progra_Dias = 1  THEN 'Diariamente'                                  " +   
                            "                WHEN D.Progra_Dias = 7  THEN 'Semanalmente'                                 " +
                            "                WHEN D.Progra_Dias = 30 THEN 'Mensualmente'                                 " +   
                            "                ELSE 'Cada '+CAST( (D.Progra_Dias / 7) AS NVARCHAR(5))+' Semanas'           " +				 
                            "            END Ped_Progra_Desc , A.Ped_Codigo , A.Ped_entrega ,                            " +
                            "            C.Dir_Codigo , C.Dir_Detalle , D.Progra_Estado, C.Dir_Nombre                   " +                                                                                       
                            "    FROM DB_Ordena.DBO.T_PEDIDOS		     A                                               " +
                            "         INNER JOIN                                                                         " +
                            "DB_Ordena.DBO.T_USUARIOS		             B                                               " +
                            "        ON A.Us_Codigo = B.Us_Codigo                                                        " +
                            "        INNER JOIN                                                                          " +
                            "    DB_Ordena.DBO.T_Direcciones		     C                                               " +
                            "        ON A.Dir_Codigo = C.Dir_Codigo                                                      " +
                            "        INNER JOIN                                                                          " +
                            "    DB_Ordena.DBO.T_Programaciones_Entregas D                                               " +
                            "       ON D.Ped_Codigo = A.Ped_Codigo                                                       " +
                            "    WHERE A.Ped_Codigo = "+req.params.orden_id
                            )
                     .spread((result , metadata)=>{                        
                        res.status(200).send({ entregar:result[0].PED_RECIBE           , telefono:result[0].Ped_Telefono_Recibe       , 
                                               programado:result[0].Ped_Progra_Desc   , programado_id: result[0].Ped_Progra_Cod      ,
                                               direccion_entrega:result[0].Dir_Nombre , descripcion_direccion:result[0].Dir_Detalle  , 
                                               direccion_id:result[0].Dir_Codigo      , status: 200 })          
                     })
                     .catch((error)=>{
                         res.status(500).send({ mensaje : "", status : 200 })
                     })       
}

function ListarItemsOrden(req, res){
  
  conexion.AbrirConexion()
  conexion.conexion.query("SELECT B.Prod_Pedi_Producto			, B.Prod_Pedi_Cantidad		,  " + 
                          "       B.Prod_Pedi_Lugar_Compra		, B.Prod_Pedi_Comentario	,  " + 
                          "       B.Prod_Pedi_Estado			, C.Estado_Descripcion		,  " + 
                          "       B.Prod_Pedi_Codigo                                           " + 
                          " FROM DB_Ordena.DBO.T_Pedidos			A                          " +  
                          "      INNER JOIN                                                    " +
                          "  DB_Ordena.DBO.T_Productos_Pedidos		B                          " + 
                          "    ON A.Ped_Codigo = B.Pedi_Codigo                                 " +             
                          "      INNER JOIN                                                    " + 
                          "  DB_Ordena.DBO.T_Estados_Prod_Pedidos	C                          " + 
                          "    ON C.Estado_Codigo = B.Prod_Pedi_Estado                         " + 
                          " WHERE A.Ped_Codigo = "+req.params.orden_id+" AND B.Prod_Pedi_Estado = 1  "
                        )
                    .spread((result , metadata)=>{
                            var Datos = []
                            for(x=0; x < result.length; x++){
                                Datos.push( { nombre : result[x].Prod_Pedi_Producto , cantidad : result[x].Prod_Pedi_Cantidad , lugar_compra : result[x].Prod_Pedi_Lugar_Compra ,
                                              nota : result[x].Prod_Pedi_Comentario , estado_d : result[x].Estado_Descripcion , id : result[0].Prod_Pedi_Codigo } )
                            }

                            res.status(200).send({mensaje:Datos , status:200})
                    }).catch((error)=>{
                        res.status(500).send({mensaje:"Error" , status:200})
                    })

}

function editar_ordenes_programadas(req, res){    
    var error = false;
    productos = JSON.parse(req.body.info_items) 
    entrega = JSON.parse(req.body.info_entrega)
    conexion.AbrirConexion()    
    conexion.conexion.query(" EXEC DB_ORDENA.DBO.P_ACTUALIZAR_PEDIDOS '"+entrega.delivery_to+"','"+
                                entrega.phone_to+"',"+entrega.AddressID+" , "+req.body.order_id+" , "+entrega.schedule )
                     .spread((result , metadata)=>{
                                
                                for(i = 0 ; i < productos.Items.length; i++){     
                                        if(productos.Items[i].producto_id == ""){
                                            conexion.conexion.query( " INSERT INTO DB_ORDENA.DBO.T_PRODUCTOS_PEDIDOS  "+
                                                                    "   (     "+
                                                                    "       PROD_PEDI_PRODUCTO	  , PROD_PEDI_CANTIDAD , PROD_PEDI_LUGAR_COMPRA , PROD_PEDI_IMG , " +
                                                                    "       PROD_PEDI_COMENTARIO    , PEDI_CODIGO , PROD_PEDI_ESTADO	 ) " +
                                                                    " VALUES ('"+productos.Items[i].name+"','"+productos.Items[i].quantity+"','"+productos.Items[i].address_item+"' , 0 , "+
                                                                    "          '"+productos.Items[i].note+"' , "+req.body.order_id+" , 1 )"  )
                                                            .spread((result , metadata)=>{})
                                                            .catch((error)=>{
                                                                    error = true;
                                                            })
                                    }else{
                                        conexion.conexion.query("EXEC DB_ORDENA.DBO.P_ACTUALIZAR_PRODUCTOS "+req.body.order_id+" , "+
                                                                    "'"+productos.Items[i].name+"' , '"+productos.Items[i].quantity+"' ,'"+productos.Items[i].address_item+"' , "+
                                                                    "'"+productos.Items[i].note+"' , "+productos.Items[i].producto_id   )
                                                            .spread((result , metadata)=>{ })
                                                            .catch((error)=>{
                                                                         error = true;
                                                            })        
                                    }
                                }

                                if(!error){
                                    res.status(200).send({mensaje:"correcto" , status:200})
                                }else{
                                    res.status(500).send({mensaje:"error" , status:500})
                                }
                        })           
}

function cancelar_orden(req ,res ){
    conexion.AbrirConexion()
    conexion.conexion.query("EXEC P_CANCELAR_ORDEN "+req.body.orden_id)
                     .spread((result , metadata)=>{
                         if(result[0].Salida == 1){
                            res.status(200).send({mensaje:"cancelada" , status: 200})
                         }else{
                            res.status(200).send({mensaje:"cancelada" , status: 403})
                         }
                     })
                     .catch((error)=>{
                        res.status(500).send({mensaje:"error del servidor" , status: 500})
                     })
    
}

function cancelar_producto(req ,res ){
    
    conexion.conexion.query(" EXEC P_CANCELAR_PRODUCTO "+req.body.producto_id)
                     .spread((result, metadata)=>{
                         if(result[0].Salida == 1){
                            res.status(200).send({mensaje:"cancelada" , status:200}) 
                         }else{
                            res.status(200).send({mensaje:"cancelada" , status:403}) 
                         }
                        
                     })
                     .catch((error)=>{
                        res.status(500).send({mensaje:"error" , status:500}) 
                     })           
}

function imagen_perfil(req ,res ){
    res.sendFile(path.resolve("Resource/"+req.params.usuario_id+"/"+req.params.usuario_id+".jpg"))
}

function getUserApiId(req , res){

    conexion.AbrirConexion()
    conexion.conexion.query(" EXEC P_REGISTRAR_USUARIO '"+req.params.email +"' , '"+req.params.nombre.toUpperCase()+"' , '"+req.params.telefono+"'")
                     .spread((result , metadata)=>{
                            if(result[0].Salida==1){  
                                var datos =[{ usuario_id: result[0].Usuario , token : auth.createToken(result[0].Usuario)}]
                                res.status(200).send({mensaje: datos , status: 200})
                            }else{
                                res.status(500).send({mensaje: "Error 500 error al crear el usuario." , status: 500})
                            }
                     })
}

function subir_imagen_perfil(req, res){    
    try{
        base64_decode(req.body.imagen_encode , "Resource/"+req.body.usuario_api_id, req.body.usuario_api_id+".jpg")
        res.status(200).send({ mensaje: 1 , status : 200})
    }catch(error){
        res.status(500).send({ mensaje: 0 , status : 500})
    }
    
    
}

function actualizar_informacion_perfil(req, res){

    Datos = JSON.parse(req.body.parametro)
    conexion.AbrirConexion()
    conexion.conexion.query(" UPDATE DB_Ordena.DBO.T_USUARIOS                                   " +
                            "    SET Us_Correo_Electronico = '"+Datos.user_email+"'         ,   " + 
                            "        Us_Nombre             = Upper('"+Datos.user_name+"')   ,   " +
                            "        Us_Telefono           = '"+Datos.user_phone+"'             " +
                            "  WHERE Us_Codigo = "+Datos.user_api_id)
                        .spread((result , metadata)=>{
                                                         
                                if(Datos.photo_updated == 1){
                                    base64_decode(Datos .photo , "Resource/"+Datos.user_api_id, Datos.user_api_id+".jpg")
                                }
                                res.status(200).send({mensaje:1 , status: 200})
                        })
                        .catch((error)=>{
                                res.status(500).send({mensaje:1 , status: 500})
                        })    
}

function eliminar_cuenta(req, res){

    Datos = JSON.parse(req.body.parametro)
    conexion.AbrirConexion()
    conexion.conexion.query(" UPDATE DB_Ordena.DBO.T_USUARIOS   "+
	                        "   SET Us_Estado = 0               "+
                            " WHERE Us_Codigo ="+Datos.user_api_id)
                     .spread((result , metadata)=>{
                        res.status(200).send({mensaje : 1 , status: 200});
                     }).catch((error)=>{
                        res.status(500).send({mensaje : 0 , status: 500});
                     })           
}

function base64_decode(base64str, folderName , file) {
    var bitmap = new Buffer(base64str, 'base64');   
    if(!fs.existsSync(folderName)){
        mkdirp(folderName, function(err){
            if(err){
                console.log(err)
            }else{
                fs.writeFileSync(folderName+"/"+file, bitmap);
            } 
        })
    }else{
        fs.writeFileSync(folderName+"/"+file, bitmap);    
    }
}

function obtener_token(req, res){    
   conexion.AbrirConexion()
   conexion.conexion.query("SELECT Us_Codigo FROM DB_Ordena.DBO.T_Usuarios  WHERE Us_Correo_Electronico ='"+req.params.email+"'")
                    .spread((result , metadata)=>{
                        var datos =[{ usuario_id: result[0].Us_Codigo ,  token : auth.createToken(result[0].Us_Codigo)}]                        
                        res.status(200).send({mensaje: datos , status: 200})
                    }).catch((error)=>{
                        res.status(500).send({mensaje: "Error de autenticación" , status: 500})
                    })
}

function Nueva_Direccion(req , res){     
    JsonAddress = JSON.parse(req.body.parametro)    
    conexion.AbrirConexion()
    conexion.conexion.query("exec P_NUEVA_DIRECCION '"+JsonAddress.address_info[0].toUpperCase()+"' , '"+JsonAddress.address_info[1].toUpperCase()+"' , "+req.user)
                     .spread((result , metadata)=>{
                         res.status(200).send({ mensaje : result[0].DIRECCION_API_ID , status:200})
                     })
                     .catch((error)=>{
                        res.status(500).send({ mensaje : "Error del servidor" , status:500})
                     })
}

function Listar_Rubros(req, res){

    conexion.AbrirConexion()
    Rubros = []
    TError = false;
    conexion.conexion.query(" SELECT *  FROM DB_ORDENA.DBO.T_RUBRO  WHERE RUBRO_ESTADO = 1" )
                    .spread((result1, metadata)=>{
                        
                            Rubros = [{ Rubro_Codigo:0, Rubro_Nombre:'Todos',Rubro_Estado:1 }]

                            for(x=0; x<result1.length; x++){
                                Rubros.push({ Rubro_Codigo:result1[x].Rubro_Codigo , 
                                              Rubro_Nombre:result1[x].Rubro_Nombre ,
                                              Rubro_Estado:result1[x].Rubro_Estado})    
                            } 
                            
                            res.status(200).send({ mensaje: Rubros , status: 200 })                            
                     })
                     .catch((error)=>{   
                                res.status(500).send({ mensaje: "Error del servidor" , status: 500 })
                            })      
}

function Listar_Locales(req, res){
    conexion.AbrirConexion();
    Locales = [];
    if(req.params.rubro != 0){
        query = " SELECT Local_Codigo , Local_Nombre , "+
                " CASE   WHEN Local_Imagen = 1 THEN 'imagen_local/'+CAST( LOCAL_CODIGO AS NVARCHAR(10) )    ELSE 'imagen_local/default' END  Local_Imagen "+
                "   FROM DB_Ordena.dbo.T_Locales WHERE Rubro_Codigo = "+req.params.rubro+" AND Local_Estado = 1  "
    }else{
        query = " SELECT Local_Codigo , Local_Nombre , "+
                " CASE   WHEN Local_Imagen = 1 THEN 'imagen_local/'+CAST( LOCAL_CODIGO AS NVARCHAR(10) )    ELSE 'imagen_local/default' END  Local_Imagen "+        
                "  FROM DB_Ordena.dbo.T_Locales WHERE  Local_Estado = 1  "
    }
    
    conexion.conexion.query( query )
                     .spread((result , metadata)=>{
                            Locales = result
                            res.status(200).send({ mensaje: Locales , status: 200 })                            
                        })
                     .catch((error)=>{
                        res.status(500).send({ mensaje: "Error del servidor" , status: 500 })
                     })

 }




 function imagen_perfil(req ,res ){
    res.sendFile(path.resolve("Resource/"+req.params.usuario_id+"/"+req.params.usuario_id+".jpg"))
}

 function imagen_local(req ,res ){
    res.sendFile(path.resolve("Resource/Locales/"+req.params.local+".jpg"))
}

function Listar_Productos(req , res){
    conexion.AbrirConexion()
    Productos = [];
    query =" SELECT producto_codigo , producto_nombre , local_codigo , 'imagen_producto/'+CAST( Producto_codigo AS NVARCHAR(10) ) producto_imagen , producto_precio , producto_medida" +
           " FROM DB_ORDENA.DBO.T_PRODUCTOS "   +
           " WHERE producto_estado = 1 and local_codigo = "+req.params.local

    conexion.conexion.query( query )
            .spread((result , metadata)=>{
                Productos = result
                res.status(200).send({ mensaje: Productos , status: 200 })                            
            })
            .catch((error)=>{
            res.status(500).send({ mensaje: "Error del servidor" , status: 500 })
            })
}


function imagen_producto(req ,res ){
    res.sendFile(path.resolve("Resource/Productos/"+req.params.producto+".jpg"))
}


 module.exports = {
    Listar_Rubros                       ,
    EnviarPedido                        ,
    EnviarPedidoATM                     ,
    ListarOrdenes                       ,
    EnviarPedidoProgramado              ,
    ListarOrdenesProgramadas            ,
    DatosOrdenProgramadaSeleccionada    ,
    ListarItemsOrden                    ,
    editar_ordenes_programadas          ,
    cancelar_orden                      ,
    cancelar_producto                   ,
    imagen_perfil                       ,
    getUserApiId                        ,
    subir_imagen_perfil                 ,
    actualizar_informacion_perfil       ,
    eliminar_cuenta                     ,
    obtener_token                       ,
    Nueva_Direccion                     ,
    Listar_Locales                      ,
    imagen_local                        ,
    Listar_Productos                    ,
    imagen_producto
}
