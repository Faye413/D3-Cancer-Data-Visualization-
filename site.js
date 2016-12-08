/* START general code:
 The code in this general code section should lie outside of the function code
 because it pertains to setting up the default layout of the page.
 */
var padding = 45;
var width = 500;
var height = 300;
var bar_width = 300;
var pie_width = 250;
var pie_height = 250;
var legend_height = 270;


var cancerSites;
var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// Scale for map colors
var mapColor = d3.scaleLinear()
    .domain([500, 800])
    .range(['#ffffff','#696969']);

var selectedState = 'Georgia';


/////////////////////////////////////////////////
// Mapping from cancer name to hex color value //
/////////////////////////////////////////////////
var cancerColorKey = {};
cancerColorKey["Brain and Other Nervous System"] = "#669FCC";
cancerColorKey["Breast"] = "#9AFFF6";
cancerColorKey["Cervix Uteri"] = "#1F6399";
cancerColorKey["Colon and Rectum"] = "#7F4240";
cancerColorKey["Corpus Uteri"] = "#FF847F";

cancerColorKey["Esophagus"] = "#FFB5B3";
cancerColorKey["Gallbladder"] = "#9AD2FF";
cancerColorKey["Kidney and Renal Pelvis"] = "#C9CC66";
cancerColorKey["Larynx"] = "#B0B263";

cancerColorKey["Leukemias"] = "#7F3074";
cancerColorKey["Liver"] = "#E1FFB3";
cancerColorKey["Lung and Bronchus"] = "#7F567A";
cancerColorKey["Melanoma of the Skin"]  = "#6379B2";

cancerColorKey["Myeloma"] = "#69991F";
cancerColorKey["Non-Hodgkin Lymphoma"] = "#FFF69A";
cancerColorKey["Oral Cavity and Pharynx"] = "#D9DAFF";
cancerColorKey["Ovary"] = "#D891E8";

cancerColorKey["Pancreas"] = "#B29262";
cancerColorKey["Prostate"] = "#849963";
cancerColorKey["Stomach"] = "#7E80FF";
cancerColorKey["Thyroid"] = "#8398CC";

cancerColorKey["Urinary Bladder invasive and in situ"] = "#FFDED7"
cancerColorKey["Urinary Bladder"] = "#FFDED7"

// initial variables for the line graph
var lineGraph = d3.select(".lineGraph");
var lineX = d3.scaleLinear().range([padding, width - padding]);
var lineY = d3.scaleLinear().range([(height - padding), padding - 20]);


// pie chart selector
var pieChart = d3.select(".pieChart");

//////////////////////
// age graph module //
//////////////////////

var ageGraph = d3.select(".ageGroupGraph");
var ageX = d3.scaleBand().range([padding - 5, bar_width - padding]);
var ageY = d3.scaleLinear().range([(height - padding), padding - 5]);
ageX.domain(["Data"]);
ageY.domain([0, 1000]);
var ageXAxis = d3.axisBottom(ageX);
var ageYAxis = d3.axisLeft(ageY);
ageYAxis.tickValues([0, 1000]);
ageGraph.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + (height - padding + 10) + ")")
    .call(ageXAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-90)");

ageGraph.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (padding - 5) + ", 0)")
    .call(ageYAxis);

///////////////////////
// race graph module //
///////////////////////
var raceGraph = d3.select(".raceGraph");
var raceX = d3.scaleBand().range([padding - 5, bar_width - padding]);
var raceY = d3.scaleLinear().range([(height - padding), padding - 5]);
raceX.domain(["Data"]);
raceY.domain([0, 1000]);
var raceXAxis = d3.axisBottom(raceX);
var raceYAxis = d3.axisLeft(raceY);
raceYAxis.tickValues([0, 1000]);
raceGraph.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + (height - padding + 10) + ")")
    .call(raceXAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-90)");
raceGraph.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (padding - 5) + ", 0)")
    .call(raceYAxis);

