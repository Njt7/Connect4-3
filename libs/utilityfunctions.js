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