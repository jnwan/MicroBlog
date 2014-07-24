/**
 * Created by Junnan on 2014/7/8.
 */
function updateHtml(comments,a,ul) {
    if(comments.length != 0) {
        $(a).last().html("评论(" + comments.length + ")");
    }
    var ss = "";
    for(var i = 0; i < comments.length; i++){
        var comment = comments[i];
        ss += "<li class='list-group-item' style='clear: both; overflow:hidden;'>";
        ss += "<a href=\"/u/"+comment.commentEmail+"\">";
        ss += comment.commentUsername+": ";
        ss += "</a>";
        if(comment.commentToEmail){
            ss += "回复 ";
            ss +=  "<a href=\"/u/"+comment.commentToEmail+"\">";
            ss += comment.commentToUsername;
            ss += "</a>";
            ss += ": ";
        }
        ss += comment.comment;
        ss += "<div class='replyInfo'><a class='replyLink' style='float:right;'>回复</a></div>";
        ss += "<div class='replyContent' style='clear:both;display: none'>";
        ss += "<textarea name='replaycomment' class='form-control' rows='1' placeholder='回复"+comment.commentUsername+":"+"'style='text-align:justify;'></textarea>";
        ss += "<button type='submit' class='btn btn-success' name='reply-comment-submit' style='float:right;' email='"+comment.hostEmail+"' time='"+comment.hostTime+"' toEmail='"+comment.commentEmail+"' toUser='"+comment.commentUsername+"'></i>评论</button>";
        ss += "</div>";
        ss += "</li>";
    }
    $(ul).html(ss);
}
function updatePost(post,repost){
    var posts = $("#posts");
    var ss = "";
    //alert(post.email);
    ss += "<div class=\"post\" style=\"clear: both;\">";
    ss += "<h4><a href=\"/u/"+post.email+"\">"+post.user+"</a></h4>";
    ss += "<p>&nbsp;"+post.post+ "</p>";
    if(repost){
        ss += "<small><div class=\"repost\" style=\"padding: 0px 10px 0px 15px; border: 2px solid lightgrey;\">";
        ss += "<div class=\"post\" style=\"clear: both;\">";
        ss += "<h4><a href=\"/u/"+ repost.email +"\">"+repost.user+"</a></h4>";
        ss += "<p>&nbsp;"+ repost.post +"</p>";
        ss += "<p>&nbsp;<small>"+repost.timekey+"</small><a class=\"comment_origin\" toggle=\"hide\" email=\""+repost.email+"\" time=\""+repost.timekey+"\" style=\"float: right\">评论("+repost.commentnum+")</a>";
        ss += "<a class=\"repost_origin\" email=\""+repost.email+"\" time=\""+repost.timekey+"\" style=\"float: right\">转发("+repost.repostnum+")&nbsp;</a></p></div></div></small>";
    }
    ss += "<p>&nbsp;<small>"+ post.timekey +"</small><a class=\"comment\" toggle=\"hide\" email=\""+post.email+"\" time=\""+post.timekey+"\" style=\"float: right\">评论</a>";
    ss += "<a class=\"repost\" email=\""+post.email+"\" time=\""+post.timekey+"\" style=\"float: right\">转发&nbsp;</a></p>";
    ss += "</div>";
    ss += "<div class=\"comment\" style=\"clear: both; display: none;\">";
    ss += "<label>发表评论</label>";
    ss += "<textarea name=\"comment\" class=\"form-control\" rows=\"1\" style=\"text-align:justify;\"></textarea>";
    ss += "<button type=\"submit\" class=\"btn btn-success\" email=\""+post.email+"\" time=\""+post.timekey+"\" name=\"comment-submit\" style=\"float:right;\"></i>评论</button>";
    ss += "<ul style=\"clear: both\" class=\"list-group\" name=\"comment-ul\">";
    ss += "</ul></div><br>";
    $(posts).html(ss+posts.html());
}
function getFriends(){
    $.ajax({
        type: 'POST',
        data: {},
        contentType: 'application/json',
        url: '/getuser',
        timeout: 4000,
        success: function(users) {
            var ul = $("#friends").children("ul");
            var ss = "";
            for(var i = 0; i < users.length; i++){
                var user = users[i];
                ss += "<li class='list-group-item friend' to='"+user.email+"'>";
                ss += "<a>"+user.username+"</a>";
                ss += "<a class='state' style='float: right'><span class='glyphicon glyphicon-star-empty'></span></a>"
                ss += "</li>";
            }
            $(ul).html(ss);
        },
        error: function(){
            alert('Process error');
        }
    });
}
$(document).ready(function(){
    var username;
    var userid;
    var ul = $("#navUl");
    var url = window.location.pathname;
    $(ul).children().removeClass("active");
    if(url == "/"){
        $("#firstpage").addClass("active");
    }
    else if(url == "/reg"){
        $("#reg").addClass("active");
    }
    else if(url == "/login"){
        $("#login").addClass("active");
    }
    $("div.comment").hide();

   var repostInfo = {};
    var repostnum;
    var clickrepost;
    $("#posts").on("click","a.repost",function(){
       clickrepost = $(this);
       repostnum = $(this).attr("num");
       centerPopup();
       loadPopup();
       repostInfo = {};
       repostInfo.email = $(this).attr("email");
       repostInfo.time = $(this).attr("time");
   });
   $("#postSubmit").click(function(e){
       if($("#postTextArea").val().length == 0) return;
       var data = {};
       data.post = $("#postTextArea").val();
       $.ajax({
           type: 'POST',
           data: JSON.stringify(data),
           contentType: 'application/json',
           url: '/post',
           timeOut: 4000,
           success: function(data){
               $("#postTextArea").val("");
               var post = data[0];
               updatePost(post,null);
           },
           error: function(){
               alert('Process error');
           }
       });
    });

   $("#repostSubmit").click(function (e){
       if($("#repostTextArea").val().length == 0) return;
       var num = Number(repostnum)+1;
       $(clickrepost).html("转发("+num+")");
       var data = {};
       data.email = repostInfo.email;
       data.time = repostInfo.time;
       data.content = $("#repostTextArea").val();
       $.ajax({
           type: 'POST',
           data: JSON.stringify(data),
           contentType: 'application/json',
           url: '/repost',
           timeOut: 4000,
           success: function(dataa){
               disablePopup();
               var post = dataa[0];
               var data = {};
               data.email = post.originpost.email;
               data.time = post.originpost.time;
               $.ajax({
                   type: 'POST',
                   data: JSON.stringify(data),
                   contentType: 'application/json',
                   url: '/getpost',
                   timeout: 4000,
                   success: function(repost) {
                       //alert(repost.time);
                        updatePost(post,repost);
                   },
                   error: function(){
                       alert('Process error');
                   }
               });
           },
           error: function(){
               alert('Process error');
               disablePopup();
           }
       });
   });

   $("#posts").on("click","a.comment",function(){
       var a = $(this);
       var div = $(this).parent().parent().next();
       $(div).css('visibility','visible');
       if($(this).attr("toggle") == "hide"){
           $(this).attr("toggle","show");
           var data = {};
           data.email = $(this).attr('email');
           data.time = $(this).attr('time');
           $.ajax({
               type: 'POST',
               data: JSON.stringify(data),
               contentType: 'application/json',
               url: '/getcomment',
               timeout: 4000,
               success: function(comments) {
                   updateHtml(comments,a,$(div).children("ul"));
                   $(div).animate({
                       height: 'toggle'
                   });
               },
               error: function(){
                   alert('Process error');
               }
           });
       }
       else{
           $(this).attr("toggle","hide");
           $(div).animate({
               height: 'toggle'
           });
       }
   });

    $("#posts").on("click","a.replyLink",function() {
        $(this).parent().next().animate({
            height: 'toggle'
        });
    });
    $("#posts").on("click","button[name='reply-comment-submit']",function() {
        if($(this).parent().children("textarea").val().length != 0) {
            var button = $(this);
            var data = {};
            data.email = ($(this).attr('email'));
            data.time = ($(this).attr('time'));
            data.comment = ($(this).parent().children("textarea").val());
            data.toEmail = ($(this).attr('toEmail'));
            data.toUser = ($(this).attr('toUser'));
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: '/comment',
                timeout: 4000,
                success: function (e) {
                    $(button).parent().children("textarea").val('');
                    $.ajax({
                        type: 'POST',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        url: '/getcomment',
                        timeout: 4000,
                        success: function(comments) {
                            var a = $(button).parent().parent().parent().parent().prev().find("a.comment");
                            var ul = $(button).parent().parent().parent();
                            updateHtml(comments,a,ul);

                        },
                        error: function(){
                            alert('Process error');
                        }
                    });
                },
                error: function () {
                    alert('Process error');
                }
            });
        }
    });

    $("#posts").on("click","button[name='comment-submit']",function(){
        if($(this).parent().children("textarea").val().length != 0) {
            var button = $(this);
            var data = {};
            data.email = ($(this).attr('email'));
            data.time = ($(this).attr('time'));
            data.comment = ($(this).parent().children("textarea").val());
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: '/comment',
                timeout: 4000,
                success: function (re) {
                    ($(button).parent().children("textarea").val(''));
                    $.ajax({
                        type: 'POST',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        url: '/getcomment',
                        timeout: 4000,
                        success: function(comments) {
                            updateHtml(comments,$(button).parent().prev().find("a.comment"),$(button).next());
                        },
                        error: function(){
                            alert('Process error');
                        }
                    });
                },
                error: function () {
                    alert('Process error');
                }
            });
        }
    });

    $("#friend-list-button").click(function(e){
        if($("#friend-list").css("visibility") == "visible"){
            $("#friend-list").css("visibility","hidden");
        }
        else{
            $("#friend-list").css("visibility","visible");
        }
        $("#friend-list").css("display","hide");
        $(this).prev().animate({
            width: 'toggle'
        });
    });
    if($("#friends").children("ul")) {
        username = $("#friend-list").attr("fromname");
        userid = $("#friend-list").attr("fromid");
        getFriends();
    }
    var socket = io();
    var map = new HashMap();
    $("#friend-list").on("click","li.friend",function() {
        var toName = $(this).children().html();
        var toId = $(this).attr('to');
        if(map.containsKey(toId)) {
            var div = map.get(toId);
            $(div).chatbox("option", "boxManager").toggleBox();
        }
        else {
            var div = document.createElement("div");
            $("#chat_div").append(div);
            var size = map.size();
            map.put(toId,div);
            var box = $(div).chatbox({
                id:username,
                user:{id : userid},
                title : toName,
                width: 300,
                offset: 310*size,
                messageSent : function(id, user, message) {
                    $(div).chatbox("option", "boxManager").addMsg(userid,id, message);
                    socket.emit('msg',{fromid: userid, fromname: username,toid: toId,msg:message});
                }});
        }
    });

    window.onbeforeunload = function (e) {
        if(userid) {
            socket.emit('notice', {id: userid, state: 'offline'});
        }
    };
    if(userid) {

        socket.on('connect', function () {
            var timer = setInterval(function () {
                socket.emit('notice', {id: userid, state: 'online'});
            }, 2000);
            socket.on('notice', function (notice) {
                var s = "li[to='" + notice.id + "']";
                //alert($("#friend-list").children(s).children(".state").css('class'));
                var span = $("#friend-list").children(s).children(".state").children("span");
                if(notice.state == "online") {
                    $(span).removeClass("glyphicon-star-empty").addClass("glyphicon-star");
                }
                else{
                    $(span).removeClass("glyphicon-star").addClass("glyphicon-star-empty");
                }
            });
            socket.on('msg', function (msg) {
                if (msg.toid == userid) {
                    if (!map.containsKey(msg.fromid)) {
                        var div = document.createElement("div");
                        $("#chat_div").append(div);
                        map.put(msg.fromid, div);
                        var box = $(div).chatbox({
                            id: username,
                            user: {id: userid},
                            title: msg.fromname,
                            width: 300,
                            messageSent: function (id, user, message) {
                                $(div).chatbox("option", "boxManager").addMsg(userid, id, message);
                                socket.emit('msg', {fromid: userid, fromname: username, toid: msg.fromid, msg: message});
                            }});
                    }

                    $(map.get(msg.fromid)).chatbox("option", "boxManager").addMsg(msg.fromid, msg.fromname, msg.msg);

                }
            });
        });
    }
