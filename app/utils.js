// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());
/**
  * Copyright (c) Mozilla Foundation http://www.mozilla.org/
  * This code is available under the terms of the MIT License
  */
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp*/) {
      var len = this.length >>> 0;
      if (typeof fun !== "function") {
          throw new TypeError();
      }

      var res = [];
      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
          if (i in this) {
              var val = this[i]; // in case fun mutates this
              if (fun.call(thisp, val, i, this)) {
                  res.push(val);
              }
          }
      }

      return res;
  };
}

function waitFor(condition,callback){
  condition ? callback() : setTimeout(function(){waitFor(callback);},250);                
}