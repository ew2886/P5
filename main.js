var data_set =[];
var locale = [];
var cost = [];

var binContainer = []; 

var filterList = []

var svg = d3.select('#svg1');

var svgWidth = 3000;
var svgHeight = 700;

var padding = {t: 50, r: 50, b: 50, l: 50};

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var xHistScale;
var yHistScale;
var hist;
var graphPlace; 
var regionDropdown; 
var actDropdown;
var satDropdown;
var legendPlace;

var valueColors = ['#FFFF02', '#FED825', '#FFA15A', '#FF6496',  '#EC02E2'];
var reversedColors = valueColors.slice().reverse();

var colorScale = d3.scaleQuantize()
      .domain([20000, 60000]) //15000, 65000
      .range(valueColors);

    // thresholds   
    // #FFFF02:  (2) [20000, 28000]
    // #FED825:  (2) [28000, 36000]
    // #FFA15A:  (2) [36000, 44000]
    // #FF6496:  (2) [44000, 52000]
    // #EC02E2:  (2) [52000, 60000]

var legendHist = ['$52k+', '$44k-$52k', '$36k-$44k', '$28k-$36k', '< $28k'];
var legendTitle = ['Median Earnings 8 years After Entry'];

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return "<div><b>Name:  </b>" + d["name"] + "</div>"
            + "<div>Region:  " + d["region"] + "</div>"
            + "<div>Admission Rate:  " + d["admission"] + "</div>"
            + "<div>ACT:  " + d["ACT"] + "</div>"
            + "<div>SAT:  " + d["SAT"] + "</div>"
            + "<div>Average Cost:  " + d["cost"] + "</div>";
        });

svg.call(tip);

var active_link = "0"; //to control legend selections and hover
var legendClicked; //to control legend selections
var legendClassArray = []; //store legend classes to select bars in plotSingle()
var y_orig; //to store original y-posn

