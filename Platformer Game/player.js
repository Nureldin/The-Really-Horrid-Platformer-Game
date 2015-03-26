var LEFT = 0;
var RIGHT = 0;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_SHOOT_LEFT = 3;
var ANIM_CLIMB = 4;
var ANIM_IDLE_RIGHT = 5;
var ANIM_JUMP_RIGHT = 6;
var ANIM_WALK_RIGHT = 7;
var ANIM_SHOOT_RIGHT = 8;
var ANIM_MAX = 9;

var Player = function() {
this.sprite = new Sprite("ChuckNorris.png");
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [0, 1, 2, 3, 4, 5, 6, 7]);  									// IDLE_LEFT
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [8, 9, 10, 11, 12]);  										// JUMP_LEFT
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);  	// WALK_LEFT
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);  	// SHOOT_LEFT
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]);  				// CLIMB
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [52, 53, 54, 55, 56, 57, 58, 59]);  							// IDLE_RIGHT
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [60, 61, 62, 63, 64]);  										// JUMP_RIGHT
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);  	// WALK_RIGHT
this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]);  	// SHOOT_RIGHT

for (var i=0; i < ANIM_MAX; i++)
{
	this.sprite.setAnimationOffset(i, -55, -87);
}

this.position = new Vector2();
this.position.set(9*TILE, 0*TILE);

this.width = 159;
this.height = 163;

this.velocity = new Vector2;

this.falling = true;
this.jumping = false;

this.direction = LEFT;

};

Player.prototype.update = function(deltaTime)
{
this.sprite.update(deltaTime);

		var left = false;
		var right = false;
		var jump = false;
		
		//check keypress events
		if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true)
		{
			left = true;
			this.direction = LEFT;
			if(this.sprite.currentAnimation != ANIM_WALK_LEFT && !this.jumping)
			{
				this.sprite.setAnimation(ANIM_WALK_LEFT);
			}
		else if(this.jumping)
			{
				this.sprite.setAnimation(ANIM_JUMP_LEFT);
			}
		}
		if (keyboard.isKeyDown(keyboard.KEY_RIGHT) == true) 
		{
			right = true;
			this.direction = RIGHT;
			if(this.sprite.currentAnimation != ANIM_WALK_RIGHT && !this.jumping)
			{
				this.sprite.setAnimation(ANIM_WALK_RIGHT);
			}
		else if (this.jumping)
			{
				this.sprite.setAnimation(ANIM_WALK_RIGHT);
			}
		}
		else
		{
			if(this.jumping == false && this.falling == false)
			{
				if(this.direction == LEFT)
				{
					if(this.sprite.currentAnimation != ANIM_IDLE_LEFT)
						this.sprite.setAnimation(ANIM_IDLE_LEFT);
				}
				else
				{
					if(this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
						this.sprite.setAnimation(ANIM_IDLE_RIGHT);
				}
			}
		}
		if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
		{
			jump = true;
		}
	
	var wasleft = this.velocity.x < 0;
	var wasright = this.velocity.x > 0;
	var falling = this.falling;
	var ddx = 0;			//acceleration
	var ddy = GRAVITY;
	
	if (left)
		ddx = ddx - ACCEL;		//player wants to go left
	else if (wasleft)
		ddx = ddx + FRICTION;	//player was going left, but not anymore
	if (right)
		ddx = ddx + ACCEL;		//same thing but going right
	else if (wasright)
		ddx = ddx - FRICTION;
		
		
		if (jump && !this.jumping && !falling)
		{
			//apply an instantaneous (large) vertical impulse
			ddy = ddy - JUMP;
			this.jumping = true;
			if (this.direction == LEFT)
				this.sprite.setAnimation(ANIM_JUMP_LEFT)
			else
				this.sprite.setAnimation(ANIM_JUMP_RIGHT)
		}
	

		//calculate the new position & velocity
		this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
		this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
		this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
		this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);
		
		if ((wasleft && (this.velocity.x > 0)) || (wasright && (this.velocity.x < 0)))
		{
			this.velocity.x = 0;			//clamp at zero to prevent friction from making us jiggle side to side
		}

		// collision detection
		// Our collision detection logic is greatly simplified by the fact that the player is a rectangle and is exactly the same size as a single tile.
		// So we know that the player can only ever occupy 1, 2 or 4 cells.

		//This means we can short-circuit and avoid building a general purpose collision detection engine by simply looking at the 1-4 cells that the player occupies
var tx = pixelToTile(this.position.x);
var ty = pixelToTile(this.position.y);
var nx = (this.position.x)%TILE;
var ny = (this.position.y)%TILE;
var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

//if the player has vertical velocity, check to see if they hit a platform above / below, in which case stop their velocity & clamp their y position
	if (this.velocity.y > 0)
	{
		if ((celldown && !cell) || (celldiag && !cellright && nx))		//clamp the y position to avoid falling into platform below
		{
			this.position.y = tileToPixel(ty);
			this.velocity.y = 0;
			this.falling = false;
			this.jumping = false;
			ny = 0;
		}
		else if (this.velocity.y < 0)
		{
			if ((cell && !celldown) || (cellright && !celldiag && nx))		//clamp y position to avoid jumping into platform above
			{
				this.position.y = tileToPixel(ty + 1);
				this.velocity.y = 0;						//stop upward velocity
				//the player is no longer really in that cell, we clamped them to the cell below
				cell = celldown;
				cellright = celldiag;
				ny = 0;										//player no longer overlaps the cells below
			}
		}
		if (this.velocity.x > 0)
		{
			if ((cellright && !cell) || (celldiag && !celldown && ny))
			{
				this.position.x = tileToPixel(tx);
				this.velocity.x = 0;
			}
		}
		else if (this.velocity.x < 0)
		{
			if ((cell && !cellright) || (celldown && !celldiag && ny))
			{
				this.position.x = tileToPixel(tx + 1);
				this.velocity.x = 0;
			}
		}
	}
}

Player.prototype.draw = function()
{
this.sprite.draw(context, this.position.x, this.position.y);
}