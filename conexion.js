//Librerías necesarias para el funcionamiento de la api.
var sql = require('mssql');
var express = require('express');
var bodyParser = require('body-parser');

//Inicializacion de servicio
var app = express();

//Conexión con servidor de TABSA
var config = {
	server: 'ventas.tabsa.cl',
	database: 'PuntoDeVenta',
	user: 'pos',
	password: 'p0s.Dv3nt4',
	port: 1433
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
 } catch(err) {
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

app.post('/buscarReserva', function(req, res){
	try {
	 sql.close();
 } catch(err) {
	 console.log("Error de cierre SQL")
 }

	var id_reserva = req.body.id_reserva;
	var identificacion = req.body.identificacion;
	var nombre = req.body.nombre;
	var apellido = req.body.apellido;
	var patente = req.body.patente;

	var sqlQuery = "SELECT r.id_reserva, r.id_pos_persona, r.id_persona, p.rut, p.pasaporte, p.nombre, p.apellido,";
		sqlQuery += " t.nombre_corto, t.nombre_tramo, r.necesidad_especial, c.fecha_viaje,";
		sqlQuery += " r.fecha_limite_pago, r.estado, r.tipo_reserva, r.tipo_reserva, r.observaciones, c.horario_cruce,";
		sqlQuery += " rv.patente, rv.id_vehiculo, rp.id_pasajero, rc.largo, rc.ancho, rc.alto, rc.peso, rc.descripcion"
		sqlQuery += " FROM reserva r"
		sqlQuery += " LEFT JOIN reserva_pasajero rp ON rp.id_reserva=r.id_reserva";
		sqlQuery += " LEFT JOIN persona p ON p.id_persona=rp.id_persona and p.id_pos=rp.id_pos_persona";
		sqlQuery += " LEFT JOIN cruce c ON c.id_cruce=r.id_cruce";
		sqlQuery += " LEFT JOIN tramo t ON t.id_tramo=c.id_tramo";
		sqlQuery += " LEFT JOIN reserva_vehiculo rv ON rv.id_reserva=r.id_reserva";
		sqlQuery += " LEFT JOIN reserva_carga rc ON r.id_reserva=rc.id_reserva";
		sqlQuery += " WHERE 1=1 ";
		if (id_reserva)
			sqlQuery += " AND r.id_reserva=" + id_reserva + " ";
		if (identificacion)
			sqlQuery += " AND (p.rut LIKE '%" + identificacion + "%' or p.pasaporte LIKE '%" + identificacion  +"%') ";
		if (nombre)
			sqlQuery += " AND p.nombre LIKE '%" + nombre + "%' ";
		if (apellido)
			sqlQuery += " AND p.apellido LIKE '%" + apellido + "%' ";
		if (patente)
			sqlQuery += " AND rv.patente LIKE '%" + patente + "%' ";
		sqlQuery += " ORDER BY r.id_reserva DESC ";
		
	const pool9 = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}

		pool9.request().query(sqlQuery, function(err, data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();

		});
	});
	pool9.on("error", err =>{
		console.log(err);
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
