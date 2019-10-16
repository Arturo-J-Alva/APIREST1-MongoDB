'use strict'

//Cargar modulos de node para cargar el servidor
const express = require("express");
const bodyParser = require("body-parser");

//Ejecutar Express (http)
const app = express();

//Cargar ficheros rutas
const article_rutes = require("./routes/article");

//Midlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());//Convirte las peticiones a JSON

//CORS : permites las peticiones Ajax, Axios,
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Añadir prefijos a rutas (Cargar Rutas)
app.use("/api",article_rutes);

//Exportar módulo (fichero actual)
module.exports = app;