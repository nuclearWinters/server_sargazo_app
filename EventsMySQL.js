const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const WebSocket = require('ws');
var express = require('express')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
var bodyParser = require('body-parser');

var app = express()

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}))

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '@sm2sm2Programad0res',
  database : 'sargazo_transaccional_nv'
});


/*/obtenerDepositos*/

app.post("/post_token_notification", (req, res) => {
  let { token } = req.body
  let { user_id } = req.body
  let query = 'SELECT * from `tokens_notifications` WHERE token = ?'
  let table = [token]
  query = mysql.format(query, table)
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error)
      res.status(403).json([])
    } else {
      console.log(results.length)
      if (results.length === 0) {
        let query = 'INSERT INTO `tokens_notifications` (`id`, `token`, `user_id`) VALUES ?'
        let table = [[uuidv4(), token, user_id]]
        //query = mysql.format(query, table)
        connection.query(query, [table], (error, results, fields) => {
          if (error) {
            console.log(error)
            res.status(403).json([])
          } else {
            res.json(results)
          }
        })
      } else {
        res.status(403).json([])
      }
    }
  })
})

app.get("/imagenPortadaDetalles", (req, res) => {
  let id = req.query.id
  connection.query('SELECT * FROM `seguimiento_fotos` WHERE proyectos_detalles_seguimiento_id = "'+id+'" LIMIT 1' , (error, results, fields) => {
    if (error) {
      res.status(403).json([])
    } else {
      res.json(results)
    }
  })
})

app.get("/imagenPortadaProyectos", (req, res) => {
  let id = req.query.id
  connection.query('SELECT * FROM `seguimiento_fotos` WHERE proyectos_detalles_id = "'+id+'" LIMIT 1' , (error, results, fields) => {
    if (error) {
      res.status(403).json([])
    } else {
      res.json(results)
    }
  })
})

app.put("/findProyectoDetallesSeguimientoByIDAndUpdate", (req, res) => {
  let table = [req.body.coord_inicio_x, req.body.coord_inicio_y, req.body.coord_fin_x, req.body.coord_fin_y, req.body.id]
  console.log(table)
  let query = 'UPDATE `proyectos_detalles_seguimiento` SET coord_inicio_x = ?, coord_inicio_y = ?, coord_fin_x = ?, coord_fin_y = ? WHERE id = ?'
  query = mysql.format(query, table)
  connection.query(query, (error, results, fields) => {
    if (error) {
      res.status(403).json([])
    } else {
      res.json(results)
    }
  })
})

app.get("/obtenerFotosHoteles", (req, res) => {
  let id  = '"' + req.query.id + '"'
  connection.query('SELECT * FROM `hoteles_fotos` WHERE cat_hotel_id = ' + id, (error, results, fields) => {
    console.log("yes")
    if (error) {
      console.log(error)
      res.status(403).json([])
    } else {
      console.log(results)
      res.json(results)
    }
  });
})

app.get("/obtenerFotosDetalles", (req, res) => {
  let id  = '"' + req.query.id + '"'
  connection.query('SELECT * FROM `seguimiento_fotos` WHERE proyectos_detalles_seguimiento_id = ' + id, (error, results, fields) => {
    console.log("yes")
    if (error) {
      console.log(error)
      res.status(403).json([])
    } else {
      res.json(results)
    }
  });
})

app.post("/guardarFotosHotel", (req, res) => {
  let query = 'INSERT INTO `hoteles_fotos`(`id`, `cat_hotel_id`, `foto`, `coord_x`, `coord_y`, `fecha_dispositivo`) VALUES ?'
  let request_table = req.body.fotos.map((ft, i) => 
    [uuidv4(), ft.id_hotel, "data:image/jpeg;base64," + ft.image, ft.coord_x, ft.coord_y, ft.date]
  )
  //res.status(403).json([])
  query = mysql.format(query, [request_table]);
  connection.query(query, [request_table], (error, results, fields) => {
    if (error) {
      console.log(error)
      res.status(403).json([])
    } else {
      res.json(results)
    }
  });
})

