$( document ).ready(function() {

'use strict;'
  //console.log(document.body);
  //todo localmatch.turns
//Lets try these colors
/*
#7EC0EE //blue
#E47EEE //purple
#EEAC7E //orange/brownish
#88EE7E //green

*/

var isMobile = false; //initiate as false

// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

console.log('Mobile device? %s', isMobile);

var socket = io();

var container;
var turns = 0;
var camera, controls, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;
var touchPoint;
var touchMoved = false;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var originalIntersectPosition = new THREE.Vector3;
var skyBox;

var mouseX = 0;
var mouseXOnMouseDown = 0;
var size = 500, step = 250;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rollOverMesh, rollOverMaterial;
var sphereGeo, sphereMaterial, sphereMaterial2;
var latestMoveMesh;
var dynamicBorder;

var movesFromPreviousSession;
var gameMode = undefined;

//Colors
var redColor = new THREE.Color( 0xE47EEE );
var greenColor = new THREE.Color( 0x88EE7E );
var blueColor = new THREE.Color( 0x7EC0EE );
var orangeColor = new THREE.Color( 0xEEAC7E );

var objects = [];

//Create and initliazes a number array where -1 is a unused space and 0 and 1 is player moves.
var moves = createArray(4, 4, 4);
 for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      for (var z = 0; z < 4; z++) {
        moves[x][y][z] = -1;
      };
    };
  };

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
  if(typeof localMatch != 'undefined'){
    //console.log('Did I get to localmatch game');
    socket.emit('joinRoom', vars['room'], localMatch._id, moves);
  }
  else{
    //console.log('Did I get to ELSE');
    socket.emit('joinRoom', vars['room']);
  }
}
socket.emit('assignplayer', vars['playerid'], vars['room'], vars['playerunique']);

