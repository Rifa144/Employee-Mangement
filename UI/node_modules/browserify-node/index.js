"use strict";
var through = require("through");
var libpath = require("path");

var EXT = /\.node\.js$/;

function getEnv(path) {
  delete require.cache[require.resolve(path)];
  return require(path);
}

function env(path) {
  return getEnv(libpath.resolve("", path));
}

function browserifyNode(filename) {
  if (!EXT.test(filename)) {
    return through();
  } else {
    return through(function() {}, function() {
      var func = getEnv(filename);
      var output = func(env);
      var script = "module.exports = " + output + ";";
      this.queue(script);
      this.queue(null);
    });
  }
}

module.exports = browserifyNode;
