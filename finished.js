'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope

  var legendary_selected = 'All'
  var generation_selected = 'All'

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1500)
      .attr('height', 1000);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // get arrays of fertility rate data and life Expectancy data
    let sp_def = data.map((row) => parseFloat(row["Sp. Def"]));
    let total = data.map((row) => parseFloat(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(sp_def, total);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");


    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();


  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 475)
      .attr('y', 40)
      .style('font-size', '24pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 650)
      .attr('y', 725)
      .style('font-size', '20pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(40, 350)rotate(-90)')
      .style('font-size', '20pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    // let pop_data = data.map((row) => +row["pop_mlns"]);
    // let pop_limits = d3.extent(pop_data);
    // // make size scaling function for population
    // let pop_map_func = d3.scaleLinear()
    //   .domain([pop_limits[0], pop_limits[1]])
    //   .range([3, 20]);

    const colors = {

        "Bug": "#4E79A7",
    
        "Dark": "#A0CBE8",
    
        "Electric": "#F28E2B",
    
        "Fairy": "#FFBE&D",
    
        "Fighting": "#59A14F",
    
        "Fire": "#8CD17D",
    
        "Ghost": "#B6992D",
    
        "Grass": "#499894",
    
        "Ground": "#86BCB6",
    
        "Ice": "#86BCB6",
    
        "Normal": "#E15759",
    
        "Poison": "#FF9D9A",
    
        "Psychic": "#79706E",
    
        "Steel": "#BAB0AC",
    
        "Water": "#D37295"
    
    }

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // append data to SVG and plot as points

    let sp_def_array = data.map(d => d['Sp. Def']);
    let total_array = data.map(d => d['Total']);
    let type2_array = data.map(d => d['Type 2']);
    let name_array = data.map(d => d['Name'])
    let dict = []
    for (let i = 0; i < 800; i++) {
      dict.push({key: sp_def_array[i], value: total_array[i], pair: type2_array[i], final: name_array[i]})
    }
    console.log(dict);

    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 6)
        .attr('fill', (d) => colors[d["Type 1"]])
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          var flag = 0;
          var type2 = 0
          for (let i = 0; i < 800; i++) {
            if(d['Sp. Def'] == Object.values(dict[i])[0] && d['Total'] == Object.values(dict[i])[1] && d['Name'] != Object.values(dict[i])[3]) {
              flag++;
              if(d['Type 2'] != '' && Object.values(dict[i])[2] != '' && d['Type 2'] != Object.values(dict[i])[2]) {
                type2++;
              }
            }
          } 

          if (flag >= 1 && type2 >= 1) {

            div.transition()
            .duration(200)
            .style("opacity", .9);
            div.html("<strong>" + '*' + "</strong>" + "<br/>" +  d['Type 1'] + "<br/>" + '*')
              .style("left", (d3.event.pageX + 10) + "px")
              .style("top", (d3.event.pageY + 3) + "px");
          } else if (flag >= 1 && type2 <= 0) {
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html("<strong>" + '*' + "</strong>" + "<br/>" +  d['Type 1'] + "<br/>" + (d["Type 2"]))
              .style("left", (d3.event.pageX + 10) + "px")
              .style("top", (d3.event.pageY + 3) + "px");

          } else {
            div.transition()
            .duration(200)
            .style("opacity", .9);
            div.html("<strong>" + d['Name'] + "</strong>" + "<br/>" +  d['Type 1'] + "<br/>" + d['Type 2'])
              .style("left", (d3.event.pageX + 10) + "px")
              .style("top", (d3.event.pageY + 3) + "px");
            }})
          .on("mouseout", (d) => {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });

    // let default_legendary = 'All'
    let distinct_legend = [...new Set(data.map(d => d.Legendary))]
    distinct_legend.push('All');

    // Legendary Dropdown
    var legendary_dropDown = d3.select("#legendary").append("select")
    .attr("name", "generation-list")
    .attr('cx', '500');

    
    var options = legendary_dropDown.selectAll("option")
    .data(distinct_legend)
    .enter()
    .append("option");
    
    options.text(function (d) {  return d; })
    .attr("value", function (d) {  return d; })
    .attr("selected", function(d) { return d.Legendary == legendary_selected;})

    // Generation Dropdown    
    
    // let default_gen = 'All'
    let distinct_gen = [...new Set(data.map(d => d.Generation))] 
    distinct_gen.push('All');
    
    var dropDown = d3.select("#filter").append("select")
    .attr("name", "generation-list")
    .attr('cx', '500');

    var options = dropDown.selectAll("option")
    .data(distinct_gen)
    .enter()
    .append("option");
    
    options.text(function (d) {  return d; })
    .attr("value", function (d) {  return d; })
    .attr('selected', function(d) { return d.Generation == generation_selected;})

    dropDown.on("change", function() {
        var selected = this.value;
        let displayOthers = this.checked ? "inline" : "none";
        let display = this.checked ? "none" : "inline";
        generation_selected = selected;

        if (selected == 'All' && legendary_selected == 'All') {
          svgContainer.selectAll("circle")
            .filter(function(d) { return d['Legendary']})
            .filter(function(d) {return d['Generation'];})
            .attr("display", display);
  
        } else if (selected == 'All' && legendary_selected != 'All') {
          svgContainer.selectAll("circle")
          .filter(function(d) { return legendary_selected != d['Legendary']})
          .attr('display', displayOthers)

          svgContainer.selectAll("circle")
          .filter(function(d) {return d['Generation'];})
          .filter(function(d) { return legendary_selected == d['Legendary']})
          .attr('display', display)

        } else if (selected != 'All' && legendary_selected == 'All') {
          svgContainer.selectAll("circle")
          .filter(function(d) {  return selected != d['Generation']})
          .attr('display', displayOthers)

          svgContainer.selectAll("circle")
          .filter(function(d) {  return selected == d['Generation']})
          .filter(function(d) {return d['Legendary'];})
          .attr('display', display)
        } else {
        svgContainer.selectAll("circle")
            .filter(function(d) {return !(selected == d['Generation'] && legendary_selected == d['Legendary']);})
            // .filter(function(d) { return legendary_selected != d['Legendary']})
            .attr("display", displayOthers);
            
        svgContainer.selectAll("circle")
            .filter(function(d) {return (selected == d['Generation'] && legendary_selected == d['Legendary']);})
            // .filter(function(d) { generation_selected == d['Generation']})
            .attr("display", display);
  
        }});

    legendary_dropDown.on("change", function() {
      var selected = this.value;
      let displayOthers = this.checked ? "inline" : "none";
      let display = this.checked ? "none" : "inline";
      legendary_selected = selected

      if (selected == 'All' && generation_selected == 'All') {
        svgContainer.selectAll("circle")
          .filter(function(d) { return d['Legendary']})
          .filter(function(d) {return d['Generation'];})
          .attr("display", display);

      } else if (selected == 'All' && generation_selected != 'All') {
        svgContainer.selectAll("circle")
        .filter(function(d) { return generation_selected != d['Generation']})
        .attr('display', displayOthers)

        svgContainer.selectAll("circle")
        .filter(function(d) {return d['Legendary'];})
        .filter(function(d) { return generation_selected == d['Generation']})
        .attr('display', display)

      } else if (selected != 'All' && generation_selected == 'All') {

        svgContainer.selectAll("circle")
        .filter(function(d) {  return d['Generation']})
        .filter(function(d) {return legendary_selected == d['Legendary'];})
        .attr('display', display)

        svgContainer.selectAll("circle")
        .filter(function(d) {  return legendary_selected != d['Legendary']})
        .attr('display', displayOthers)
      } else {
      svgContainer.selectAll("circle")
          .filter(function(d) {return !(selected == d['Generation'] && legendary_selected == d['Legendary']);})
          .attr("display", displayOthers);
          
      svgContainer.selectAll("circle")
          .filter(function(d) {return (selected == d['Legendary'] && generation_selected == d['Generation']);})
          .attr("display", display);

      }});

      
      let pixel_data = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]

      var legend = svgContainer.selectAll('#my_legend')
        .data(pixel_data)
        .enter()
        .append('g')
        .attr('class', 'legend')

      legend.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 1350)
        .attr('y', function(d) { return (d * 20) + 250})
        .style('fill', function(d) { return colors[Object.keys(colors)[d]]});

      legend.append('text')
        .attr('x', 1375)
        .attr('y', function(d) { return (d * 20) + 260})
        .text(function(d) { return Object.keys(colors)[d] })

        
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 10, limits.xMax + 1]) // give domain buffer room
      .range([100, 1250]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 650)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 650]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(100, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


})();

