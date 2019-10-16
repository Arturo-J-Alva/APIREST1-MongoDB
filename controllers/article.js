'use strict'

const validator = require("validator");
const Article = require("../models/article");

var fs = require("fs");
var path = require("path");

const controller = {
    datosCurso: (req, res) => {

        return res.status(200).send({
            curso: "API REST con MongoDB y Nodejs",
            autor: "Arturo J. Alva",
            url: "TimiTree.com",
            holi: holi
        });
    },
    test: (req, res) => {
        return res.status(200).send({
            message: "Soy la acción test de mi controlador de artículos"
        });
    },
    save: (req, res) => {
        //Recoger parámetros por post
        var params = req.body;
        //console.log(params);
        //Validar datos (validator)      
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);


        } catch (err) {
            return res.status(200).send({
                status: "error",
                message: "Faltan datos por enviar!"
            });
        }
        if (validate_title && validate_content) {
            //crear objeto a guardar
            var article = new Article();
            //Asignar valores
            article.title = params.title;
            article.content = params.content;

            if(params.image){
                article.image = params.image;
            }else{
                article.image = null;
            }
        
            //guardar el artículo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: "error",
                        message: "El artículo no se ha guardado!"
                    });
                }
                return res.status(200).send({
                    status: "success",
                    article: articleStored
                });

            });

            //Devolver una respuesta

        } else {
            return res.status(200).send({
                status: "error",
                message: "Datos no validos!"
            });
        }



    },
    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        var lastInt = parseInt(last);
        //console.log(lastInt);

        if (last || last != undefined) { // ( last || last != undefined )
            query.limit(lastInt);
        }

        //Find
        query.sort("-_id").exec((err, articles) => {//- _id ordena de manera descendente(reciente al más antiguo)
            if (err) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al devolver los datos de los artículos"
                });
            }
            if (!articles) {
                return res.status(404).send({
                    status: "error",
                    message: "No hay artículos para mostrar"
                });
            }
            return res.status(200).send({
                status: "success",
                articles
            });
        })
    },
    getArticle: (req, res) => {
        //Recoger el id de la URL
        var articleID = req.params.id;
        //Comprobar que existe
        if (!articleID || articleID == null) {
            return res.status(404).send({
                status: "error",
                message: "No existe el artículo"
            });
        }
        //Buscar el artículo
        Article.findById(articleID, (err, article) => {
            if (!article || err) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe el artículo"
                });
            }
            //Devolverlo en json
            return res.status(200).send({
                status: "success",
                article
            });
        })

    },
    update: (req, res) => {
        //Recoger el id de la URL
        var articleID = req.params.id;
        //Recoger los datos
        var params = req.body;
        //Validar los datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(404).send({
                status: "error",
                message: "Fatan datos por enviar"
            });
        }
        if (validate_content && validate_title) {
            //Metodo Find and update
            Article.findOneAndUpdate({ _id: articleID }, params, { new: true }, (err, articleUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error al actualizar"
                    });
                }
                if (!articleUpdate) {
                    return res.status(404).send({
                        status: "error",
                        message: "No existe el artículo"
                    });
                }

                return res.status(200).send({
                    status: "success",
                    article: articleUpdate
                });
            });
        } else {
            return res.status(200).send({
                status: "error",
                message: "La validación no es correcta"
            });
        }
        //Hacen consulta find
    },
    delete: (req, res) => {
        //Recoger el id de la URL
        var articleID = req.params.id;
        //Comprobar que existe
        if (!articleID || articleID == null) {
            return res.status(404).send({
                status: "error",
                message: "No existe el artículo"
            });
        }
        //Buscar el artículo
        Article.findOneAndDelete({ _id: articleID }, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: "error",
                    message: "Error del servidor al eliminar el artículo"
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe el artículo o ya fue eliminado"
                });
            }
            //Devolverlo en json
            return res.status(200).send({
                status: "success",
                article: articleRemoved
            });
        })
    },
    upload: (req, res) => {
        //Configurar el módulo connect mutiparty en rotuer/article.js

        //Recoger el fichero de la petición
        var file_name = "Imagen no subida...";
        //console.log(req.files);

        if (!req.files) {
            return res.status(404).send({
                status: "error",
                message: file_name
            });
        }
        //Conseguir el nombre y la extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\') //Para Windows. En Linux o Mac: file_path.split('/')}

        //Nombre del archivo
        var file_name = file_split[2];
        //Extensión del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];
        //Comprobar la extensión, solo imagenes, si es validada, borrar el fichero
        if (file_ext != "png" && file_ext != "jpg" && file_ext != "jpeg" && file_ext != "gif") {
            //Borrar el archivo subido si no es imagen
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: "error",
                    message: "La extensión de la imágen no es válida"
                });
            })
        } else {
            //Si todo es válido, obteniendo ID de la URL
            var articleID = req.params.id;
            if (articleID) {
                //Buscar el artículo, asignarle el nombre de la imagen y actualizarla
                Article.findOneAndUpdate({ _id: articleID }, { image: file_name }, { new: true }, (err, articleUpdate) => {

                    if (err || !articleUpdate) {
                        return res.status(404).send({
                            status: "error",
                            message: "Error al guardar la imagen del artículo"
                        });
                    }
                    return res.status(200).send({
                        status: "success",
                        article: articleUpdate
                    });
                })
            } else {
                return res.status(200).send({
                    status: "success",
                    image: file_name
                });
            }

        }
    }, //end upload file
    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = `./upload/articles/${file}`;

        fs.stat(path_file, (err, stats) => {//utilicé fs.stat en vez de fs.exist (viendo la documentación de nodejs.org)
            //console.log(stats);
            if (err) {
                return res.status(404).send({
                    status: "error",
                    message: "La imagen no existe"
                });
            }
            return res.sendFile(path.resolve(path_file));
        })

    },
    search: (req, res) => {
        //Sacar el string a buscar
        var searchString = req.params.search;

        //Find or
        Article.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },//i:si el searchString está incluido en alguna palabra del title
                { "content": { "$regex": searchString, "$options": "i" } }
            ]
        })
            .sort([["date", "descending"]])//Otra manera de ordenar el arreglo de manera descendente
            .exec((err, articles) => {

                if (err) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error del sistema en la petición"
                    });
                }
                //console.log(articles.length);
                if (!articles || articles.length <= 0) {
                    return res.status(404).send({
                        status: "error",
                        message: "No hay artículos que coincida con tu búsqueda"
                    });
                }

                return res.status(200).send({
                    status: "success",
                    articles
                });
            })
    }

}; //end controller

module.exports = controller;