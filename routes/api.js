"use strict";
var tumblr = require("../api_wrapper/tumblr_wrapper")
	, port = process.env.PORT || 5000
	, socket_server;

function info(data, socket){
	var blog = data.blog;
	if (!blog){ socket.emit("errorOccurred", {message: "No Blog Received"});}
	if (!socket){console.log("socket is undefined!");}
	tumblr.getInfo(blog, socket);
}

function post(data, socket){
	var blog = data.blog
		, index = data.index || 0;
		
	if (!blog){ socket.emit("errorOccurred", {message: "No Blog Received"});}
	
	tumblr.getText(blog, index, socket);
}

exports.setSocketRoutes = function(io){
	socket_server = io;
	socket_server.sockets.on("connection", function(socket){
		
		socket.on("getInfo", function(data){
			info(data, socket);
		});
		
		socket.on("getPost", function(data){
			post(data, socket);
		});

	});
};