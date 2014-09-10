'use strict';
var path = require('path');

function Configuration() {
    this.port =  process.env.PORT || 35267;
    this.instances_path = path.normalize(path.resolve(process.env.HOME || process.cwd(), "instances"));
    this.administrator_end =  "castorjs.org";
}

Configuration.prototype.set = function set(name, value) {
  this[name] = value;
  return this;
};

Configuration.prototype.get = function get(name) {
  return this[name] ? this[name] : undefined;
};


module.exports = new Configuration();
