//game states code is here
var STATE_SPLASH = 0;
var STATE_PLAY = 1;
var STATE_YOUDIE = 2;
var STATE_LvWIN = 3;
//var STATE_MENU = 4;		for later
var gameState = STATE_SPLASH;

var bullets = [];
var enemies = [];
var cells = [];		// the array that holds our simplified collision data

var score = 0;
var lives = 1;
var heartImage = document.createElement("img")
heartImage.src = "heartImage.png";
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;


// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load an image to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

var LAYER_HELP = 4;
var LAYER_DEATH = 3;
var LAYER_ENEMY = 2;
var LAYER_BACKGROUND = 1;
var LAYER_PLATFORMS = 0;
var LAYER_COUNT = 5; 		//the number of layers in your map
//var LAYER_TRIGGERS = 5;

var MAP = { tw: 120, th: 15}; //equalled to the pixel height & pixel width of your map; use "resize map" to view its size
var TILE = 35; //the width & height of 1 tile (in pixels); your tiles should be square
var TILESET_TILE = TILE * 2; //because images are twice as big as the grid of our map
var TILESET_PADDING = 2; //how many pixels between the image border & the tile images in the tilemap - I'm not too sure what this means...
var TILESET_SPACING = 2; //how many pixels between the tile images & the tilemap
var TILESET_COUNT_X = 14; //how many columns of tile images are in the tileset
var TILESET_COUNT_Y = 14; //how many rows of tile images are in the tileset

var tileset = document.createElement("img");
	tileset.src = "tileset.png";

var METRE = TILE;		//abitrary choice for 1 metre
var GRAVITY = METRE * 9.8 * 6;		//very exaggerated gravity (x6)
var MAXDX = METRE * 10;				//max horizontal speed (10 tiles per second)
var MAXDY = METRE * 20;				//max vertical speed (15 tiles per second)
var ACCEL = MAXDX * 2;				//horizontal acceleration - take 1/2 second to reach "MAXDX"
var FRICTION = MAXDX * 6;			//horizontal friction - take 1/6 second to stop from "MAXDX"
var JUMP = METRE * 1500;			//(a large) instantaneous jump impulse

var ENEMY_MAXDX = METRE * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

var player = new Player();
var keyboard = new Keyboard();

var musicBackground;
var sfxFire;

var worldOffsetX = 0;

var splashTimer = 3;
function runSplash()
{
	splashTimer -= deltaTime;

	if (splashTimer <= 0)
	{
		gameState = STATE_PLAY;		//change to "state_menu" later
		return;
	}
	/*else
	{
		console.log("START GAME IN... " + splashTimer);
	}*/
	
	context.fillStyle = "#000";
	context.font = "24px Arial";
	context.fillText("CHUCK NORRIS in...", SCREEN_HEIGHT / 2 - 100, SCREEN_WIDTH / 2 - 100);
	context.fillText("MUSCULAR CARNAGE!!!", SCREEN_HEIGHT / 2, SCREEN_WIDTH / 2);

/*	if (splashTimer = 2)
	{
		console.log("READY...");
	}
	else if (splashTimer = 1)
	{
		console.log("SET...");
	}
	else if (splashTimer = 0.5)
	{
		console.log("GO!!!");
	}
*/	
}

function runGame()
{
	draw_Map();
	
if (player.isDead == false)
	{
	player.draw();
	player.update(deltaTime);
	}
else if (player.isDead == true)
	{
		gameState = STATE_YOUDIE
		return;
	}

enemyStuff();
bulletStuff();
hudStuff();
frameStuff();

console.log(player.isDead);
}

function runGameover()
{	
	context.fillStyle = "#000";
	context.font="24px Arial";
	context.fillText("Game Over Dude", SCREEN_WIDTH / 2 - 50, SCREEN_HEIGHT / 2);
	context.fillText("Your score was... "+ score + "%", SCREEN_WIDTH / 2 - 50, SCREEN_HEIGHT / 2 + 50);
}

function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
if(y2 + h2 < y1 ||
x2 + w2 < x1 ||
x2 > x1 + w1 ||
y2 > y1 + h1)
{
	return false;
}
return true;
}

function initialize()
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
	{				// initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++)
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++)
			{
				if(level1.layers[layerIdx].data[idx] != 0)
				{
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
			else if(cells[layerIdx][y][x] != 1)
			{
				// if we haven't set this cell's value, then set it to 0 now
				cells[layerIdx][y][x] = 0;
			}
		idx++;
			}
		}
	}

/*cells[LAYER_TRIGGERS] = [];						//code for LAYER_TRIGGERS
var idx = 0;
for (var y = 0; y < level1.layers[LAYER_TRIGGERS].height; y++)
	{
	cells[LAYER_TRIGGERS][y] = [];
	for (var x = 0; x < level1.layers[LAYER_TRIGGERS].width; x++)
		{
		if (Level1.layers[LAYER_TRIGGERS].data[idx] != 0)
			{
				cells[LAYER_TRIGGERS][y][x] = 1;
				cells[LAYER_TRIGGERS][y-1][x] = 1;
				cells[LAYER_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_TRIGGERS][y][x+1] = 1;
			}
		else if (cells[LAYER_TRIGGERS][y][x] != 1)
			{
				cells[LAYER_TRIGGERS][y][x] = 0;			//setting value to 0 if haven't done so before now
			}
		idx++;
		}
	}
*/

