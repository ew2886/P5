var width = 500;
var height= 500;

var svg = d3.select('#svg');

var svgWidth = 1000;
var svgHeight = 800;
var padding = {t: 50, r: 50, b: 50, l: 50};

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;


d3.csv("colleges.csv", function(csv) {
	console.log(csv[0]);
    for (var i=0; i<csv.length; ++i) {
		d = csv[i];
		d["Average Cost"] = Number(d["Average Cost"]);
		d["Mean Earnings 8 years After Entry"] = Number(d["Mean Earnings 8 years After Entry"]);
    }
    var costExtent = d3.extent(csv, function(row) { return row["Average Cost"]; });
    var earningsExtent = d3.extent(csv, function(row) { return row["Mean Earnings 8 years After Entry"]; });
	var xScale = d3.scaleLinear().domain(costExtent).range([0, chartWidth]);
	var yScale = d3.scaleLinear().domain(earningsExtent).range([chartHeight, 0]);

	var xAxis = d3.axisBottom().scale(xScale);
	var yAxis = d3.axisLeft().scale(yScale);
	//Create SVGs for charts
	
	
	var chart1 = d3.select("#chart1")
		.append("svg:svg")
		.attr("width",chartWidth)
		.attr("height",chartHeight);
	
	var temp1= chart1.selectAll("circle")
		.data(csv)
		.enter()
		.append("circle")
		.attr("id",function(d,i) {return i;} )
		.attr("stroke", "black")
		.attr("cx", function(d) { return xScale(d["Average Cost"]); })
		.attr("cy", function(d) { return yScale(d["Mean Earnings 8 years After Entry"]); })
		.attr("r", 5)
		.on("click", function(d,i){ 
 
		});

	chart1 // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(0," + (chartHeight - 100) + ")")
		.call(xAxis) // call the axis generator
		.append("text")
		.attr("class", "label")
		.attr("x", width-16)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("SATM");

    chart1 // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(50, 0)")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)");
 

	});
