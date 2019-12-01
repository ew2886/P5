var width =500;
var height= 500;

var data_set =[];
var hello = [];
var control = [];
var locale = [];
var white = [];
var black = [];
var hispanic = [];
var asian = [];
var americanIndian = [];
var pacfic = [];
var biracial = [];
var cost = [];
var earnings = [];
var debt = [];
var pop = [];
var colors = ["gray", '#996600', '#660066', "#003300", '#003366', '#C8C8C8', '#000000', '#680000']

var svg = d3.select('#svg1');
 var slider = document.getElementById('svg1');

var svgWidth = 3000;
var svgHeight = 700;

var padding = {t: 50, r: 50, b: 50, l: 50};

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var xHistScale;

//wtf are these lines doing theyre not reverseing anything
var valueColors = ['#fed825', '#ffa15a', '#ff6496', '#fe2bcc'];
var reversedColors = valueColors.slice().reverse();

var colorScale = d3.scaleQuantize()
      .domain([5000, 65000])
      .range(valueColors);

var hist = svg.append('g')
            .attr('class', 'histogram')
            .attr("transform", function(d){ return 'translate(' + [padding.t, padding.l] + ')'; });

            //TODO: probably change fonts too
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
    .attr('transform', function(d) {return "translate("+[250,130]+") "})
    .text('Median Earnings (USD)')
    .style('font-size', '15px')
    .attr("font-family", "Trebuchet MS");

// var plot = svg.append('g')
//     .attr('class', 'plot')
//     .attr("transform", function(d) {return 'translate(' + [100, 100]+')'; });

var yHistScale = d3.scaleLinear()
    .domain([0, 60])
    .range([chartHeight * .8, 0]);

//TODO: need to rethink stuff with leged 
var legendHist = ['50k+', '35k-50k', '$20k-35k', '$20k+'];
// var legendTitle = ['Median Earnings 8 years After Entry'];

hist.selectAll(".legend")
    .data(reversedColors).enter()
    .append("rect")
    .attr("fill", function (color){ return color; })
    .attr("x", 650)
    .attr("y", function(c, i) {return (i * 20) ; })
    .attr("width", 17)
    .attr("height", 17)
    .attr("transform", 'translate(' +[-400, 150]+')');

hist.selectAll(".legend_label")
    .data(legendHist).enter()
    .append("text")
    .attr('class', 'legend_label')
    .attr('transform', 'translate('+[-200,163]+')')
    .text(function(d) {return d})
    .attr('x', 475)
    .attr('y', function(c, i) {return i * 20})
    .style('font-size', '12px')
    .attr("font-family", "Trebuchet MS");

svg.append('g') // Append a g element for the scale
    .attr('class', 'yHist_axis') // Use a class to css style the axes together
    .attr('transform', 'translate(50, 180)') // Position the axis
    .call(d3.axisLeft(yHistScale)); // Call the axis function

d3.csv('./colleges.csv',
    function(d){
        // This callback formats each row of the data
        //console.log("I'm in the first csv function");
        return {
            name: d.Name,
            admission: +d['Admission Rate'],
            ACT: +d['ACT Median'],
            SAT: +d['SAT Average'],
            region: d.Region,
            locale: d.Locale,
            control: d.Control,
            cost: +d['Average Cost'],
            salary: +d['Median Earnings 8 years After Entry'],
            debt: +d['Median Debt on Graduation']
        }
    },

    function(error, dataset){
        //console.log("I'm in the second csv function");
        if(error) {
            return;
        }

        xHistScale = d3.scaleLinear()
            .range([0, chartWidth * .4])
            .domain([0, d3.max(dataset, function(d) {
                return d.cost;
            })]);
        svg.append('g') // Append a g element for the scale
            .attr('class', 'xHist_axis') // Use a class to css style the axes together
            .attr('transform', 'translate(50, 660)') // Position the axis
            .call(d3.axisBottom(xHistScale)); // Call the axis function

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
        //console.log(stats[0]);

        //TODO: not sure if we need these max and min salaries 
        var maxSalary = d3.max(dataset, function(d){
            return d.salary;
        });

        var minSalary = d3.min(dataset, function(d){
            return d.salary;
        });


        //TODO: 
        //this isn't being used rn maybe we can use for some filtering
        var regions = d3.nest()
            .key(function(d) { return d.region; })
            .entries(dataset);
        var regionsArr = [];
        regions.forEach(function(e) {
          var tempObj = {}
          tempObj.label = e.key;
          tempObj.selected = true;
          regionsArr.push(tempObj);
        });

        //console.log("regionsArr: ", regionsArr)


        updateChart();

    });