//////////////////////
// Sex graph module //
//////////////////////
var sexGraph = d3.select(".sexGraph");
var sexX = d3.scaleBand().range([padding - 5, bar_width - padding]);
var sexY = d3.scaleLinear().range([(height - padding), padding - 5]);
sexX.domain(["Data"]);
sexY.domain([0, 1000]);
var sexXAxis = d3.axisBottom(sexX);
var sexYAxis = d3.axisLeft(sexY);
sexYAxis.tickValues([0, 1000]);
sexGraph.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + (height - padding + 10) + ")")
    .call(sexXAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-90)");
sexGraph.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (padding - 5) + ", 0)")
    .call(sexYAxis);


// Code to process state incidences for map shading
var state_incidents = [];
d3.csv('Data/State/state_incidents.csv', function(d) {
    state_incidents = d.map(function(a) {
        a.value = +a.value;
        a.year = +a.year;
        return a;

    });
})

///////////////////
// Slider Module //
///////////////////
var slider = $('.timeRangeSlider').limitslider({
    values:     [1999, 2013],
    min:1999,
    max:2013,
    left: 1999,
    right: 2013,
    gap : 1,
    slide: function(event, ui) {

        var years = get_slider_years();
        update_charts(years[0], years[1], selectedState);
        update_map(years[0], years[1]);
        $('#sliderYearsText').text(years[0] + ' to ' + years[1]);
        //get_top_cancer_incidents();
    }
});