//INSERT INTO `seguimiento_fotos`(`id`, `proyectos_detalles_seguimiento_id`, `proyectos_detalles_id`, `foto`) VALUES ?
app.post("/guardarFotosDetalles", (req, res) => {
  let query = 'INSERT INTO `seguimiento_fotos`(`id`, `proyectos_detalles_seguimiento_id`, `tipo`, `tamanio`, `foto`) VALUES ?'
  let request_table = req.body.fotos.map((ft, i) => 
    [uuidv4(), ft.id_detalle ? ft.id_detalle : null, "image/jpeg", Buffer.from(ft.img.substring(ft.img.indexOf(',') + 1)).length, "data:image/jpeg;base64," + ft.img]
  )
  //res.status(403).json([])
  query = mysql.format(query, [request_table]);
  connection.query(query, [request_table], (error, results, fields) => {
    if (error) {
      console.log(error)
      res.status(403).json([])
    } else {
      res.json(results)
    }
  });
})


app.get("/obtenerMunicipios", (req, res) => {
  connection.query('SELECT * FROM `cat_municipios`', (error, results, fields) => {
    res.json(results)
  });
})

app.get("/obtenerContratos", (req, res) => {
  connection.query('SELECT * FROM `proyectos`', (error, results, fields) => {
    if (error) {
      console.log(error)
    } else {
      results = results.map(res => {
        res.archivo_contrato = null
        return res
      })
      res.json(results)
    }
  });
})

//SELECT cat_playas.nombre as `playaNombre`, cat_tipo_seguimiento.nombre as `seguimientoNombre`, proyectos_detalles.nombre as `proyectoNombre`, proyectos_detalles_seguimiento.id, proyectos_detalles_seguimiento.proyecto_detalles_id, proyectos_detalles_seguimiento.id_playa, proyectos_detalles_seguimiento.cat_deposito_id, proyectos_detalles_seguimiento.id_tipo_seguimiento, proyectos_detalles_seguimiento.nombre_coordinador, proyectos_detalles_seguimiento.barrera_instalada, proyectos_detalles_seguimiento.coord_inicio_x, proyectos_detalles_seguimiento.coord_inicio_y, proyectos_detalles_seguimiento.coord_fin_x, proyectos_detalles_seguimiento.coord_fin_y, proyectos_detalles_seguimiento.coord_deposito_sargazo, proyectos_detalles_seguimiento.cantidad_sargazo, proyectos_detalles_seguimiento.ml_zona_costera, proyectos_detalles_seguimiento.m3_residuo_agua, proyectos_detalles_seguimiento.m3_residuo_linea_costera, proyectos_detalles_seguimiento.fecha, proyectos_detalles_seguimiento.hr_inicio_actividad, proyectos_detalles_seguimiento.hr_fin_actividad, proyectos_detalles_seguimiento.observaciones, proyectos_detalles_seguimiento.viajes_residuos, proyectos_detalles_seguimiento.num_empleados, proyectos_detalles_seguimiento.activo, proyectos_detalles_seguimiento.created, proyectos_detalles_seguimiento.modified, cat_depositos.nombre as `depositoNombre` FROM `proyectos_detalles_seguimiento` JOIN `cat_playas` ON cat_playas.id = proyectos_detalles_seguimiento.id_playa JOIN `cat_depositos` ON cat_depositos.id = proyectos_detalles_seguimiento.cat_deposito_id JOIN `cat_tipo_seguimiento` ON cat_tipo_seguimiento.id = proyectos_detalles_seguimiento.id_tipo_seguimiento JOIN `proyectos_detalles` ON proyectos_detalles.id = proyectos_detalles_seguimiento.proyecto_detalles_id
//SELECT cat_playas.nombre as `playaNombre`, cat_tipo_seguimiento.nombre as `seguimientoNombre`, proyectos_detalles.nombre as `proyectoNombre`, proyectos_detalles_seguimiento.id, proyectos_detalles_seguimiento.proyecto_detalles_id, proyectos_detalles_seguimiento.id_playa, proyectos_detalles_seguimiento.cat_deposito_id, proyectos_detalles_seguimiento.id_tipo_seguimiento, proyectos_detalles_seguimiento.nombre_coordinador, proyectos_detalles_seguimiento.barrera_instalada, proyectos_detalles_seguimiento.coord_inicio_x, proyectos_detalles_seguimiento.coord_inicio_y, proyectos_detalles_seguimiento.coord_fin_x, proyectos_detalles_seguimiento.coord_fin_y, proyectos_detalles_seguimiento.coord_deposito_sargazo, proyectos_detalles_seguimiento.cantidad_sargazo, proyectos_detalles_seguimiento.ml_zona_costera, proyectos_detalles_seguimiento.m3_residuo_agua, proyectos_detalles_seguimiento.m3_residuo_linea_costera, proyectos_detalles_seguimiento.fecha, proyectos_detalles_seguimiento.hr_inicio_actividad, proyectos_detalles_seguimiento.hr_fin_actividad, proyectos_detalles_seguimiento.observaciones, proyectos_detalles_seguimiento.viajes_residuos, proyectos_detalles_seguimiento.num_empleados, proyectos_detalles_seguimiento.activo, proyectos_detalles_seguimiento.created, proyectos_detalles_seguimiento.modified, cat_depositos.nombre as `depositoNombre` FROM `proyectos_detalles_seguimiento` JOIN `cat_playas` ON cat_playas.id = proyectos_detalles_seguimiento.id_playa JOIN `cat_depositos` ON cat_depositos.id = proyectos_detalles_seguimiento.cat_deposito_id JOIN `cat_tipo_seguimiento` ON cat_tipo_seguimiento.id = proyectos_detalles_seguimiento.id_tipo_seguimiento JOIN `proyectos_detalles` ON proyectos_detalles.id = proyectos_detalles_seguimiento.proyecto_detalles_id
app.get("/obtenerDetalles", (req, res) => {
  connection.query('SELECT * FROM `proyectos_detalles_seguimiento`', (error, results, fields) => {
    if (error) {
      console.log(error)
    } else {
      res.json(results)
    }
  });
})