//function updateChart(SATRange, ACTRange, regions, sizeRange, costRange) {
var dotsEnter;
var dotBins;
var arrayofrects = [];
var counting = 0; 
var dots; 
function updateChart() {
    //console.log("I'm in updateChart");

    var costRange;
    var ACTRange;
    var SATRange;
    var regionsVal = [];
    var localeVal = [];
    var controls = [];

    var filteredStats = stats.filter(function(d) {
        return true;
      });

    var bins = d3.histogram()
        .domain(xHistScale.domain())
        .thresholds(xHistScale.ticks(50))
        .value(function(d) { return d.cost; })
        (filteredStats);

    dotBins = hist.selectAll('.gBin')
        .data( function() {
            return bins; });
        
    

    var dotBinsEnter = dotBins.enter()
        .append("g")
        .merge(dotBins).attr("class", "gBin");


    dotBinsEnter.attr("class", "gBin")
        .attr("transform", function(d){ return 'translate(' + [xHistScale(d.x0), padding.b] + ')'; });

    dots = dotBinsEnter.selectAll(".dot")
        .data(d => d.map((p, i) => {
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
                    debt: p['debt']};
        }))

    dotsEnter = dots.enter()
        .append("rect");
    
    dotsEnter.attr("x", 0)
        .attr("y", function(d, i) {
                //console.log(d.name);
                arrayofrects[counting] = d.name;
                counting++;
                //so rn the top square is abnormally larger
                //than the rest of the ones in the histogram? 
                //it becomes the same size if you do i * 1.2
                //but then it extends past the y axis
                return yHistScale(i) + 70
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("stroke", "white")
        .style("fill", function(d) {return colorScale(d['salary']); })
        .attr("name", function(d) { return d['name']})
        .on('mouseover', function(d) {
          //toolTip.show(d);
          color(this);
        })
        .on('mouseout', function(d) {
          //toolTip.hide(d);
          uncolor(this);
        });
    
        //console.log(dots)
    //dots.exit().remove();
    //dotBins.exit().remove();

    // var circles = plot.selectAll('.plotEntry')
    //   .data(filteredStats, function(d) {
    //     return { name:d['name'],
    //              debt:d.debt,
    //              salary: d.salary
    //            };
    //   });
}

function color(d) {
  svg.selectAll(".plotEntry")
    .filter(function(e) {
      return d.getAttribute('name') == e.name;
    })
  .transition()
  .attr('r', '6')
  .style("fill", '#ff0011')
  .style("opacity", 1);
}

function uncolor(d) {
  svg.selectAll('.plotEntry')
    .transition()
    .attr('r', '4')
    .style("fill", '#ffffff')
    .style("opacity", 0.3);
}

//not sure if these two functions here are necessary

d3.queue()
.defer(d3.csv, 'colleges.csv', function(row) {
    
    //console.log("I'm in the queue and defer function");
    return {
        name: row['Name'],
        control: row['Control'],
        region: row['Region'],
        locale: row['Locale'],
        admission_rate: +row['Admission Rate'],
        act_median: +row['ACT Median'],
        sat_average: +row['SAT Average'],
        undergrad_pop: +row['Undergrad Population'],
        percent_white: +row['% White'],
        percent_black: +row['% Black'],
        percent_hispanic: +row['% Hispanic'],
        percent_asian: +row['% Asian'],
        percent_amer_indian: +row['% American Indian'],
        percent_pacific_islander: +row['% Pacific Islander'],
        percent_biracial: +row['% Biracial'],
        percent_aliens: +row['% Nonresident Aliens'],
        percent_part_time_students: +row['% Part-time Undergrads'],
        average_cost: +row['Average Cost'],
        expenditure_per_student: +row['Expenditure Per Student'],
        average_faculty_salary: +row['Average Faculty Salary'],
        percent_full_time_faculty: +row['% Full-time Faculty'],
        percent_students_with_pell: +row['% Undergrads with Pell Grant'],
        completion_rate: +row['Completion Rate 150% time'],
        retention_rate: +row['Retention Rate (First Time Students)'],
        percent_older_students: +row['% Undergrads 25+ y.o.'],
        three_year_default_rate: +row['3 Year Default Rate'],
        median_debt: +row['Median Debt'],
        median_debt_on_graduation: +row['Median Debt on Graduation'],
        median_debt_on_withdrawal: +row['Median Debt on Withdrawal'],
        percent_federal_loans: +row['% Federal Loans'],
        percent_pell_recipients: +row['% Pell Grant Recipients'],
        average_entry_age: +row['Average Age of Entry'],
        average_family_income: +row['Average Family Income'],
        median_family_income: +row['Median Family Income'],
        poverty_rate: +row['Poverty Rate'],
        unemployed_after_eight: +row['Number of Unemployed 8 years after entry'],
        employed_after_eight: +row['Number of Employed 8 years after entry'],
        mean_earnings_after_eight: +row['Mean Earnings 8 years After Entry'],
        median_earnings_after_eight: +row['Median Earnings 8 years After Entry']
    }
}).await(dotheGoodStuff);

function dotheGoodStuff(error, dataset) {
    //console.log("I'm in the doGoodStuff function");
    if(error) {
        console.log("error");
        return;
    }
    data_set = dataset;
    //doStuff();
    for (var i = 0; i < dataset.length; i++) {
        hello[i] = dataset[i].name;
        control[i] = dataset[i].control;
        locale[i] = dataset[i].locale;
        cost[i] = dataset[i].average_cost;
        earnings[i] = dataset[i].median_earnings_after_eight;
        debt[i] = dataset[i].median_debt;
        pop[i] = dataset[i].undergrad_pop;
    }
    //populate();
} 