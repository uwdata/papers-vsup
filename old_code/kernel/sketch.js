const height = 10;
const width = 16;
const size = 20;
const offset = 25;

function setup() {
  Math.seedrandom('random');

  createCanvas(width * size, 3 * height * size + 2 * offset);

  background('white');

  const values = getRandom();
  const certainties = getRandom();

  noStroke();

  forEach(function(i, j) {
    const value = values[i][j];
    fill(255*value);
    rect(j*size, i*size, size, size);

    const certainty = certainties[i][j];
    fill(255*certainty);
    rect(j*size, i*size + height*size + offset, size, size);
  });

  forEach(function(i, j) {
    const certainty = certainties[i][j];
    const stdev = 0.1 / certainty;
    const kernelSize = Math.ceil(2 * stdev);
    const kernel = computeKernel(stdev, kernelSize, i, j);

    let value = 0;
    for (let ii = -kernelSize; ii < kernelSize + 1; ii++) {
      for (let jj = -kernelSize; jj < kernelSize + 1; jj++) {
        const kernelI = ii + kernelSize;
        const kernelJ = jj + kernelSize;
        const mult = kernel[kernelI][kernelJ];
        if (mult > 0) {
          value += mult * values[i + ii][j + jj];
        }
      }
    }

    fill(255*value);

    rect(j*size, i*size + 2*(height*size + offset), size, size);
  });
}

function computeKernel(stdev, kernelSize, i, j) {
  const gauss = gaussian(stdev);
  const kernelLength = 2 * kernelSize + 1;

  let sum = 0;
  let kernel = [];
  for (let ii = -kernelSize; ii < kernelSize + 1; ii++) {
    let line = [];
    for (let jj = -kernelSize; jj < kernelSize + 1; jj++) {
      if (0 <= i + ii && i + ii < height && 0 <= j + jj && j + jj < width) {
        const dist = Math.sqrt(ii*ii + jj*jj);
        const mult = gauss(dist);
        sum += mult;
        line.push(mult);
      } else {
        line.push(0);  // should never be used
      }
    }
    kernel.push(line);
  }

  // normalize kernel
  for (let i = 0; i < kernelLength; i++) {
    for (let j = 0; j < kernelLength; j++) {
      if (sum > 0) {
        kernel[i][j] /= sum;
      } else {
        kernel[i][j] = 1 / (kernelLength * kernelLength);
      }
    }
  }

  return kernel;
}

function getRandom() {
  let data = [];
  for (let i = 0; i < height; i++) {
    data.push([]);
    for (let j = 0; j < width; j++) {
      data[i].push(random());
    }
  }
  return data;
}

/**
 * Compute pdf
 */
function gaussian(stdev) {
  const mult = 1 / (Math.sqrt(2 * Math.PI) * stdev);
  const twoVar = - 2 * stdev * stdev;

  return function(x) {
    return mult * Math.exp(x * x / twoVar); 
  }
}

function forEach(f) {
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      f(i, j);
    }
  }
}

