
var canvas;

var pw = 20;  // width of grid in number of points
var ph = 15;  // height of grid in number of points

var points = [];  // array of point objects

var edges = [];  // array of edge objects, linking pairs of points

var lines = [];  // line segments defining a polygon boundary

var ctx;

var z = 0.3;

function build(w, h) {
  // create some point objects
  for (var x=0; x<pw; x++) {
    for (var y=0; y<ph; y++) {
      var p = {
        x: x * w/pw,
        y: y * h/ph,
        gx:x,
        gy:y
      };
      points.push(p);
    }
  }

  // define edges for a regular grid
}


function indexForCoords(x,y) {
  return x * ph + y;
}


function lerpPoints(p1, p2, t) {
  return {
    x: p1.x + (p2.x-p1.x)*t,
    y: p1.y + (p2.y-p1.y)*t,
    d: p1.d + (p2.d - p1.d)*t
  };
}

// distance of c to line defined by a, b
function distanceOfPointFromLine(c, a, b) {
  var xba = b.x - a.x;
  var yca = c.y - a.y;
  var yba = b.y - a.y;
  var xca = c.x - a.x;
  var xcb = c.x - b.x;
  var ycb = c.y - b.y;
  var dab =Math.sqrt( xba*xba + yba*yba );
  var distanceFromLine = Math.abs(xba * yca - yba*xca) / dab;
  var da = Math.sqrt(xca*xca + yca*yca);
  var db = Math.sqrt(ycb*ycb + xcb*xcb);
  if (da > dab || db > dab) {
    // must be outside the line region...  so take the max of the da/db values
    return Math.max(da,db);
  }
  return distanceFromLine;
}


// top-left, top-right, bottom-left, bottom-right
function drawGyroidCell(p1,p2,p3,p4) {
  // assume z=0;
  

  // calculate a unit cell, map to target coordinates
  ctx.fillStyle = '#f00';
  var steps = 20;
  for (var x=0; x<steps; x++) {
    var xf = x / steps;
    var xf2 = xf * 2 * Math.PI;
    for (var y=0; y<steps; y++) {
      var yf = y/steps;
      var yf2 = yf * 2 * Math.PI;

      var v = Math.sin(xf2) * Math.cos(yf2) + Math.sin(yf2) * Math.cos(z) + Math.sin(z) * Math.cos(xf2);
      if (Math.abs(v) < 100) {

        

        // calc mapped location with some lerps
        var t1 = lerpPoints(p1,p2, xf);
        var t2 = lerpPoints(p3,p4, xf);
        var t3 = lerpPoints(t1,t2, yf);

        //v = 100 - v;
        var b = Math.abs(v) * 50;
        if (b> 100) b = 100;
        b = 100 - b;



        ctx.fillStyle = 'hsl(0, '+ t3.d +'%, '+ b +'%)';

        // see if t3 is still in the poly?
        // only check if one of the points is outside the poly
        var doDraw = true;
        if (!p1.inPoly || !p2.inPoly || !p3.inPoly || !p4.inPoly) {
          doDraw = isPointInPolygon(t3, lines);
        }

        if (doDraw && b > 90) {
          ctx.beginPath();
          ctx.ellipse(t3.x, t3.y, 3,3, 0, 0, 2*Math.PI);
          ctx.fill();
        }
        
      } else {

      }
    }
  } 

}


function isPointInPolygon(p, poly) {
  // from: https://www.engr.colostate.edu/~dga/documents/papers/point_in_polygon.pdf

  var w = 0;

  // for each line segment in poly, just take the p1 value as it's closed we can ignore p2 values
  var lp = {
    x: poly[0].p1.x,
    y: poly[0].p1.y
  };
  // translate lp
  lp.x -= p.x;
  lp.y -= p.y;

  for (var i =0; i<poly.length; i++) {
    var pp = { x: poly[i].p2.x, y: poly[i].p2.y };
    // translate such that p is at origin
    pp.x -= p.x;
    pp.y -= p.y;

    if (pp.y * lp.y < 0) {
      var r = lp.x + (lp.y * (pp.x - lp.x) / (lp.y - pp.y));
      if (r > 0) {
        if (lp.y < 0) {
          w++;
        } else {
          w--;
        }
      }
    } else if (lp.y == 0 && lp.x > 0) {
      if (pp.y > 0) {
        w += 0.5;
      } else {
        w -= 0.5;
      }
    } else if (pp.y == 0 && pp.x > 0) {
      if (lp.y < 0) {
        w += 0.5;
      } else {
        w -= 0.5;
      }
    }

    lp = pp;
  }

  return w != 0;
}


