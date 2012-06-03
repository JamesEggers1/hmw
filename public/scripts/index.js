"use strict";
(function($, io, speak, clippy){
	var _blogTitle = $(".blog-title")
		, _blogBody = $(".blog-body")
		, _blog = $("#Blog")
		, _blogError = $(".blog-finder-error")
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
		_blogError.html("");
		var blogUri = _blog.val().trim();
		if (blogUri.length > 0 && /^(.*)\.tumblr\.com$/.test(blogUri)){
			_blogList.find("li").removeClass("active");
			_blogList.append("<li class=\"active\">" + blogUri + "</li>");
			getInfo(blogUri);
			getFirstPost(blogUri);
		} else {
			_blogError.html("Invalid Blog or Blog Format");
		}
	}
	
	function changeToPreviousBlog(e){
		_blogError.html("");
		var blogs = _blogList.find("li")
			, previousBlog
			, currentBlog;
		 
		if ($(blogs[0]).hasClass("active")){
			return;
		}
		//teardownAudioEvents();
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
		_blogError.html("");
		var blogs = _blogList.find("li")
			, blogCount = blogs.length
			, nextBlog
			, currentBlog;
		 
		if ($(blogs[blogCount - 1]).hasClass("active")){
			return;
		}
		//teardownAudioEvents();	
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
		_blogError.html("");
		_socket.emit("getInfo", {blog: blog});
	}
	
	function infoReceived(data){
		_info = data;
		//console.log(_info);
	}
	
	function textResponseReceived(data){
		_blogError.html("");
		_blogTitle.text(data.title);
		_blogBody.html("<div id=\"audio\"></div>");
		_blogBody.append("<p>" + data.date + "</p>");
		_blogBody.append("<p>" + data.url + "</p>");
		_blogBody.append("<div class=\"audio-start\">" + data.body + "</div>");
	}
	
	function getFirstPost(blog){
		_blogError.html("");
		_currentPostIndex = 0;
		_socket.emit("getPost", {blog: blog, index:0});
	}
	
	function getNextPost(){
		_blogError.html("");
		if (_currentPostIndex !== _info.posts - 1){
			//teardownAudioEvents();
			var blog = $("li.active").text();
			_currentPostIndex += 1;
			_socket.emit("getPost", {blog: blog, index:_currentPostIndex});
		}
	}
	
	function getPreviousPost(){
		_blogError.html("");
		if (_currentPostIndex !== 0) {
			//teardownAudioEvents();
			var blog = $("li.active").text();
			_currentPostIndex -= 1;
			_socket.emit("getPost", {blog: blog, index:_currentPostIndex});
		}
	}
	
	var _isPlaying = false
		, _hasStarted = false
		, _recursionCounter = 0;
		
	function setupAudioEvents(){
		var audio = $("audio")[0];
		
		if (!audio && _recursionCounter < 30) {
			setTimeout(1000, setupAudioEvents);
			_recursionCounter++;
			return;
		}
		
		audio.addEventListener("onpause", function(){
			_play.find("img").attr("src", "/images/control-play-icon.png");
			_isPlaying = false;
			_hasStarted = true;
		});
		
		audio.addEventListener("onplay", function(){
			_play.find("img").attr("src", "/images/control-pause-icon.png");
			_isPlaying = true;
			_hasStarted = true;
		});
		
		audio.addEventListener("onended", function(){
			_play.find("img").attr("src", "/images/control-play-icon.png");
			_isPlaying = false;
			_hasStarted = false;
		});
	}
	
	function teardownAudioEvents(){
		var audio = $("audio")[0];
		
		if (audio) {
			audio.removeEventListener("onpause", function(){
				_play.find("img").attr("src", "/images/control-play-icon.png");
				_isPlaying = false;
				_hasStarted = true;
			});
		
			audio.removeEventListener("onplay", function(){
				_play.find("img").attr("src", "/images/control-pause-icon.png");
				_isPlaying = true;
				_hasStarted = true;
			});
		
			audio.removeEventListener("onended", function(){
				_play.find("img").attr("src", "/images/control-play-icon.png");
				_isPlaying = false;
				_hasStarted = false;
			});
		}
		
		_isPlaying = false;
		_hasStarted = false;
	}
	
	function play(){
		if (!_isPlaying && !_hasStarted){
			showClippy();
			var text = $(".audio-start");
			if (text.length > 0) {
				speak(text.text());
				//_play.find("img").attr("src", "/images/control-pause-icon.png");
			} else {
				speak("No Post Found");
			}
			
			//setupAudioEvents();
		} else if (!_isPlaying && _hasStarted) {
			$("audio")[0].play();
		} else if (_isPlaying) {
			$("audio")[0].pause();
		}
	}
	
	var _clippy_is_loaded = false;
	function showClippy(){
		if (!_clippy_is_loaded){
			clippy.load("Clippy", function(agent){
				_clippy_is_loaded = true;
				agent.show();
				agent.speak("Please wait while I prepare to read this to you. (10-30 seconds)");
				agent.play("Thinking");
				setTimeout(function(){agent.hide(); _clippy_is_loaded = false;}, 20000);
			});
		}
	}
	
	function errorReceived(data){
		_blogError.html(data.message);
		console.error(data.message);
		console.error(data.err || "No error object provided.");
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
		_socket.on("errorOccurred", errorReceived);
		
	});
}(window.jQuery, window.io, window.speak, window.clippy));