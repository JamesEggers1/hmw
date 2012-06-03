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

function getInfo(blog, socket){
	var api = new Tumblr(blog, _oAuth);
	api.info(function(err, res) {
		if (err) {formatErrorResponse(err, res);}

		_blogs[res.blog.name.toLowerCase()] = res.blog;
		socket.emit("infoReceived", res.blog);
	});
}

function getText(blog, index){
	var api = new Tumblr(blog, _oAuth)
		, pattern = /^(.*)\.tumblr\.com/
		, blogName = pattern.exec(blog)[1];
	
	if (!_blogs[blogName.toLowerCase()]){getInfo(blog);}	
	
	index = index || 0;
	api.text({limit: index+1}, formatTextResponse);
}
	
function formatTextResponse(err, res){
	if (err) {formatErrorResponse(err, res);}
	
	var postIndex = res.posts.length
		, post = res.posts[postIndex - 1]
		, blogName = post.blog_name.toLowerCase();
	
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
	console.log(err);
	emit("errorResponseReceived", err);
}

exports.getInfo = getInfo;
exports.getText = getText;
exports.on = on;
exports.off = off;