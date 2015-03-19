Vector2.prototype.set = function (x,y)
{
	this.x = 0;
	this.y = 0;
};

Vector2.prototype.normalize = function ()
{
	this.magnitude = (dirX * dirX) + (dirY * dirY);
	if (magnitude !=0)
	{
			var oneOverMag = 1 / Math.sqrt(magnitude);
			dirX *= oneOverMag;
			dirY *= oneOverMag;
	}
}

Vector2.prototype.add = function (v2)
{
this.x += v2.x;
this.y += v2.y;
}

Vector2.prototype.subtract = function (v2)
{
this.x -= v2.x;
this.y -= v2.y;
}

Vector2.prototype.multiplyScalar = function (num)
{
this.x *= num.x;
this.y *= num.y;
}