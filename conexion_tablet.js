//Librerías necesarias para el funcionamiento de la api.
var bd = require('./bd.json');
var sql = require('mssql');
var express = require('express');
var bodyParser = require('body-parser');

//Importamos archivo Helper con funciones útiles
var helper = require('./Helper');

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
});

app.use(bodyParser.json());//Soporte para codificar en JSON
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//Inicializacion del Web Server, escuchando en el puerto 24500
var server = app.listen(737, function(){
	console.log("[ APP LISTENING AT: 737 ]");
});


app.post('/buscarReserva', function(req, res){
	try {
	 sql.close();
	 }
	catch(err) {
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
		sqlQuery += " rv.patente, rv.id_vehiculo, rp.id_pasajero, rc.largo, rc.ancho, rc.alto, rc.peso, rc.descripcion";
		sqlQuery += " FROM reserva r";
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
		
	const pool1 = new sql.ConnectionPool(config, err =>{
		if(err){
			console.log(err);
		}

		pool1.request().query(sqlQuery, function(err, data){
			if(err){
				console.log(err);
			}
			res.send(data.recordset);
			sql.close();

		});
	});
	pool1.on("error", err =>{
		console.log(err);
	});
});

app.post('/datosPasajeroReserva', function(req, res){
	try {
        sql.close();
    }
    catch(err) {
        console.log("Error de cierre SQL")
    }

    var id_reserva = req.body.id_reserva;

    var sqlQuery = "SELECT rp.id_reserva, rp.id_pasajero, rp.id_pos_persona, rp.id_tarifa, r.id_cruce, r.estado, r.tipo_reserva, tp.validation_seed, doc.correlativo,";
        sqlQuery += " p.id_persona, p.rut, p.pasaporte, p.nombre, p.apellido, p.tipo, p.nacionalidad, p.fecha_nacimiento, c.id_nave, c.id_tramo, c.horario_cruce, tp.id_ticket,";
        sqlQuery += " a.id_asiento AS asiento, t.id_tramo, t.id_lugar,t.nombre_tramo,nas.etiqueta, rd.id_documento, rd.id_pos_documento, dp.id_forma_pago,";
        sqlQuery += " fp.descripcion AS forma_pago, tarifa.valor,	iso.nombre as nombre_pais, p.sexo, p.id_pos, r.id_pos_persona, r.id_persona as id_persona_r, tp.estado as estado_ticket";
        sqlQuery += " FROM reserva r join reserva_pasajero rp ON r.id_reserva=rp.id_reserva";
        sqlQuery += " JOIN persona p ON p.id_pos=rp.id_pos_persona and p.id_persona=rp.id_persona";
        sqlQuery += " JOIN cruce c ON c.id_cruce=r.id_cruce";
        sqlQuery += " JOIN tramo t ON t.id_tramo=c.id_tramo";
        sqlQuery += " LEFT JOIN asiento a ON a.id_pasajero=rp.id_pasajero and a.ext_id_reserva=r.id_reserva";
        sqlQuery += " LEFT JOIN nave_asiento nas ON nas.id_nave=c.id_nave and nas.id_asiento=a.id_asiento";
        sqlQuery += " LEFT JOIN reserva_documento rd ON rd.id_reserva=r.id_reserva AND rd.nro_doc=rp.nro_doc";
        sqlQuery += " LEFT JOIN documento_pago dp ON dp.id_pos=rd.id_pos_documento and dp.id_documento=rd.id_documento";
        sqlQuery += " LEFT JOIN forma_pago fp ON dp.id_forma_pago=fp.id_forma_pago";
        sqlQuery += " LEFT OUTER JOIN ticket_pasajero_v1 AS tp ON tp.id_reserva=r.id_reserva AND (tp.rut=p.rut OR tp.rut=p.pasaporte)";
        sqlQuery += " LEFT JOIN documento doc ON doc.id_pos=rd.id_pos_documento and doc.id_documento=rd.id_documento";
        sqlQuery += " LEFT OUTER JOIN tarifa ON rp.id_tarifa=tarifa.id_tarifa";
        sqlQuery += " LEFT OUTER JOIN iso3166 as iso ON p.nacionalidad=iso.codigo";
        sqlQuery += " WHERE r.id_reserva=" + id_reserva;
    
    query(sqlQuery, data =>{
        res.send(data);
    });
});

app.post('/datosVehiculoReserva', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log("Error de cierre SQL");
    }
    var id_reserva = req.body.id_reserva;

    var sqlQuery = 'SELECT rv.id_vehiculo,rv.id_tipo_vehiculo,rv.id_reserva,rv.patente,rv.largo,rv.alto,rv.ancho,rv.peso,rv.extras';
        sqlQuery += ' ,tv.id_tipo_vehiculo,tv.descripcion AS tipo_vehiculo';
        sqlQuery += ' ,rv.id_tarifa,t.nombre_tarifa,t.valor,rv.cantidad, r.id_pos_persona, r.id_persona, r.tipo_reserva, p.tipo, p.rut ';
        sqlQuery += ' ,tr.nombre_tramo, tr.nombre_corto, tr.id_tramo, p.nombre, p.apellido ';
        sqlQuery += ', n.nombre_nave,c.horario_cruce, c.id_cruce, c.horario_embarque_vehiculo, c.horario_presentacion';
        sqlQuery += ', tve.id_ticket, tve.validation_seed';
        sqlQuery += ' FROM reserva_vehiculo AS rv ';
        sqlQuery += ' join reserva r on r.id_reserva=rv.id_reserva';
        sqlQuery += ' left join persona p on p.id_pos=r.id_pos_persona and p.id_persona=r.id_persona';
        sqlQuery += ' join cruce c on c.id_cruce=r.id_cruce';
        sqlQuery += ' join tramo tr on tr.id_tramo=c.id_tramo';
        sqlQuery += ' join nave n on n.id_nave=c.id_nave';
        sqlQuery += ' INNER JOIN tipos.vehiculo AS tv ON rv.id_tipo_vehiculo=tv.id_tipo_vehiculo';
        sqlQuery += ' LEFT OUTER JOIN tarifa AS t ON rv.id_tarifa=t.id_tarifa';
        sqlQuery += ' left join ticket_vehiculo tve on tve.id_vehiculo=rv.id_vehiculo';
        sqlQuery += ' WHERE rv.id_reserva=' + id_reserva;
    
    query(sqlQuery, data =>{
        res.send(data);
    });
});
app.post('/datosCargaReserva', function(req,res){
    try{
        sql.close();
    }
    catch(err){
        console.log("Error de cierre SQL");
    }
    var id_reserva = req.body.id_reserva;

    var sqlQuery = "SELECT rc.id_carga,rc.id_reserva,rc.largo,rc.ancho,rc.alto,rc.peso,rc.tipo,rc.id_tarifa,rc.cantidad,rc.extras,rc.descripcion";
        sqlQuery += " ,rc.destinatario,rc.observaciones,t.id_item,t.id_tramo,t.id_tramo2,t.id_divisa,t.nombre_tarifa,t.valor";
        sqlQuery += " FROM reserva_carga AS rc";
        sqlQuery += " INNER JOIN tarifa AS t ON rc.id_tarifa=t.id_tarifa";
        sqlQuery += " WHERE id_reserva=" + id_reserva;

    query(sqlQuery, data=>{
        res.send(data)
    });
});

