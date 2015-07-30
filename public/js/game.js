$( document ).ready(function() {
  console.log(document.body);

var socket = io();
var container;
var turns = 0;
var camera, controls, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var originalIntersectPosition = new THREE.Vector3;

var mouseX = 0;
var mouseXOnMouseDown = 0;
var size = 500, step = 250;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rollOverMesh, rollOverMaterial;
var sphereGeo, sphereMaterial;
var dynamicBorder;

var objects = [];
var moves = createArray(4, 4, 4);
var gameMode = undefined;
//Colors
var redColor = new THREE.Color( 0xff0000 );
var greenColor = new THREE.Color( 0x00ff00 );


init();

animate();

//Find and split query string into vars
var vars = [], hash;
var q = document.URL.split('?')[1];
if(q != undefined){
    q = q.split('&');
    for(var i = 0; i < q.length; i++){
        hash = q[i].split('=');
        vars.push(hash[1]);
        vars[hash[0]] = hash[1];
    }
}
if(vars['room'] === 'hotseat'){
  gameMode = 'hotseat';
}
else if(vars['room'] !== undefined && gameMode != 'hotseat'){
  gameMode = 'randomMultiplayer';
  socket.emit('joinRoom', vars['room']);
}
socket.emit('assignplayer', vars['playerid']);

function init() {
  container = document.getElementById( 'container' );
  console.log(container);
  console.log(document.body.user);
  var x = document.getElementById("username");
  console.log(x);
  /*
  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  //info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> - voxel painter - webgl<br><strong>click</strong>: add voxel, <strong>shift + click</strong>: remove voxel';
  container.appendChild( info );
  */

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 500, 1600, 1300 );
  camera.lookAt( new THREE.Vector3() );

  controls = new THREE.OrbitControls( camera );
  controls.damping = 0.2;
  controls.addEventListener( 'change', render );

  scene = new THREE.Scene();

  // roll-over helpers

  //rollOverGeo = new THREE.BoxGeometry( 250, 250, 250 );
  rollOverGeo = new THREE.SphereGeometry( 80, 100, 100 );
  rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
  rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
  scene.add( rollOverMesh );

  // cubes

  //sphereGeo = new THREE.BoxGeometry( 250, 250, 250 );
  sphereGeo = new THREE.SphereGeometry( 80, 20, 20 );
  sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, ambient: 0xff0000, shading: THREE.SmoothShading } );
  sphereMaterial2 = new THREE.MeshPhongMaterial( { color: 0x00ff000, ambient: 0x00ff000, shading: THREE.SmoothShading } );

  // grid

  var lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );

  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 0, 1000, 0 )
  );
  var startPosX = - size + step * 0.5;
  var startPosZ = - size + step * 0.5;
  for (var i = 0; i < 4; i++) {
    for (var y = 0; y < 4; y++) {
   
    var line = new THREE.Line( geometry, lineMaterial );
    line.position.x = startPosX + i * step;
    line.position.z = startPosZ + y * step;
    scene.add(line); //TODO

    }         
  }

  var geometry = new THREE.Geometry();

  for ( var i = -size; i <= size; i += step ) {

    geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
    geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

    geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
    geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

  }


  var line = new THREE.Line( geometry, lineMaterial, THREE.LinePieces );
  scene.add( line );



  //

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
  geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  var material = new THREE.MeshBasicMaterial( { color: 0x7EC0EE } );
  plane = new THREE.Mesh( geometry, material );
  plane.visible = true;
  scene.add( plane );
  objects.push( plane ); 

  //dynamicBorder
  var geometry = new THREE.BoxGeometry( 1200, 100, 1200 );
  geometry.vertices.push( new THREE.Vector3( 550, 0, 0 ) );
  var material = new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 1, transparent: false } );
  dynamicBorder = new THREE.Mesh( geometry, material );
  dynamicBorder.position.y = -51
  scene.add( dynamicBorder );

  // Lights

  var ambientLight = new THREE.AmbientLight( 0x606060 );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xABABAB );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'keydown', onDocumentKeyDown, false );
  document.addEventListener( 'keyup', onDocumentKeyUp, false );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function positionInGrid(){


}
function onDocumentMouseDown( event ) {
  event.preventDefault();

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mouseout', onDocumentMouseOut, false );

  mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {

    var intersect = intersects[ 0 ];

    // delete cube

    if ( isShiftDown ) {

      if ( intersect.object != plane ) {

        scene.remove( intersect.object );

        objects.splice( objects.indexOf( intersect.object ), 1 );

      }

    // create cube

    } else {
      
      var heightVector = new THREE.Vector3(0,250,0);
      if(intersect.object != plane )
      {
        originalIntersectPosition.copy( intersect.point ).add( heightVector );
      }
      else
      {
        originalIntersectPosition.copy( intersect.point ).add( intersect.face.normal );
      }
      
      originalIntersectPosition.divideScalar( 250 ).floor().multiplyScalar( 250 ).addScalar( 125 );

      //socket.emit('player action', originalIntersectPosition);

    }

  }
}

