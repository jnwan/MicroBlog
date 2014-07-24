/**
 * Created by Junnan on 2014/7/5.
 */
var mongodb = require('./db');
var async = require('async');
function Post(email,username,post,originpost,time,timekey,commentnum,repostnum){
    this.email = email;
    this.user = username;
    this.post = post;
    if(originpost){
        this.originpost = originpost;
    }
    else{
        this.originpost = null;
    }
    var date = new Date();
    if(time){
        this.time = time;
    }
    else{
        this.time = date;
    }
    if(timekey){
        this.timekey = timekey;
    }
    else{
        this.timekey = date.toString();
    }
    if(commentnum){
        this.commentnum = commentnum;
    }
    else{
        this.commentnum = 0;
    }
    if(repostnum){
        this.repostnum = repostnum;
    }
    else{
        this.repostnum = 0;
    }
}

module.exports = Post;

Post.prototype.save = function save(callback){
    var post = {
        email : this.email,
        user : this.user,
        post : this.post,
        originpost: this.originpost,
        time : this.time,
        commentnum : this.commentnum,
        repostnum : this.repostnum,
        timekey: this.timekey
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            if(post.originpost){
                var query = {};
                query.email = post.originpost.email;
                query.timekey = post.originpost.time;
                collection.update(query,{$inc: {repostnum: 1}},{multi:true},function(error, num){
                });
            }
            collection.ensureIndex({email:1, timekey: -1,_id:1}, {unique: true}, function(err, user) {});
            collection.insert(post,{safe: true},function(err,post){
                mongodb.close();
                callback(err,post);
            });
        })
    });

};

Post.getOne = function getOne(email,time,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('post', function (err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            query.email = email;
            query.timekey = time;
            collection.findOne(query,function(err,doc){
                mongodb.close();
                if(err){
                    callback(err);
                }
                callback(null,doc);
            });
        });
    });
};
Post.get = function get(email,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('post', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(email){
                query.email = email;
            }
            collection.find(query).sort({time: -1}).toArray(function(err,docs){
                if(err){
                    callback(err,null);
                }

                var posts = [];
                var reposts = [];
                docs.forEach(function(doc,index){
                    var post = new Post(doc.email,doc.user,doc.post,doc.originpost,doc.time,doc.timekey,doc.commentnum,doc.repostnum);
                    posts.push(post);
                    if(post.originpost){
                        reposts.push(post);
                    }
                });
                if(reposts.length == 0) {
                    mongodb.close();
                    callback(null, posts);
                }
                async.each(reposts,
                    // 2nd parameter is the function that each item is passed into
                    function(repost, callback){
                        // Call an asynchronous function (often a save() to MongoDB)
                        collection.findOne({email:repost.originpost.email,timekey: repost.originpost.time},function(err,originpost){
                            repost.originpost = originpost;
                            callback();
                        });
                    },
                    // 3rd parameter is the function call when everything is done
                    function(err){
                        // All tasks are done now
                        //console.log(posts);
                        mongodb.close();
                        callback(null,posts);
                    }
                );


            });
        })
    });
};


