
// Torx's Pardus Free Trade Syndicate Trader 
// FTSTrader Copyright (c) 19-Oct-06


function FTSTraderReader(){
}

// Return current page type i.e. Nav or Building Trade etc
FTSTraderReader.prototype.GetPageType = function(doc){
	try	{
		if (doc == null)
			return null;
		
		var pageType = null;
		
		var location = doc.location + "";
		
		if (location.match(/\/main\.php/))
			pageType = "nav";
			
		else if (location.match(/\/overview_stats\.php/))
			pageType = "overview_stats";
			
		else if (location.match(/\/building\.php/))
			pageType = "building_welcome";
			
		else if (location.match(/\/building_trade\.php/))
			pageType = "building_trade";
			
		else if (location.match(/\/starbase\.php/))
			pageType = "starbase_welcome";
			
		else if (location.match(/\/starbase_trade\.php/))
			pageType = "starbase_trade";
			
		else if (location.match(/\/planet\.php/))
			pageType = "planet_welcome";
			
		else if (location.match(/\/planet_trade\.php/))
			pageType = "planet_trade";
			
		else if (location.match(/\/building_trade_settings\.php/)) {	
			if (!this.IsInputTagPresent(doc, "Remotely destroy this building")) {
				if (this.IsInputTagPresent(doc, "Activate building trade"))
					pageType = "enable_building_trade"; // trading is disabled
				else
					pageType = "set_building_prices";
			}
		}
		else if (location.match(/\/building_management\.php/))
			pageType = "my_building";
		
		/*
		if (pageType != null)
		{
			if (pageType != "nav")
				alert("pageType: " + pageType);
		}
		*/
		
		return pageType;
	}
	catch(ex) {
		alert(ex);
	}
	
	return null;
}


FTSTraderReader.prototype.IsInputTagPresent = function(doc, inputValue) {
	var inputTags = doc.getElementsByTagName("input");
				
	for (var i = 0; i < inputTags.length; i++) {
		if (inputTags[i] != null) {
			if (inputTags[i].value == inputValue) {
				return true;
			}
		}
	}
	
	return false;
}


