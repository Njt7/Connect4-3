//helper functions
var THREE = require('three');

exports.createArray = function(length) {
  var arr = new Array(length || 0),
    i = length;

	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while(i--) arr[length-1 - i] = this.createArray.apply(this, args);
	}
	return arr;
};
    
exports.screenToBoardPosition = function(screenPosition) {
  var stepSize = 250;
  
  return new THREE.Vector3((screenPosition.x + 375) / stepSize,
  					   (screenPosition.y - 125) / stepSize,
  					   ((screenPosition.z -375) /stepSize) * -1);
};

exports.create1DArrayFrom3D = function(ThreeDArray) {
  console.log('ThreeDArray');
  console.log(ThreeDArray);
  var OneDArray = new Array(64);
  for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      for (var z = 0; z < 4; z++) {
        OneDArray[get1DIndex(x, y, z)] = ThreeDArray[x][y][z];
        //console.log('1DArrayIndex: %s x: %s y: %s z: %s', index, x, y, z);
      };
    };
  };
  return OneDArray;
};

exports.create3DArrayFrom1D = function(OneDArray) {

  var ThreeDArray = this.createArray(4, 4, 4);
  var index = 0;
  for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      for (var z = 0; z < 4; z++) {
        ThreeDArray[x][y][z] = OneDArray[index];
        index++;
      };
    };
  };
  console.log(ThreeDArray);
  return ThreeDArray;
};

function get1DIndex(x, y, z){
//Flat[x + WIDTH * (y + DEPTH * z)] = Original[x, y, z]
  return x * 4 * 4 + y * 4 + z;
};