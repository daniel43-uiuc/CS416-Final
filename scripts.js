// Load the data
d3.json("movies_full.json").then(function (data) {
  var currentScene = 1;
  showScene(currentScene);

  // Event listener for the Next button
  d3.select("#nextButton").on("click", function () {
    currentScene = (currentScene % 3) + 1;
    showScene(currentScene);
  });

  function showScene(scene) {
    d3.selectAll(".scene").style("display", "none");
    d3.select("#scene" + scene).style("display", "block");

    if (scene === 1) {
      scene1(data);
    } else if (scene === 2) {
      scene2(data);
    } else if (scene === 3) {
      scene3(data);
    }
  }

  function scene1(data) {
    d3.select("#scene1").html(""); // Clear previous content
    var svg = d3
      .select("#scene1")
      .append("svg")
      .attr("width", 800)
      .attr("height", 600);

    var x = d3
      .scaleBand()
      .domain(data.map((d) => d.movie_title))
      .range([0, 800])
      .padding(0.1);

    var y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total_gross)])
      .nice()
      .range([600, 0]);

    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("g")
      .attr("transform", "translate(0,600)")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.movie_title))
      .attr("y", (d) => y(d.total_gross))
      .attr("width", x.bandwidth())
      .attr("height", (d) => 600 - y(d.total_gross))
      .append("title")
      .text((d) => d.total_gross);

    svg
      .append("text")
      .attr("x", 400)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Total Gross of Disney Movies");
  }

  function scene2(data) {
    d3.select("#scene2").html(""); // Clear previous content
    // Implementation for scene2
  }

  function scene3(data) {
    d3.select("#scene3").html(""); // Clear previous content
    // Implementation for scene3
  }
});
