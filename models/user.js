/**
 * Created by Junnan on 2014/7/4.
 */
var mongodb = require('./db');

function User(user){
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
}

module.exports = User;

User.prototype.save = function save(callback){
    var user = {
        email: this.email,
        name: this.name,
        password: this.password
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex({email: 1}, {unique: true}, function(err, user) {});
            collection.insert(user,{safe:true},function(err,user){
                mongodb.close();
                callback(err,user);
            });
        });
    });
};
User.get = function get(email,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({'email': email},function(err,doc){
                mongodb.close();
                if(doc){
                    var user = new User(doc);
                    callback(err,user);
                }
                else{
                    callback(err,null);
                }
            });
        });
    });
};

User.getOthers = function getOthers(email,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.find({}).toArray(function(err,docs){
                mongodb.close();
                var users = [];
                docs.forEach(function(doc,index){
                    if(doc.email != email) {
                        var user = {email:doc.email,username:doc.name};
                        users.push(user);
                    }
                });
                callback(null,users);
            });
        });
    });
};