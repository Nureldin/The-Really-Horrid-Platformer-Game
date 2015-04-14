var Enemy = function(x, y)
{
this.sprite = new Sprite("arnie.png");
this.sprite.buildAnimation(2, 1, 381, 100, 0.3, [0]);

	{
	this.sprite.setAnimationOffset(0, -35, -40);
	}

this.position = new Vector2();
this.position.set(x, y);

this.velocity = new Vector2;

this.moveRight = true;
this.pause = 0;
};

Enemy.prototype.update = function(deltaTime)
{
this.sprite.update(deltaTime);

if (this.pause > 0)
	{
		this.pause -= deltaTime;
	}

	var ddx = 0;			//acceleration

	var tx = pixelToTile(this.position.x);
	var ty = pixelToTile(this.position.y);
	var nx = (this.position.x)%TILE;
	var ny = (this.position.y)%TILE;
	var cell = cellAtCoord(LAYER_ENEMY, tx, ty);
	var cellright = cellAtCoord(LAYER_ENEMY, tx + 1, ty);
	var celldown = cellAtCoord(LAYER_ENEMY, tx, ty + 1);
	var celldiag = cellAtCoord(LAYER_ENEMY, tx + 1, ty + 1);
	
	if (this.moveRight)
	{
		if(celldiag && !cellright)
		{
		ddx = ddx + ENEMY_ACCEL;		//enemy wants to go right
		}		
	else
		{
		this.velocity.x = 0;
		this.moveRight = false;
		this.pause = 0.5;
		}
	}
	if (!this.moveRight)
	{
		if (celldown && !cell)
		{
		ddx = ddx - ENEMY_ACCEL;	//enemy wants to go left
		}
	else
		{
			this.velocity.x = 0;
			this.moveRight = true;
			this.pause = 0.5;
		}
		
	this.position.x = Math.floor(this.position.x + (dt * this.velocity.x));
	this.velocity.x = bound(this.velocity.x + (dt * ddx), -ENEMY_MAXDX, ENEMY_MAXDX);

	}
}

Enemy.prototype.draw = function()
{
this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y);
}