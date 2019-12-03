// set the dimensions and margins of the graph

var margin = {top: 100, right: 100, bottom: 250, left: 100, all: 100},
    width = 960 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;


const msm = {marginAll: 0, width: width, height: height, marginLeft: 50}

const small_msm = {
    width: 700,
    height: 500,
    marginAll: 70,
    marginLeft: 100
}
// set the ranges
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

var tooltipContainer = d3.select("#tooltip_viz")
    .append('svg')
    .attr('width', margin.width)
    .attr('height', margin.height);

// get the data
d3.csv("crime.csv", function(error, data) {
  if (error) throw error;
  var newdata = d3.nest()
  .key(function(d) { return d.OFFENSE_CODE_GROUP; })
  .rollup(function(v) { return v.length; })
  .entries(data);

  newdata.sort((a,b) => b.value - a.value); 
  newdata = newdata.slice(0, 15)

  var newdata2 = d3.nest()
  .key(function(d) { return d.OFFENSE_CODE_GROUP; })
  .key(function(d) { return d.YEAR; })
  .entries(data);


  // format the data
//   data.forEach(function(d) {
//     d.sales = +d.sales;
//   });

  // Scale the range of the data in the domains
  x.domain(newdata.map(function(d) { return d.key; }));
  y.domain([0, d3.max(newdata, function(d) { return d.value; })]);

  // append the rectangles for the bar chart

  let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let toolChart = div.append('svg')
  .attr('width', small_msm.width)
  .attr('height', small_msm.height)


  svg.selectAll(".bar")
        .data(newdata)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.key); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("fill", "teal")
      .attr("height", function(d) { return height - y(d.value); })
      .on("mouseover", (d) => {
        toolChart.selectAll("*").remove()
        div.transition()
            .duration(200)
            .style("opacity", .9);
        plotTooltip(d.key, toolChart)
        div
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 300) + "px");
        
    })
    .on("mouseout", (d) => {
        div.transition()
            .duration(500)
            .style("opacity", 0);
    });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));
    makeLabels(svg, msm, "Histogram of 15 Most Common Crimes In Boston", "Offense Code Group: Type of Crime", "Frequency", false);


function plotTooltip(code, toolChart) {
    let offensedata = data.filter((row) => {return row.OFFENSE_CODE_GROUP == code})
    var newdata2 = d3.nest()
    .key(function(d) { return d.YEAR; })
    .rollup(function(v) { return v.length; })
    .entries(offensedata);
    newdata2.sort((a,b) => a.key - b.key); 

var xScale = d3.scalePoint()
    .domain(newdata2.map(function(d) {
        return d.key
    }))
    .range([80, small_msm.width - 50])
    .padding(0.5);

var yScale = d3.scaleLinear()
    .domain([d3.min(newdata2, function(d) {return d.value}), d3.max(newdata2, function(d) {
        return d.value
    }) * 1.1])
    .range([small_msm.height - 50, 10]);

var line = d3.line()
	.x(function(d){ return xScale(d.key)})
	.y(function(d){ return yScale(d.value)});
	
toolChart.append("path")
	.attr("d", line(newdata2))
	.attr("stroke", "teal")
	.attr("stroke-width", "2")
	.attr("fill", "none");

var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);

toolChart.append("g").attr("transform", "translate(0, 450)")
    .attr("class", "xAxis")
    .call(xAxis);

toolChart.append("g")
    .attr("transform", "translate(80,0)")
    .attr("class", "yAxis")
    .call(yAxis);

toolChart.selectAll("circle")
    .data(newdata2)
  .enter().append("circle")
    .attr("class", "circle")
    .attr("stroke", 'teal')
    .attr("fill", "white")
    .attr("cx", function(d) { return xScale(d.key); })
    .attr("cy", function(d) { return yScale(d.value); })
    .attr("r", 4);

    makeLabels(toolChart, small_msm, "Frequency Of \"" + code + "\" Crimes Over Time", "Year", "Frequency", true);

}

function findMinMax(x, y) {

    let xMin = d3.min(x);
    let xMax = d3.max(x);

    let yMin = d3.min(y);
    let yMax = d3.max(y);

    return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
    }
}

function makeLabels(svgContainer, msm, title, x, y, small) {
    let titleFont = '14pt'
    let titley = -30
    xaxis_ypos = 520
    xaxis_xpos = 240
    yaxis_ypos = 0
    yaxis_xpos = -80
    if (small) {
        titleFont = '11pt'
        titley = 50
        yaxis_ypos = 20
        yaxis_xpos = 0
        xaxis_ypos = 500
        xaxis_xpos = 350
    }
    svgContainer.append('text')
        .attr('x', (msm.width - 2 * msm.marginAll) / 2 + msm.marginLeft )
        .attr('text-anchor', 'middle')
        .attr('y', titley)
        .style('font-size', titleFont)
        .text(title);

    svgContainer.append('text')
        .attr('x', xaxis_xpos )
        .attr('y', xaxis_ypos)
        .style('font-size', '12pt')
        .text(x);

    svgContainer.append('text')
        .attr('transform', 'translate( 15,' + (msm.height / 2 + 40) + ') rotate(-90)')
        .attr('y', yaxis_xpos)
        .attr('x', yaxis_ypos)
        .style('font-size', '12pt')
        .text(y);
}
});
