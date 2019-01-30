const X = 0.525731112119133606;
const Z = 0.850650808352039932;
const verticesIsocahedron = [
            [-X, 0.0, Z], [ X, 0.0, Z ], [ -X, 0.0, -Z ], [ X, 0.0, -Z ],
            [ 0.0, Z, X ], [ 0.0, Z, -X ], [ 0.0, -Z, X ], [ 0.0, -Z, -X ],
            [ Z, X, 0.0 ], [ -Z, X, 0.0 ], [ Z, -X, 0.0 ], [ -Z, -X, 0.0 ]
];

const indices = [
          [0, 4, 1], [ 0, 9, 4 ], [ 9, 5, 4 ], [ 4, 5, 8 ], [ 4, 8, 1 ],
          [ 8, 10, 1 ], [ 8, 3, 10 ], [ 5, 3, 8 ], [ 5, 2, 3 ], [ 2, 7, 3 ],
          [ 7, 10, 3 ], [ 7, 6, 10 ], [ 7, 11, 6 ], [ 11, 0, 6 ], [ 0, 1, 6 ],
          [ 6, 1, 10 ], [ 9, 0, 11 ], [ 9, 11, 2 ], [ 9, 2, 5 ], [ 7, 2, 11 ]
      ];


const vLerp = (start, end, percent) => {
  //console.error(`lerp(${start}, ${end},  ${percent})`);
  return vAdd(start, vMul(vSub(end, start), percent));
};
const vDiv = (v, s) => {
  //console.error(`div(${v} / ${s})`);
  return [v[0] / s, v[1] / s, v[2] / s];
};
const vMul = (v, s) => {
  //console.error(`mul(${v} * ${s})`);
  return [v[0] * s, v[1] * s, v[2] * s];
};
const vMag = (v) => {
  //console.error(`mag(${v})`);
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
};
const vSub = (a, b) => {
  //console.error(`sub(${a} - ${b})`);
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};
const vAdd = (a, b) => {
  //console.error(`add(${a} + ${b})`);
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
};
const vEqual = (a, b) => {
  //console.error(`add(${a} + ${b})`);
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
};
const vNorm = (v) => {
  //console.error(`norm(${v})`);
  return vDiv(v, vMag(v));
};

const vRotX = (v, t) => {
  // |1     0           0| |x|   |        x        |   |x'|
  // |0   cos θ    −sin θ| |y| = |y cos θ − z sin θ| = |y'|
  // |0   sin θ     cos θ| |z|   |y sin θ + z cos θ|   |z'|
  return [v[0], v[1] * Math.cos(t) - v[2] * Math.sin(t), v[1] * Math.sin(t) + v[2] * Math.cos(t)];
};

const vRotY = (v, t) => {
  // | cos θ    0   sin θ| |x|   | x cos θ + z sin θ|   |x'|
  // |   0      1       0| |y| = |         y        | = |y'|
  // |−sin θ    0   cos θ| |z|   |−x sin θ + z cos θ|   |z'|
  return [v[0] * Math.cos(t) + v[2] * Math.sin(t), v[1], v[2] * Math.cos(t) - v[0] * Math.sin(t) ];
};

const vRotZ = (v, t) => {
  // |cos θ   −sin θ   0| |x|   |x cos θ − y sin θ|   |x'|
  // |sin θ    cos θ   0| |y| = |x sin θ + y cos θ| = |y'|
  // |  0       0      1| |z|   |        z        |   |z'|
  return [v[0] * Math.cos(t) - v[1] * Math.sin(t), v[0] * Math.sin(t) + v[1] * Math.cos(t), v[2]];
};


const angle = Math.asin(X);
const rotatedVertices = verticesIsocahedron.map(v => vRotY(v, angle));

const edges = [];
const pushUnique = (a, b) => {
  if (!edges.some(([ea, eb]) => vEqual(ea, a) && vEqual(eb, b) || vEqual(ea, b) && vEqual(eb, a))) {
    edges.push([a, b]);
  }
};

const subdivide = (a, b, c) => {
  const ab = vNorm(vAdd(a, b));
  const bc = vNorm(vAdd(b, c));
  const ac = vNorm(vAdd(a, c));

  pushUnique(a, ab);
  pushUnique(a, ac);
  pushUnique(ab, ac);
  pushUnique(ab, bc);
  pushUnique(ab, b);
  pushUnique(ac, bc);
  pushUnique(ac, c);
  pushUnique(bc, c);
  pushUnique(bc, b);
};

indices.forEach(([a, b, c]) => {
  subdivide(rotatedVertices[a], rotatedVertices[b], rotatedVertices[c]);
  //subdivide(verticesIsocahedron[a], verticesIsocahedron[b], verticesIsocahedron[c]);
  //pushUnique(rotatedVertices[a], rotatedVertices[b]); pushUnique(rotatedVertices[b], rotatedVertices[c]); pushUnique(rotatedVertices[a], rotatedVertices[c]);
  //pushUnique(verticesIsocahedron[a], verticesIsocahedron[b]); pushUnique(verticesIsocahedron[b], verticesIsocahedron[c]); pushUnique(verticesIsocahedron[a], verticesIsocahedron[c]);
});

const nLEDs = 32;
const lerp = edges => {
  let out = [];
  edges.forEach(([from, to]) => {
    for (let i = 1; i < nLEDs + 1; i++) {
      out.push(vMul(vLerp(from, to, 1 / (nLEDs + 1) * i), 2));
    }
  });
  return out;
};

//const cutDome = edges => edges.filter(([a, b]) => a[2] >= -0.1 && b[2] >= -0.1);
const cutDome = edges => edges.filter(([a, b]) => a[2] >= 0.1 || b[2] >= 0.1);

const unique = a => {
  return a.filter(function(item, index, allItems) {
    return allItems.findIndex(element => vEqual(element, item)) === index;
  })
};

const domeEdges = cutDome(edges);
const lerped = lerp(domeEdges);
const vUnique = unique(lerped)
const vdata = vUnique.sort();

//const vdata = cutDome(unique(rawdata.sort()));
//const vdata = rawdata;//.sort();
console.error(indices.length, lerped.length, vUnique.length, domeEdges.length, vdata.length);

console.log(`[`);
for (let i = 0; i < vdata.length - 1; i++) {
  console.log(`  {"point": [${vdata[i][0]}, ${vdata[i][1]}, ${vdata[i][2]}]},`);
}
console.log(`  {"point": [${vdata[vdata.length - 1][0]}, ${vdata[vdata.length - 1][1]}, ${vdata[vdata.length - 1][2]}]}`);
console.log(`]`);
