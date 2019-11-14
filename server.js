let express = require("express");
let morgan = require("morgan");
let bodyParser = require("body-parser");
let uuid = require("uuid");
let cors = require("cors");
let mongoose = require("mongoose");
let {PostList} = require("./blog-post-model");
let {DATABASE_URL, PORT} = require("./config");

let app = express();
let jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use(cors())
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

let date = new Date();

app.get("/blog-posts", (req, res) =>{
    PostList.get()
                .then(posts =>{
                    return res.status(200).json(posts);
                })
                .catch(err =>{
                    res.statusMessage = "Something went wrong with the DB";
                    return res.status(500).json({
                        code: 500,
                        message: "Something went wrong with the DB"
                    })
                });
});

app.get("/blog-post?", (req, res) =>{

    let query = req.query.author;

    if(query != null){
        PostList.getAuthor(query)
                    .then(posts => {
                        return res.status(200).json(posts);  
                    })
                    .catch(error =>{
                        res.statusMessage = "Something went wrong with the DB";
                        return res.status(500).json({
                            code: 500,
                            message: "Something went wrong with the DB"
                        }) 
                    });  
    }
    else{
        res.statusMessage = "No author parameter given";
        return res.status(406).json({
            code: 406,
            message: "No author parameter given" 
        });
    }
});

app.post("/blog-posts", jsonParser, (req, res) => {

    if(req.body.title == null){
        return res.status(406).json({
            code: 406,
            message: "No title given"
        });
    }

    if(req.body.content == null){
        return res.status(406).json({
            code: 406,
            message: "No content given"
        });
    }

    if(req.body.author == null){
        return res.status(406).json({
            code: 406,
            message: "No author given"
        });
    }

    let json = {
        id: uuid.v4(),
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        publishDate: date.getDate() + "/" +  date.getMonth() + "/" + date.getFullYear()
    };
    console.log(json)
    PostList.post(json)
                    .then(post =>{
                        return res.status(201).json(post);
                    })
                    .catch(err =>{
                        res.statusMessage = "Something went wrong with the DB";
                        return res.status(500).json({
                            code: 500,
                            message: "Something went wrong with the DB"
                        })
                    });
});

app.delete("/blog-posts/:id", (req, res) => {

    let query = req.params.id;

        PostList.delete(query)
                        .then(post => {
                            if(!post){
                                return res.status(404).json({
                                    code: 404,
                                    message: "Post with that id doesn't exist"
                                });
                            }
                            else{
                                return res.status(200).json({
                                    code:200,
                                    message: "Successfully deleted post"
                                });
                            }
                        })
                        .catch(err => {
                            res.statusMessage = "Something went wrong with the DB";
                            return res.status(500).json({
                                code: 500,
                                message: "Something went wrong with the DB"
                            })
                        });

});

app.put("/blog-posts/:id", (req, res) =>{

    if (req.body.id == null){
        return res.status(406).json({
            code:406,
            message: "No id in body"
        });
    }

    if(req.params.id != req.body.id){
        return res.status(409).json({
            code: 409,
            message: "The ids don't match"
        });
    }

    let newValues = {$set : {}};
    let id = req.params.id;

    if (Object.keys(req.body).length > 1){
        if(req.body.title != null){
            newValues["$set"]["title"] = req.body.title;
        }
    
        if(req.body.content != null){
            newValues["$set"]["content"] = req.body.content;
        }
    
        if(req.body.author != null){
            newValues["$set"]["author"] = req.body.author;
        }

        PostList.update(id, newValues)
                        .then(post => {
                                return res.status(202).json(post);
                        })
                        .catch(err => {
                            res.statusMessage = "Something went wrong with the DB";
                            return res.status(500).json({
                                code: 500,
                                message: "Something went wrong with the DB"
                            })
                        });
    }


});

let server;

function runServer(port, databaseUrl){
    return new Promise( (resolve, reject) => {
        mongoose.connect(databaseUrl, response =>{
            if(response){
                return reject(response);
            }
            else{
                server = app.listen(port, () =>{
                    console.log("App is running on port " + port);
                    resolve();
                })
                .on("error", err =>{
                    mongoose.disconnect();
                    return reject(err);
                });
            }
        });
    });
}

function closeServer(){
    return mongoose.disconnect()
            .then(() => {
                return new Promise((resolve, reject) =>{
                    console.log("Closing the server");
                    server.close(err =>{
                        if (err){
                            return reject(err);
                        }
                        else{
                            resolve();
                        }
                    });
                });
            });
}

runServer(PORT, DATABASE_URL)
        .catch(err => {
            console.log(err);
        });

module.exports = {app, runServer, closeServer};