var width =500;
var height= 500;

var svg = d3.select('#svg1');

var svgWidth = 3000;
var svgHeight = 700;


var padding = {t: 50, r: 50, b: 50, l: 50};

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var xHistScale;
var yHistScale;

var valueColors = ['#99d6ff', '#33adff','#008ae6','#005c99'];
var reversedColors = valueColors.slice().reverse();

var colorScale = d3.scaleQuantize()
      .domain([5000, 65000])
      .range(valueColors);

var hist = svg.append('g')
            .attr('class', 'histogram')
            .attr("transform", function(d){ return 'translate(' + [padding.t, padding.l] + ')'; });

hist.append('text')
    .attr('class', 'hist_y_axis_label')
    .attr('transform', function(d) {return "translate("+[-30,450]+") " + "rotate(270)"})
    .text('Number of Colleges')
    .style('font-size', '15px')
    .attr("font-family", "Trebuchet MS");;

hist.append('text')
    .attr('class', 'hist_x_axis_label')
    .attr('transform', function(d) {return "translate("+[200,650]+") " })
    .text('Average Cost ($)')
    .style('font-size', '15px')
    .attr("font-family", "Trebuchet MS");;

hist.append('text')
    .attr('class', 'hist_title')
    .attr('transform', function(d) {return "translate("+[25,50]+") "})
    .text('Distribution of Admission Rates')
    .style('font-size', '15pt')
    .attr("font-family", "Trebuchet MS");

hist.append('text')
    .attr('class', 'legend_title')
    .attr('transform', function(d) {return "translate("+[500,130]+") "})
    .text('Median Earnings (USD)')
    .style('font-size', '15px')
    .attr("font-family", "Trebuchet MS");

d3.csv("colleges.csv", function(csv) {
    console.log(csv[0]);
    for (var i=0; i<csv.length; ++i) {
		d = csv[i];
		d["Average Cost"] = Number(d["Average Cost"]);
		//d["Mean Earnings 8 years After Entry"] = Number(d["Mean Earnings 8 years After Entry"]);
    }
    var costExtent = d3.extent(csv, function(row) { return row["Average Cost"]; });
    //var earningsExtent = d3.extent(csv, function(row) { return row["Mean Earnings 8 years After Entry"]; });

    xHistScale = d3.scaleLinear()
        .range([0, chartWidth * .4])
        .domain(costExtent);

    
    svg.append('g') // Append a g element for the scale
        .attr('class', 'xHist_axis') // Use a class to css style the axes together
        .attr('transform', 'translate(50, 660)') // Position the axis
        .call(d3.axisBottom(xHistScale));
        //.tickFormat(d3.format(".0%"))); // Call the axis function
    

    var histogram = d3.histogram()
        .value(function(d) { return d["Average Cost"]; })   // I need to give the vector of value
        .domain(xHistScale.domain())  // then the domain of the graphic
        .thresholds(xHistScale.ticks(70)); // then the numbers of bins
  
    // And apply this function to data to get the bins
	var bins = histogram(csv);
	
	yHistScale = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([chartHeight * .8, 0]);

	svg.append('g') // Append a g element for the scale
        .attr('class', 'yHist_axis') // Use a class to css style the axes together
        .attr('transform', 'translate(50, 180)') // Position the axis
		.call(d3.axisLeft(yHistScale)); // Call the axis function
		
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return "translate(" + (xHistScale(d.x0) + 50) + "," + (yHistScale(d.length) + 160) + ")"; })
          .attr("width", function(d) { return xHistScale(d.x1) - xHistScale(d.x0) -1 ; })
          .attr("height", function(d) { return height - yHistScale(d.length); })
          .style("fill", "#69b3a2")
});