var express = require("Express");
var controller = require("../Controllers/controller")
var auth = require("../Middlewares/auth")
var log = require("../Controllers/auth")
var api = express.Router();


api.post("/enviar_pedido",auth.isAuth,controller.EnviarPedido);
api.post("/enviar_pedidoATM",auth.isAuth,controller.EnviarPedidoATM);
api.post("/enviar_pedidoProgramado",auth.isAuth,controller.EnviarPedidoProgramado);
api.post("/editar_orden_programada",auth.isAuth,controller.editar_ordenes_programadas);
api.post("/cancelar_orden",auth.isAuth,controller.cancelar_orden);
api.post("/cancelar_producto",auth.isAuth,controller.cancelar_producto);
api.post("/subir_imagen_perfil",auth.isAuth,controller.subir_imagen_perfil);
api.post("/actualizar_perfil_usuario",auth.isAuth,controller.actualizar_informacion_perfil)
api.post("/eliminar_cuenta",auth.isAuth,controller.eliminar_cuenta)
api.post("/registrar_direccion",auth.isAuth,controller.Nueva_Direccion)

api.get("/listar_ordenes/:usuario/:accion/:token",auth.isAuth,controller.ListarOrdenes);
api.get("/listar_ordenes_programadas/:usuario/:token",auth.isAuth,controller.ListarOrdenesProgramadas);
api.get("/dato_orden_programada/:orden_id/:token",auth.isAuth,controller.DatosOrdenProgramadaSeleccionada);
api.get("/listar_item_orden/:orden_id/:token",auth.isAuth,controller.ListarItemsOrden);
api.get("/perfil_image/:usuario_id/:token",auth.isAuth,controller.imagen_perfil);
api.get("/obtener_usuario_api_id/:email/:nombre/:telefono",controller.getUserApiId);
api.get("/token/:email",controller.obtener_token)
api.get("/listar_rubros/:token",auth.isAuth,controller.Listar_Rubros)
api.get("/listar_locales/:token/:rubro",auth.isAuth,controller.Listar_Locales)
api.get("/imagen_local/:local/:token",auth.isAuth,controller.imagen_local)
api.get("/listar_productos/:token/:local",auth.isAuth,controller.Listar_Productos)
api.get("/imagen_producto/:producto/:token",auth.isAuth,controller.imagen_producto)


module.exports = api;