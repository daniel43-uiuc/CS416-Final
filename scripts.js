// Load the data for each scene
Promise.all([
  d3.json("data/top_50_streamed.json"),
  d3.json("data/top_50_popularity.json"),
  d3.json("data/top_50_playlist.json"),
]).then(function (data) {
  var top50Streamed = data[0];
  var top50Popularity = data[1];
  var top50Playlist = data[2];

  var currentScene = 1;
  showScene(currentScene);

  // Event listener for navbar buttons
  d3.selectAll(".nav-button").on("click", function () {
    currentScene = +d3.select(this).attr("data-scene");
    showScene(currentScene);
  });

  // Event listener for the Next button
  d3.select("#nextButton").on("click", function () {
    currentScene = (currentScene % 3) + 1;
    showScene(currentScene);
  });

  function showScene(scene) {
    d3.selectAll(".scene").style("display", "none");
    d3.select("#scene" + scene).style("display", "block");

    if (scene === 1) {
      scene1(top50Streamed);
    } else if (scene === 2) {
      scene2(top50Popularity);
    } else if (scene === 3) {
      scene3(top50Playlist);
    }
  }

  function scene1(data) {
    d3.select("#scene1").html(""); // Clear previous content

    var margin = { top: 35, right: 20, bottom: 150, left: 80 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var svg = d3
      .select("#scene1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand().range([0, width]).padding(0.1);
    var y = d3.scaleLinear().range([height, 0]);

    x.domain(data.map((d) => d["Track"]));
    y.domain([0, d3.max(data, (d) => d["Spotify Streams"])]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", "-0.6em")
      .attr("dx", "-0.8em")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("text-align", "center")
      .style("width", "120px")
      .style("height", "auto")
      .style("padding", "10px")
      .style("font", "12px sans-serif")
      .style("background", "lightsteelblue")
      .style("border", "0px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d["Track"]))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d["Spotify Streams"]))
      .attr("height", (d) => height - y(d["Spotify Streams"]))
      .attr("fill", "#4e79a7")
      .append("title") // Simple tooltip
      .text(
        (d) =>
          `${d["Track"]} by ${d["Artist"]}\n${d["Spotify Streams"]} streams`
      )
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Track: ${d["Track Name"]}<br>Artist: ${d["Artist"]}<br>Release Date: ${d["Release Date"]}<br>Streams: ${d["Spotify Streams"]}`
          )
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Top 50 Streamed Songs on Spotify");
  }

  function scene2(data) {
    d3.select("#scene2").html(""); // Clear previous content

    var margin = { top: 50, right: 30, bottom: 150, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var svg = d3
      .select("#scene2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand().range([0, width]).padding(0.1);
    var y = d3.scaleLinear().range([height, 0]);

    // Normalizing values to a scale of 1 - 100
    var platforms = ["Spotify Streams", "YouTube Views", "TikTok Views"];
    platforms.forEach((platform) => {
      var maxVal = d3.max(data, (d) => d[platform]);
      data.forEach((d) => {
        d[`${platform}_normalized`] = (d[platform] / maxVal) * 100;
      });
    });

    // Compute average normalized score and sort by it
    data.forEach((d) => {
      d.avg_normalized =
        platforms.reduce(
          (sum, platform) => sum + d[`${platform}_normalized`],
          0
        ) / platforms.length;
    });
    data.sort((a, b) => b.avg_normalized - a.avg_normalized);

    x.domain(data.map((d) => d["Track"]));
    y.domain([0, 100]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", "-0.6em")
      .attr("dx", "-0.8em")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    var colors = ["#4e79a7", "#f28e2c", "#e15759"];
    var color = d3.scaleOrdinal().domain(platforms).range(colors);

    platforms.forEach((platform, i) => {
      svg
        .selectAll(`.bar-${platform.replace(" ", "-")}`)
        .data(data)
        .enter()
        .append("rect")
        .attr("class", `bar bar-${platform.replace(" ", "-")}`)
        .attr(
          "x",
          (d) => x(d["Track"]) + (x.bandwidth() / platforms.length) * i
        )
        .attr("width", x.bandwidth() / platforms.length)
        .attr("y", (d) => y(d[`${platform}_normalized`] || 0))
        .attr("height", (d) => height - y(d[`${platform}_normalized`] || 0))
        .attr("fill", colors[i])
        .append("title") // Simple tooltip
        .text(
          (d) => `${d["Track"]} by ${d["Artist"]}\n${platform}: ${d[platform]}`
        );
    });

    // Legend
    var legend = svg
      .selectAll(".legend")
      .data(platforms)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text((d) => d.replace("_normalized", ""));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Top 50 Songs' Popularity Across Platforms (Normalized)");
  }

  function scene3(data) {
    d3.select("#scene3").html(""); // Clear previous content

    var margin = { top: 50, right: 50, bottom: 150, left: 80 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var svg = d3
      .select("#scene3")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    x.domain([0, d3.max(data, (d) => d["Spotify Playlist Count"] || 0)]);
    y.domain([0, d3.max(data, (d) => d["Spotify Playlist Reach"] || 0)]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d["Spotify Playlist Count"] || 0))
      .attr("cy", (d) => y(d["Spotify Playlist Reach"] || 0))
      .attr("r", 5)
      .attr("fill", "#4e79a7")
      .append("title") // Simple tooltip
      .text(
        (d) =>
          `${d["Track Name"]} by ${d["Artist"]}\nPlaylist Count: ${d["Spotify Playlist Count"]}\nPlaylist Reach: ${d["Spotify Playlist Reach"]}`
      );

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Spotify Playlist Reach and Count for Top 50 Songs");
  }
});
