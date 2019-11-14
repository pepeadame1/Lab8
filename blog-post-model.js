let mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let postSchema = mongoose.Schema({
    id : { 
        type : String,
        required : true },
	title : { type : String },
    content : { type : String },
    author : { type : String },
    publishDate : { type : String }
});

let Post = mongoose.model("Post", postSchema);

let PostList = {
    get : function(){
        return Post.find()
                        .then(posts => {
                            return posts;
                        })
                        .catch(error => {
                            throw Error(error);
                        });
    },

    getAuthor : function(authorName){
        return Post.find({author: authorName})
                        .then(posts => {
                            return posts;
                        })
                        .catch(error => {
                            throw Error(error);
                        });
    },

    post : function(newPost){
        return Post.create(newPost)
                            .then(post =>{
                                return post;
                            })
                            .catch(error =>{
                                throw Error(error);
                            });
    },

    delete : function(idValue){
        return Post.deleteOne({id : idValue})
                            .then((post) =>{
                                if (post["deletedCount"] == 0){
                                   return 0
                                }
                                else{
                                    return 1
                                }
                            })
                            .catch(error =>{
                                console.log(error)
                                throw Error(error);
                            });
    },

    update : function(idValue, newValues){
        return Post.findOneAndUpdate({id: idValue}, newValues, {new: true})
                            .then(post =>{
                                return post;
                            })
                            .catch(error =>{
                                throw Error(error);
                            });
    }
};

module.exports = {PostList};