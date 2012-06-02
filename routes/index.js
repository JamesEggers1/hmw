"use strict";
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Hack the Midwest\'s Rambler'});
};