// function to update the pie and line chart module
// called when a new state is selected of the sliders change
function update_charts(startYear, endYear, placeName) {


    // change stroke for selected state
    d3.selectAll('.state').attr('stroke', 'none');
    d3.selectAll('.state-' + createClassName(placeName)).attr('stroke', '#545454')
        .attr('stroke-width', 3);


    $('.pieChart').empty();
    $('.lineGraph').empty();


    var dataType = "Incidences";
    var columnName = (dataType == "Incidences") ? "Count" : "Deaths";
    var placeType = "State";


    var heading = d3.select(".title");
    var directoryPath = "Data/" + placeType + "/";
    var fileName = placeType + dataType + ".tsv";
    var fullPath = directoryPath + fileName;
    heading.html((startYear + "-" + endYear + " Cancer " + "Incidents" + " for " + placeName));


    cancerSites = null;
    // load data for visualizations
    d3.tsv(fullPath, function (data) {
        // format data to be used by visualization
        var placeData = data.filter(function (d) {
            var startCondition = (+d["Year"]) >= startYear;
            var endCondition = (+d["Year"]) <= endYear;
            if (d[placeType] == null || d[placeType] == "") {
                return false;
            } else {
                return startCondition && endCondition && d[placeType].trim() == placeName;
            }
        });
        cancerSites = Array.from(new Set(placeData.map(function (d) {
            return d["Leading Cancer Sites"];
        })));
        var separatedData = [];
        var totalData = [];

        cancerSites.forEach(function (value) {
            var cancerData = placeData.filter(function (d) {
                return d["Leading Cancer Sites"] == value;
            });

            separatedData.push({
                "cancer": value,
                "values": cancerData
            });
        });

        separatedData.forEach(function (cancer) {
            var totalCount = 0;
            cancer.values.forEach(function (d) {
                totalCount += (+d[columnName]);
            });
            totalData.push({
                "cancer": cancer.cancer,
                "total": totalCount
            })
        });
        // find min and max years to use in charts
        var minYear = d3.min(placeData, function (d) {
            return +d["Year"];
        });

        var maxYear = d3.max(placeData, function (d) {
            return +d["Year"];
        })

        lineX.domain([minYear, maxYear])

        lineY.domain([0, d3.max(placeData, function (d) {
            return +d[columnName];
        })]);

        var dot = lineGraph.selectAll("dot")
            .data(placeData)
            .enter();

        dot.append("circle")
            .attr('class', function (d) {
                return 'dot-' + createClassName(d['Leading Cancer Sites'])
            })
            .attr("cx", function (d) {

                return lineX(+d["Year"]);
            })
            .attr("cy", function (d) {
                return lineY(+d[columnName]);
            })
            .attr("r", 4)
            .attr("fill", function (d) {
                return cancerColorKey[d["Leading Cancer Sites"].trim()];

            })
            // add behavior for tooltip
            .on("mouseover", function (d) {

                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("r", 12);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html("<strong>" + d["Leading Cancer Sites"] + "</strong><br/>Number of " + "incidents" + " in "
                        + d["Year"] + ": " + d[columnName])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {

                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("r", 4);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            // click functionality for drilling down to demographic charts
            .on("click", function (d) {
                window.scrollTo(0,document.body.scrollHeight);

                var ageFile = directoryPath + ("AgeGroup" + dataType + ".tsv");
                var raceFile = directoryPath + ("Race" + dataType + ".tsv");
                var sexFile = directoryPath + ("Sex" + dataType + ".tsv");

                var subHeading = d3.select(".specificTitle");
                subHeading.html(d["Leading Cancer Sites"] + " " + 'Incidents' + " for " + placeName + " in " + d["Year"]);

                if (dataType == "Incidences" && placeType == "State") {
                    placeType = "States";
                }
                // load age data
                d3.tsv(ageFile, function (ageData) {

                    var relevantData = ageData.filter(function (datum) {
                        var condition1 = datum["Year"] == d["Year"];
                        var condition2 = d["Leading Cancer Sites"] == datum["Leading Cancer Sites"];

                        if (datum[placeType] == null || datum[placeType] == "") {
                            return false;
                        } else {
                            return condition1 && condition2 && datum[placeType].trim() == placeName;
                        }
                    });

                    var ageColumn = (dataType == "Incidences") ? "Age Groups" : "Age Group";

                    if (relevantData.length != 0) {
                        var ageDomain = relevantData.map(function (row) {
                            return row[ageColumn];
                        })
                        ageX.domain(ageDomain);
                        ageY.domain([0, d3.max(relevantData, function (row) {
                            return +row[columnName];
                        })]);

                        ageGraph.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(ageXAxis)
                            .selectAll("text")
                            .style("text-anchor", "end")
                            .attr("dx", "-.8em")
                            .attr("dy", ".15em")
                            .attr("transform", "rotate(-90)");

                        ageYAxis.tickValues([0, d3.max(relevantData, function (row) {
                            return +row[columnName];
                        })]);

                        ageGraph.select(".y.axis")
                            .transition()
                            .duration(1000)
                            .call(ageYAxis);
                    } else {
                        ageX.domain(["Data Unavailable"]);
                        ageY.domain([0, 1000]);

                        ageGraph.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(ageXAxis);

                        ageYAxis.tickValues([0, 1000]);

                        ageGraph.select(".y.axis")
                            .transition()
                            .duration(1000)
                            .call(ageYAxis);
                    }

                    var bars = ageGraph.selectAll(".bar")
                        .data(relevantData);

                    bars.enter().append("rect")
                        .attr("class", "bar")
                        .attr("fill", function (row) {
                            return cancerColorKey[row["Leading Cancer Sites"]];
                        })
                        .attr("stroke", "black")
                        .attr("x", function (row) {
                            return ageX(row[ageColumn]);
                        })
                        .attr("width", ageX.bandwidth())
                        .attr("y", function (row) {
                            return ageY(+row[columnName]);
                        })
                        .attr("height", function (row) {
                            return (height - padding - ageY(+row[columnName]));
                        })
                        .on("mouseover", function (row) {
                            d3.select(this)
                                .attr("fill", "lightgrey");
                            tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);

                            tooltip.html("<strong>Incidents for age group " + row[ageColumn] + ":</strong><br/>" + row[columnName])
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY) + "px");
                        }).on("mouseout", function (row) {
                        d3.select(this)
                            .attr("fill", cancerColorKey[row["Leading Cancer Sites"]]);
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

                    bars.transition()
                        .duration(1000)
                        .attr("fill", function (row) {
                            return cancerColorKey[row["Leading Cancer Sites"]];
                        })
                        .attr("stroke", "black")
                        .attr("x", function (row) {
                            return ageX(row[ageColumn]);
                        })
                        .attr("width", ageX.bandwidth())
                        .attr("y", function (row) {
                            return ageY(+row[columnName]);
                        })
                        .attr("height", function (row) {
                            return (height - padding - ageY(+row[columnName]));
                        })


                    bars.exit()
                        .transition()
                        .duration(1000)
                        .attr("y", ageY(0))
                        .attr("height", (height - padding - ageY(0)))
                        .style('fill-opacity', 1e-6)
                        .remove();

                });

                // load race demographic data
                d3.tsv(raceFile, function (raceData) {
                    var relevantData = raceData.filter(function (datum) {
                        var condition1 = datum["Year"] == d["Year"];
                        var condition2 = d["Leading Cancer Sites"] == datum["Leading Cancer Sites"];
                        if (datum[placeType] == null || datum[placeType] == "") {
                            return false;
                        } else {
                            return condition1 && condition2 && datum[placeType].trim() == placeName;
                        }
                    });

                    if (relevantData.length != 0) {
                        var raceDomain = relevantData.map(function (row) {
                            return convertRaceName(row["Race"]);
                        });


                        raceX.domain(raceDomain);
                        raceY.domain([0, d3.max(relevantData, function (row) {
                            return +row[columnName];
                        })]);


                        raceGraph.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(raceXAxis)
                            .selectAll("text")
                            .style("text-anchor", "end")
                            .attr("dx", "-.8em")
                            .attr("dy", ".15em")
                            .attr("transform", "rotate(-90)");
                        /*.selectAll(".tick text")
                         .call(wrap, raceX.bandwidth());*/

                        raceYAxis.tickValues([0, d3.max(relevantData, function (row) {
                            return +row[columnName];
                        })]);

                        raceGraph.select(".y.axis")
                            .transition()
                            .duration(1000)
                            .call(raceYAxis);
                    } else {
                        raceX.domain(["Data Unavailable"]);
                        raceY.domain([0, 1000]);

                        raceGraph.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(raceXAxis);

                        raceYAxis.tickValues([0, 1000]);

                        raceGraph.select(".y.axis")
                            .transition()
                            .duration(1000)
                            .call(raceYAxis);
                    }

                    var bars = raceGraph.selectAll(".bar")
                        .data(relevantData);

                    bars.enter().append("rect")
                        .attr("class", "bar")
                        .attr("fill", function (row) {
                            return cancerColorKey[row["Leading Cancer Sites"]];
                        })
                        .attr("stroke", "black")
                        .attr("x", function (row) {
                            return raceX(convertRaceName(row["Race"]));
                        })
                        .attr("width", raceX.bandwidth())
                        .attr("y", function (row) {
                            return raceY(+row[columnName]);
                        })
                        .attr("height", function (row) {
                            return (height - padding - raceY(+row[columnName]));
                        })
                        .on("mouseover", function (row) {
                            d3.select(this)
                                .attr("fill", "lightgrey");
                            tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);

                            tooltip.html("<strong>Incidents for " + row["Race"] + "s:</strong><br/>" + row[columnName])
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY) + "px");
                        }).on("mouseout", function (row) {

                        d3.select(this)
                            .attr("fill", cancerColorKey[row["Leading Cancer Sites"]]);
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

                    bars.transition()
                        .duration(1000)
                        .attr("fill", function (row) {
                            return cancerColorKey[row["Leading Cancer Sites"]];
                        })
                        .attr("stroke", "black")
                        .attr("x", function (row) {
                            return raceX(convertRaceName(row["Race"]));
                        })
                        .attr("width", raceX.bandwidth())
                        .attr("y", function (row) {
                            return raceY(+row[columnName]);
                        })
                        .attr("height", function (row) {
                            return (height - padding - raceY(+row[columnName]));
                        });

                    bars.exit()
                        .transition()
                        .duration(1000)
                        .attr("y", raceY(0))
                        .attr("height", (height - padding - raceY(0)))
                        .style('fill-opacity', 1e-6)
                        .remove();

                });

                // load sex demographic information
                d3.tsv(sexFile, function (sexData) {

                    var relevantData = sexData.filter(function (datum) {
                        var condition1 = datum["Year"] == d["Year"];
                        var condition2 = d["Leading Cancer Sites"] == datum["Leading Cancer Sites"];
                        if (datum[placeType] == null || datum[placeType] == "") {
                            return false;
                        } else {
                            return condition1 && condition2 && datum[placeType].trim() == placeName;
                        }
                    });

                    if (relevantData.length != 0) {
                        var sexDomain = relevantData.map(function (row) {
                            return row["Sex"];
                        });


                        sexX.domain(sexDomain);
                        sexY.domain([0, d3.max(relevantData, function (row) {
                            return +row[columnName];
                        })]);


                        sexGraph.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(sexXAxis)
                            .selectAll("text")
                            .style("text-anchor", "end")
                            .attr("dx", "-.8em")
                            .attr("dy", ".15em")
                            .attr("transform", "rotate(-90)");
                        /*.selectAll(".tick text")
                         .call(wrap, raceX.bandwidth());*/

                        sexYAxis.tickValues([0, d3.max(relevantData, function (row) {
                            return +row[columnName];
                        })]);

                        sexGraph.select(".y.axis")
                            .transition()
                            .duration(1000)
                            .call(sexYAxis);

                    } else {
                        sexX.domain(["Data Unavailable"]);
                        sexY.domain([0, 1000]);

                        sexGraph.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(sexXAxis);

                        sexYAxis.tickValues([0, 1000]);

                        sexGraph.select(".y.axis")
                            .transition()
                            .duration(1000)
                            .call(sexYAxis);
                    }

                    var bars = sexGraph.selectAll(".bar")
                        .data(relevantData);

                    bars.enter().append("rect")
                        .attr("class", "bar")
                        .attr("fill", function (row) {
                            return cancerColorKey[row["Leading Cancer Sites"]];
                        })
                        .attr("stroke", "black")
                        .attr("x", function (row) {
                            return sexX(row["Sex"]);
                        })
                        .attr("width", sexX.bandwidth())
                        .attr("y", function (row) {
                            return sexY(+row[columnName]);
                        })
                        .attr("height", function (row) {
                            return (height - padding - sexY(+row[columnName]));
                        })
                        .on("mouseover", function (row) {

                            d3.select(this)
                                .attr("fill", "lightgrey");

                            tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);

                            tooltip.html("<strong>Incidents for " + row["Sex"] + "s:</strong><br/>" + row[columnName])
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY) + "px");
                        }).on("mouseout", function (row) {

                        d3.select(this)
                            .attr("fill", cancerColorKey[row["Leading Cancer Sites"]]);
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

                    bars.transition()
                        .duration(1000)
                        .attr("fill", function (row) {
                            return cancerColorKey[row["Leading Cancer Sites"]];
                        })
                        .attr("stroke", "black")
                        .attr("x", function (row) {
                            return sexX(row["Sex"]);
                        })
                        .attr("width", sexX.bandwidth())
                        .attr("y", function (row) {
                            return sexY(+row[columnName]);
                        })
                        .attr("height", function (row) {
                            return (height - padding - sexY(+row[columnName]));
                        });

                    bars.exit()
                        .transition()
                        .duration(1000)
                        .attr("y", sexY(0))
                        .attr("height", (height - padding - sexY(0)))
                        .style('fill-opacity', 1e-6)
                        .remove();

                });
            });

        var line = d3.line()
            .x(function (d) {
                return lineX(+d["Year"]);
            })
            .y(function (d) {
                return lineY(+d[columnName]);
            });
        var linePath = lineGraph.selectAll("path")
            .data(separatedData)
            .enter().append("path")
            .attr("class", function (d) {
                return 'line-' + createClassName(d.cancer) + ' line'
            })
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("fill", "none")
            .style("stroke", function (d) {
                return cancerColorKey[d.cancer.trim()];
            })
            .style("stroke-width", 2);

        var pie = d3.pie()
            .sort(function (a, b) {
                return b.total - a.total;
            })
            .value(function (d) {
                return d.total;
            });

        var xAxis = d3.axisBottom(lineX);
        xAxis.tickValues([minYear, maxYear])
        xAxis.tickFormat(d3.format("d"));

        lineGraph.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (height - padding + 10) + ")")
            .call(xAxis);

        var yAxis = d3.axisLeft(lineY);
        yAxis.tickSize(10);

        lineGraph.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (padding - 10) + ", 0)")
            .call(yAxis);
            lineGraph.append("text")
    .attr("class", "linelabel")
    .attr("text-anchor", "end")
    .attr("x", width/2-50)
    .attr("y", height-10)
    .text("Year");
    lineGraph.append("text")
    .attr("class", "linelabel")
    .attr("text-anchor", "end")
    .attr("y", 0)
    .attr("dy", ".75em")
    .attr("x", -140)
    .attr("transform", "rotate(-90)")
    .text("Number of Incidents");
    //PIE CHART
      pieChart.append("text")
          .attr("class", "pielabel")
          .attr("text-anchor", "end")
          .attr("x", pie_width/2)
          .attr("y", pie_height-15)
          .text("Cancer Distributions");
        //PIE CHART
        var arc = d3.arc()
            .outerRadius((3 * pie_width) / 8)
            .innerRadius(0);

        var arcs = pieChart.selectAll("g.arc")
            .data(pie(totalData))
            .enter()
            .append("g")
            .attr("class",function(d) {return "pieArc arc-" + createClassName(d.data.cancer)})
            .attr("transform", "translate(" + (pie_width / 2) + "," + (pie_width / 2) + ")");

        arcs.append("path")
            .attr("fill", function (d) {
                return cancerColorKey[d.data.cancer.trim()];
            })
            .attr("d", arc);

        arcs.selectAll("path")
            .on("mouseover", function (d) {
            })

        linePath.on("mouseover", function (theLine) {
                var linecolor = d3.select(this)
                    .style("stroke");

                linePath.transition()
                    .duration(1000).style("stroke", "lightgrey");

                d3.select(this).transition()
                    .duration(1000)
                    .style("stroke", linecolor);

                dot.selectAll("circle")
                    .filter(function (d) {
                        return d["Leading Cancer Sites"] != theLine.cancer;
                    })
                    .attr("fill", "lightgrey");

                arcs.selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("fill", function (d) {
                        if (d.data.cancer.trim() == theLine.cancer.trim()) {
                            return linecolor;
                        } else {
                            return "lightgrey";
                        }
                    });

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html("<strong>" + theLine.cancer + "</strong>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");

            })
            .on("mouseout", function (theLine) {

                linePath.transition()
                    .duration(1000).style("stroke", function (d) {
                        return cancerColorKey[d.cancer];
                    });

                dot.selectAll("circle")
                    .transition()
                    .duration(1000)
                    .attr("fill", function (d) {
                        return cancerColorKey[d["Leading Cancer Sites"]];
                    });
                arcs.selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr("fill", function (d) {
                        return cancerColorKey[d.data.cancer.trim()];
                    });

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
        if ($('.legendNode').length == 0) {
            make_legend();
        }




    });

}