app.get("/obtenerDepositos", (req, res) => {
  connection.query('SELECT * FROM `cat_depositos`', (error, results, fields) => {
    res.json(results)
  });
})

app.get("/obtenerPlayas", (req, res) => {
  connection.query('SELECT * FROM `cat_playas`', (error, results, fields) => {
    res.json(results)
  });
})

app.get("/obtenerProyectos", (req, res) => {
  connection.query('SELECT * FROM `proyectos_detalles`', (error, results, fields) => {
    res.json(results)
  });
})

app.post("/editDetalle", (req, res) => {
  console.log("Llego")
  let query = "UPDATE `proyectos_detalles_seguimiento` SET `id_playa`= ?,`cat_deposito_id`= ?,`nombre_coordinador`= ?,`barrera_instalada`= ?,`cantidad_sargazo`= ?,`ml_zona_costera`= ?,`m3_residuo_agua`= ?,`m3_residuo_linea_costera`= ?,`fecha`= ?,`hr_inicio_actividad`= ?,`hr_fin_actividad`= ?,`observaciones`= ?,`viajes_residuos`= ?,`modified`= CURRENT_TIMESTAMP WHERE id = ?"
  let { id_playa, cat_deposito_id, nombre_coordinador, barrera_instalada, cantidad_sargazo, ml_zona_costera, m3_residuo_agua, m3_residuo_linea_costera, fecha, hr_inicio_actividad, hr_fin_actividad, observaciones, viajes_residuos, id } = req.body
  let request_table = [id_playa, cat_deposito_id , nombre_coordinador, barrera_instalada, cantidad_sargazo, ml_zona_costera, m3_residuo_agua, m3_residuo_linea_costera, fecha.slice(0, 10), hr_inicio_actividad, hr_fin_actividad, observaciones, viajes_residuos, id]
  console.log(request_table)
  //res.status(403).json([])
  let sql = mysql.format(query, request_table)
  console.log(sql)
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.log(error)
      res.status(403).json([])
    } else {
      console.log("Written")
      res.json(results)
    }
  });
})