app.post('/reserva', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log("Error de cierre SQL");
    }

    var id_reserva = req.body.id_reserva;

    var sqlQuery = "SELECT r.id_reserva, r.id_cruce, cruce.id_tramo, r.id_pos_persona, r.id_persona, r.id_pos_cliente, r.id_cliente, rd.id_pos_documento, rd.id_documento,";
        sqlQuery += " d.correlativo, convert(datetime2, d.fecha) as fecha_pago, p.nombre, p.apellido, p.nacionalidad,";
        sqlQuery += " r.tipo_reserva, r.necesidad_especial, r.estado, r.agencia, r.extra_flags, r.fecha_limite_pago, r.id_user, r.fecha_creacion, r.id_user_mod, r.ultima_mod, r.observaciones,";
        sqlQuery += " r.nombre_contacto, r.telefono_contacto, r.email_contacto, p.tipo, p.rut, p.pasaporte, p.email as email_reserva, p.telefono, td.nombre_tipo_doc, td.id_tipo_doc,";
        sqlQuery += " cruce.id_tramo, nave_asiento.etiqueta as nro_asiento, asiento.id_pasajero, agencia.nombre AS nombre_agencia";
        /* datos cliente factura, si es que tiene factura la reserva*/
        sqlQuery += " ,c.rut as rut_cliente, c.razon_social, c.codigo_legal, c.giro, c.direccion, c.codigo_postal, c.comuna, c.ciudad, c.pais, c.email as email_cliente,";
        sqlQuery += " c.telefono, c.descuento_contado, c.regimen_especial, c.flex_cuenta_cte";
        sqlQuery += " FROM reserva AS r INNER JOIN cruce ON r.id_cruce = cruce.id_cruce";
        sqlQuery += " LEFT OUTER JOIN reserva_pasajero on r.id_reserva = reserva_pasajero.id_reserva";
        sqlQuery += " LEFT OUTER JOIN asiento on reserva_pasajero.id_pasajero = asiento.id_pasajero";
        sqlQuery += " LEFT OUTER JOIN nave_asiento on asiento.id_asiento = nave_asiento.id_asiento";
        sqlQuery += " LEFT OUTER JOIN persona AS p ON r.id_pos_persona=p.id_pos AND r.id_persona=p.id_persona";
        sqlQuery += " LEFT JOIN reserva_documento rd on rd.id_reserva=r.id_reserva";
        sqlQuery += " LEFT JOIN documento d on d.id_pos=rd.id_pos_documento and d.id_documento=rd.id_documento";
        sqlQuery += " LEFT JOIN tipo_documento td on d.id_tipo_doc=td.id_tipo_doc";
        sqlQuery += " LEFT OUTER JOIN agencia ON r.agencia=agencia.id_agencia";
        sqlQuery += " LEFT JOIN cliente c on c.id_cliente=r.id_cliente and c.id_pos=r.id_pos_cliente";
        sqlQuery += " WHERE r.id_reserva=" + id_reserva;

        query(sqlQuery, data =>{
            res.send(data[0]);
        });
});
app.post('/datosCruce', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log("Error de cierre SQL");
    }

    var id_cruce = req.body.id_cruce;

    var sqlQuery = "SELECT u.id_cruce,u.id_tramo,u.horario_cruce,u.tipo,u.estado,u.extras,u.horario_presentacion,";
        sqlQuery += " u.limite_reserva,u.duracion_reserva,u.limite_venta,u.id_nave,u.id_viaje,u.fecha_viaje,";
        sqlQuery += " u.cupo_pasajeros_web,u.cupo_vehiculos_web,u.cupo_pasajeros_maximo,u.cupo_pasajeros_utilizado,";
        sqlQuery += " u.cupo_vehiculos_maximo,u.cupo_vehiculos_utilizado, n.nombre_nave";
        sqlQuery += " ,t.nombre_tramo, s1.nombre_sitio AS origen, s2.nombre_sitio AS destino";
        sqlQuery += " , t.id_origen, t.id_destino";
        sqlQuery += " FROM cruce AS u INNER JOIN tramo AS t ON u.id_tramo=t.id_tramo";
        sqlQuery += " INNER JOIN sitio AS s1 ON t.id_origen=s1.id_sitio";
        sqlQuery += " INNER JOIN sitio AS s2 ON t.id_destino=s2.id_sitio";
        sqlQuery += " left join nave n on n.id_nave=u.id_nave";
        sqlQuery += " WHERE id_cruce=" + id_cruce
        sqlQuery += " ORDER BY horario_cruce";

    const pool1 = new sql.ConnectionPool(config, err =>{
        if(err){
            console.log(err);
        }
        pool1.request().query(sqlQuery, function(err, data){
            if(err){
                console.log(err);
            }
            res.send(data.recordset);
            sql.close();
        });
    });
    pool1.on("ERROR", err =>{
        console.log(err);
    });
    
    // query(sqlQuery, data =>{
    //     res.send(data);
    // });
});
app.post('/valorReserva', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log("Error de cierre SQL");
    }
    var id_reserva = req.body.id_reserva;
    var id_tramo = req.body.id_tramo;
    var pago_online = req.body.pago_online;
    var valor;
    var total = 0;
    var resultado;

    var sqlQuery = "SELECT x.id_tarifa,x.cantidad,t.valor,t.nombre_tarifa,i.exento,x.id_reserva,r.tipo_reserva";
        sqlQuery += " FROM (";
        sqlQuery += " SELECT id_reserva,id_tarifa, 1 AS cantidad FROM reserva_pasajero AS rp WHERE rp.id_reserva=" + id_reserva;
    // Si es tramo Natales Y el total es para el pago online, no incluir valor de vehiculos ni carga
    if(!(pago_online &&  helper.esTramoNatales(id_tramo) == true)){
        sqlQuery += " UNION ALL SELECT id_reserva,id_tarifa,cantidad FROM reserva_vehiculo AS rv WHERE rv.id_reserva=" + id_reserva;
        sqlQuery += " UNION ALL SELECT id_reserva,id_tarifa,cantidad FROM reserva_carga AS rc WHERE rc.id_reserva=" + id_reserva;
    }
        sqlQuery += ") AS x INNER JOIN tarifa AS t ON x.id_tarifa=t.id_tarifa";
        sqlQuery += " INNER JOIN item_servicio AS i ON i.id_item=t.id_item";
        sqlQuery += " INNER JOIN reserva AS r ON x.id_reserva=r.id_reserva";

    query(sqlQuery, data =>{
        resultado = data;
        if(resultado === false || resultado === true)
            return false;
        resultado.forEach(element => {
            valor = element.valor;
            if(helper.esTramoLeyNavarino(id_tramo) == true && (element.tipo_reserva == 512 && !element.exento)){
                valor = Math.round(valor/1.19);
            }
            total += valor * element.cantidad;
        });
        res.send(helper.formatoValor(total));
        
    });
});
app.post('/creadorReserva', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log("Error de cierre SQL");
    }
    var id_reserva = req.body.id_reserva;

    var sqlQuery = "SELECT u.nombre, u.apellido, r.fecha_creacion";
        sqlQuery += " FROM reserva AS r, usuario AS u";
        sqlQuery += "  WHERE u.id_usuario = r.id_user AND r.id_reserva = " + id_reserva;
    
    query(sqlQuery, data =>{
        res.send(data[0]);
    });

});
app.get('/getOrigenes', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log(err);
    }
    var sqlQuery = 'SELECT id_tramo,nombre_tramo,nombre_corto FROM tramo WHERE id_lugar IN (4,5,7)'

    query(sqlQuery, data =>{
        res.send(data);
        
    });
});
app.post('/getDestinos', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log(err);
    }
    var nombre_tramo = req.body.nombre_tramo;

    var sqlQuery = "SELECT id_tramo,nombre_tramo,nombre_corto FROM tramo";
        sqlQuery += " WHERE id_lugar IN (4,5,7) AND nombre_tramo LIKE '" + nombre_tramo + "%'";

    query(sqlQuery, data =>{
        res.send(data)
    });
});
app.get('/getPaises', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log(err);
    }
    
    var sqlQuery = "SELECT * FROM iso3166 ORDER BY orden, nombre";

    query(sqlQuery, data =>{
        res.send(data);
    });
});
app.post('/getPersona', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log(err);
    }

    var id_tipo_persona = req.body.id_tipo_persona;
    var rut_pasaporte = req.body.rut_pasaporte;

    var sqlQuery = "SELECT p.id_pos, p.id_persona, p.rut, p.pasaporte, p.nombre, p.apellido, p.estado, p.sexo, p.nacionalidad, p.tipo, p.extras, p.extras2, p.fecha_nacimiento,p.email,p.telefono, tp.descripcion";
        sqlQuery += "FROM persona p left join tipos.persona tp on p.tipo=tp.id_tipo_persona WHERE ";
        if(id_tipo_persona == 1){
            sqlQuery += "rut = '";
        }
        else{
            sqlQuery += "pasaporte = '";
        }
        sqlQuery += rut_pasaporte + "' ORDER BY p.tipo DESC";
    
    query(sqlQuery, data =>{
        res.send(data);
    });
});