// function to draw legend
function make_legend(){
    // Dimensions for legend
    var li = {
        w: 120, h: 30, s: 3, r: 3
    };



    var legendEntries = [];
    // create key-value mapping for legend
    for (var e in cancerSites) {
        legendEntries.push({
            'key': cancerSites[e],
            'value' : cancerColorKey[cancerSites[e]]
        })
    }


    // Legend D3 Selector
    var legend = d3.select('#legendDiv').append('svg')
        .attr('width', li.w)
        .attr('height', d3.keys(cancerSites).length * (li.h + li.s))

    var legendG = legend.selectAll('g')
        .data(legendEntries)
        .enter().append('g')
        .attr('class', function(d) {return d.key + '-node legendNode'})
        .attr('transform', function(d, i) {
            return 'translate(0,' + i * (li.h + li.s) + ")";
        })
        // TODO: need to implement createClassName function
        .on('click', function(d) {
            var nodeName = d.key;
            var nodeClassName = createClassName(nodeName);
            if (d3.select(this).classed("hidden-node")) {
                d3.select(this).classed("hidden-node", false)
                    .transition()
                    .duration(100)
                    .style("opacity", 1);
                d3.selectAll('.line-' + nodeClassName + ',' + '.dot-' + nodeClassName)
                    .style("visibility", 'visible');
                d3.selectAll('.arc-'+ nodeClassName)
                    .style('visibility', 'visible');
            } else {
                d3.select(this).classed("hidden-node", true)
                    .transition()
                    .duration(100)
                    .style("opacity", 0.4);
                d3.selectAll('.line-' + nodeClassName + ',' + '.dot-' + nodeClassName)
                    .style("visibility", 'hidden');
                d3.selectAll('.arc-' + nodeClassName)
                    .style('visibility', 'hidden');
            }



        });


    legendG.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", legend_height)
        .style("fill", function(d) { return d.value; });

    legendG.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return convertCancerName(d.key); });

    $("#legendDiv").height(legend_height);
}
////////////////
// Map Module //
////////////////
var svg = d3.select('.map'),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var mortality = d3.map();

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeReds[9]);
var state_abbreviations_list = [];



