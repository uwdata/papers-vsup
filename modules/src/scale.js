/*
A tree-like bivariate quantization scheme.
As uncertainty increases, the number of quantization bins decreases.
*/

function treeScale(branchingFactor,treeLayers) {
  var branch = branchingFactor ? branchingFactor : 2,
      layers = treeLayers ? treeLayers : 2,
      tree = makeTree();

  function scale(value,uncertainty) {
    var u = uncertainty!=undefined ? uncertainty : value.u,
        v = uncertainty!=undefined ? value : value.v,
        i = 0;

    //find the right layer of the tree, based on uncertainty
    while(i<tree.length-1 && u < 1 - ((i+1)/layers)){
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
