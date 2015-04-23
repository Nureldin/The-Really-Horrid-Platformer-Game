var bullet = function(x, y, moveRight)
{
	this.sprite = new Sprite("skeleton bullet.png");
	this.sprite.buildAnimation(1, 1, 32, 44, -1, [0]);
	this.sprite.setAnimationOffset(0, 0, 0);
	this.sprite.setLoop(0, false);
	
	this.position = new Vector2();
	this.position.set(x, y);
	
	this.velocity = new Vector2();
	
	this.moveRight = moveRight;
	if (this.moveRight == true)
	{
		this.velocity.set(MAXDX * 2, 0);
	}
	else
	{
		this.velocity.set(-MAXDX * 2, 0);
	}
}

bullet.prototype.update = function (dt)
{
	this.sprite.update(dt);
	this.position.x = Math.floor(this.position.x + (dt * this.velocity.x));
}

bullet.prototype.draw = function()
{
	var screenX = this.position.x - worldOffsetX;
	this.sprite.draw(context, screenX, this.position.y);
}