var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
    .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("2013 Cancer Mortalities Rate");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
    .select(".domain")
    .remove();

d3.queue()
    .defer(d3.json, "Data/Mapping/us-10m.v1.json")
    //.defer(d3.json, 'Data/Mapping/us.json')
    .defer(d3.tsv, "Data/MSA/2013_Mortalities_Rate.tsv", function(d) { mortality.set(d.id, +d.rate); })
    .await(ready);
var years = get_slider_years();
update_charts(years[0], years[1], selectedState);



// function to update heatmap of states based on slider
function update_map(startYear, endYear) {
    var incidents_map = get_avg_incidents_map(startYear, endYear);
    var values = Object.keys(incidents_map).map(function(d) {
        return incidents_map[d];
    });
    //mapColor.domain([Math.min.apply(null,values), Math.max.apply([null,values])]);
    d3.selectAll('.state')
        .attr('fill', function(d) {
            return mapColor(incidents_map[state_abbreviations_list[+d.id - 1].name]);
        })
    clear_bottom_charts();
}

// call of initial page load
function ready(error, us) {
    d3.json('Data/Mapping/state_abbreviations.json', function(d) {
        state_abbreviations_list = d.states;
        if (error) throw error;
        var years = get_slider_years();
        var incidents_map = get_avg_incidents_map(years[0], years[1]);
        var values = Object.keys(incidents_map).map(function(d) {
            return incidents_map[d];
        });
        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("fill", 'red')
            .attr("d", path)
            .on('click', function(d) {
                var name = state_abbreviations_list[+d.id - 1].name;
                var className = createClassName(name);
                var years = get_slider_years();
                selectedState = name;
                clear_bottom_charts();
                update_charts(years[0],years[1], name)
            })
            .attr('class', function(d) {return 'state state-' + createClassName(state_abbreviations_list[+d.id - 1].name) })
            .append("title")
            .text(function(d) {
                return state_abbreviations_list[+d.id - 1].name  + ': ' + parseInt(incidents_map[state_abbreviations_list[+d.id - 1].name]) + ' avg. incidents'; });

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);

        update_map(years[0], years[1]);
        // initially sets the border to Georgia to be selected
        d3.selectAll('.state').attr('stroke', 'none');
        d3.selectAll('.state-georgia').attr('stroke', 'black')
            .attr('stroke-width', 3)

    })
}

