var THREE = require('three');
var winCheckResult;

module.exports.checkAll = function (x, y, z, player, moves){
  console.log("player %s",player);
  console.log(moves);
  winCheckResult = [];
  checkVertical(x, z, player, moves);
  checkHorizontal(y, z, player, moves);
  checkDepth(x, y, player, moves);
  checkRightSimpleDiagonal(y, player, moves);
  checkLeftSimpleDiagonal(y, player, moves);
  checkIncrementalXDiagonal(x, player, moves);
  checkDecrementalXDiagonal(x, player, moves);
  checkIncrementalZDiagonal(z, player, moves);
  checkDecrementalZDiagonal(z, player, moves);
  checkDecrementalXCrossDiagonal(x, player, moves);
  checkIncrementalXCrossDiagonal(x, player, moves);
  checkDecrementalZCrossDiagonal(z, player, moves);
  checkIncrementalYCrossDiagonal(y, player, moves);
  if (winCheckResult.length > 1) {
    return winCheckResult;
  }
  else{
    return false;
  }  
}

function win(player, winningPieces)
{
  winCheckResult.push(player);
  winCheckResult.push(winningPieces);
  console.log('We have a winner! wincheck.js');
  return player, winningPieces;
}

function checkVertical(x, z, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[x][i][z] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = x;
            aVector.y = i;
            aVector.z = z;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {

              return win(player, winCounter);
            }
          } 
      }
    }

    function checkHorizontal(y, z, player, moves){
      //Check y axis
      console.log(y, z);
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[i][y][z] !== player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = i;
            aVector.y = y;
            aVector.z = z;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkDepth(x, y, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[x][y][i] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = x;
            aVector.y = y;
            aVector.z = i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkRightSimpleDiagonal(y, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[i][y][i] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = i;
            aVector.y = y;
            aVector.z = i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkLeftSimpleDiagonal(y, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[3-i][y][i] != player){
          return false; 
          }
          else
            var aVector = new THREE.Vector3;
            aVector.x = 3-i;
            aVector.y = y;
            aVector.z = i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
    }

    function checkIncrementalXDiagonal(x, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[x][i][i] != player){
          return false; 
          }
          var aVector = new THREE.Vector3;
            aVector.x = x;
            aVector.y = i;
            aVector.z = i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          }
    }
    
    
    function checkDecrementalXDiagonal(x, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[x][i][3-i] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = x;
            aVector.y = i;
            aVector.z = 3-i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkIncrementalZDiagonal(z, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[i][i][z] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = i;
            aVector.y = i;
            aVector.z = z;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkDecrementalZDiagonal(z, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[3-i][i][z] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = 3-i;
            aVector.y = i;
            aVector.z = z;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkDecrementalXCrossDiagonal(x, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[3-i][i][i] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = 3-i;
            aVector.y = i;
            aVector.z = i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkIncrementalXCrossDiagonal(x, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[i][i][i] != player){
          return false; 
          }
          else
          {
          var aVector = new THREE.Vector3;
            aVector.x = i;
            aVector.y = i;
            aVector.z = i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkDecrementalZCrossDiagonal(z, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[i][i][3-i] != player){
          return false; 
          }
          else
          {  
            var aVector = new THREE.Vector3;
            aVector.x = i;
            aVector.y = i;
            aVector.z = 3-i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }

    function checkIncrementalYCrossDiagonal(y, player, moves){
      //Check y axis
      var winCounter = [];
      for(var i = 0; i < 4; i++){
        if(moves[3-i][i][3-i] != player){
          return false; 
          }
          else
          {
            var aVector = new THREE.Vector3;
            aVector.x = 3-i;
            aVector.y = i;
            aVector.z = 3-i;

            winCounter[i] = aVector;
            if (winCounter.length === 4)
            {
              win(player, winCounter);
            }
          } 
      }
    }