function onDocumentMouseUp( event ) {
  event.preventDefault();
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  //document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mouseout', onDocumentMouseOut, false );

  mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {

    var intersect = intersects[ 0 ];

    // delete cube

    if ( isShiftDown ) {

      if ( intersect.object != plane ) {

        scene.remove( intersect.object );

        objects.splice( objects.indexOf( intersect.object ), 1 );

      }

    } else {

      var mouseUpPosVector = new THREE.Vector3;

      var heightVector = new THREE.Vector3(0,250,0);
      if(intersect.object != plane )
      {
        mouseUpPosVector.copy( intersect.point ).add( heightVector );
      }
      else
      {
        mouseUpPosVector.copy( intersect.point ).add( intersect.face.normal );
      }
      
      mouseUpPosVector.divideScalar( 250 ).floor().multiplyScalar( 250 ).addScalar( 125 );

      if (originalIntersectPosition.equals(mouseUpPosVector)){
        if(gameMode === 'hotseat'){
          hotSeatPlayerAction(mouseUpPosVector);
          console.log('hotseatRoom');
          return;
        }
        socket.emit('player action', mouseUpPosVector, turns % 2);
        console.log('player action?');
      }
    }
  }
}

function onDocumentMouseMove( event ) {
  event.preventDefault();

  mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {

    var intersect = intersects[ 0 ];


    var heightVector = new THREE.Vector3( 0, 170, 0);
      if(intersect.object != plane )
      {
        rollOverMesh.position.copy( intersect.point ).add( heightVector );
      }
      else
      {
        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
      }

    rollOverMesh.position.divideScalar( 250 ).floor().multiplyScalar( 250 ).addScalar( 125 );
  }
}

function onDocumentMouseOut( event ) {


}

function onDocumentTouchStart( event ) {
  if ( event.touches.length === 1 ) {

    event.preventDefault();

  }

}

function onDocumentTouchMove( event ) {

  if ( event.touches.length === 1 ) {

    event.preventDefault();

  }

}


function onDocumentKeyDown( event ) {

  switch( event.keyCode ) {

    case 16: isShiftDown = true; 

    break;

  }

}

function onDocumentKeyUp( event ) {

  switch ( event.keyCode ) {

    case 16: isShiftDown = false; break;

  }

}

function animate() {
  
  requestAnimationFrame( animate );
  controls.update();
  render();

}

function render() {
  
  renderer.render( scene, camera );
  TWEEN.update();

}

function setupMap(){

}

socket.on('match', function(msg){
  console.log('waow2');
});
socket.on('winner', function(msg){
  console.log('winner %s', msg);
  win(msg[0], msg[1]);
});
$('form').submit(function(){
socket.emit('chat message', $('#m').val());
$('#m').val('');
return false;
});
socket.on('chat message', function(msg){
$('#messages').append($('<li>').text(msg));
});
socket.on('connection', function(msg){
$('#messages').append($('<li>').text('connection'));
});
socket.on('player action', function(msg){

  //moves[(msg.x+375)/step][(msg.y-125)/step][(msg.y-125)/step,((msg.z-375)/step)*-1] = turns % 2;
  //Checking for win conditions as well as legal moves
  if(winCheck(msg.x, msg.y, msg.z, (turns % 2)) === false){
    return; //TODO: Bättre
  }

  var sphere;
  turns++;
  if (turns % 2 == 0)
  {
    sphere = new THREE.Mesh( sphereGeo, sphereMaterial );
    borderColorTween(greenColor);
  }
  else
  {
    sphere = new THREE.Mesh( sphereGeo, sphereMaterial2 );
    borderColorTween(redColor);
  }
  
  msg.y = heightPositionModifier(msg.y);

  sphere.position.x = msg.x;
  sphere.position.y = msg.y;
  sphere.position.z = msg.z;
        
  var orgAniPos = { x : msg.x, y : msg.y + 1000, z : msg.z};
  var tween = new TWEEN.Tween(orgAniPos).to(msg);
  tween.easing(TWEEN.Easing.Bounce.Out);
  tween.start();
  scene.add( sphere );
  objects.push( sphere );
  tween.onUpdate(function(){
    sphere.position.x = orgAniPos.x;
    sphere.position.y = orgAniPos.y;
    sphere.position.z = orgAniPos.z;
  });
});

