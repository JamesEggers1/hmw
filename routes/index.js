"use strict";
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', key: process.env.TUMBLR_OAUTH.length > 0 });
};