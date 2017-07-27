/*
Items we need for a VSUM:

1) A value mapping (likely a color map)
2) An uncertainty mapping (could be saturation or lightness or size or...)
3) A threshold of distance in CIELAB (or jnd?)
4) How big our marks will be (if we're using size)
5) A branching factor

What we want a VSUM to look like:

1) A function where you pass it a (value,uncertainty) pair, and you get a color
(or color/size) out.

Other notes: let's make things play as nicely with d3 as possible,
so let's model off of d3.scaleQuantize as much as possible.

*/

function treeScale(branchingFactor,treeLayers) {
  var branch = branchingFactor ? branchingFactor : 2,
      layers = treeLayers ? treeLayers : 2,
      tree = makeTree();

  function scale(value,uncertainty) {
    var u = uncertainty!=undefined ? uncertainty : value.u,
        v = uncertainty!=undefined ? value : value.v,
        i = 0;

    //find right layer of tree, based on uncertainty
    while(i<tree.length && u < tree[i][0].u){
      i++;
    }

    //find right leaf of tree, based on value
    var vgap = (tree[i].length>1) ? (tree[i][1].v - tree[i][0].v) / 2 : 0,
        j = 0;

    while(j<(tree[i].length-1) && v > tree[i][j].v+vgap){
      j++;
    }

    return tree[i][j];
  }

  function makeTree() {
    // Our tree should be "squarish" - it should have about
    // as many layers as leaves.
    var tree = [],
        n;

    tree[0] = [];
    tree[0].push({u: 1, v: 0.5});

    for(var i = 1;i<layers;i++){
      tree[i] = [];
      n = 2*Math.pow(branch,i);
      for(var j = 1;j<n;j+=2){
        tree[i].push({ u: 1 - ( i/(layers-1)), v: (j/n)});
      }
    }
    return tree;
  }

  scale.tree = function() {
    return tree;
  }

  scale.branching = function(newbranch) {
      if(!arguments.length) {
        return branch;
      }
      else{
        branch = Math.max(1,newbranch);
        tree = makeTree();
        return scale;
      }
  }

  scale.layers = function(newlayers) {
    if(!arguments.length) {
      return layers;
    }
    else{
      layers = Math.max(1,newlayers);
      tree = makeTree();
      return scale;
    }
  }

  return scale;
}

module.exports = treeScale;
