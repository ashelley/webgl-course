const path = require('path')
const webpack = require('webpack')

let config = require('./webpack.config.js')

let devproxy
try {
    devproxy = require('./devproxy.config.js')
}
catch(err) {
    console.warn(err)
}
 

config.devServer = {
    contentBase: './public',
    index: "index.html",
    proxy: {
        "/": {
          target: devproxy?.endpoint,
          changeOrigin: true,
          bypass: function(req, res, proxyOptions) {
            if(req.path.indexOf("/api/ops/claimimages") == 0) return                  
            if (devproxy == null || !req.headers.accept || req.headers.accept.indexOf("json") == -1) {
              console.log("proxy( no)", req.url)            
              return req.url;
            }
            else {
                console.log("proxy(yes)" + devproxy.endpoint + req.path)
            }
          }
        }
    }        
},

module.exports = config;