d3.csv('./colleges.csv',
    function(d){
        // This callback formats each row of the data
        return {
            name: d.Name,
            admission: +d['Admission Rate'],
            ACT: +d['ACT Median'],
            SAT: +d['SAT Average'],
            cost: +d['Average Cost'],
            salary: +d['Median Earnings 8 years After Entry'],
            // needed for on click 
            debt: +d['Median Debt on Graduation'],
            locale: d.Locale,
            control: d.Control,
            region: d.Region,
            population: +d['Undergrad Population'],
            percent_white: +d['% White'],
            percent_black: +d['% Black'],
            percent_hispanic: +d['% Hispanic'],
            percent_asian: +d['% Asian'],
            percent_amer_indian: +d['% American Indian'],
            percent_pacific_islander: +d['% Pacific Islander'],
            percent_biracial: +d['% Biracial'],
            percent_aliens: +d['% Nonresident Aliens'],
        }
    },


    function(error, dataset){
        if(error) {
            return;
        }
        // Testing sht 
        var headerNames = d3.keys(dataset[0])
        console.log(headerNames)

        xHistScale = d3.scaleLinear()
            .range([0, chartWidth * .4])
            .domain([0, d3.max(dataset, function(d) {
                return d.cost;
            })]);
        svg.append('g') // Append a g element for the scale
            .attr('class', 'xHist_axis') // Use a class to css style the axes together
            .attr('transform', 'translate(50, 660)') // Position the axis
            .call(d3.axisBottom(xHistScale)); // Call the axis function

        hist = svg.append('g')
            .attr('class', 'histogram')
            .attr("transform", function(d){ return 'translate(' + [padding.t, padding.l] + ')'; });

        ``//TODO: probably change fonts too
        yHistScale = d3.scaleLinear()
            .domain([0, 40])
            .range([chartHeight * .8, 0]);

        svg.append('g') // Append a g element for the scale
            .attr('class', 'yHist_axis') // Use a class to css style the axes together
            .attr('transform', 'translate(50, 180)') // Position the axis
            .call(d3.axisLeft(yHistScale)); // Call the axis function

        graphPlace = hist.append('g')
            .attr('class', 'graphPlace')
            .attr("transform", function(d) { return "translate(" + "0" + ",0)"; });
        legendPlace = hist.append('g')
            .attr('class', 'graphPlace')
            .attr("transform", function(d) { return "translate(" + "0" + ",0)"; });


        hist.append('text')
            .attr('class', 'hist_y_axis_label')
            .attr('transform', function(d) {return "translate("+[-30,450]+") " + "rotate(270)"})
            .text('Number of Colleges')
            .style('font-size', '15px')
            .attr("font-family", "Trebuchet MS");

        //TODO: need to reformat this 
        hist.append('text')
            .attr('class', 'hist_title')
            .attr('transform', function(d) {return "translate("+[25,50]+") "})
            .text('Distribution of Admission Rates')
            .style('font-size', '15pt')
            .attr("font-family", "Trebuchet MS");

        hist.append('text')
            .attr('class', 'legend_title')
            .attr('transform', function(d) { return "translate(" + [100, 130] + ") " })
            .text('Median Earnings (USD)')
            .style('font-size', '15px')
            .attr("font-family", "Trebuchet MS");
``
        hist.append('text')
            .attr('class', 'hist_x_axis_label')
            .attr('transform', function(d) {return "translate("+[200,650]+") " })
            .text('Average Cost ($)')
            .style('font-size', '15px')
            .attr("font-family", "Trebuchet MS");
        
        
        var sortedData = dataset.sort(function(a, b) {
            return b.salary - a.salary;
        })
        stats = dataset;

        var legend = legendPlace.selectAll(".legend")
            .data(valueColors.slice().reverse()).enter()
            .append("rect")
            .attr("fill", function (color){ return color; })
            .attr("x", 650)
            .attr("y", function(c, i) {return (i * 20) ; })
            .attr("width", 17)
            .attr("height", 17)
            .attr("class", function(d) {
                //testing this
                legendClassArray.push(d.replace(/\s/g, ''));
                return "legend";
            })
            .attr("transform", 'translate(' + [-550, 150] + ')')
            .on("mouseover", function() {
                //makes cursor change
                if (active_link === "0") d3.select(this).style("cursor", "pointer");
                else {
                    if (active_link === d3.select(this).attr("fill")) {
                        d3.select(this).style("cursor", "pointer");
                    } else d3.select(this).style("cursor", "auto");
                }
            })
            .on("click",function(d){        
                if (active_link === "0") { //nothing selected, turn on this selection
                  d3.select(this)           
                    .style("stroke", "black")
                    .style("stroke-width", 2);
        
                    active_link = d3.select(this).attr("fill")
                    plotSingle(this);
        
                    //gray out the others
                    for (i = 0; i < legendClassArray.length; i++) {
                      if (legendClassArray[i] != active_link) {
                        legendPlace.selectAll("[fill= '" + legendClassArray[i] + "']")
                          .style("opacity", 0.5);
                      }
                    }
                    
                   
                } else { //deactivate
                    console.log(active_link);
                    console.log(this);
                  if (active_link === d3.select(this).attr("fill")) {//active square selected; turn it OFF
                    d3.select(this)           
                      .style("stroke", "none");
        
                    active_link = "0"; //reset
        
                    //restore remaining boxes to normal opacity
                    for (i = 0; i < legendClassArray.length; i++) {              
                        legendPlace.selectAll("[fill= '" + legendClassArray[i] + "']")
                          .style("opacity", 1);
                    }
        
                    //restore plot to original
                    restorePlot(d);
        
                  }
        
                } //end active_link check
            });

        hist.selectAll(".legend_label")
            .data(legendHist).enter()
            .append("text")
            .attr('class', 'legend_label')
            .attr('transform', 'translate(' + [-350, 163] + ')')
            .text(function(d) { return d })
            .attr('x', 475)
            .attr('y', function(c, i) {return i * 20})
            .style('font-size', '12px')
            .attr("font-family", "Trebuchet MS");
        //console.log("regionsArr: ", regionsArr)
        updateChart();

        var minACT; 
        var maxACT;
        var minSAT;
        var maxACT;

        d3.select("#minACT")
            .append('input')
            .attr('type', 'number')
            .attr('class', 'inputFields')
            .on('input', function() {
                minACT = this.value;
            })
        d3.select("#maxACT")
            .append('input')
            .attr('type', 'number')
            .attr('class', "inputFields")
            .on('input', function() {
                maxACT = this.value; 
            })
        d3.select("#filterACT").on("click", function(d) {

            d3.selectAll(".inputFields").property("disabled", true); 
            d3.selectAll(".filterButton")
                .property("disabled", true)
                .attr('class', 'btn btn-outline-secondary btn-sm filterButton'); 


            hist.selectAll('.rect')
                .filter(function (d) {
                    // if (!(d.ACT >= maxACT || d.ACT <= minACT)) {
                    //     //if in filter list than it was greyed by SAT already and should remain there even if it satisfies the ACT req 
                    //     // if (filterList.includes(d)) {
                    //     //     return false
                    //     // } 
                    // }
                    return !(d.ACT > maxACT || d.ACT < minACT)
                })
                .style("fill", function (d) {
                    return colorScale(d.salary);
                });


            console.log(filterList)
            //now greying out those that are not in range 
            var testing = hist.selectAll('.rect')
                .filter(function(d) {
                    if(d.ACT > maxACT || d.ACT < minACT) { 
                        // if its not in filtered list add it 
                        if (!filterList.includes(d)) {
                            filterList.push(d)
                        } 
                    };
                    return d.ACT > maxACT || d.ACT < minACT 
            })
            .style("fill", "#c6c6c6");

            console.log(filterList)

            //first recolor those that are in range on ACT for sure and maybe SAT 
           
        });
        d3.select("#minSAT")
            .append('input')
            .attr('type', 'number')
            .attr('class', "inputFields")
            .on('input', function() {
                minSAT = this.value;
            })
        d3.select("#maxSAT")
            .append('input')
            .attr('type', 'number')
            .attr('class',"inputFields")
            .on('input', function() {
                maxSAT = this.value; 
            })
        d3.select("#filterSAT").on("click", function(d) {

            d3.selectAll(".inputFields").property("disabled", true); 
            d3.selectAll(".filterButton").property("disabled", true)
                .attr('class', 'btn btn-outline-secondary btn-sm filterButton'); 

            hist.selectAll('.rect')
                .filter(function (d) {
                    // if (!(d.SAT >= maxSAT || d.SAT <= minSAT)) {
                    //     if (filterList.includes(d)) { 
                    //         return false 
                    //     }
                    // }
                    return !(d.SAT > maxSAT || d.SAT < minSAT)
                })
                .style("fill", function (d) {
                    return colorScale(d.salary);
                }); 
            
            var testing = hist.selectAll('.rect')
                .filter(function(d) {
                    if(d.SAT > maxSAT || d.SAT < minSAT) {
                        if (!filterList.includes(d)) {
                            filterList.push(d)
                        }
                    }
                    return d.SAT > maxSAT || d.SAT < minSAT;
            })
            .style("fill", "#c6c6c6");
            console.log(filterList); 
        });
        reset = d3.select("#reset").on("click", function() {
            d3.selectAll(".inputFields").property("disabled", false); 
            d3.selectAll(".filterButton")
                .property("disabled", false) 
                .attr('class', 'btn btn-outline-primary btn-sm filterButton'); 


            filterList = []; 
            console.log(filterList)
            hist.selectAll('.rect')
                .style("fill", function(d) {
                    return colorScale(d.salary);
                });
        });

    });

