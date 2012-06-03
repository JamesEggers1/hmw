"use strict";
(function($, io, speak, clippy){
	var _blogTitle = $(".blog-title")
		, _blogBody = $(".blog-body")
		, _blog = $("#Blog")
		, _blogList = $(".blog-finder-list > ul")
		, _submit = $("input[type='submit']")
		, _previousBlog = $(".previous-blog")
		, _previousPost = $(".previous-post")
		, _play = $(".play")
		, _nextPost = $(".next-post")
		, _nextBlog = $(".next-blog")
		, _socket;
		
	var _info
		, _currentPostIndex;
		
	function setSocketServer(){
		var scheme = window.location.protocol;
		var host = window.location.host;
		_socket = io.connect(scheme + '//' + host);
	}
		
	function addBlogToList(e){
		e.preventDefault();
		var blogUri = _blog.val().trim();
		if (blogUri.length > 0 && /^(.*)\.tumblr\.com$/.test(blogUri)){
			_blogList.find("li").removeClass("active");
			_blogList.append("<li class=\"active\">" + blogUri + "</li>");
			getInfo(blogUri);
			getFirstPost(blogUri);
		}
	}
	
	function changeToPreviousBlog(e){
		var blogs = _blogList.find("li")
			, previousBlog
			, currentBlog;
		 
		if ($(blogs[0]).hasClass("active")){
			return;
		}
			
		for (var i = 1, len = blogs.length; i < len; i++){
			previousBlog = $(blogs[i - 1]);
			currentBlog = $(blogs[i]);
			
			if (currentBlog.hasClass("active")){
				currentBlog.removeClass("active");
				previousBlog.addClass("active");
				getInfo(previousBlog.text());
				getFirstPost(previousBlog.text());
				break;
			}
		}
	}
	
	function changeToNextBlog(e){
		var blogs = _blogList.find("li")
			, blogCount = blogs.length
			, nextBlog
			, currentBlog;
		 
		if ($(blogs[blogCount - 1]).hasClass("active")){
			return;
		}
			
		for (var i = 0; i < blogCount - 1; i++){
			nextBlog = $(blogs[i + 1]);
			currentBlog = $(blogs[i]);
			
			if (currentBlog.hasClass("active")){
				currentBlog.removeClass("active");
				nextBlog.addClass("active");
				getInfo(nextBlog.text());
				getFirstPost(nextBlog.text());
				break;
			}
		}
	}
	
	
	function getInfo(blog){
		_socket.emit("getInfo", {blog: blog});
	}
	
	function infoReceived(data){
		_info = data;
		console.log(_info);
	}
	
	function textResponseReceived(data){
		_blogTitle.text(data.title);
		_blogBody.html("");
		_blogBody.append("<p>" + data.date + "</p>");
		_blogBody.append("<p>" + data.url + "</p>");
		_blogBody.append("<div class=\"audio-start\">" + data.body + "</div>");
	}
	
	function getFirstPost(blog){
		_currentPostIndex = 0;
		_socket.emit("getPost", {blog: blog, index:0});
	}
	
	function getNextPost(){
		if (_currentPostIndex !== _info.posts - 1){
			var blog = $("li.active").text();
			_currentPostIndex += 1;
			_socket.emit("getPost", {blog: blog, index:_currentPostIndex});
		}
	}
	
	function getPreviousPost(){
		if (_currentPostIndex !== 0) {
			var blog = $("li.active").text();
			_currentPostIndex -= 1;
			_socket.emit("getPost", {blog: blog, index:_currentPostIndex});
		}
	}
	
	function play(){
		showClippy();
		var text = $(".audio-start");
		if (text.length > 0) {
			speak(text.text());
		} else {
			speak("No Post Found");
		}
	}
	
	function showClippy(){
		clippy.load("clippy", function(agent){
			agent.show();
			agent.speak("Please wait while I prepare to read this to you. (10-30 seconds)");
			agent.Play("Thinking");
		});
	}
	
	$(function(){
		setSocketServer();
		_submit.on("click", addBlogToList);
		_previousBlog.on("click", changeToPreviousBlog);
		_nextBlog.on("click", changeToNextBlog);
		_play.on("click", play);
		_previousPost.on("click", getPreviousPost);
		_nextPost.on("click", getNextPost);
		_socket.on("infoReceived", infoReceived);
		_socket.on("textResponseReceived", textResponseReceived);
		
	});
}(window.jQuery, window.io, window.speak, window.clippy));