//点击"X"所触发的事件
    $("#popupContactClose").click(function(){
        disablePopup();
    });
});
function HashMap(){
    //定义长度
    var length = 0;
    //创建一个对象
    var obj = new Object();

    /**
     * 判断Map是否为空
     */
    this.isEmpty = function(){
        return length == 0;
    };

    /**
     * 判断对象中是否包含给定Key
     */
    this.containsKey=function(key){
        return (key in obj);
    };

    /**
     * 判断对象中是否包含给定的Value
     */
    this.containsValue=function(value){
        for(var key in obj){
            if(obj[key] == value){
                return true;
            }
        }
        return false;
    };

    /**
     *向map中添加数据
     */
    this.put=function(key,value){
        if(!this.containsKey(key)){
            length++;
        }
        obj[key] = value;
    };

    /**
     * 根据给定的Key获得Value
     */
    this.get=function(key){
        return this.containsKey(key)?obj[key]:null;
    };

    /**
     * 根据给定的Key删除一个值
     */
    this.remove=function(key){
        if(this.containsKey(key)&&(delete obj[key])){
            length--;
        }
    };

    /**
     * 获得Map中的所有Value
     */
    this.values=function(){
        var _values= new Array();
        for(var key in obj){
            _values.push(obj[key]);
        }
        return _values;
    };

    /**
     * 获得Map中的所有Key
     */
    this.keySet=function(){
        var _keys = new Array();
        for(var key in obj){
            _keys.push(key);
        }
        return _keys;
    };

    /**
     * 获得Map的长度
     */
    this.size = function(){
        return length;
    };

    /**
     * 清空Map
     */
    this.clear = function(){
        length = 0;
        obj = new Object();
    };
}
var popupStatus = 0;
//使用Jquery加载弹窗
function loadPopup(){
//仅在开启标志popupStatus为0的情况下加载
    if(popupStatus==0){
        $("body").css({
            "opacity": "0.7"
        });
        //$("body").fadeIn("slow");
        $("#popupContact").fadeIn("slow");
        popupStatus = 1;
    }
    $("#popupContact").focus();
}
//使用Jquery去除弹窗效果
function disablePopup(){
//仅在开启标志popupStatus为1的情况下去除
    if(popupStatus==1){
        $("body").css({
            "opacity": "1.0"
        });
        $("#popupContact").fadeOut("slow");
        popupStatus = 0;
    }
}
//将弹出窗口定位在屏幕的中央
function centerPopup(){
//获取系统变量
    var windowWidth = document.documentElement.clientWidth;
    var windowHeight = document.body.clientHeight;
    var popupHeight = $("#popupContact").height();
    var popupWidth = $("#popupContact").width();
//居中设置
    $("#popupContact").css({
        "position": "absolute",
        "top": windowHeight/2-popupHeight/2,
        "left": windowWidth/2-popupWidth/2
    });
//以下代码仅在IE6下有效
    $("body").css({
        "height": windowHeight
    });
}