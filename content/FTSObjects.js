/*********** Building - applies to all NPC and PC buildings except TOs & SBs  ***********/

function Building()
{
	this.X		= -1;
	this.Y		= -1;
	this.Sector	= "";
	this.Type 	= "";
	this.Owner 	= "";
	this.Alliance 	= "";
	this.Faction 	= "";
	this.FreeSpace 	= -1;
	this.Credits 	= -1;
	this.IsTrading  = "";
	this.Commodities = new Array();
}

Building.prototype.ToString = function()
{
	return this.X + "|" + this.Y + "|" + this.Sector + "|" + this.Type + "|" + this.Owner + "|" + this.Alliance + "|" + this.Faction + "|" + this.FreeSpace + "|" + this.Credits + "|" + this.IsTrading;
}

Building.prototype.CommoditiesToString = function()
{
	var commodityString = "";
	
	if (this.Commodities.length > 0)
	{
		for (var i = 0; i < this.Commodities.length; i++)
		{
			if (i > 0)
				commodityString += "|";
				
			commodityString += this.Commodities[i].ToString();	
		}
	}
	
	return commodityString;
}

Building.prototype.SetLocation = function(sector, x, y)
{
	this.Sector = sector;
	this.X = x;
	this.Y = y;
}

Building.prototype.IsSameAs = function(b2)
{
	if (this.X != b2.X) 				return false;
	if (this.Y != b2.Y) 				return false;
	if (this.Sector.value != b2.Sector.value) 	return false;
	if (this.Type.value != b2.Type.value) 		return false;
	if (this.Owner.value != b2.Owner.value) 	return false;
	if (this.Alliance.value != b2.Alliance.value) 	return false;
	if (this.Faction.value != b2.Faction.value) 	return false;
	if (this.FreeSpace.value != b2.FreeSpace.value) return false;
	if (this.Credits.value != b2.Credits.value) 	return false;
	if (this.IsTrading != b2.IsTrading)	 	return false;
	
	//alert("Last Comms: " + b2.CommoditiesToString() + ". New: " + this.CommoditiesToString());
	if (this.Commodities.length != b2.Commodities.length) return false;
		
	for (var i = 0; i < this.Commodities.length; i++)
	{
		if (!this.Commodities[i].IsSameAs(b2.Commodities[i])) return false;
	}

	return true;
}

Building.prototype.Clone = function()
{
	var newBuilding = new Building();
	var newCommodities = new Array(this.Commodities.length);
	
	for (var i = 0; i < this.Commodities.length; i++)
	{
		newCommodities[i] = this.Commodities[i].Clone();
	}
	
	for (i in this)
	{
		if (typeof this[i] != "object") // i.e. Building.Commodities array
		{
			newBuilding[i] = this[i];
		}
	}
	
	newBuilding.Commodities = newCommodities;	
	
	return newBuilding;
}


/*********** Commodity - applies to all commodities ***********/
function Commodity(name)
{
	this.Name 	= name;
	this.Amount 	= -1;
	this.Min 	= -1;
	this.Max 	= -1;
	this.BuyPrice 	= -1;
	this.SellPrice 	= -1;
	this.Upkeep 	= -1;
}

Commodity.prototype.ToString = function()
{
	return this.Name + "," + this.Amount + "," + this.Min + "," + this.Max + "," + this.BuyPrice + "," + this.SellPrice + "," + this.Upkeep;
}

Commodity.prototype.IsSameAs = function(c2)
{
    	if (this.Name.value != c2.Name.value) 	return false;
	if (this.Amount != c2.Amount) 		return false;
	if (this.Min != c2.Min) 		return false;
	if (this.Max != c2.Max) 		return false;
	if (this.BuyPrice != c2.BuyPrice) 	return false;
	if (this.SellPrice != c2.SellPrice) 	return false;
	if (this.Upkeep != c2.Upkeep) 		return false;

	return true;
}

Commodity.prototype.Clone = function()
{
	var newCommodity = new Commodity();
	
	for (i in this)
	{
		newCommodity[i] = this[i];
	}
	return newCommodity;
}


/*********** Base - applies to TO, SB and Planets ***********/
function Base()
{
	this.X		= -1;
	this.Y		= -1;
	this.Sector	= "";
	this.Name 	= "";
	this.Type	= ""
	this.Population = -1;
	this.Owner 	= "";
	this.Alliance 	= "";
	this.Faction 	= "";
	this.FreeSpace 	= -1;
	this.Credits 	= -1;
	this.IsTrading  = "";
	this.Commodities = new Array();
}

Base.prototype.ToString = function()
{
	return this.X + "|" + this.Y + "|" + this.Sector + "|" + this.Name + "|" + this.Type + "|" + this.Population + "|" + this.Owner + "|" + this.Alliance + "|" + this.Faction + "|" + this.FreeSpace + "|" + this.Credits + "|" + this.IsTrading;
}

Base.prototype.CommoditiesToString = function()
{
	var commodityString = "";

	if (this.Commodities.length > 0)
	{
		for (var i = 0; i < this.Commodities.length; i++)
		{
			if (i > 0)
				commodityString += "|";

			commodityString += this.Commodities[i].ToString();	
		}
	}
		
	return commodityString;
}

Base.prototype.SetLocation = function(sector, x, y)
{
	this.Sector = sector;
	this.X = x;
	this.Y = y;
}

Base.prototype.IsSameAs = function(b2)
{
	if (this.X != b2.X) 				return false;
	if (this.Y != b2.Y) 				return false;
	if (this.Sector.value != b2.Sector.value) 	return false;
	if (this.Name.value != b2.Name.value) 		return false;
	if (this.Type.value != b2.Type.value) 		return false;
	if (this.Population != b2.Population)		return false;
	if (this.Owner.value != b2.Owner.value) 	return false;
	if (this.Alliance.value != b2.Alliance.value) 	return false;
	if (this.Faction.value != b2.Faction.value) 	return false;
	if (this.FreeSpace.value != b2.FreeSpace.value) return false;
	if (this.Credits.value != b2.Credits.value) 	return false;
	if (this.IsTrading != b2.IsTrading)	 	return false;

	//alert("Last Comms: " + b2.CommoditiesToString() + ". New: " + this.CommoditiesToString());
	if (this.Commodities.length != b2.Commodities.length) return false;

	for (var i = 0; i < this.Commodities.length; i++)
	{
		if (!this.Commodities[i].IsSameAs(b2.Commodities[i])) return false;
	}
	
	return true;
}

Base.prototype.Clone = function()
{
	var newBase = new Base();
	var newCommodities = new Array(this.Commodities.length);
	
	for (var i = 0; i < this.Commodities.length; i++)
	{
		newCommodities[i] = this.Commodities[i].Clone();
	}
	
	for (i in this)
	{
		if (typeof this[i] != "object") // i.e. Base.Commodities array
		{
			newBase[i] = this[i];
		}
	}
	
	newBase.Commodities = newCommodities;	
	
	return newBase;
}