//function updateChart(SATRange, ACTRange, regions, sizeRange, costRange) {
var bins;
var dotsEnter;
var dotBins;
var dotBinsEnter;
var arrayofrects = [];
var counting = 0; 
var dots; 
function updateChart() {

    var filteredStats = stats.filter(function(d) {return true;});

    bins = d3.histogram()
        .domain(xHistScale.domain())
        .thresholds(xHistScale.ticks(100)) //50 or 100?
        .value(function(d) { return d.cost; })
        (filteredStats);

    dotBins = graphPlace.selectAll('.gBin')
        .data( function() {
            return bins; })
        // .append("g")
        // .attr("class", "g")
        // .attr("transform", function(d) { return "translate(" + "0" + ",0)"; });
        
    dotBinsEnter = dotBins.enter()
        .append("g")
        .merge(dotBins)
        .attr("class", "gBin")
        .attr("transform", function(d){ 
            binContainer.push(d);
            return 'translate(' + [xHistScale(d.x0), padding.b] + ')'; })
        .attr("bin", function(d, i) {
            return i;
        });

    dots = dotBinsEnter.selectAll(".dot")
        .data((d, a) => d.map((p, i) => {
            return {idx: i,
                    cost: p['cost'],
                    admission: p['admission'],
                    name: p['name'],
                    SAT: p['SAT'],
                    ACT: p['ACT'],
                    region: p['region'],
                    locale: p['locale'],
                    control: p['control'],
                    salary: p['salary'],
                    debt: p['debt'],
                    color: colorScale(p['salary']),
                    bin: a
                };
        }))

    dotsEnter = dots.enter()
        .append("rect")
        .attr("class", "rect")
        .attr("x", function(d, i) {
            //console.log("indotsenter");
            //console.log(i, d);
        })
        .attr("y", function(d, i) {
                arrayofrects[counting] = d.name;
                counting++;
                return yHistScale(i) + 70
        })
        .attr("ogY", function(d, i) {
            return yHistScale(i) + 70
        })
        .attr("width", 10)
        .attr("height", 10)
        .attr("opacity", 1)
        .attr("color", function(d) {return colorScale(d['salary']); })
        .style("stroke", "white")
        .style("fill", function(d) {return colorScale(d['salary']); })
        .attr("name", function(d) { return d['name']})
        .on("mouseover", function(d) {
            //color(this);
            if (d3.select(this).attr("opacity") == 1) {
                tip.show(d);
            }
            d3.select(this).style("fill", "#90EE90"); //change this color eventually ?? light green atm 

        })					
        .on("mouseout", function(d) {
            tip.hide(d);
            d3.select(this).style("fill", function (d) { 
                console.log(d)
                var greyOut = false; 
                filterList.forEach(element => {
                    if (element['name'] == d["name"]) {
                        greyOut = true; 
                    } 
                }); 
                if (greyOut) { 
                    return "#c6c6c6"; 
                }
                return colorScale(d['salary']); 

            });
            //uncolor(this) here? i think we should re color all during mouse over;
        })
        .on("click", function(d) {
            d3.select(this).style("fill", "#90EE90");
            
            d3.select("#sName").text(d['name']); 
            d3.select("#sDebt").text(d['debt']);
            d3.select("#sRegion").text(d['region']); 
            d3.select("#sLocale").text(d['locale']);
            d3.select("#sControl").text(d['control']);

            d3.select("#sCost").text(d['cost']); 
            d3.select("#sAdmission").text(d['admission']);
            d3.select("#sACT").text(d['ACT']);
            d3.select("#sSAT").text(d['SAT']);

            // d3.select(".infobox").style('visibility', 'visible');

            // d3.select("#sPopulation").text(d['cost']); //not working atm 
            // d3.select("#sPercent_white").text(d['percent_white']);
            // d3.select("#sPercent_black").text(d['percent_black']);
            // d3.select("#sPercent_hispanic").text(d['percent_hispanic']);
            // d3.select("#sPercent_asian").text(d['percent_asian']);
            // d3.select("#sPercent_amer_indian").text(d['percent_amer_indian']);
            // d3.select("#sPercent_pacific_islander").text(d['percent_pacific_islander']);
            // d3.select("#sPercent_biracial").text(d['percent_biracial']);
            // d3.select("#sPercent_aliens").text(d['percent_aliens']);

        });
}