function init() {
  container = document.getElementById( 'container' );
  //console.log(container);
  /*
  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  //info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> - voxel painter - webgl<br><strong>click</strong>: add voxel, <strong>shift + click</strong>: remove voxel';
  container.appendChild( info );
  */

  //Textures

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 500, 1600, 1300 );
  camera.lookAt( new THREE.Vector3() );

  controls = new THREE.OrbitControls( camera );
  controls.damping = 0.2;
  controls.addEventListener( 'change', render );

  scene = new THREE.Scene();

  //Testing skysphere
  
  geometry = new THREE.SphereGeometry(3000, 60, 40);  
  var uniforms = {  
    texture: { type: 't', value: THREE.ImageUtils.loadTexture('/textures/orion_nebula_4_by_eeitam1024x512.png') }
  };

  var material = new THREE.ShaderMaterial( {  
    uniforms:       uniforms,
    vertexShader:   document.getElementById('sky-vertex').textContent,
    fragmentShader: document.getElementById('sky-fragment').textContent
  });

  skyBox = new THREE.Mesh(geometry, material);  
  skyBox.scale.set(-1, 1, 1);  
  skyBox.rotation.order = 'XZY';  
  skyBox.renderDepth = 1000.0;  
  scene.add(skyBox);  

  // roll-over helpers

  //rollOverGeo = new THREE.BoxGeometry( 250, 250, 250 );
  rollOverGeo = new THREE.SphereGeometry( 80, 100, 100 );
  rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.5, transparent: true } );
  rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
  rollOverMesh.position.y = 3000;
  scene.add( rollOverMesh );

  //Most recent move visualizer mesh.
  var latestMoveGeo = new THREE.SphereGeometry( 90, 100, 100 );
  var latestMoveMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.45, transparent: true } );
  latestMoveMesh = new THREE.Mesh( latestMoveGeo, latestMoveMaterial );
  latestMoveMesh.position.y = 4000;
  scene.add( latestMoveMesh );

  // cubes

  /*
  var texture = THREE.ImageUtils.loadTexture( "/textures/pattern-truchet.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 1, 1 );
   --Texture mapping test-- sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, ambient: 0xff0000, map: texture, shading: THREE.SmoothShading } );
  */
  //sphereGeo = new THREE.BoxGeometry( 250, 250, 250 );
  sphereGeo = new THREE.SphereGeometry( 80, 20, 20 );
  sphereMaterial = new THREE.MeshPhongMaterial( { color: redColor, ambient: redColor, shading: THREE.SmoothShading } );
  sphereMaterial2 = new THREE.MeshPhongMaterial( { color: greenColor, ambient: greenColor, shading: THREE.SmoothShading } );

  // grid

  //"height sticks"
  var lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true, linewidth: 10  } );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 0, 750, 0 )
  );
  var startPosX = - size + step * 0.5;
  var startPosZ = - size + step * 0.5;
  for (var i = 0; i < 4; i++) {
    for (var y = 0; y < 4; y++) {
   
    var line = new THREE.Line( geometry, lineMaterial );
    line.position.x = startPosX + i * step;
    line.position.z = startPosZ + y * step;
    scene.add(line);

    }         
  }

  var geometry = new THREE.Geometry();

  for ( var i = -size; i <= size; i += step ) {

    geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
    geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

    geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
    geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

  }

  var lineMaterial2 = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true, lineWidth: 10  } );
  var line = new THREE.Line( geometry, lineMaterial2, THREE.LinePieces );
  scene.add( line );



  //

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  touchPoint = new THREE.Vector2();

  for (var i = 0; i < 16; i++) {
    var intersectPlane;
    var quickPositionFix = new THREE.Vector3();
    quickPositionFix.x = i % 4;
    quickPositionFix.z = parseInt(i / 4);
    
    quickPositionFix = denormalizePosition(quickPositionFix); 
    var geometry = new THREE.PlaneBufferGeometry( 250, 250 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    var material = new THREE.MeshBasicMaterial( { color: 0x7EC0EE } );
    intersectPlane = new THREE.Mesh( geometry, material );
    intersectPlane.position.x = quickPositionFix.x;
    intersectPlane.position.z = quickPositionFix.z;
    intersectPlane.position.y = 0;
    intersectPlane.visible = true;
    scene.add( intersectPlane );
    objects.push( intersectPlane ); 
  };

  /*
  var geometry = new THREE.PlaneBufferGeometry( 250, 250 );
  geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  var material = new THREE.MeshBasicMaterial( { color: 0x7EC0EE } );
  plane = new THREE.Mesh( geometry, material );
  plane.visible = true;
  scene.add( plane );
  objects.push( plane ); 
  */
  
  //dynamicBorder
  var geometry = new THREE.BoxGeometry( 1200, 100, 1200 );
  geometry.vertices.push( new THREE.Vector3( 550, 0, 0 ) );
  var material = new THREE.MeshLambertMaterial( { color: greenColor, opacity: 1, transparent: false } );
  dynamicBorder = new THREE.Mesh( geometry, material );
  dynamicBorder.position.y = -51
  scene.add( dynamicBorder );

  // Lights

  //TODO Fix so that it doesnt break anything else
  //TODO HERE we can initialize a unfinished game for real with localMatch.moves;
  if(typeof localMatch != 'undefined'){
    //console.log('localMatch.playerOneId: ' + localMatch.playerOneId);
    //console.log('localMatch.moves: ' + localMatch.moves);
    //console.log('localMatch.turns: ' + localMatch.turns);
    movesFromPreviousSession = create3DArrayFrom1D(localMatch.moves);
    setupUnfinishedGame(movesFromPreviousSession);
    //turns = localMatch.turns;
    //TODO se till att db.moves är
    //moves = localMatch.moves;
  }

  var ambientLight = new THREE.AmbientLight( 0x606060 );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set( -1, 0.75, 0.0 ).normalize();
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xABABAB );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  document.addEventListener( 'touchend', onDocumentTouchEnd, false );
  

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

function onDocumentTouchStart( event ) {

  if ( event.touches.length === 1 ) {
      console.log('touchStart');
    event.preventDefault();
    touchMoved = false;

    touchPoint.set( ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1, - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1 );
    console.log(touchPoint);

    raycaster.setFromCamera( touchPoint, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      var coords = screenToBoardCoords(intersect.object.position);
      var positionToDrawAndCoords = intersectToDesiredPosition(intersect.object.position, coords);
     
      rollOverMesh.position.copy( positionToDrawAndCoords[0] );

      originalIntersectPosition.copy( intersect.point );

    }
  }
}

function onDocumentTouchMove( event ) {
  console.log('touchMove');
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    
    touchMoved = true;
  }
}

