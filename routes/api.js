"use strict";

function info(req, res){
	
}

function getPost(req, res){
	
}

exports.routes = function(app){
	app.get("/api/info", info);
	app.get("/api/getPost", getPost);
};