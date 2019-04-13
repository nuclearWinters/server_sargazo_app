const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const WebSocket = require('ws');
var express = require('express')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
var bodyParser = require('body-parser');

var app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'nuclearWinters',
  password : 'armando123',
  database : 'sargazo_web'
});

app.get("/obtenerDetalles", (req, res) => {
  connection.query('SELECT cat_playas.nombre as `playaNombre`, cat_tipo_seguimiento.nombre as `seguimientoNombre`, proyectos_detalles.nombre as `proyectoNombre`, proyectos_detalles_seguimiento.id, proyectos_detalles_seguimiento.proyecto_detalles_id, proyectos_detalles_seguimiento.id_playa, proyectos_detalles_seguimiento.cat_deposito_id, proyectos_detalles_seguimiento.id_tipo_seguimiento, proyectos_detalles_seguimiento.nombre_coordinador, proyectos_detalles_seguimiento.barrera_instalada, proyectos_detalles_seguimiento.coord_inicio_x, proyectos_detalles_seguimiento.coord_inicio_y, proyectos_detalles_seguimiento.coord_fin_x, proyectos_detalles_seguimiento.coord_fin_y, proyectos_detalles_seguimiento.coord_deposito_sargazo, proyectos_detalles_seguimiento.cantidad_sargazo, proyectos_detalles_seguimiento.ml_zona_costera, proyectos_detalles_seguimiento.m3_residuo_agua, proyectos_detalles_seguimiento.m3_residuo_linea_costera, proyectos_detalles_seguimiento.fecha, proyectos_detalles_seguimiento.hr_inicio_actividad, proyectos_detalles_seguimiento.hr_fin_actividad, proyectos_detalles_seguimiento.observaciones, proyectos_detalles_seguimiento.viajes_residuos, proyectos_detalles_seguimiento.num_empleados, proyectos_detalles_seguimiento.activo, proyectos_detalles_seguimiento.created, proyectos_detalles_seguimiento.modified, cat_depositos.nombre as `depositoNombre` FROM `proyectos_detalles_seguimiento` JOIN `cat_playas` ON cat_playas.id = proyectos_detalles_seguimiento.id_playa JOIN `cat_depositos` ON cat_depositos.id = proyectos_detalles_seguimiento.cat_deposito_id JOIN `cat_tipo_seguimiento` ON cat_tipo_seguimiento.id = proyectos_detalles_seguimiento.id_tipo_seguimiento JOIN `proyectos_detalles` ON proyectos_detalles.id = proyectos_detalles_seguimiento.proyecto_detalles_id', (error, results, fields) => {
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

app.post("/createDetalle", (req, res) => {
  console.log(req.body)
  res.json("Hi!")
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
  query = mysql.format(query,table);
  connection.query(query, (error, results, fields) => {
    if (results.length !== 0) {
      const hashBool = bcrypt.compareSync(password, results[0].password)
      if (hashBool) {
        var token = jwt.sign({
          id: results[0].id,
          nombre: results[0].nombres,
          email: results[0].email,
          apellidos: results[0].apellidos,
          grupo: results[0].cat_grupo_id,
          username: results[0].username
        }, 'sm2programadores')
        res.json(token)
      }
      else {
        res.status(403).send("Forbidden")
      }
    }
    else {
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
const ws = new WebSocket('ws://192.168.1.84:8080');

//Detector de cambios
const program = async () => {
  const connection1 = mysql.createConnection({
    host: 'localhost',
    user: 'nuclearWinters',
    password: 'armando123',
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
    expression: 'sargazo_web.users',
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
    expression: 'sargazo_web.proyectos_detalles',
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
    expression: 'sargazo_web.proyectos_detalles_seguimiento',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: (event) => { // You will receive the events here
      if (event.type === "UPDATE" || event.type === "INSERT") {
        let affectedRows = event.affectedRows.reduce((StringReturn, Row,  i) => {
          if (i === 0) {
            return StringReturn + 'proyectos_detalles_seguimiento.id = "' + Row.after.id + '"'
          }
          else {
            return StringReturn + ' OR proyectos_detalles_seguimiento.id = "' + Row.after.id + '"'
          }
        }, "")
        setTimeout(
         connection.query('SELECT cat_playas.nombre as `playaNombre`, cat_tipo_seguimiento.nombre as `seguimientoNombre`, proyectos_detalles.nombre as `proyectoNombre`, proyectos_detalles_seguimiento.id, proyectos_detalles_seguimiento.proyecto_detalles_id, proyectos_detalles_seguimiento.id_playa, proyectos_detalles_seguimiento.cat_deposito_id, proyectos_detalles_seguimiento.id_tipo_seguimiento, proyectos_detalles_seguimiento.nombre_coordinador, proyectos_detalles_seguimiento.barrera_instalada, proyectos_detalles_seguimiento.coord_inicio_x, proyectos_detalles_seguimiento.coord_inicio_y, proyectos_detalles_seguimiento.coord_fin_x, proyectos_detalles_seguimiento.coord_fin_y, proyectos_detalles_seguimiento.coord_deposito_sargazo, proyectos_detalles_seguimiento.cantidad_sargazo, proyectos_detalles_seguimiento.ml_zona_costera, proyectos_detalles_seguimiento.m3_residuo_agua, proyectos_detalles_seguimiento.m3_residuo_linea_costera, proyectos_detalles_seguimiento.fecha, proyectos_detalles_seguimiento.hr_inicio_actividad, proyectos_detalles_seguimiento.hr_fin_actividad, proyectos_detalles_seguimiento.observaciones, proyectos_detalles_seguimiento.viajes_residuos, proyectos_detalles_seguimiento.num_empleados, proyectos_detalles_seguimiento.activo, proyectos_detalles_seguimiento.created, proyectos_detalles_seguimiento.modified, cat_depositos.nombre as `depositoNombre` FROM `proyectos_detalles_seguimiento` JOIN `cat_playas` ON cat_playas.id = proyectos_detalles_seguimiento.id_playa JOIN `cat_depositos` ON cat_depositos.id = proyectos_detalles_seguimiento.cat_deposito_id JOIN `cat_tipo_seguimiento` ON cat_tipo_seguimiento.id = proyectos_detalles_seguimiento.id_tipo_seguimiento JOIN `proyectos_detalles` ON proyectos_detalles.id = proyectos_detalles_seguimiento.proyecto_detalles_id WHERE ' + affectedRows, (error, results, fields) => {
          var msg = {
            type: "subscriptionProyectoSeguimiento",
            payload: results
          }
          ws.send(JSON.stringify(msg));
        }), 100)
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
        //console.log(msg)
      }
    },
  });
  
  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
  .then(() => console.log('Waiting for database events...'))
  .catch(console.error);