function onDocumentTouchEnd( event ) {

  event.preventDefault();
  if (touchMoved === true){
    return;
  }
  else{
    console.log(touchPoint);
    raycaster.setFromCamera( touchPoint, camera );
    var intersects = raycaster.intersectObjects( objects );
    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];

      var coords = screenToBoardCoords(intersect.object.position);
  
      if (originalIntersectPosition.equals(intersect.point)){
        if(gameMode === 'hotseat'){
          var positionToDrawAndCoords = intersectToDesiredPosition(intersect.object.position, coords);
          hotSeatPlayerAction(positionToDrawAndCoords[0], positionToDrawAndCoords[1]);
          console.log('hotseatRoom');
          return;
        }
        else{
          var positionToDrawAndCoords = intersectToDesiredPosition(intersect.object.position, coords);
          console.log(positionToDrawAndCoords[0]);
          socket.emit('player action', positionToDrawAndCoords[0], positionToDrawAndCoords[1], turns % 2);
          console.log('player action?');
        }
      }
    }
  }
  
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

    var coords = screenToBoardCoords(intersect.object.position);
    var positionToDrawAndCoords = intersectToDesiredPosition(intersect.object.position, coords);
   
    rollOverMesh.position.copy( positionToDrawAndCoords[0] );

    originalIntersectPosition.copy( intersect.point );
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
  if(isMobile){
    rollOverMesh.position.y = 3000;
  }
  if ( intersects.length > 0 ) {

    var intersect = intersects[ 0 ];

    var coords = screenToBoardCoords(intersect.object.position);
    
    if (originalIntersectPosition.equals(intersect.point)){
      if(gameMode === 'hotseat'){
        var positionToDrawAndCoords = intersectToDesiredPosition(intersect.object.position, coords);
        hotSeatPlayerAction(positionToDrawAndCoords[0], positionToDrawAndCoords[1]);
        console.log('hotseatRoom');
        return;
      }
      else{
        var positionToDrawAndCoords = intersectToDesiredPosition(intersect.object.position, coords);
        console.log(positionToDrawAndCoords[0]);
        socket.emit('player action', positionToDrawAndCoords[0], positionToDrawAndCoords[1], turns % 2);
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
  if(isMobile){
    //Need workaround to work for all browsers
     rollOverMesh.position.y = 3000;
  }
  else{
    if ( intersects.length > 0 ) {

      var intersect = intersects[ 0 ];
      /*
      var myTestPoint = screenToBoardCoords(intersect.object.position);
      console.log('X: %s Y:%s Z:%s', myTestPoint.x, myTestPoint.y, myTestPoint.z);
      */
      var coords = screenToBoardCoords(intersect.object.position);
      var positionToDrawAndCoords = intersectToDesiredPosition(intersect.object.position, coords);

     
      rollOverMesh.position.copy( positionToDrawAndCoords[0] );

    }
  }
}

function intersectToDesiredPosition(intersectPosition, coords){
  var desiredPosition = new THREE.Vector3();
  desiredPosition.copy(intersectPosition);
  var boardY = -1
 
  for (var i = 0; i < 4; i++) {
    if( moves[coords.x][i][coords.z] === -1){
       switch (i) {
        case 0:
            desiredPosition.y = 125;
            boardY = 0;
            break;
        case 1:
            desiredPosition.y = 295;
            boardY = 1;
            break;
        case 2:
            desiredPosition.y = 465;
            boardY = 2;
            break;
        case 3:
            desiredPosition.y = 635
            boardY = 3;
            break;
        default:
          console.log('Something didnt work in intersectToDesiredPosition func');
          break;
      }
      break;
    }
  };
  //console.log('Moves on boardY' +moves[coords.x][boardY][coords.z]);

  return [desiredPosition, new THREE.Vector3(coords.x, boardY, coords.z)];
};


function onDocumentMouseOut( event ) {


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
  //console.log('waow2');
  //waow
});

socket.on('winner', function(msg){
  //console.log('winner %s', msg[0]);
  win(msg[0], msg[1]);
});

socket.on('player action', function(receivedPosition, coords){

  //moves[(msg.x+375)/step][(msg.y-125)/step][(msg.y-125)/step,((msg.z-375)/step)*-1] = turns % 2;
  //Checking for win conditions as well as legal moves
  var passCoordsOn = new THREE.Vector3(coords.x, coords.y, coords.z);
  console.log(coords);
  //Checking for win conditions as well as legal moves
  if(boardCheck(receivedPosition.x, receivedPosition.y, receivedPosition.z, passCoordsOn, (turns % 2)) === false ){
    return; //TODO: A check that cant be circumvented as well as looks if its possible to place a piece there.
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
  
  //receivedPosition.y = heightPositionModifier(receivedPosition.y);

  sphere.position.x = receivedPosition.x;
  sphere.position.y = receivedPosition.y;
  sphere.position.z = receivedPosition.z;
  
  var orgAniPos = { x : receivedPosition.x, y : receivedPosition.y + 1000, z : receivedPosition.z};
  var tween = new TWEEN.Tween(orgAniPos).to(receivedPosition);
  tween.easing(TWEEN.Easing.Bounce.Out);
  tween.start();
  scene.add( sphere );
  objects.push( sphere );
  tween.onUpdate(function(){
    sphere.position.x = orgAniPos.x;
    sphere.position.y = orgAniPos.y;
    sphere.position.z = orgAniPos.z;
  });

  //Most recent move visualiser.
  latestMoveMesh.position.copy(receivedPosition);
});

function hotSeatPlayerAction(msg, coords){
  console.log(coords);
  var passCoordsOn = new THREE.Vector3(coords.x, coords.y, coords.z);
  //Checking for win conditions as well as legal moves
  if(boardCheck(msg.x, msg.y, msg.z, passCoordsOn, (turns % 2)) === false ){
    return; //TODO: A check that cant be circumvented as well as looks if its possible to place a piece there.
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
  
  //msg.y = heightPositionModifier(msg.y);

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

  //Most recent move visualizer.
  latestMoveMesh.position.copy(msg);
}

function boardCheck(x, y, z, coords, player ) {
  //TODO det är här som du ska fixa wincheck för oinloggade spelare!
  //console.log("test %s %s %s %s", x, y, z, player);
  //screen simplefied board coordinates

  if(moves[coords.x][coords.y][coords.z] >= 0){
    //illegal move TODO: Bättre
    return false;
  }
  moves[coords.x][coords.y][coords.z] = player;

  socket.emit('win check', coords.x, coords.y, coords.z, player, moves);

  return true;
}

function win(player, winningpcs){
  //TODO player behöver översättas ifrån 0, 1 till username
  if(winningpcs){
    //take first and last position to draw a line. 

    var startpos = denormalizePosition(winningpcs[0]);
    denormalizePosition(winningpcs[1]);
    denormalizePosition(winningpcs[2]);
    var finalpos = denormalizePosition(winningpcs[3]);
    var material = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    
    //Fix coolare win
    latestMoveMesh.position.y = 4000;
    var winGeo = new THREE.SphereGeometry( 90, 100, 100 );
    var winMaterial;
    if(player === 0){
      winMaterial = new THREE.MeshBasicMaterial( { color: greenColor, opacity: 0.80, transparent: true } );
    }
    else{
     winMaterial = new THREE.MeshBasicMaterial( { color: redColor, opacity: 0.80, transparent: true } ); 
    }
    for (var i = 0; i < 4; i++) {
      var sphere;
      sphere = new THREE.Mesh( winGeo, winMaterial );
      sphere.position.copy(winningpcs[i]);
      scene.add( sphere );        
    }
    

  var intersects = raycaster.intersectObjects( objects );

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
    if(typeof localMatch != 'undefined'){
      //TODO
      //if player === localMatch.user.username
      // else 
      // localMatch.db.match.username....
      //Fix so that the correct username is shown on winner
      if(player === 0){
        alert( localMatch.playerOneId + ' won! Congratulations');
      }
      else if(player === 1)
      {
        alert( localMatch.playerTwoId + ' won! Congratulations');
      }
    }
    else{
      if(player === 0){
        alert('Green player is a winner!');
      }
      else if(player === 1)
      {
       alert('Purple player is a winner!');
      }
    }
}

function heightPositionModifier(positionY){
    var positionMod = parseInt(positionY / 250);
    for (var i = 4 - positionMod; i < 4 ; i++) {
      positionY -= 0;
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
  position.y = (position.y * 170) + 125;
  position.z = ((position.z * step) - 375) * -1;
  return position;
};

function screenToBoardCoords(position){
  var retPos = new THREE.Vector3();
  retPos.x = (position.x + 375) / step;
  if(position.y === 0){
    retPos.y = 0
  }
  else{
    retPos.y = (position.y - 125) / step;
  }
  retPos.z = ((position.z - 375) / step) * -1;
  return retPos;
};

function create3DArrayFrom1D(OneDArray) {
  var ThreeDArray = createArray(4, 4, 4);
  var index = 0;
  for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      for (var z = 0; z < 4; z++) {
        console.log('x: %s y: %s z %s value: %s' , x, y, z, OneDArray[index]);
        ThreeDArray[x][y][z] = OneDArray[index];
        index++;
      };
    };
  };
  return ThreeDArray;
};

function setupUnfinishedGame(previousMoves){
// previousMoves is a 3d array of moves
  moves = previousMoves;
  for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      for (var z = 0; z < 4; z++) {
        var sphere;
        if(previousMoves[x][y][z] >= 0){
          var dePosition = new THREE.Vector3();
          dePosition.x = x;
          dePosition.y = y;
          dePosition.z = z;
          dePosition = denormalizePosition(dePosition);
          if(previousMoves[x][y][z] === 0){
            sphere = new THREE.Mesh( sphereGeo, sphereMaterial2 );
          }
          else if(previousMoves[x][y][z] === 1){
            sphere = new THREE.Mesh( sphereGeo, sphereMaterial );
          }
          sphere.position.copy(dePosition);
          scene.add( sphere );
          objects.push( sphere );
          }
      };
    };
  };
};


function get1DIndex(x, y, z){
  //Flat[x + WIDTH * (y + DEPTH * z)] = Original[x, y, z]
  return x * 4 * 4 + y * 4 + z;
};

});
