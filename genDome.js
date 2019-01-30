const X = 0.525731112119133606;
const Z = 0.850650808352039932;
const viso = [
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
  subdivide(viso[a], viso[b], viso[c]);
  //pushUnique(viso[a], viso[b]);
  //pushUnique(viso[b], viso[c]);
  //pushUnique(viso[a], viso[c]);
});

const filteredEdges = edges.filter(([a, b]) => {
  return true;//a[1] > 0 || b[1] > 0;
});

const nLEDs = 32;
const rawdata = [];
filteredEdges.forEach(([from, to]) => {
  for (let i = 1; i < nLEDs + 1; i++) {
    rawdata.push(vMul(vLerp(from, to, 1 / (nLEDs + 1) * i), 2));
  }
});

const unique = a => {
  return a.filter(function(item, index, allItems) {
    return allItems.findIndex(element => vEqual(element, item)) === index;
  })
};

//const vdata = unique(rawdata.sort());
const vdata = rawdata;//.sort();
console.error(indices.length, edges.length, filteredEdges.length, vdata.length, rawdata.length);

console.log(`[`);
for (let i = 0; i < vdata.length - 1; i++) {
  console.log(`  {"point": [${vdata[i][0]}, ${vdata[i][1]}, ${vdata[i][2]}]},`);
}
console.log(`  {"point": [${vdata[vdata.length - 1][0]}, ${vdata[vdata.length - 1][1]}, ${vdata[vdata.length - 1][2]}]}`);
console.log(`]`);
