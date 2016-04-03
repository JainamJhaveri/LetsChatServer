var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectedUsers = {};
var readyUsers = [];


app.get('/',function(req,res){
    res.sendFile(__dirname + "/" + "index.html");
});

io.on('connection',function(socket){
    console.log("a mobile connected "+ socket.id);


    socket.on('register',function(user){

        user.socket = socket;
        connectedUsers[user.id] = user;
        console.log("user registered** "+ dispOnlineUsers());
        //console.log(user);
        socket.emit('getUsers',dispOnlineUsers());

    });

    socket.on("newMessageS",function(ob){
        var messageOb = {};
        messageOb.message = ob.message;
        connectedUsers[ob.to].socket.emit("newMessageR",messageOb);
    });

    socket.on('unregister',function(user){
        delete connectedUsers[user.id];
        console.log('----user unregistered----');
        console.log(dispOnlineUsers());
    });

    /*
    socket.on('chat message', function(msg){

        console.log('message: ' + msg);
    });
*/

    socket.on('disconnect',function(){
        console.log("user disconnected");
    });

    socket.on('display',function(){
        socket.emit('getUsers',dispOnlineUsers());
        console.log(dispOnlineUsers());
    });

    socket.on('ready',function(user){
        var id = user.id;

        readyUsers.push(connectedUsers[id]);
        console.log(readyUsers);
        //console.log(connectedUsers);
        //console.log('-------------------');
        //console.log(readyUsers);
    });

    socket.on('notReady',function(user){
        var id = user.id;
        var index = readyUsers.indexOf(connectedUsers[id]);
        if(index > -1)
            readyUsers.splice(index,1);
        console.log(readyUsers);
    })




    /*
    socket.on('display',function(){
             console.log("display called..")
        console.log(connectedUsers);
    });
*/


});



http.listen(3000,function(){
    console.log("server running...");
});

function makePairs(){
    if(readyUsers.length >= 2){
        var temp1 = readyUsers.shift();
        var temp2 = readyUsers.shift();

        var user1={};
        user1.id = temp1.id;
        user1.name = temp1.name;
        var user2={};
        user2.id = temp2.id;
        user2.name = temp2.name;

        temp1.socket.emit('newChat',user2);
        temp2.socket.emit('newChat',user1);
    }
    else{
        //console.log('waiting for some user...');
    }
}

setInterval(makePairs,1000);



function dispOnlineUsers(){
    var names = [];
    var id = [];
    for(var x in connectedUsers){
        names.push(connectedUsers[x].name);
        id.push(connectedUsers[x].id);
    }
    var ob ={};
    ob.names = names;
    ob.id = id;
    return ob;

}

