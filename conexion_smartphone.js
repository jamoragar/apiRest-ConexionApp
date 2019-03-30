//Librerías necesarias para el funcionamiento de la api.
var bd = require('./bd.json');
var sql = require('mssql');
var express = require('express');
var bodyParser = require('body-parser');

//Inicializacion de servicio
var app = express();

//Conexión con servidor de TABSA
var config = {
	server: bd.ventas.server,
	database: bd.ventas.database,
	user: bd.ventas.user,
	password: bd.ventas.password,
	port: bd.ventas.port
};

const pool = new sql.ConnectionPool(config);
pool.connect();
pool.on('error', err=> {
  if (err) {
    console.log(err)
  }
  if (!err) {
    pool.connect();
  }
})

app.use(bodyParser.json());//Soporte para codificar en JSON
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//Inicializacion del Web Server, escuchando en el puerto 24500
var server = app.listen(24500, function(){
	console.log("App listening at 24500");
});

// S.P. de Usuarios, para login
app.get('/Users', function(req, res){
	try {
	 sql.close();
	} catch(err) {
	 console.log("Error de cierre SQL")
	}

	var q = `EXEC [apps].[getUsuarios]`;
	query(q, data => {
		res.send(data);
	});
});

// S.P. de obtención de sitios
app.get('/Sitios', function(req, res){
	try {
	 sql.close();
	} catch(err) {
	 console.log("Error de cierre SQL")
	}

	var q = `EXEC [apps].[obtenerSitios]`;
	query(q, data =>{
		res.send(data);
	});
});

// S.P. de Obtención de cruces según fecha
app.post('/Cruces', function(req, res){
	try {
	 sql.close();
 } catch(err) {
	 console.log("Error de cierre SQL")
 }

	var fecha = req.body.fecha;
	const pool3 = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}
		pool3.request().query("EXEC [apps].[obtenerCruces] @inicio = '" + fecha + "'", function(err, recordset){
			if(err){
				console.log(err);
			}
			res.send(recordset);
			sql.close();

		});
	});
	pool3.on("error", err =>{
		console.log(err);
	});
});
// S.P. de Validación de Ticket
app.post('/valTicket', function(req, res){
	try {
	 sql.close();
 } catch(err) {
	 console.log("Error de cierre SQL")
 }

	var id_ticket = req.body.id_ticket;
	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;
	var val_seed = req.body.val_seed;

	const pool4 = new sql.ConnectionPool(config, err =>{

		if(err){
			console.log(err);
		}
		pool4.request().query("EXEC [apps].[validarTicket] @id_ticket = "+ id_ticket +",@id_cruce = " + id_cruce + ",@id_tramo = " + id_tramo + ",@val_seed = " + val_seed, function(err, data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();

		});
	});
	pool4.on("error", err =>{
		console.log(err);
	});
});
// S.P. de validación de ticket Vehículo
app.post('/valTicketVehiculo',function (req,res){
	try {
		sql.close();
	} catch (err) {
		console.log('Error de Cierre SQL');
	}

	var id_ticket = req.body.id_ticket;
	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;
	var val_seed = req.body.val_seed;

	const pool5 = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}
		pool5.request().query("EXEC [apps].[validarTicketVehiculo] @id_ticket = "+ id_ticket + ",@id_cruce = " + id_cruce + ",@id_Tramo = " +id_tramo + ",@val_seed = " + val_seed, function(err,data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();
		});
	});
	pool5.on("error",err =>{
		console.log(err);
	});
});
// S.P. de utilización de ticket
app.post('/utilTicket', function(req, res){
	try {
	 sql.close();
 } catch(err) {
	 console.log("Error de cierre SQL")
 }

	var id_ticket = req.body.id_ticket;
	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;
	var val_seed = req.body.val_seed;
	var id_usuario = req.body.id_usuario;

	const pool6 = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}
		pool6.request().query("EXEC [apps].[utilizarTicket] @id_ticket = " + id_ticket + ",@id_cruce = " + id_cruce + ",@id_tramo = " + id_tramo + ",@val_seed = " + val_seed + ",@id_usuario = " + id_usuario, function(err, data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();

		});
	});
	pool6.on("error", err =>{
		console.log(err);
	});
});

//S.P. de utilización de ticket Vehículo
app.post('/utilTicketVehiculo', function(req, res){
	try {
		sql.close();
	} catch (err) {
		console.log('Error de cierre SQL');
	}

	var id_ticket = req.body.id_ticket;
	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;
	var val_seed = req.body.val_seed;
	var id_usuario = req.body.id_usuario;


	const poolX = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}
		poolX.request().query("EXEC [apps].[utilizarTicketVehiculo] @id_ticket = " + id_ticket + ",@id_cruce = " + id_cruce + ",@id_tramo = " + id_tramo + ",@val_seed = " + val_seed + ",@id_usuario = " + id_usuario, function(err,data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();
		});
	});
	poolX.on("error", err =>{
		console.log(err);
	});
});