function redraw() {
  var w = 800;
  var h = 600;

  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.rect(0,0,w,h);
  ctx.fill();


  // draw sinusoid between grid points, warping grid as required
  for (var x=0; x<pw-1; x++) {
    for (var y=0; y<ph-1; y++) {
      var i1 = indexForCoords(x,y);
      var i2 = indexForCoords(x+1,y);
      var i3 = indexForCoords(x,y+1);
      var i4 = indexForCoords(x+1,y+1);

      // if at least one point is in the poly
      if (points[i1].inPoly || points[i2].inPoly || points[i3].inPoly || points[i4].inPoly )
        drawGyroidCell(points[i1], points[i2], points[i3], points[i4]);
    }
  }

  // draw points
  for (var i=0; i<points.length; i++) {
    var p = points[i];

    if (p.inPoly) {
      ctx.fillStyle = "#0f0";
    } else {
      ctx.fillStyle = "#f00";
    }

    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 2,2, 0, 0, 2*Math.PI);
    ctx.fill();
  }

  // draw boundary lines
  ctx.strokeStyle = '#fff';
  for (var i=0; i<lines.length; i++) {
    var line = lines[i];
    ctx.beginPath();
    ctx.moveTo(line.p1.x, line.p1.y);
    ctx.lineTo(line.p2.x, line.p2.y);
    ctx.stroke();
  }
}


// compute force of p2 relative to p1
function computeNeighbourForce(p1 ,p2, nominalLength) {
  var f = 0;
  var dx = p2.x-p1.x;
  var dy = p2.y - p1.y;
  var d=  Math.sqrt(dx*dx + dy*dy);
  var targetD = 1;

  // set targetD based on distance from edges
  //if (p1.inPoly && p2.inPoly) {
    targetD = Math.min(p1.d, p2.d) * 0.7;
    //if (targetD > 300) targetD = 300;
  //}

  targetD *= nominalLength;

  var err = Math.abs(targetD - d);

  if (!p1.inPoly) {
    //err = err / 100;
  }

  if ( d < targetD) {
    // repell
    f = -err / 10;
  } else {
    // attract
    f = err / 10;
  }

  p1.f.x += f * (p2.x - p1.x);
  p1.f.y += f * (p2.y - p1.y);
}


function distanceToNearestEdge(p, poly) {
  var dMin = 10000;
  for (var i=0; i<poly.length; i++) {
    var d = distanceOfPointFromLine(p, poly[i].p1, poly[i].p2);
    if (d < dMin) dMin = d;
  }
  return dMin;
}



function reposition() {
  // update points in polygon
  for (var i=0; i<points.length; i++) {
    var p = points[i];

    // zero current forces
    p.f = {x:0, y:0};
    p.d = 0;

    p.inPoly = isPointInPolygon(p, lines);

    //if (p.inPoly)
      p.d = distanceToNearestEdge(p, lines);
  }

  // now for each point, calculates the forces acting on it based on its neighbours
  // ignore boundary points - they are static
  for (var x=1; x<pw-1; x++) {
    for (var y=1; y<ph-1; y++) {
      var i = indexForCoords(x,y);
      var p = points[i];

      // inner points repell each other, outer points attract
      // check neighbour 4 points (grid neighbours)
      computeNeighbourForce(p, points[indexForCoords(x+1, y)], 1);
      computeNeighbourForce(p, points[indexForCoords(x-1, y)], 1);
      computeNeighbourForce(p, points[indexForCoords(x, y-1)], 1);
      computeNeighbourForce(p, points[indexForCoords(x, y+1)], 1);

      // add diagonals for better mesh shape
      //computeNeighbourForce(p, points[indexForCoords(x+1, y+1)], 1.41);
      //computeNeighbourForce(p, points[indexForCoords(x+1, y-1)], 1.41);
      //computeNeighbourForce(p, points[indexForCoords(x-1, y+1)], 1.41);
      //computeNeighbourForce(p, points[indexForCoords(x-1, y-1)], 1.41);
    }
  }

  // update point positions based on forces
  var scaler = 0.0001;
  for (var i=0; i<points.length; i++) {
    var p = points[i];

    p.x += p.f.x * scaler;
    p.y += p.f.y * scaler;
  }

}


var redrawTimer = 0;

function loop() {
  var loopTime = (new Date()).getTime();

  reposition();


  // redraw every second
  if (loopTime > redrawTimer + 1000) {
    redraw();

    redrawTimer = loopTime;
  }
  

  window.requestAnimationFrame(loop);
}

function init() {

  // setup canvas

  canvas = $('<canvas width=800 height=600></canvas>');
  $('body').append(canvas);

  ctx = canvas[0].getContext("2d");

  $('#zSlider').on('change', (e)=>{
    var val = $('#zSlider').val();
    console.log(val);
    z = val /100;
  });

  // create some connected lines
  var lx =0;
  var ly = 0; 
  var numLines = 10;
  for (var i=0; i<numLines; i++) {
    var r = 100 + Math.random() * 200;
    var x1 = 400 + r * Math.cos(2 * Math.PI * i/numLines);
    var y1 = 300 + r * Math.sin(2 * Math.PI * i/numLines);
    var p2 = {x: x1, y: y1 };
    var p1 = {x: lx ,y: ly};
    var line = {
      p1: p1,
      p2: p2
    };
    lines.push(line);
    lx = x1;
    ly = y1;
  }
  lines[0].p1 = {x:lx, y:ly};

  console.log(lines);

  build(800, 600);

  window.requestAnimationFrame(loop);

}



init();