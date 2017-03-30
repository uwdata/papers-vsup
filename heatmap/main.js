function main(){
  var body = d3.select("body");
  var svg = body.append("svg").attr("height", 900).append("g").attr("transform","translate(10, 10)");

  var map = d3.interpolateViridis;
  // Other maps to test:
  //
  // interpolateViridis
  // interpolateInferno
  // interpolatePlasma
  // interpolateWarm
  // interpolateCool

  var MAX_SIZE = 14;
  var maps = makeMaps(map, 18, MAX_SIZE);

  var uSL = makeuSL(map);
  var uSize = makeuSize(map, MAX_SIZE);

  var squareScale = makeScaleFunction(maps.square, uSL);
  var arcScale = makeScaleFunction(maps.arc, uSL);
  var arcSizeScale = makeScaleFunction(maps.arcSize, uSize);

  makeHeatmap(svg, 0,0,250,maps.square, squareScale, "legendSquare");
  makeArcmap(svg, 300,0,250,maps.arc,arcScale,"legendArc");
  makeArcHexmap(svg, 600,0,250,maps.arcSize,arcSizeScale,"legendSizeArc");

  var gradient = gradientData(8,8);
  makeHeatmap(svg, 0,300,250,gradient, squareScale);
  makeHeatmap(svg, 300,300,250,gradient, arcScale);
  makeHexmap(svg, 600,300,250,gradient, arcSizeScale, MAX_SIZE);

  var random = randomData(5,5);
  makeHeatmap(svg, 0,600,250,random, squareScale);
  makeHeatmap(svg, 300,600,250,random, arcScale);
  makeHexmap(svg, 600,600,250,random, arcSizeScale, MAX_SIZE);

  // flight data example heatmap
  d3.csv("data.csv", function(data) {
    data = data.map(function(d) {
      return {
        DayOfWeek: +d.DayOfWeek,
        DepDelay: +d.DepDelay,
        DepTimeBlk: d.DepTimeBlk,
        StdMeanErr: +d.StdMeanErr
      }
    });

    makeFlightExample(body.append("svg"), arcScale, maps.arc, data, "arc");
    makeFlightExample(body.append("svg"), squareScale, maps.square, data, "square");
  });
}

main();