app.post("/createDetalle", (req, res) => {
  console.log("Llego")
  let query = "INSERT INTO `proyectos_detalles_seguimiento`(`id`, `proyecto_detalles_id`, `id_playa`, `cat_deposito_id`, `id_tipo_seguimiento`, `nombre_coordinador`, `barrera_instalada`, `coord_inicio_x`, `coord_inicio_y`, `coord_fin_x`, `coord_fin_y`, `coord_deposito_sargazo`, `cantidad_sargazo`, `ml_zona_costera`, `m3_residuo_agua`, `m3_residuo_linea_costera`, `fecha`, `hr_inicio_actividad`, `hr_fin_actividad`, `observaciones`, `viajes_residuos`, `activo`) VALUES ?"
  let { id, proyectos_detalles_id, id_playa, cat_deposito_id, nombre_coordinador, barrera_instalada, coord_inicio_x, coord_inicio_y,coord_fin_x, coord_fin_y, coord_deposito_sargazo, cantidad_sargazo, ml_zona_costera, m3_residuo_agua, m3_residuo_linea_costera, fecha, hr_inicio_actividad, hr_fin_actividad, observaciones, viajes_residuos, activo } = req.body
  let request_table = [[id, proyectos_detalles_id, id_playa, cat_deposito_id, "1c530bf8-9eaf-471b-8fdf-9e3212ff4467" , nombre_coordinador, barrera_instalada, coord_inicio_x, coord_inicio_y,coord_fin_x, coord_fin_y, coord_deposito_sargazo, cantidad_sargazo, ml_zona_costera, m3_residuo_agua, m3_residuo_linea_costera, fecha.slice(0, 10), hr_inicio_actividad, hr_fin_actividad, observaciones, viajes_residuos, activo]]
  console.log(request_table)
  //res.status(403).json([])
  connection.query(query, [request_table], (error, results, fields) => {
    if (error) {
      console.log(error)
      res.status(403).json([])
    } else {
      console.log("Written")
      res.json(results)
    }
  });
})

app.post('/updateUser', (req, res) => {
  const array = req.body.data
  let decoded = jwt.verify(req.body.token, 'sm2programadores')
  let isFirst = true
  let responseArray = []
  let properties = array.reduce((str, arr, i) => {
    for (let every in arr) {
      if (isFirst !== true && arr[every] !== null) {
        str += ","
      }
      if (arr[every] !== null) {
        str += " " + every + " = ?"
        isFirst = false
        responseArray.push(every)
      }
    }
    return str
  }, '')
  let query = "Update users SET" + properties + " WHERE id = ?";
	let table = array.reduce((ini, arr) => {
    for (let every in arr) {
      if (arr[every] !== null) {
        console.log(arr[every])
        ini.push(arr[every])
      }
    }
    return ini
  }, [])
  table.push(decoded.id)
  query = mysql.format(query,table)
  connection.query(query, (error, results, fields) => {
    res.json(responseArray)
  })
})

app.get('/loginFB', (req, res) => {
  let username = req.query.id
  var query = "SELECT * FROM `users` WHERE username = ?";
	var table = [username];
  query = mysql.format(query,table);
  connection.query(query, (error, results, fields) => {
    if (results.length !== 0) {
      var token = jwt.sign({
        id: results[0].id,
        nombre: results[0].nombres,
        email: results[0].email,
        apellidos: results[0].apellidos,
        grupo: results[0].cat_grupo_id,
        hotel: results[0].cat_hoteles_id,
        username: results[0].username
      }, 'sm2programadores')
      res.json(token)
    }
    else if (results.length === 0) {
      let password = bcrypt.hashSync(req.query.id, 8)
      let nombre = req.query.nombre
      let apellidos = req.query.apellido
      let email = req.query.email
      let username = req.query.id
      let grupo = "3727c908-c699-11e8-a393-14dda990f926"
      let id = uuidv4()
      let date = new Date()
      connection.query('INSERT INTO `users`(`id`, `cat_grupo_id`, `nombres`, `apellidos`, `email`, `username`, `password`, `ultimo_acceso`, `activo`) VALUES ("' + id + '","' + grupo + '","' + nombre + '","' + apellidos + '","' + email +'","' + username + '","' + password + '",' + connection.escape(date) + ', 1)', (error, results1, fields) => {
        var token = jwt.sign({
          id: id,
          nombre: req.query.nombre,
          email: req.query.email,
          apellidos: req.query.apellido,
          grupo: "3727c908-c699-11e8-a393-14dda990f926",
          username: username
        }, 'sm2programadores')
        res.json(token)
      });
    }
  })
})

