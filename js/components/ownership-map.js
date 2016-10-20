(function() {

  var pixelize = function(value) {
    return String(value).match(/px/)
      ? value
      : value + 'px';
  };

  var attached = function() {
    var root = d3.select(this);

    var cropMap = function() {
      var svgMap = root.select('svg.ownership.map');
      var svgContainer = root.select('.svg-container');

      if (!svgMap.empty() && !svgContainer.empty()) {
        console.log('<<', svgContainer.style('padding-bottom'))
        svgContainer.style('padding-bottom', function() {
          console.log(svgMap.node().getBoundingClientRect().height)

          return pixelize(svgMap.node().getBoundingClientRect().height);
        });
      } else {
      console.warn('cannot resize svg county map because it doesn\'t exist')
      }
    }

    cropMap();

    console.log('attached')


    // d3.select(window).on('resize.cropOwnership', cropMap);
  };

  var detached = function() {
  };

  document.registerElement('ownership-map', {
    'extends': 'figure',
    prototype: Object.create(
      HTMLElement.prototype,
      {
        attachedCallback: {value: attached},
        detachedCallback: {value: detached}
      }
    )
  });

})();
