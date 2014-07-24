/**
 * Created by Junnan on 2014/7/8.
 */
var mongodb = require('./db');

function Comment(hostEmail,hostTime,commentEmail,commentUsername,commentToEmail,commentToUsername,comment,commentTime){
    this.hostEmail = hostEmail;
    this.hostTime = hostTime;
    this.commentEmail = commentEmail;
    this.commentUsername = commentUsername;
    this.commentToEmail = commentToEmail;
    this.commentToUsername = commentToUsername;
    this.comment = comment;
    if(commentTime){
        this.commentTime = commentTime;
    }
    else{
        this.commentTime = new Date();
    }
}

module.exports = Comment;

Comment.prototype.save = function save(callback){
    var comment = {
        hostEmail : this.hostEmail,
        hostTime : this.hostTime,
        commentEmail : this.commentEmail,
        commentUsername : this.commentUsername,
        commentToEmail: this.commentToEmail,
        commentToUsername: this.commentToUsername,
        comment: this.comment,
        commentTime: this.commentTime
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('post', function (err,collection) {
            var query = {};
            var hostEmail = comment.hostEmail;
            var hostTime = comment.hostTime;
            if(hostEmail){
                query.email = hostEmail;
                query.timekey = hostTime;
                collection.update(query,{$inc: {commentnum: 1}},{multi:true},function(error, bars){});
            }
        });
        db.collection('comment',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex({hostEmail:1,hostTime: -1,commentTime: -1,_id:1}, {unique: true}, function(err, comment) {});
            collection.insert(comment,{safe: true},function(err,comment){
                mongodb.close();
                callback(err,comment);
            });
        })
    });

};

Comment.get = function get(hostEmail,hostTime,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('comment', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(hostEmail){
                query.hostEmail = hostEmail;
                query.hostTime = hostTime;
            }
            collection.find(query).sort({commentTime: -1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    callback(err,null);
                }

                var comments = [];
                docs.forEach(function(doc,index){
                    var comment = new Comment(doc.hostEmail,doc.hostTime,doc.commentEmail,doc.commentUsername,doc.commentToEmail,doc.commentToUsername,doc.comment,doc.commentTime);
                    comments.push(comment);
                });
                callback(null,comments);
            });
        })
    });
};