// S.P. de la cantidad de pasajeros Embarcados segun id de cruce y tramo
app.post('/cantPasajeros', function(req, res){
	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;

	try {
	 sql.close();
 } catch(err) {
	 console.log("Error de cierre SQL")
 }
 var q = `EXEC [apps].[getCantidadPasajerosEmbarcados] @id_cruce = ` + id_cruce + `,@id_tramo = ` + id_tramo;
 query(q,data =>{
	 res.send(data);
 })
});

// S.P. de la Lista de pasajeros que falta por embarcar segun id de cruce y tramo
app.post('/pendientePasajeros', function(req, res){
	try {
	 sql.close();
	 }
	 catch(err) {
	 console.log("Error de cierre SQL")
 	}

	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;

	const pool7 = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}
		pool7.request().query("EXEC [apps].[getListadoPasajerosPorEmbarcar] @id_cruce = " + id_cruce + ",@id_tramo = " + id_tramo, function(err, data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();

		});
	});
	pool7.on("error", err =>{
		console.log(err);
	});
});
// S.P. de la Lista de pasajeros que Actualmente estan embarcados, según cruce y tramo
app.post('/embarcadosPasajeros', function(req, res){
	try {
	 sql.close();
 } catch(err) {
	 console.log("Error de cierre SQL")
 }

	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;

	const pool8 = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}
		pool8.request().query("EXEC [apps].[getListadoPasajerosEmbarcados] @id_cruce = " + id_cruce + ",@id_tramo = " + id_tramo, function(err, data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();

		});
	});
	pool8.on("error", err =>{
		console.log(err);
	});
});
//Query que devuelve el listado de pasajeros embarcados y/o por embarcar, según cruce y tramo. Donde estado = 8 es por embarcar y 16 es embarcados
app.post('/pasajerosEmbarcadosOrNot', function(req,res){
	try {
		sql.close();
	} catch(err) {
		console.log("Error de cierre SQL")
	}
	
	var id_cruce = req.body.id_cruce;
	var id_tramo = req.body.id_tramo;

	var sqlQuery = "SELECT reserva_pasajero.id_reserva, reserva_pasajero.observaciones, reserva_pasajero.id_pasajero, persona.nombre, persona.apellido, nave_asiento.etiqueta as asiento, persona.rut"
		sqlQuery += " , persona.pasaporte , reserva.estado , iso3166.nombre AS pais , persona.telefono , persona.fecha_nacimiento, tramo.nombre_tramo";
		sqlQuery += " , tramo.nombre_corto, reserva.necesidad_especial, tv1.estado as estado_embarque, tramo.id_tramo, tp.descripcion as tipo_pasajero";
		sqlQuery += " , t.valor, reserva.fecha_creacion, cruce.fecha_viaje, cruce.id_viaje, cruce.id_cruce";
		sqlQuery += " , reserva.agencia_tipo_doc,reserva.agencia_nro_doc,reserva.agencia_forma_pago,reserva.agencia_extras";
		sqlQuery += " FROM reserva INNER JOIN reserva_pasajero ON reserva.id_reserva = reserva_pasajero.id_reserva";
		sqlQuery += " INNER JOIN persona ON reserva_pasajero.id_persona = persona.id_persona AND reserva_pasajero.id_pos_persona = persona.id_pos";
		sqlQuery += " INNER JOIN iso3166 ON persona.nacionalidad = iso3166.codigo INNER JOIN cruce ON reserva.id_cruce = cruce.id_cruce";
		sqlQuery += " INNER JOIN tramo ON tramo.id_tramo=cruce.id_tramo LEFT OUTER JOIN asiento on asiento.id_pasajero = reserva_pasajero.id_pasajero";
		sqlQuery += " LEFT OUTER JOIN nave_asiento on nave_asiento.id_asiento = asiento.id_asiento and nave_asiento.id_nave = asiento.id_nave";
		sqlQuery += " LEFT JOIN tarifa t on t.id_tarifa=reserva_pasajero.id_tarifa";
		sqlQuery += " LEFT JOIN tipos.persona tp on tp.id_tipo_persona=persona.tipo"
		sqlQuery += " LEFT JOIN ticket_pasajero_v1 tv1 ON (tv1.rut=persona.rut or tv1.rut=persona.pasaporte) AND tv1.nombre=persona.nombre AND tv1.apellido=persona.apellido AND tv1.id_reserva=reserva_pasajero.id_reserva";
		sqlQuery += " WHERE cruce.id_cruce = " + id_cruce + " AND (reserva.estado & 64) > 0 AND tv1.estado = 8 and tramo.id_tramo = " + id_tramo

	query(sqlQuery, data =>{
		res.send(data);
	});

});


var query = async function (q, callback) {
  if (!callback) callback = function () {};

  try {
    let result = await pool.request().query(q);

    return callback(result.recordset);
  } catch (err) {
    console.log(err);
    return callback(err);
  }
	 finally {
  }
}
