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
  var sizeScale = makeScaleFunction(maps.squareSize, uSize);
  var arcSizeScale = makeScaleFunction(maps.arcSize, uSize);
  var juxtaposedValueScale = function(d) {
    return map(d3.scaleQuantize().domain([0,1]).range(maps.linearValue)(d.v));
  }
  var juxtaposedUncertaintyScale = function(d) {
    return reverseGrey(d3.scaleQuantize().domain([0,1]).range(maps.linearUncertainty)(d.u));
  }

  makeHeatmap(svg, 0,0,250,maps.square, squareScale, "legendSquare");
  makeArcmap(svg, 300,0,250,maps.arc,arcScale,"legendArc");
  makeHexmap(svg, 600,0,250,maps.squareSize, sizeScale, MAX_SIZE);
  makeArcHexmap(svg, 900,0,250,maps.arcSize,arcSizeScale,"legendSizeArc");
  makeSimpleLegend(svg, 1200,0,40, 250,maps.linearValue, map, "Value");
  makeSimpleLegend(svg, 1200,120,40, 250,maps.linearUncertainty, reverseGrey, "Uncertainty");
  makeHexLegend(svg, 1200,240,MAX_SIZE, 250,maps.linearUncertainty,d3.scalePoint().domain(maps.linearUncertainty).range([MAX_SIZE, 5]), "Uncertainty");

  var gradient = gradientData(8,8);
  makeHeatmap(svg, 0,300,250,gradient, squareScale);
  makeHeatmap(svg, 300,300,250,gradient, arcScale);
  makeHexmap(svg, 600,300,250,gradient, sizeScale, MAX_SIZE);
  makeHexmap(svg, 900,300,250,gradient, arcSizeScale, MAX_SIZE);
  makeHeatmap(svg, 1200,300,250,gradient, juxtaposedValueScale);
  makeHeatmap(svg, 1500,300,250,gradient, juxtaposedUncertaintyScale);

  var random = randomData(5,5);
  makeHeatmap(svg, 0,600,250,random, squareScale);
  makeHeatmap(svg, 300,600,250,random, arcScale);
  makeHexmap(svg, 600,600,250,random, sizeScale, MAX_SIZE);
  makeHexmap(svg, 900,600,250,random, arcSizeScale, MAX_SIZE);
  makeHeatmap(svg, 1200,600,250,random, juxtaposedValueScale);
  makeHeatmap(svg, 1500,600,250,random, juxtaposedUncertaintyScale);

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

  // genome data example heatmap
  d3.csv("viraldata.csv", function(data) {
    data = data.map(function(d) {
      return {
        Individual: d.Individual,
        Position: +d.Position,
        Mutation: +d.Mutation,
        BadReads: +d.BadReads
      }
    }).filter(function(d) {
      return d.Position < 500 && d.Position < 700
    });

    makeViralExample(body.append("svg"), arcScale, maps.arc, data, "arc");
    makeViralExample(body.append("svg"), squareScale, maps.square, data, "square");
  });
}

main();