colorRects = [];
var squares; 
var color_keep;

function plotSingle(d) {
    color_keep = d3.select(d).attr("fill");
   
    //erase all but selected bars by setting opacity to 0
    for (i = 0; i < legendClassArray.length; i++) {
      if (legendClassArray[i] != color_keep) {
          //d3.select("[id='" + i + "']")
          //hist.selectAll(".rect" + legendClassArray[i])
          hist.selectAll("[color= '" + legendClassArray[i] + "']")
          .transition()
          .duration(1000)
          .attr("opacity", 0)        
          .style("opacity", 0);
      }
    }
    var currBin = -1;
    var currMinHeight = 0;
    
    squares = hist.selectAll("[color= '" + color_keep + "']")
        .each(function(d) {
            orig_y = parseInt(d3.select(this).attr("y"));
            if(d["bin"] > currBin) {
                currBin = d["bin"];
                currMinHeight = 550 - orig_y;
            } 

            d3.select(this)
            .transition()
            .duration(2000)
            .delay(500)
            .attr("y", (currMinHeight + orig_y).toString());
        })
} 

function restorePlot(d) {

    hist.selectAll("[color= '" + color_keep + "']")
        .each(function(d) {
            var ogY = d3.select(this).attr("ogY");
            d3.select(this)
            .transition()
            .duration(2000)
            .delay(750)
            .attr("y", ogY);
    })
    //restore opacity of erased bars
    for (i = 0; i < legendClassArray.length; i++) {
        if (legendClassArray[i] != color_keep) {
            //d3.select("[id='" + i + "']")
            //hist.selectAll(".rect" + legendClassArray[i])
            hist.selectAll("[color= '" + legendClassArray[i] + "']")
            .transition()
            .duration(500)
            .delay(1500)
            .attr("opacity", 1)        
            .style("opacity", 1);
        }
    }
  }