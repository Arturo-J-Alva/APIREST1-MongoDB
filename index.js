'use strict'

const mongoose = require("mongoose");
const app = require("./app");
const port = 4000;
const url="mongodb://localhost:27017/api_rest_blog";

mongoose.set("useFindModify", false);//Descativa los métodos(comandos) antiguos
mongoose.Promise = global.Promise;
mongoose.connect(url, {
    useNewUrlParser: true
}).then( () => {
    console.log("DB is conected ");

    //Crear Servidor y ponerme a escuchar peticiones HTTP
    app.listen(port, () => {
        console.log("Server on port " + port);
    })

});