app.post('/getCruces', function(req, res){
    try{
        sql.close();
    }
    catch(err){
        console.log(err);
    }

    var fecha_inicial = req.body.fecha_inicial;
    var fecha_final = req.body.fecha_final;
    var id_tramo = req.body.id_tramo;

    var sqlQuery = "SELECT id_cruce,id_tramo,horario_cruce,tipo,estado,extras,horario_presentacion,";
        sqlQuery += " limite_reserva,duracion_reserva,limite_venta,id_viaje,fecha_viaje,cupo_pasajeros_web,cupo_vehiculos_web,";
        sqlQuery += " cupo_pasajeros_maximo,cupo_pasajeros_utilizado,cupo_vehiculos_maximo,cupo_vehiculos_utilizado";
        sqlQuery += " FROM cruce";
        sqlQuery += " WHERE id_tramo = " +id_tramo + " AND CONVERT(VARCHAR, horario_cruce, 120) between '" + fecha_inicial + "%' AND '" + fecha_final + "%'";
        sqlQuery += " ORDER BY horario_cruce DESC";

    query(sqlQuery, data =>{
        res.send(data);
    });
});
app.post('/getPasajeroData', function(req,res){
    try{
        sql.close();
    }
    catch(err){
        console.log(err);
    }
    // tipo de indentificación corresponde a si el pasajero posee Rut (1) o pasaporte (2).
    var tipo_identificacion = req.body.tipo_identificacion;
    var num_identificacion  = req.body.num_identificacion;
    obtenerPersona(num_identificacion, tipo_identificacion, data=>{
        res.send(data);
    });
});

