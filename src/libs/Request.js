/*!
 * HTTP/HTTPS Agent for my Soft Boilerplate
 * Hugo Piquemal - https://hugo.works
 */
'use strict';

var dataToURL = function(obj){
  Object.keys(obj).map(function(k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
  }).join('&');
};

//TODO: change class pattern to closures
var Request = function(method, url) {
  this.req = new XMLHttpRequest();
  this.method = method;
  this.url = url;
  this.dataContent = null;
  this.headersContent = {};
  this.json = true;
};

Request.prototype.data = function(data) {
  this.dataContent = data;
  return this;
};

Request.prototype.headers = function(data) {
  this.headersContent = data;
  return this;
};

Request.prototype.exec = function(cb) {
  var self = this;
  var unbind = function() {
    self.req.removeEventListener('load', load);
    self.req.removeEventListener('error', error);
  }
  var load = function(e) {
    if (this.status >= 200 && this.status < 400) {
      var body = (this.getResponseHeader('Content-Type').match(/^application\/json/))
                 ? JSON.parse(this.responseText) : this.responseText;
      cb(false, body);
    }
    else cb(this.statusText, this.responseText);
    unbind();
  };
  var error = function(e) {
    cb(e, null);
    unbind();
  };

  this.req.open(this.method, this.url, true);

  //format data
  if (this.dataContent && (this.method == "PUT" || this.method === "POST")) {
    this.dataContent = (this.json) ? JSON.stringify(this.dataContent) : dataToURL(this.dataContent);
  }
  else this.dataContent = null;

  //make headers
  for (k in this.headersContent) {
    if (k === 'Content-Type'){
      if (this.headersContent[k] === 'application/json') continue;
      else this.json = false;
    }
    this.req.setRequestHeader(k, this.headersContent[k]);
  }
  if (this.json) this.req.setRequestHeader('Content-Type', 'application/json');

  this.req.addEventListener('load', load, false);
  this.req.addEventListener('error', error, false);
  this.req.send(this.dataContent);
};

module.exports = {
  get: function(url){
    var request = new Request('GET', url);
    return request;
  },
  post: function(url){
    //var request = new Request('POST', url);
    return new Request('POST', url);
  }
}
