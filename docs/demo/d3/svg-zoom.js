'use strict';

var diagram = {
  url: 'https://swanix.org/diagrams/src/draw-io/org-chart.svg',
  name: "base",
  x: 0,
  y: 0,
  width: 900,
  height: 'auto'
}

var margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

var width = '100vw',
  height = '100vh';

var x = d3.scale.linear()
  .domain([0, width])
  .range([0, width]);

var y = d3.scale.linear()
  .domain([0, height])
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickSize(-height);

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .ticks(5)
  .tickSize(-width);

var zoom = d3.behavior.zoom()
  .x(x)
  .y(y)
  .scaleExtent([1, 32])
  .on("zoom", zoomed);

var svg = d3.select('#viewer').append('svg')
  .attr("width", width)
  .attr("height", height)
  .call(zoom);

// svg.append("rect")
//    .attr("width", "100%")
//    .attr("height", "100%")
//    .attr("fill", "royalblue");

d3.select("#reset-zoom").on("click", reset);

var elementsToScale = svg.append("g")
  .attr("id", "elementsToScale")

function zoomed() {
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);
  var translate = d3.event ? d3.event.translate : '0,0'
  var scale = d3.event ? d3.event.scale : '1'
  svg.select('#elementsToScale').attr("transform", "translate(" + translate + ")" + " scale(" + scale + ")");
}

function reset() {
  d3.transition().duration(750).tween("zoom", function() {
    var ix = d3.interpolate(x.domain(), [0, width]),
      iy = d3.interpolate(y.domain(), [0, height]);
    return function(t) {
      zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
      zoomed();
    };
  });
}

function showDiagram(el, offsetX = 0, offsetY = 0) {
  d3.xml(el.url, 'image/svg+xml', function(error, xml) {
    if (error) {
      console.log('error' + error)
      throw error;
    }
    var svgNode = xml.getElementsByTagName('svg')[0];
    d3.select(svgNode).attr('id', diagram.name)
      .attr('x', el.x + offsetX)
      .attr('y', el.y + offsetY);
    elementsToScale.node().appendChild(svgNode);
    elementsToScale.select('#' + el.name)
      .attr('width', el.width)
      .attr('height', el.height);
  });
}

showDiagram(diagram, 30);