function hotSeatPlayerAction(msg){
    //moves[(msg.x+375)/step][(msg.y-125)/step][(msg.y-125)/step,((msg.z-375)/step)*-1] = turns % 2;
  //Checking for win conditions as well as legal moves
  if(winCheck(msg.x, msg.y, msg.z, (turns % 2)) === false){
    return; //TODO: Bättre
  }

  var sphere;
  turns++;
  if (turns % 2 == 0)
  {
    sphere = new THREE.Mesh( sphereGeo, sphereMaterial );
    //Animating border color
    borderColorTween(greenColor);
  }
  else
  {
    sphere = new THREE.Mesh( sphereGeo, sphereMaterial2 );
    borderColorTween(redColor);
  }
  
  
  console.log(sphere.position.y);

  msg.y = heightPositionModifier(msg.y);
  
  var orgAniPos = { x : msg.x, y : msg.y + 1000, z : msg.z };
  sphere.position.x = orgAniPos.x;
  sphere.position.y = orgAniPos.y;
  sphere.position.z = orgAniPos.z;

  var tween = new TWEEN.Tween(orgAniPos).to(msg);
  tween.easing(TWEEN.Easing.Bounce.Out);
  tween.start();
  scene.add( sphere );
  objects.push( sphere );
  tween.onUpdate(function(){
    sphere.position.x = orgAniPos.x;
    sphere.position.y = orgAniPos.y;
    sphere.position.z = orgAniPos.z;
  });
}

function winCheck(x, y, z, player) {
//console.log("test %s %s %s %s", x, y, z, player);
//screen simplefied board coordinates
var normX = (x + 375) / step;
var normY = (y - 125) / step;
var normZ = ((z - 375) / step) * -1;
//Insert player number into board corresponding coordinates.
console.log("test x: %s y :%s  z: %s spelarNummer %s ", normX, normY, normZ, player);
if(moves[normX][normY][normZ] !== undefined){
  //illegal move TODO: Bättre
  return false;
}
moves[normX][normY][normZ] = player;

socket.emit('win check', normX, normY, normZ, player, moves);

return true;
}


function win(player, winningpcs){
if(winningpcs){
  //take first and last position to draw a line. 

  var startpos = denormalizePosition(winningpcs[0]);
  var finalpos = denormalizePosition(winningpcs[3]);
  startpos.y = heightPositionModifier(startpos.y);
  finalpos.y = heightPositionModifier(finalpos.y);
  var material = new THREE.LineBasicMaterial({
    color: 0xffffff
  });

  //create line and animate from white to gold.
  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( startpos.x, startpos.y, startpos.z),
     new THREE.Vector3( finalpos.x, finalpos.y, finalpos.z));

  var line = new THREE.Line( geometry, material );
  var aniColor = new THREE.Color( "rgb(255,215,0)" );
  var tween2 = new TWEEN.Tween(line.material.color).to(aniColor);
  tween2.easing(TWEEN.Easing.Elastic.InOut);
  tween2.yoyo(true);
  tween2.repeat( Infinity );
  tween2.delay( 1000 );
  tween2.start();

  scene.add( line );
  }
alert("Player %s won!", player);
}

function heightPositionModifier(positionY){
    var positionMod = parseInt(positionY / 250);
    console.log(positionMod);
    for (var i = 4 - positionMod; i < 4 ; i++) {
      positionY -= 80;
    }
    return positionY
  };
//Helper functions

function createArray(length) {
var arr = new Array(length || 0),
    i = length;

if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while(i--) arr[length-1 - i] = createArray.apply(this, args);
  }
  return arr;
}

function borderColorTween(color){
  var tween2 = new TWEEN.Tween(dynamicBorder.material.color).to(color);
    tween2.easing(TWEEN.Easing.Quadratic.Out);
    tween2.start();
};

function denormalizePosition(position){
  position.x = (position.x * step) - 375; 
  position.y = (position.y * step) + 125;
  position.z = ((position.z * step) - 375) * -1;
  return position;
};

});