idx = 0;			//adds enemies
for (var y = 0; y < level1.layers[LAYER_ENEMY].height; y++)
	{
	for (var x = 0; x < level1.layers[LAYER_ENEMY].width; x++)
		{
		if (level1.layers[LAYER_ENEMY].data[idx] != 0)
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
		idx++;
		}
	}
	
		/*for (var x = 0; x < level1.layers[LAYER_ENEMY].width; x++)
		{
			for (var y = 0; y < level1.layers[LAYER_ENEMY].height; y++)
			{
				if (level1.layers[LAYER_ENEMY].data[idx] != 0)
				{
					var enemy = new Enemy ();
					enemy.position.set(tileToPixel(x),tileToPixel(y));
					enemies.push (enemy);
				}
			}
		}*/
				
musicBackground = new Howl(
	{
		urls: ["background.ogg"],
		loop: true,
		buffer: true,
		volume: 0.5
	} );
musicBackground.play();

sfxFire = new Howl(
	{
		urls: ["fireEffect.ogg"],
		buffer: true,
		volume: 1,
		onend: function()
		{
			isSfxPlaying = false;
		}
	});
}

function cellAtPixelCoord(layer, x,y)
{
if(x<0 || x>SCREEN_WIDTH || y<0)
	return 1;				//let the player drop off the bottom of the screen (which means DEATH)
if(y>SCREEN_HEIGHT)
	return 0;
return cellAtTileCoord(layer, p2t(x), p2t(y));
}

function cellAtTileCoord(layer, tx,ty)
{
if (tx<0 || tx>=MAP.tw || ty<0)
	return 1;				//let the player drop off the bottom of screen (more death! (rather same death))
if(ty>=MAP.th)
	return 0;
return cells[layer][ty][tx];

}

function tileToPixel(tile)
{
return tile * TILE;
}

function pixelToTile(pixel)
{
return Math.floor(pixel/TILE);
}

function bound(value, min, max)
{
if(value < min)
	return min;
if(value > max)
	return max;
return value;
}

function draw_Map()
{
var startX = -1;
var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
var tileX = pixelToTile(player.position.x);
var offsetX = TILE + Math.floor(player.position.x%TILE);

startX = tileX - Math.floor(maxTiles / 2);

	if (startX < -1)
	{
		startX = 0;
		offsetX = 0;
	}
	if (startX  > MAP.tw - maxTiles)
	{
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}

worldOffsetX = startX * TILE + offsetX;

	for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
	{
		for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		{
			var idx = y * level1.layers[layerIdx].width + startX;
			
			for( var x = startX; x < startX + maxTiles; x++ )
			{
				if( level1.layers[layerIdx].data[idx] != 0 )
				{
// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile), so subtract one from the tileset id to get the correct tile
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, (x - startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
			idx++;
			}
		}
	}
}

function hudStuff()
{
	//score
	context.fillStyle = "red";
	context.font = "23px verdana";
	var scoreText = "score: " + score + "%";
	context.fillText(scoreText, SCREEN_WIDTH - 170, 35);
	
	//life counter
for (var i=0; i<lives; i++)
	{
		context.drawImage(heartImage, 70 + ((heartImage.width + 2) * i), 10);
	}
}

function enemyStuff()
{
//drawing & updating enemies
for (var i=0; i < enemies.length; i++)
	{
		enemies[i].update(deltaTime);
		if (player.isDead == false)
		{
			if (intersects(enemies[i].position.x, enemies[i].position.y, TILE, TILE,
							player.position.x, player.position.y, player.width, player.height) == true)
			{
				//lives -= 1;
				//if (lives = 0)
				player.isDead = true;
			}
		}
	}
	for (var i=0; i < enemies.length; i++)
	{
	//console.log("whatever");
		enemies[i].draw();
	}
}

function bulletStuff()
{
//drawing & updating bullets
var hit = false;
for (var i = 0; i < bullets.length; i++)
	{
		bullets[i].update(deltaTime);
	}
	
for (var i = 0; i < bullets.length; i++)
	{
		if (bullets[i].position.x - worldOffsetX < 0 ||
			bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
		{
			hit = true;
		}
		
	for (var j = 0; j < enemies.length; j++)
		{
			if (intersects (bullets[i].position.x, bullets[i].position.y, TILE, TILE,
				enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
			{
				//kill both bullet & enemy
				enemies.splice(j,1);
				hit = true;
				score += 5;
				break;
			}
		}
	if (hit == true)
		{
			bullets.splice(i, 1);
			break;
		}
	}		
	
for (var i=0; i < bullets.length; i++)
	{
		bullets[i].draw();
	}
}

function frameStuff()
{
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
context.fillStyle = "#f00";
context.font="14px Arial";
context.fillText("FPS: " + fps, 5, 20, 100);
}

/*function restart()
{
	run();
}
*/

function run()
{
//console.log(player.position.x + ", " + player.position.y);
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	deltaTime = getDeltaTime();

switch(gameState)
	{
	case STATE_SPLASH:
				runSplash();
				break;
	case STATE_PLAY:
				runGame();
				break;
	case STATE_YOUDIE:
				runGameover();
				break;
	}
}

initialize();

/*if (keyboard.isKeyDown(keyboard.KEY_SPACE) == true && player.isDead == true)
	{
		restart();
	}
*/

//-------------------- Don't modify anything below here -------------------------------------------------------------
//---cos it is magic and you DON'T mess with magic!!!!!


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);


// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}