app.get('/login', (req, res) => {
  let username = req.query.username
  let password = req.query.password
  var query = "SELECT * FROM `users` WHERE username = ?";
  var table = [username];
  console.log(username, password)
  query = mysql.format(query,table);
  connection.query(query, (error, results, fields) => {
    if (results.length !== 0) {
      console.log("Existe")
      const hashBool = bcrypt.compareSync(password, results[0].password)
      if (hashBool) {
        var token = jwt.sign({
          id: results[0].id,
          nombre: results[0].nombres,
          email: results[0].email,
          apellidos: results[0].apellidos,
          grupo: results[0].cat_grupo_id,
          username: results[0].username,
          hotel: results[0].cat_hoteles_id
        }, 'sm2programadores')
        console.log("Accesado")
        res.json(token)
      }
      else {
        console.log("Negado")
        res.status(403).send("Forbidden")
      }
    }
    else {
      console.log("Negado")
      res.status(403).send("Forbidden")
    }
  })
})

app.get('/registro', (req, res) => {
  connection.query('SELECT EXISTS(SELECT 1 FROM `users` WHERE `username` = "' + req.query.username + '")', (error, results, fields) => { 
    let response = 0
    for (const result in results[0]) {
      response = results[0][result]
    }
    if (response === 0) {
      let password = bcrypt.hashSync(req.query.password, 8)
      let nombre = req.query.nombre
      let apellidos = req.query.apellidos
      let email = req.query.email
      let username = req.query.username
      let grupo = req.query.grupo
      let id = uuidv4()
      var date = new Date()
      connection.query('INSERT INTO `users`(`id`, `cat_grupo_id`, `nombres`, `apellidos`, `email`, `username`, `password`, `ultimo_acceso`, `activo`) VALUES ("' + id + '","' + grupo + '","' + nombre + '","' + apellidos + '","' + email +'","' + username + '","' + password + '",' + connection.escape(date) + ', 1)', (error, results, fields) => {
        res.json(results)
      })
    }
    else {
      res.status(403).send("Forbidden")
    }
  })
})

app.get("/userData", (req, res) => {
  let decoded = jwt.verify(req.query.token, 'sm2programadores')
  const id = decoded.id
  var query = "SELECT * FROM `users` WHERE id = ?";
	var table = [id];
  query = mysql.format(query,table);
  connection.query(query, (error, results, fields) => {
    //console.log(results)
    res.json(results)
  })
})

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

app.listen(3000)

//Servidor
const wss = new WebSocket.Server({ port: 8080 });

function toEvent (message) {
    try {
        var event = JSON.parse(message);
        this.emit(event.type, event.payload);
    } catch(err) {
        console.log('not an event' , err);
    }
}

