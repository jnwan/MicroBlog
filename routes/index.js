module.exports = function(app,io){

    var User = require('../models/user.js');
    var crypto = require('crypto');
    var Post = require('../models/post.js');
    var Comment = require('../models/comment.js');

    io.on('connection', function(socket){
        socket.on('disconnect', function(){
            //console.log('user disconnected');
        });
        socket.on('msg',function(msg){
            socket.broadcast.emit("msg",msg);
        });
        socket.on('notice',function(notice){
             socket.broadcast.emit("notice",notice);
        });
    });


    app.get('/',function(req,res){
        Post.get(null, function (err,posts) {
            if(err){
                posts = [];
            }
            res.render('index',{
                title: '首页',
                posts: posts
            });
        });
    });

    app.get('/reg', checkNotLogin);
    app.get('/reg',function(req,res){
        res.render('reg',{
            title: '用户注册'
        });
    });

    app.get('/reg', checkNotLogin);
    app.post('/reg',function(req,res){
        if(req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '两次输入的口令不一致')
            return res.redirect('/reg');
        }

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var newUser = new User({
            email: req.body.email,
            name: req.body.nickname,
            password: password
        });
        User.get(newUser.email,function(err,user){
            if(user)
               err = 'Email has already been used!';
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            newUser.save(function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success','注册成功');
                res.redirect('/');
            });
        });
    });


    app.get('/login', checkNotLogin);
    app.get('/login', function (req,res) {
        res.render('login',{
           title: '用户登入'
        });
    });

    app.get('/login', checkNotLogin);
    app.post('/login',function(req,res){
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        User.get(req.body.email, function(err,user){
            if(!user){
                req.flash('error','用户不存在');
                return res.redirect('/login');
            }
            if(user.password != password){
                req.flash('error','密码错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登入成功');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success','登出成功');
        res.redirect('/');
    });

    app.post('/post',checkLogin);
    app.post('/post',function(req,res){
        var currentUser = req.session.user;
        var post = new Post(currentUser.email, currentUser.name, req.body.post);
        post.save(function(err,post){
            if(err){
                return res.redirect('/');
            }
            res.contentType('application/json');
            res.send(JSON.stringify(post));
        });
    });

    app.post('/getpost',checkLogin);
    app.post('/getpost',function(req,res){
        var email = req.body.email;
        var time = req.body.time;
        //console.log(email);
        Post.getOne(email,time,function(err,post){
            if(err){
                return res.redirect('/');
            }
            res.contentType('application/json');
            res.send(JSON.stringify(post));
        });
    });
    app.post('/repost',checkLogin);
    app.post('/repost',function(req,res){
        var currentUser = req.session.user;
        var originPost = {email: req.body.email,time : req.body.time};
        var post = new Post(currentUser.email,currentUser.name,req.body.content,originPost);
        post.save(function(err,post){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.contentType('application/json');
            res.send(JSON.stringify(post));
        });
    });
    app.post('/getuser',checkLogin);
    app.post('/getuser',function(req,res){
        User.getOthers(req.session.user.email,function(err,users){
            res.contentType('application/json');
            res.send(JSON.stringify(users));
        });
    });
    app.post('/comment',checkLogin);
    app.post('/comment', function (req,res) {
        var currentUser = req.session.user;
        var comment;
        if(req.body.toEmail) {
            comment = new Comment(req.body.email, req.body.time, currentUser.email, currentUser.name, req.body.toEmail, req.body.toUser, req.body.comment, null);
        }
        else{
            comment = new Comment(req.body.email, req.body.time, currentUser.email, currentUser.name, null, null, req.body.comment, null);
        }
        comment.save(function(err){
            if(err){
                req.flash('error',err);
                return;
            }
            var data = {};
            res.send(JSON.stringify(data));
        });
    });

    app.post('/getcomment',checkLogin);
    app.post('/getcomment', function (req,res) {
        Comment.get(req.body.email,req.body.time,function(err,comments){
             res.contentType('application/json');
             res.send(JSON.stringify(comments));
        });

    });

    app.get('/u/:user',function(req,res){
        User.get(req.params.user, function(err,user){
           if(!user){
               req.flash('error','用户不存在');
               return res.redirect('/');
           }
            Post.get(user.email, function (err,posts) {
                if(err){
                    req.flash('error',err);
                    return res.redirect('/');
                }
                res.render('user',{
                    layout: 'layoutperson',
                    title: user.name,
                    posts: posts
                });
            })
        });
    });
    function checkLogin(req, res, next) {
        if(!req.session.user) {
            req.flash('error', '未登入');
            return res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登入');
            return res.redirect('/');
        }
        next();
    }

};
