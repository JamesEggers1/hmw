"use strict";
(function($, io){
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
		, _socket = io.connect('http://localhost');
		
	function addBlogToList(e){
		e.preventDefault();
		var blogUri = _blog.val().trim();
		if (blogUri.length > 0 && /^(.*)\.tumblr\.com$/.test(blogUri)){
			_blogList.find("li").removeClass("active");
			_blogList.append("<li class=\"active\">" + blogUri + "</li>");
			getInfo(blogUri);
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
				break;
			}
		}
	}
	
	
	function getInfo(blog){
		_socket.emit("getInfo", {blog: blog});
	}
	
	function infoReceived(data){
		_blogTitle.text(data.title);
		_blogBody.html("");
		console.dir(data);
		_blogBody.append("<p>" + data.description + "</p>"
			+ "<p>"
			+ "<dl>"
			+ "<dt>Url:</dt><dd><a href=\"" + data.url + "\">" + data.url + "</a></dd>"
			+ "<dt>Number of Posts:<dt><dd>" + data.posts + "</dd>"
			+ "</dl>"
			+ "</p>");
	}
	
	$(function(){
		_submit.on("click", addBlogToList);
		_previousBlog.on("click", changeToPreviousBlog);
		_nextBlog.on("click", changeToNextBlog);
		_socket.on("infoReceived", infoReceived);
	});
}(window.jQuery, window.io));