// Returns a mapping from state to incidents of the most popular cancer for the give year span
function get_top_cancer_incidents() {
    var years = get_slider_years();
    var incidence_map = {};
    var state_incidence_map = {}
    for (var i in state_incidents) {
        var state = state_incidents[i];
        state_incidence_map[i] = {}
        for (var y in state) {
            if (y >= years[0] && y <= years[1]) {
                for (var c in state[y]) {
                    if (!state_incidence_map.hasOwnProperty(c)) {
                        state_incidence_map[i][c] = state[y][c];
                    } else {
                        state_incidence_map[i][c] += state[y][c];
                    }
                    if (!incidence_map.hasOwnProperty(c)) {
                        incidence_map[c] = state[y][c]
                    } else {
                        incidence_map[c] += state[y][c]
                    }
                }
            }
        }
    }

    var top_cancer = Object.keys(incidence_map).reduce(function(a, b){ return incidence_map[a] > incidence_map[b] ? a : b });
    var output_map = {}
    for (var i in state_incidence_map) {
        var state = state_incidence_map[i];
        output_map[i] = state[top_cancer];
    }
    return [top_cancer, output_map];

}

// function that returns the selected years for the slider
function get_slider_years() {
    var start_year = $('.timeRangeSlider').limitslider("values")[0];
    var end_year = $('.timeRangeSlider').limitslider("values")[1];
    return [start_year, end_year];
}