app.post('/guardarReserva', function(req,res){
    try{
        sql.close();
    }
    catch(err){
        console.log(err);
    }

    var id_cruce = req.body.id_cruce;
    var id_pos_persona = req.body.id_pos_persona;
    var id_persona = req.body.id_persona;
    var id_pos_cliente = req.body.id_pos_cliente;
    var id_cliente = req.body.id_cliente;
    var tipo_reserva = req.body.tipo_reserva;
    var estado = req.body.estado;
    var agencia = req.body.agencia;
    var necesidad_especial = req.body.necesidad_especial;
    var extra_flags = req.body.extra_flags;
    var fecha_limite_pago = req.body.fecha_limite_pago;
    var id_user = req.body.id_user;
    var fecha_creacion = req.body.fecha_creacion;
    var observaciones = req.body.observaciones;
    var contacto_nombre = req.body.contacto_nombre;
    var contacto_telefono = req.body.contacto_telefono;
    var contacto_mail = req.body.contacto_mail;
    var nombre_emergencia = req.body.nombre_emergencia;
    var telefono_emergencia = req.body.telefono_emergencia;
    var email_emergencia = req.body.email_emergencia;

    var sqlQuery = "INSERT INTO reserva ([id_cruce],[id_pos_persona],[id_persona],[id_pos_cliente],[id_cliente],[tipo_reserva],[estado],[agencia],";
        sqlQuery += "[necesidad_especial],[extra_flags],[fecha_limite_pago],[id_user],[fecha_creacion],[observaciones],[nombre_contacto],[telefono_contacto],";
        sqlQuery += "[email_contacto], [nombre_emergencia], [telefono_emergencia], [email_emergencia])";
        sqlQuery += " VALUES (" + id_cruce + ", " + id_pos_persona + ", " + id_persona + ", " + id_pos_cliente + ", " + id_cliente + ", " + tipo_reserva;
        sqlQuery += ", " + estado + ", " + agencia + ", " + necesidad_especial + ", " + extra_flags + ", '" + fecha_limite_pago + "', " + id_user + ", '" + fecha_creacion;
        sqlQuery += "', '" + observaciones + "', '" + contacto_nombre + "', '" + contacto_telefono + "', '" + contacto_mail + "', '" + nombre_emergencia + "', '" + telefono_emergencia;
        sqlQuery += "', '" + email_emergencia + "');";
        sqlQuery += " SELECT SCOPE_IDENTITY();";

    query(sqlQuery, data =>{
        console.log(data)
        res.send(data)
    });
});
app.post('/reporteListado')


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
  };