// Return ship's position on Nav screen
FTSTraderReader.prototype.ParseLocation = function(doc) {
	try {
    		var locationString = doc.getElementsByTagName("table")[2].rows[0].cells[1].innerHTML;
    		var locationArray = locationString.match(/\[(\d+)\,(\d+)/);
    		return [parseInt(locationArray[1]), parseInt(locationArray[2])];
  	}
  	catch(ex) {
  		//alert(ex);
  		return [-1, -1];
  	}
}


// Return current sector
FTSTraderReader.prototype.ParseSector = function(doc) {
  	try {
    		var sector =  doc.getElementsByTagName("table")[2].rows[0].cells[0].innerHTML;
    		sector = sector.replace(/<[^>]+>/g, "");  // remove html tags
    		sector = sector.replace(/^\s*|\s*$/g,""); // trim
		
		if (sector.length > 0)
			return sector;
	}
	catch(ex) {
		//alert(ex);
	}
	
	return "-"; 
}


// Return player's name from welcome message
FTSTraderReader.prototype.ParseNameFromWelcomeMessage = function(doc) {
	var name = null;
	try {
		var welcomeMsg = doc.getElementsByTagName("table")[1].rows[0].cells[0].innerHTML;
		var name = welcomeMsg.match(/Welcome ([\w\s]+)!/)[1];

	}
	catch(ex) {
		//alert(ex);
	}
	
	return name;
}

// Return player's name from overview stats
FTSTraderReader.prototype.ParseNameFromOverviewStats = function(doc) {
	var name = null;

	try {
		var t = doc.getElementsByTagName("table")[6];
		name = t.rows[1].cells[1].innerHTML;

	}
	catch(ex) {
		alert(ex);
	}
	
	return name;
}

FTSTraderReader.prototype.ParseAllianceFromOverviewStats = function(doc) {
	var alliance = null;

	try {
		var t = doc.getElementsByTagName("table")[6];

		for (var i = 2; i<60; i++) 		{
			if (t.rows[i].cells[0].innerHTML == "Alliance:") {
				alliance = t.rows[i].cells[1].innerHTML;
			}
		}

	}
	catch(ex)
	{
		//alert(ex);
	}
	
	return alliance;
}

// Parse Building Welcome Screen (Building Type, Owner, Alliance, Faction)
FTSTraderReader.prototype.ParseBuildingWelcomeScreen = function(doc) {
	try {
		var building = new Building();

		var boldTags = doc.getElementsByTagName("b");

		building.Type = boldTags[0].textContent;

		var boldTags = doc.getElementsByTagName("a");
		building.Owner = boldTags[0].textContent;

		// Parse alliance 
		//for (var i = 0; i < boldTags.length; i++)
		//{
		//	alert(boldTags[i].innerHTML);
		//	if (boldTags[i].innerHTML.match(/alliance/) && boldTags[i].textContent != null)
		//	{
		//		building.Alliance = boldTags[i].textContent;
		//		break;
		//	}
		//}
		if (!boldTags[1].innerHTML.match(/Trade with/) && boldTags[1].textContent != null && boldTags[1].href.match(/alliance/)) {
			building.Alliance = boldTags[1].textContent;
		}
		
		if (building.Alliance == "")
			building.Alliance = "[null]";

		// Parse faction
		var imgTags = doc.getElementsByTagName("img");

		if (imgTags[5] != null && imgTags[5].alt.match(/Union|Empire|Federation/))
			building.Faction = imgTags[5].alt;
		else
			building.Faction = "[null]";
			
		// Parse whether the building is open for trading
		for (var i = boldTags.length-1; i >= 0; i--) {
			if (boldTags[i].innerHTML.match(/Currently this building does not offer public trading/) && boldTags[i].textContent != null) {
				building.IsTrading = false;
				break;
			}
		}
		return building;
	}
	catch(ex) {
		alert("ParseBuildingWelcomeScreen: " + ex);
		return null;
	}
}


// Return trade data from other peoples' buildings
FTSTraderReader.prototype.ParseBuildingTradeData = function(doc) {
	try {
		var building = new Building();
		FTSTrader.MessageFrameDocument = doc;
		
		// Parse Sell Side (note this is building BuyPrice!)
		
		var sellTable = doc.getElementsByTagName("table")[4];
		
		for (var i = 1; i < sellTable.rows.length - 3; i++) {
			var commodity = sellTable.rows[i].cells[0].innerHTML.match(/([^\/\\]+)\.png"/)[1];
			var sellPrice = parseInt(sellTable.rows[i].cells[3].innerHTML);
			
			building.Commodities[i-1] = new Commodity(commodity);
			building.Commodities[i-1].BuyPrice = sellPrice;
						
			// Check if amount is a 'useMax' link or plain untradeable number
			var amountship = sellTable.rows[i].cells[2].innerHTML.match(/>\s*(\d+)\s*</);
			
			if (amountship != null)
				building.Commodities[i-1].InShip = parseInt(amountship[1]);
			else
				building.Commodities[i-1].InShip = parseInt(sellTable.rows[i].cells[2].innerHTML);
				

		}
		
		// Parse Buy Side (note this is building SellPrice!)
		var buyTable = doc.getElementsByTagName("table")[5];
		
		FTSTrader.DisplayMessage(" ");
		var inputnum = 0

		for (var j = 1; j < buyTable.rows.length - 3; j++) {
			// Check if amount is a 'useMax' link or plain untradeable number
			var amount = buyTable.rows[j].cells[2].innerHTML.match(/>\s*(\d+)\s*</);
			
			if (amount != null)
				building.Commodities[j-1].Amount = parseInt(amount[1]);
			else
				building.Commodities[j-1].Amount = parseInt(buyTable.rows[j].cells[2].innerHTML);
			
			building.Commodities[j-1].Min 		= parseInt(buyTable.rows[j].cells[3].innerHTML);
			building.Commodities[j-1].Max 		= parseInt(buyTable.rows[j].cells[4].innerHTML);
			building.Commodities[j-1].SellPrice 	= parseInt(buyTable.rows[j].cells[5].innerHTML);
			
			var cansell = building.Commodities[j-1].Max - building.Commodities[j-1].Amount
			if (cansell >= building.Commodities[j-1].InShip)
				cansell = building.Commodities[j-1].InShip;
			
			if (building.Commodities[j-1].InShip>0)
				inputnum = inputnum + 1;

			if ((FTSTrader.AutoFillSell) && (cansell > 0) && (building.Commodities[j-1].BuyPrice >0)) {
				FTSTrader.DisplayMessage("" + cansell + " x " + building.Commodities[j-1].Name);
				var sellbox = doc.getElementsByTagName("input")[inputnum-1];
				sellbox.value = cansell;
			}
		}
		FTSTrader.DisplayMessage(" ");


		building.FreeSpace 	= buyTable.rows[buyTable.rows.length-2].cells[1].innerHTML.match(/([\d,]+)t/)[1];
		building.Credits	= buyTable.rows[buyTable.rows.length-1].cells[1].innerHTML.replace(/,/g, "");
		building.IsTrading 	= true;
		
		return building;
	}
	catch(ex) {
		alert(ex);
		return null;
	}
}


// Parse starbase welcome screen
FTSTraderReader.prototype.ParseStarbaseWelcomeScreen = function(doc) {
	try {
		var base = new Base();
		
		base.Type	= "Starbase"
		
		var boldTags = doc.getElementsByTagName("b");

		if (boldTags[0] != null) {
			base.Type	= "Starbase"
			base.Owner = boldTags[0].textContent;
		}
		else {
			base.Type	= "NPC Starbase"
			base.Owner = "NPC";
		}

		// Parse alliance 
		if (boldTags[1] != null) {
			base.Alliance = boldTags[1].textContent;
		}
		
		//for (var i = 2; i < boldTags.length; i++)
		//{
		//	if (boldTags[i].innerHTML.match(/alliance/) && boldTags[i].textContent != null)
		//	{
		//		base.Alliance = boldTags[i].textContent;
		//		break;
		//	}
		//}
		
		var heading = doc.getElementsByTagName("span")[0].innerHTML;
		heading = heading.replace(/<[^>]+>/g, "");  // remove html tags
		heading = heading.replace(/&nbsp;/g, " ");
		heading = heading.replace(/^\s*|\s*$/g,""); // trim
		base.Name = heading;
	
		if (base.Alliance == "")
			base.Alliance = "[null]";

		// Parse faction
		var imgTags = doc.getElementsByTagName("img");

		if (imgTags[3] != null)
			base.Faction = imgTags[3].alt;
		else
			base.Faction = "[null]";
		
		// Parse whether the building is open for trading
		base.IsTrading = true;

		return base;
	}
	catch(ex) {
		alert("ParseBuildingWelcomeScreen: " + ex);
		return null;
	}
}

// Parse planet welcome screen
FTSTraderReader.prototype.ParsePlanetWelcomeScreen = function(doc) {
	var base = new Base();

	// Parse faction
	var imgTags = doc.getElementsByTagName("img");

	if (imgTags[4] != null && imgTags[3].alt.match(/Union|Empire|Federation/))
		base.Faction = imgTags[3].alt.replace("The ", "");
	else
		base.Faction = "[null]";

	base.Owner = "NPC";
	
	// Parse planet type
	if (imgTags[5] != null) {
		var type = imgTags[5].src.match(/planet_m|planet_i|planet_d|planet_g|planet_r|planet_a/);
		
		if (type != null)
			base.Type = type;
		else
			base.Type = "[null]";
	}
		
	// Parse Base name
	var heading = doc.getElementsByTagName("h1")[0].innerHTML;
	heading = heading.replace(/<[^>]+>/g, "");  // remove html tags
	heading = heading.replace(/&nbsp;/g, " ");
    	heading = heading.replace(/^\s*|\s*$/g,""); // trim
	base.Name = heading;
	
	
	// Parse population
	var tables = doc.getElementsByTagName("table");
	
	var population = tables[3].rows[0].cells[1].innerHTML;
	
	if (population != null) {
		population = population.replace(",", "").replace(/^\s*|\s*$/g,"");;
	}
	
	if (population.length > 0)
		base.Population = population;	
	
	return base;
}


FTSTraderReader.prototype.ParseStarbaseTradeData = function(doc) {
	var playerOwned = false;
	
	var base = new Base();
		
	// Parse Sell Side (note this is base BuyPrice!)
	var sellTable = doc.getElementsByTagName("table")[4];

	for (var i = 1; i < sellTable.rows.length - 3; i++) {
		var commodity = sellTable.rows[i].cells[0].innerHTML.match(/([^\/\\]+)\.png"/)[1];
		var sellPrice = parseInt(sellTable.rows[i].cells[3].innerHTML.replace(/,/g, ""));
		base.Commodities[i-1] = new Commodity(commodity);
		base.Commodities[i-1].BuyPrice = sellPrice;
	}

	// Parse Buy Side (note this is base SellPrice!)
	var buyTable = doc.getElementsByTagName("table")[5];

	for (var j = 1; j < buyTable.rows.length - 3; j++) {
		// Check if amount is a 'useMax' link or plain untradeable number
		var amount = buyTable.rows[j].cells[2].innerHTML.match(/>\s*([\d,]+)\s*</);

		if (amount != null) {
			amount[1] = amount[1].replace(/,/g, "");
			base.Commodities[j-1].Amount = parseInt(amount[1]);
		}
		else
		base.Commodities[j-1].Amount = parseInt(buyTable.rows[j].cells[2].innerHTML.replace(/,/g, ""));

		if(buyTable.rows[buyTable.rows.length-2].cells[0].innerHTML.length >10) { // == "free space:"
			playerOwned = true;
		}
		else {
			playerOwned = false;
		}


		if(playerOwned) {
			base.Commodities[j-1].Upkeep = parseInt(buyTable.rows[j].cells[3].innerHTML.replace(/<[^>]+>/g, "").replace(/,/g, ""));
			base.Commodities[j-1].Min = parseInt(buyTable.rows[j].cells[4].innerHTML.replace(/,/g, ""));
			base.Commodities[j-1].Max = parseInt(buyTable.rows[j].cells[5].innerHTML.replace(/,/g, ""));
			base.Commodities[j-1].SellPrice = parseInt(buyTable.rows[j].cells[6].innerHTML.match(/<\/script>([\d,]+)/)[1].replace(/,/g, ""));
		}
		else {
			base.Commodities[j-1].Upkeep = parseInt(buyTable.rows[j].cells[3].innerHTML.replace(/<[^>]+>/g, "").replace(/,/g, ""));
			base.Commodities[j-1].Min = parseInt(buyTable.rows[j].cells[4].innerHTML.replace(/,/g, ""));
			base.Commodities[j-1].Max = parseInt(buyTable.rows[j].cells[4].innerHTML.replace(/,/g, ""));
			base.Commodities[j-1].SellPrice = parseInt(buyTable.rows[j].cells[5].innerHTML.match(/<\/script>([\d,]+)/)[1].replace(/,/g, ""));
		}

	}

	// NPC Starbases don't have free space!
	if(playerOwned) base.FreeSpace = buyTable.rows[buyTable.rows.length-2].cells[1].innerHTML.match(/([\d,]+)t/)[1].replace(/,/g, "");

	base.Credits = buyTable.rows[buyTable.rows.length-1].cells[1].innerHTML.replace(/,/g, "");
	base.IsTrading = true;

	//alert(base.ToString());
	//alert(base.CommoditiesToString());
	return base;
}


// Parse commodity amounts on planet
FTSTraderReader.prototype.ParsePlanetTradeData = function(doc) {
	var base = new Base();
	FTSTrader.MessageFrameDocument = doc;
	
	var urlTags = doc.getElementsByTagName("a");

	//if (urlTags[0] != null )
	//	FTSTrader.DisplayMessage(urlTags[0].alt);

	// Parse Sell Side (note this is base BuyPrice!)
	var sellTable = doc.getElementsByTagName("table")[4];

	for (var i = 1; i < sellTable.rows.length - 3; i++) {
		var commodity = sellTable.rows[i].cells[0].innerHTML.match(/([^\/\\]+)\.png"/)[1];
		var sellPrice = parseInt(sellTable.rows[i].cells[3].innerHTML.replace(/,/g, ""));
		base.Commodities[i-1] = new Commodity(commodity);
		base.Commodities[i-1].BuyPrice = sellPrice;
		
		if (FTSTrader.DroidWash) {
			// *****   droid wash code *****				
			// Check if amount is a 'useMax' link or plain untradeable number
			var amountship = sellTable.rows[i].cells[2].innerHTML.match(/>\s*(\d+)\s*</);

			if (amountship != null)
				base.Commodities[i-1].InShip = parseInt(amountship[1]);
			else
				base.Commodities[i-1].InShip = parseInt(sellTable.rows[i].cells[2].innerHTML);	

			// *****  end droid wash code *****		
		}
		

	}

	// Parse Buy Side (note this is base SellPrice!)
	var buyTable = doc.getElementsByTagName("table")[5];
	var inputnum = 0

	for (var j = 1; j < buyTable.rows.length - 2; j++) {
		// Check if amount is a 'useMax' link or plain untradeable number
		var amount = buyTable.rows[j].cells[2].innerHTML.match(/>\s*([\d,]+)\s*</);


		if (amount != null) {
			amount[1] = amount[1].replace(/,/g, "");
			base.Commodities[j-1].Amount = parseInt(amount[1]);
		}
		else
			base.Commodities[j-1].Amount = parseInt(buyTable.rows[j].cells[2].innerHTML.replace(/,/g, ""));

		base.Commodities[j-1].Upkeep	= parseInt(buyTable.rows[j].cells[3].innerHTML.replace(/<[^>]+>/g, "").replace(/,/g, ""));
		base.Commodities[j-1].Max 	= parseInt(buyTable.rows[j].cells[4].innerHTML.replace(/,/g, ""));
		base.Commodities[j-1].SellPrice = parseInt(buyTable.rows[j].cells[5].innerHTML.match(/<\/script>([\d,]+)/)[1].replace(/,/g, ""));

		if (FTSTrader.DroidWash) {
			// ***** droid wash code *****
			var cansell = base.Commodities[j-1].Max - base.Commodities[j-1].Amount
			if (cansell >= base.Commodities[j-1].InShip)
				cansell = base.Commodities[j-1].InShip;
			
			if (base.Commodities[j-1].InShip>0)
				inputnum = inputnum + 1;
			
			if ((cansell > 0) && (base.Commodities[j-1].BuyPrice >0) && (base.Commodities[j-1].Upkeep ==0)) {
				FTSTrader.DisplayMessage("" + cansell + " x " + base.Commodities[j-1].Name);
				var sellbox = doc.getElementsByTagName("input")[inputnum-1];
				sellbox.value = cansell;
			}
			// ***** end droid wash code *****
		} 
	}

	if (FTSTrader.DroidWash) {
		// ***** droid wash code *****
		// inputboxes doortellen
		FTSTrader.DisplayMessage("Droid Washing is enabled");
		for (var j = 1; j < buyTable.rows.length - 2; j++) {
			var canbuy = base.Commodities[j-1].Amount + base.Commodities[j-1].Upkeep
		
			if (canbuy>0) {
				inputnum = inputnum + 1;
			}
		
			if ((canbuy > 0) && (base.Commodities[j-1].BuyPrice >0) && (base.Commodities[j-1].Upkeep ==0)) {
				if ((base.Commodities[j-1].Name == "droid_modules") || (FTSTrader.CommodityWash)) {
					FTSTrader.DisplayMessage(canbuy + " x " + base.Commodities[j-1].Name);
					var sellbox = doc.getElementsByTagName("input")[inputnum+1];
					sellbox.value = canbuy;
				}
			}
		
		}
		// ***** end droid wash code *****
	}

	
	base.Credits	= buyTable.rows[buyTable.rows.length-1].cells[1].innerHTML.replace(/,/g, "");
	base.IsTrading 	= true;
	
	//alert(base.ToString());
	//alert(base.CommoditiesToString());
	return base;
}


// Parse commodity amounts in own building
FTSTraderReader.prototype.ParseOwnBuildingStock = function(doc) {
	try {
		var building = new Building();
		
		// Parse building type
		var boldTags = doc.getElementsByTagName("b");
		building.Type = boldTags[0].textContent;
		
		
		// Parse free space in building
		var freeSpaceBoldTag = doc.getElementsByTagName("table")[2].innerHTML;
		var freeSpace = freeSpaceBoldTag.match(/Free space in building:\s([\d,]+)t/)[1].replace(/,/g, "");
		building.FreeSpace = freeSpace;
		
		building.Alliance = FTSTrader.Alliance;
		
		// Parse upkeep & production per tick
		for (var table = 4; table < 6; table++) {
			var upkeepTable = doc.getElementsByTagName("table")[table];

			if (upkeepTable != null) {
				for (var j = 1; j < upkeepTable.rows.length; j++) {
					for (var k = 0; k < upkeepTable.rows[j].cells.length; k++) {
						var commodity = upkeepTable.rows[j].cells[k].innerHTML.match(/([^\/\\]+)\.png"/)[1];
						var upkeep = parseInt(upkeepTable.rows[j].cells[k].innerHTML.match(/>:\s([\d]+)/)[1]);
						//alert("commodity-upkeep: " + commodity + "-" + upkeep);

						building.Commodities[building.Commodities.length] = new Commodity(commodity);
						building.Commodities[building.Commodities.length-1].Upkeep = upkeep;					
					}
				}
			}
		}
		
		
		// Parse upkeep & production stock
		for (var table = 10; table < 12; table++) {
			var upkeepStockTable = doc.getElementsByTagName("table")[table];

			if (upkeepStockTable != null) {
				for (var i = 1; i < upkeepStockTable.rows.length; i++) {
					var commodity = upkeepStockTable.rows[i].cells[0].innerHTML.match(/([^\/\\]+)\.png"/)[1];

					for (var m = 0; m < building.Commodities.length; m++) {
						if (building.Commodities[m].Name == commodity) {
							building.Commodities[m].Amount = parseInt(upkeepStockTable.rows[i].cells[2].innerHTML.match(/>\s*(\d+)\s*</)[1]);
							break;
						}
					}
				}
			}
		}
		
		
		// If any production commodities still have Amounts of -1, set the amounts to zero
		for (var n = 0; n < building.Commodities.length; n++) {
			if (building.Commodities[n].Amount == -1) {
				building.Commodities[n].Amount = 0;
			}
		}
		
		return building;
  	}
  	catch(ex) {
  		alert(ex);
  		return null;
  	}
}


// Parse set price screen for own building (not remotely accessing)
FTSTraderReader.prototype.ParseOwnBuildingPrices = function(doc) {
	try {
		var building = new Building();
		
		// Parse building type
		var boldTags = doc.getElementsByTagName("b");
		building.Type = boldTags[0].textContent;	
		
		// Parse amount, min, max, prices
		var priceTable = doc.getElementsByTagName("table")[3];

		for (var i = 3; i < priceTable.rows.length - 5; i++) {
			var commodity = priceTable.rows[i].cells[0].innerHTML.match(/([^\/\\]+)\.png"/)[1];
			building.Commodities[building.Commodities.length] = new Commodity(commodity);
			building.Commodities[building.Commodities.length-1].Amount 	= parseInt(priceTable.rows[i].cells[2].innerHTML);
			building.Commodities[building.Commodities.length-1].Min 	= parseInt(priceTable.rows[i].cells[3].innerHTML.match(/value=["'](\d+)["']/)[1]);
			building.Commodities[building.Commodities.length-1].Max 	= parseInt(priceTable.rows[i].cells[4].innerHTML.match(/value=["'](\d+)["']/)[1]);
			building.Commodities[building.Commodities.length-1].SellPrice 	= parseInt(priceTable.rows[i].cells[5].innerHTML.match(/value=["'](\d+)["']/)[1]);
			building.Commodities[building.Commodities.length-1].BuyPrice 	= parseInt(priceTable.rows[i].cells[6].innerHTML.match(/value=["'](\d+)["']/)[1]);
		}
		//alert(building.CommoditiesToString());

		building.IsTrading = true;
		
		return building;
	}
	catch(ex) {
		alert(ex);
		return null;
	}
}


// Parse set price screen for own building (not remotely accessing)
FTSTraderReader.prototype.ParseOwnBuildingTradingDisabled = function(doc) {
	try {
		var building = new Building();
		
		building.IsTrading = false;
		
		// Parse building type
		var boldTags = doc.getElementsByTagName("b");
		building.Type = boldTags[0].textContent;
		
		return building;
	}
	catch(ex) {
		alert(ex);
		return null;
	}
}