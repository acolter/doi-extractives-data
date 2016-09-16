(function(exports) {
  'use strict';

  var sticky = require('stickyfill')();

  [].forEach.call(
    document.querySelectorAll('.sticky'),
    sticky.add
  );

  exports.stickyfill = sticky;

})(window);