const obtenerPersona = async function (rut_pass, tipo, callback){
    if(!callback) callback = function(){};

    try {
        let sqlQuery = "SELECT p.id_pos, p.id_persona, p.rut, p.pasaporte, p.nombre, p.apellido, p.estado, p.sexo,";
            sqlQuery += " p.nacionalidad, p.tipo, p.extras, p.extras2, p.fecha_nacimiento,p.email,p.telefono, tp.descripcion,";
            sqlQuery += " p.residencia_ciudad, p.residencia_direccion, p.residencia_comuna, iso.nombre as pais";
            sqlQuery += " FROM persona as p";
            sqlQuery += " LEFT JOIN tipos.persona tp ON p.tipo=tp.id_tipo_persona";
            sqlQuery += " LEFT JOIN iso3166 iso ON iso.codigo=p.nacionalidad";
            sqlQuery += " WHERE ";
            if(tipo == 1) sqlQuery += "rut = '" + rut_pass + "'";
            else if(tipo == 2) sqlQuery += "pasaporte = '" + rut_pass + "'";
            sqlQuery += " ORDER BY p.tipo DESC";

        let result = await pool.request().query(sqlQuery);
        return callback(result.recordset);
    }catch (err){
        console.log(err);
        return callback(err);
    }
    finally{
    }
};