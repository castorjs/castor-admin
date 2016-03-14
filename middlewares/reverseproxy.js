/*jshint node:true, laxcomma:true */
"use strict";

var config             = require('../config')
  , getInstancesConfig = require('../lib/instances').getInstancesConfig
  , httpProxy          = require('http-proxy')
  ;



/*
 * Proxy redirect middleware
 */

module.exports = function() {

  config.instances = getInstancesConfig();

  var proxy = httpProxy.createProxyServer({})
    , domainEnv = process.env.domainProxy
    , data = config.instances;

  return function(req, res , next) {

    var reqServer = req.headers['x-forwarded-server']
      , reqHost = req.headers['x-forwarded-host']
      , reqSubdomain = reqHost ? reqHost.split('.') : null
      ;

    console.log('reverseproxy#1',reqSubdomain,' && (', reqServer, ' === ', domainEnv, ")");

    if(reqSubdomain && (reqServer === domainEnv) && data !== undefined) {

      console.log('reverseproxy#1.1');

      var search = reqSubdomain[0].split('-');

      var found = Object.keys(data)
      .map(function(z) {
        data[z].current = data[z].id.split('-');
        data[z].current[2] = data[z].current[2] === undefined ? 0 : Number(data[z].current[2]);
        if (Number.isNaN(data[z].current[2])) {
          data[z].current[2] = 0;
        }
        return z;
      })
      .sort(function(a, b) {
        return data[a].current[2] < data[b].current[2];
      })
      .filter(function(x) {
        return data[x].current[0] === search[0] && data[x].current[1] === search[1];
      })
      .reduce(function(prev, w) {
        if (prev !== undefined) {
          return prev;
        }
        if (search[2] === undefined) {
          return w;
        }
        if (data[w].current[0] === search[0] && data[w].current[1] === search[1] && data[w].current[2] === Number(search[2])) {
          return w;
        }
        return;
      }, undefined);

      if (found !== undefined) {
        var url = 'http://127.0.0.1:' + data[found].port;
        console.log('reverseproxy#1.1.1', url);
        proxy.web(req, res, { target: url });
        proxy.on('error', function(e) { console.error("reverseproxy#1.1.2", e);  } );
        return;
      }
      else {
        console.log('reverseproxy#1.2');
        res.render('404', { title: 'No any app found :( !', path: '/', userName: req.user });
      }
    }
    else {
      console.log('reverseproxy#1.0');
      next();
    }
  }
}