wss.on('connection', function(ws) {
  console.log("user connected")
    ws.on('message', toEvent)
    .on('firstOpen', (data) => {
      var decoded = jwt.verify(data, 'sm2programadores')
        ws.subscribedTo = {
          personalID: decoded.id
        }
        console.log(ws.subscribedTo)
        wss.clients.forEach(function each(client) {
          if (client === ws) {
            client.send(JSON.stringify("Subcribed!"));
          }
        });
    })
    .on('subscription', (data) => {
      let msg = {
        type: "user_info",
        payload: data
      }
      response = JSON.stringify(msg)
      wss.clients.forEach(function each(client) {
        if (client.subscribedTo) {
          console.log(client.subscribedTo.personalID)
          if (client.subscribedTo.personalID.includes(data[0].id)) {
            client.send(response);
          }
        }
      });
    })
    .on('subscriptionProyecto', (data) => {
      let msg = {
        type: "user_proyectos",
        payload: data
      }
      response = JSON.stringify(msg)
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          console.log()
          client.send(response);
        }
      });
    })
    ws.on('close', (data) => {
      console.log("user disconnected");
  })
  .on('subscriptionProyecto_delete', (data) => {
    let msg = {
      type: "user_proyectos_delete",
      payload: data
    }
    response = JSON.stringify(msg)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(response);
      }
    });
  })
  .on('subscriptionProyectoSeguimiento', (data) => {
    console.log(data)
    let msg = {
      type: "user_proyectos_seguimiento",
      payload: data
    }
    response = JSON.stringify(msg)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log(client.subscribedTo)
        client.send(response);
      }
    });
  })
  .on('subscriptionProyectoSeguimiento_delete', (data) => {
    console.log(data)
    let msg = {
      type: "user_proyectos_seguimiento_delete",
      payload: data
    }
    response = JSON.stringify(msg)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(response);
      }
    });
  })
  ws.on('close', (data) => {
    console.log("user disconnected");
});
  
});

//Cliente
const ws = new WebSocket('ws://sm2test.cloudapp.net:8080');

//Detector de cambios
const program = async () => {
  const connection1 = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '@sm2sm2Programad0res',
  });

  const instance = new MySQLEvents(connection1, {
    startAtEnd: true,
    excludedSchemas: {
        mysql: true,
      },
  });

  await instance.start();

  instance.addTrigger({
    name: 'user_info',
    expression: 'sargazo_transaccional_nv.users',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: (event) => { // You will receive the events here
      if (event.type === "UPDATE") {
        let rowAfter = event.affectedRows[0].after
        var msg = {
          type: "subscription",
          payload: [rowAfter]
        };
        ws.send(JSON.stringify(msg));
        console.log(msg)
      }
    },
  });

  instance.addTrigger({
    name: 'proyectos_detalles',
    expression: 'sargazo_transaccional_nv.proyectos_detalles',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: (event) => { // You will receive the events here
      if (event.type === "UPDATE" || event.type === "INSERT") {
        let affectedRows = event.affectedRows.map((NewAndUpdatedRow) => {
          return NewAndUpdatedRow.after
        })
        var msg = {
          type: "subscriptionProyecto",
          payload: affectedRows
        }
        ws.send(JSON.stringify(msg));
        console.log(msg)
      }
      else if (event.type === "DELETE") {
        let affectedRows = event.affectedRows.map((NewAndUpdatedRow) => {
          return NewAndUpdatedRow.before
        })
        var msg = {
          type: "subscriptionProyecto_delete",
          payload: affectedRows
        }
        ws.send(JSON.stringify(msg));
        console.log(msg)
      }
    },
  });

  instance.addTrigger({
    name: 'proyectos_detalles_seguimiento',
    expression: 'sargazo_transaccional_nv.proyectos_detalles_seguimiento',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: (event) => { // You will receive the events here
      if (event.type === "UPDATE" || event.type === "INSERT") {
        let affectedRows = event.affectedRows.map((NewAndUpdatedRow) => {
          return NewAndUpdatedRow.after
        })
        var msg = {
            type: "subscriptionProyectoSeguimiento",
            payload: affectedRows
        }
        ws.send(JSON.stringify(msg));
        console.log(msg)
      }
      else if (event.type === "DELETE") {
        let affectedRows = event.affectedRows.map((NewAndUpdatedRow) => {
          return NewAndUpdatedRow.before
        })
        var msg = {
          type: "subscriptionProyectoSeguimiento_delete",
          payload: affectedRows
        }
        ws.send(JSON.stringify(msg));
        console.log(msg)
      }
    },
  });
  
  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
  .then(() => console.log('Waiting for database events...'))
  .catch(console.error);
