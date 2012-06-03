"use strict";
var tumblr = require("../api_wrapper/tumblr_wrapper")
	, port = process.env.PORT || 5000
	, socket_server;

function info(data, socket){
	var blog = data.blog;
	if (!blog){ socket.emit("errorOccurred", {message: "No Blog Received"});}
	
	tumblr.getInfo(blog, socket);
}

function getPost(req, res){
	
}

exports.setSocketRoutes = function(io){
	socket_server = io;
	socket_server.sockets.on("connection", function(socket){
		
		socket.on("getInfo", function(data){
			info(data, socket);
		});


	});
};