"use strict";
var Tumblr = require("tumblr").Tumblr
	, _oAuth = process.env.TUMBLR_OAUTH
	, _channels = {}
	, _blogs = {};

function on(channel, cb) {
	if (!_channels[channel]) { _channels[channel] = []; }
	_channels[channel].push(cb);
}

function off(channel, cb) {
	if (!_channels[channel] || _channels[channel].indexOf(cb) === -1) { return; }

	var index = _channels[channel].indexOf(cb);
	_channels[channel].splice(index, 1);
}

function emit(channel) {
	if (!_channels[channel]) { return; }
	var args = [].slice.call(arguments, 1);

	for (var i = 0, l = _channels[channel].length; i < l; i++) {
		_channels[channel][i].apply(this, args);
	}
}

function getInfo(blog){
	console.log(_oAuth);
	var api = new Tumblr(blog, _oAuth);
	api.info(function(err, res){
		console.log(res.blor);
	});
}

function getText(blog, index){
	var api = new Tumblr(blog, _oAuth)
		, pattern = /^(.*)\.tumblr\.com/
		, blogName = pattern.exec(blog)[1];
	
	if (!_blogs[blogName]){getInfo(blog);}	
	
	index = index || 0;
	api.text({limit: index+1}, formatTextResponse);
}

function infoResponse(err, res) {
	if (err) {formatErrorResponse(err, res);}
	
	_blogs[res.blog.name] = res.blog;
	emit("infoReceived", res.blog);
}
	
function formatTextResponse(err, res){
	if (err) {formatErrorResponse(err, res);}
	
	var postIndex = res.posts.length
		, post = res.posts[postIndex - 1]
		, blogName = post.blog_name;
	
	var responseObject = {
		url: post.post_url
		, date: post.date
		, title: post.title
		, body: post.body
		, index: postIndex
		, postCount: _blogs[blogName]
	};
	
	emit("textResponseReceived", responseObject);
}

function formatErrorResponse(err, res){
	emit("errorResponseReceived", err);
}

exports.getInfo = getInfo;
exports.getText = getText;
exports.on = on;
exports.off = off;