// Utility functions
function createClassName(cls) {
    return cls.trim().replace(/\(|\)|\{|\}|\&|\.|\"|\'/g,'').replace(/\s|\-/g,'_').toLowerCase();
}

function clear_bottom_charts() {
    $('.ageGroupGraph > rect').remove();
    $('.raceGraph > rect').remove();
    $('.sexGraph > rect').remove();
    $('.specificTitle').text("Click on a point on the line graph for more information");
}

// code to create proper string for race name
function convertRaceName(raceName) {
    switch (raceName) {
        case "White":
            return "White";
        case "Asian or Pacific Islander":
            return "Asia/Pacific";
        case "Black or African American":
            return "Black/African";
        case "American Indian or Alaska Native":
            return "Indian/Alaskan";
        case "Other Races and Unknown combined":
            return "Other/Unknown";
    }
}

// function to get average incidents
function get_avg_incidents_map(startYear, endYear) {
    var incidents_map = {};
    var incidents_count_map = {}
    for (var i in state_incidents) {
        var incident = state_incidents[i];
        if (incident.year >= startYear && incident.year <= endYear) {
            if (!incidents_map.hasOwnProperty(incident.state)) {
                incidents_map[incident.state] = incident.value;
                incidents_count_map[incident.state] = 1;
            } else {
                incidents_map[incident.state] += incident.value;
                incidents_count_map[incident.state] += 1;
            }
        }
    }
    for (var i in incidents_map) {
        incidents_map[i] = incidents_map[i] / incidents_count_map[i];
    }
    return incidents_map;
}

// function to create string representation of cancer names
function convertCancerName(cancerName) {
    switch (cancerName) {
        case "Brain and Other Nervous System":
            return "Brain/Nervous System";
        case "Breast":
            return cancerName;
        case "Cervix Uteri":
            return cancerName;
        case "Colon and Rectum":
            return "Colon & Rectum";
        case "Corpus Uteri":
            return cancerName;
        case "Esophagus":
            return cancerName;
        case "Gallbladder":
            return cancerName;
        case "Kidney and Renal Pelvis":
            return "Kidney & Renal Pelvis";
        case "Larynx":
            return cancerName;
        case "Leukemias":
            return cancerName;
        case "Liver":
            return cancerName;
        case "Lung and Bronchus":
            return "Lung & Bronchus";
        case "Melanoma of the Skin":
            return "Skin Melanoma";
        case "Myeloma":
            return cancerName;
        case "Non-Hodgkin Lymphoma":
            return cancerName;
        case "Oral Cavity and Pharynx":
            return "Oral Cavity & Pharynx";
        case "Ovary":
            return cancerName;
        case "Pancreas":
            return cancerName;
        case "Prostate":
            return cancerName;
        case "Stomach":
            return cancerName;
        case "Thyroid":
            return cancerName;
        case "Urinary Bladder invasive and in situ":
            return "Urinary Bladder";
        case "Urinary Bladder":
            return cancerName;

    }
}
