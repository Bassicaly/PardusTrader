window.addEventListener("load", function() { FTSTrader.OnLoad(); }, false);

var FTSTrader = {


	OnLoad : function()
	{
		try
		{

			this.Version = "0.83";
			
			// first, noname, name
			this.TraderState = "first";
			this.IsEnabled = true;
			this.DroidWash = false;
			this.CommodityWash = false;
			this.AutoFillSell = true;
			
			this.Reader = new FTSTraderReader();

			this.Name = "?";
			this.Alliance = "?";
			this.Sector = "-";
			this.Location = [-1, -1];

			this.LastBuildingPosted = new Building();
			this.LastBuildingTimePosted	= new Date().getTime();
			
			this.LastBasePosted 	= new Base();
			this.LastBaseTimePosted	= new Date().getTime();

			this.MessageFrameDocument = null;
			
			// listen for every time a page loads		
			this.appContent = document.getElementById("appcontent");

			if (this.appContent)
				this.appContent.addEventListener("DOMContentLoaded", this.PageLoaded, true);
		}

		catch(ex) { alert(ex); }
	},

	
	PageLoaded : function(aEvent)
	{

		var doc = aEvent.originalTarget;
		var location = doc.location + "";
		var welcomemess = false
		

		if (location.match(/orion.pardus.at/))
		{
			FTSTrader.Server = "pardustools.jennie.nl/orion/orion"; // live server
		}
		else if (location.match(/artemis.pardus.at/))
		{
			FTSTrader.Server = "pardustools.jennie.nl/fts/artemis"; // live server
		}
		else if (location.match(/pegasus.pardus.at/))
		{
			FTSTrader.Server = "pardustools.jennie.nl/fts/pegasus"; // live server
		}
		
		if ((location.match(/portal.pardus.at/)) || (location.match(/www.pardus.at/)))
		{
			FTSTrader.Name = "?";
			if (FTSTrader.TraderState == "first")
			{
				alert("FTSTrader loaded.\n\nAfter you enter a universe, visit the Overview - Stats screen to catch your game name and start the plugin.\nThe plugin will disable again, when you leave that universe.");
			}
			else if (FTSTrader.TraderState == "name")
			{
				alert("FTSTrader stopped.\n\nAfter you re-enter a universe, visit the Overview - Stats screen to start it again.");
				FTSTrader.Name = "?";
				FTSTrader.Alliance = "?";
			}
			FTSTrader.TraderState = "noname";
		}

		try
		{
			// Exit control loop if FTSTrader has been disabled
			if (!FTSTrader.IsEnabled)
				return;	

			// Attempt to parse page type
			var pageType = FTSTrader.Reader.GetPageType(doc);
			
			// If user's name is unknown try to parse it
			if (((FTSTrader.TraderState == "noname") || (FTSTrader.TraderState == "first")) && pageType == "overview_stats")
			{
				
				var name = FTSTrader.Reader.ParseNameFromOverviewStats(doc);
				name = name.replace(/<\/?[^>]+(>|$)/g, "");
				var alliance = FTSTrader.Reader.ParseAllianceFromOverviewStats(doc);
				alliance = alliance.replace(/<\/?[^>]+(>|$)/g, "");
				if (name != null)
				{
					alert("FTSTrader started. - Welcome back " + name + " of the Alliance '"+alliance+"'!\n\nRevisit the Overview - Stats page every time you switch universes.\n\nMake sure you allow the nav screen to completely load before you enter buildings.\nOtherwise buildings will be saved with the wrong location! ");
					FTSTrader.Name = name;
					FTSTrader.Alliance = alliance;
					FTSTrader.TraderState = 'name';
				}
				else
					return;
			}

			if ((pageType != null) && (FTSTrader.TraderState == "name"))
			{
				switch (pageType) 
				{
				
					case "nav":

						// Parse Sector
						var sector = FTSTrader.Reader.ParseSector(doc);
						if (sector != null)
							FTSTrader.Sector = sector;

						// Parse Ship Location
						var location = FTSTrader.Reader.ParseLocation(doc);
						if (location != [-1, -1])
							FTSTrader.Location = location;

						// attempt to clear all properties from last scan
						var building = new Building();
						
						break;

					case "building_welcome":

						if (FTSTrader.LocationKnown())
						{
							var building = FTSTrader.Reader.ParseBuildingWelcomeScreen(doc);
							
							if (building != null)
							{
								FTSTrader.PostBuildingIfChanged(building, doc);
							}
						}
						
						break;
						
					case "building_trade":
					
						if (FTSTrader.LocationKnown())
						{
							var building = FTSTrader.Reader.ParseBuildingTradeData(doc);
					
							if (building != null)
							{
								FTSTrader.PostBuildingIfChanged(building, doc);
							}
						}
					
						break;

					case "starbase_welcome":
										
						if (FTSTrader.LocationKnown())
						{
							var base = FTSTrader.Reader.ParseStarbaseWelcomeScreen(doc);
					
							if (base != null)
							{
								FTSTrader.PostBaseIfChanged(base, doc);
							}
						}
											
						break;
						
					case "starbase_trade":
						
						if (FTSTrader.LocationKnown())
						{
							var base = FTSTrader.Reader.ParseStarbaseTradeData(doc);

							if (base != null)
							{
								FTSTrader.PostBaseIfChanged(base, doc);
							}
						}
												
						break;

					//case "planet_welcome":
															
					//	if (FTSTrader.LocationKnown())
					//	{
					//		var base = FTSTrader.Reader.ParsePlanetWelcomeScreen(doc);

					//		if (base != null)
					//		{
					//			FTSTrader.PostBaseIfChanged(base, doc);
					//		}
					//	}

					//	break;

					case "planet_trade":

						if (FTSTrader.LocationKnown())
						{
							var base = FTSTrader.Reader.ParsePlanetTradeData(doc);

							if (base != null)
							{
								FTSTrader.PostBaseIfChanged(base, doc);
							}
						}

						break;
						
					case "my_building":
					
						if (FTSTrader.LocationKnown())
						{
							var building = FTSTrader.Reader.ParseOwnBuildingStock(doc);

							if (building != null)
							{
								building.Owner = FTSTrader.Name;
								building.Alliance = FTSTrader.Alliance;
								
								FTSTrader.PostBuildingIfChanged(building, doc);
							}
						}
						
						break;

					case "set_building_prices":
					
						if (FTSTrader.LocationKnown())
						{
							var building = FTSTrader.Reader.ParseOwnBuildingPrices(doc);

							if (building != null)
							{
								building.Owner = FTSTrader.Name;
								building.Alliance = FTSTrader.Alliance;
								
								FTSTrader.PostBuildingIfChanged(building, doc);
							}
						}
						break;
						
					case "enable_building_trade":
					
						if (FTSTrader.LocationKnown())
						{
							var building = FTSTrader.Reader.ParseOwnBuildingTradingDisabled(doc);

							if (building != null)
							{
								building.Owner = FTSTrader.Name;
								building.Alliance = FTSTrader.Alliance;
								building.IsTrading = false;
								
								FTSTrader.PostBuildingIfChanged(building, doc);
							}
						}
						break; 

				}
			}

			//alert(FTSTrader.Name + ": " + FTSTrader.Sector + " [" + FTSTrader.Location[0] + "," + FTSTrader.Location[1] + "]");
		}
		catch(ex)
		{
			alert(ex);
		}
	},
	
	LocationKnown : function()
	{
		return !(FTSTrader.Sector == "-" || FTSTrader.Location == [-1, -1]);
	},
	
	PostBuildingIfChanged : function(building, doc)
	{
		try
		{
			FTSTrader.MessageFrameDocument = doc;
			
			building.SetLocation(FTSTrader.Sector, FTSTrader.Location[0], FTSTrader.Location[1]);

			// Only post if building has changed, or it has been 10 mins since last update
			var now = new Date().getTime();
			
			if ( !building.IsSameAs(FTSTrader.LastBuildingPosted) || ((now - FTSTrader.LastBuildingTimePosted) > 1000*60*10) )
			{
				var buildingString = building.ToString();
				var commodityString = building.CommoditiesToString();

				var postData = "version=" + FTSTrader.Version + "&userName=" + FTSTrader.Name + "&building=" + buildingString;

				if (commodityString.length > 0)
					postData += "&commodities=" + commodityString;

				//alert("posting data: " + postData);
				
				var httpRequest  = new FTSComms();
				httpRequest.CallBack 	=  httpRequest.RetrieveCommsResponse;    				
				httpRequest.Post("http://" + FTSTrader.Server + "/UploadBuilding.aspx", postData);
								
				FTSTrader.LastBuildingPosted 	 = building.Clone();
				FTSTrader.LastBuildingTimePosted = now;
			}
		}
		catch(ex)
		{
			try
			{
				FTSTrader.DisplayMessage(ex.message, doc);
			}
			catch(ex) { alert(ex); }
		}
	},
	
	PostBaseIfChanged : function(base, doc)
	{
		try
		{
			FTSTrader.MessageFrameDocument = doc;

			base.SetLocation(FTSTrader.Sector, FTSTrader.Location[0], FTSTrader.Location[1]);
			
			// Only post if building has changed, or it has been 10 mins since last update
			var now = new Date().getTime();
			
			if (!base.IsSameAs(FTSTrader.LastBasePosted) || ((now - FTSTrader.LastBaseTimePosted) > 1000*60*10) )
			{
				var baseString  = base.ToString();
				var commodityString = base.CommoditiesToString();
				
				var postData = "version=" + FTSTrader.Version + "&userName=" + FTSTrader.Name + "&base=" + baseString;

				if (commodityString.length > 0)
					postData += "&commodities=" + commodityString;

				//alert("posting data: " + postData);
				
				var httpRequest  = new FTSComms();
				httpRequest.CallBack 	=  httpRequest.RetrieveCommsResponse;    				
				httpRequest.Post("http://" + FTSTrader.Server + "/UploadBase.aspx", postData);

				FTSTrader.LastBasePosted 	= base.Clone();
				FTSTrader.LastBaseTimePosted 	= now;
			}
		}
		catch(ex)
		{
			try
			{
				FTSTrader.DisplayMessage(ex.message, doc);
			}
			catch(ex) { alert(ex); }
		}
	},
	
	DisplayMessage : function(msg)
	{
		try
		{
			var doc = FTSTrader.MessageFrameDocument;
			
			// check if the FTSTrader div is already present...
			var ftsDiv = doc.getElementById("FTSTrader");
			
			if (ftsDiv == null)
			{
				var style = doc.createElement("style");
				style.appendChild(doc.createTextNode("#FTSTrader { position: absolute; top: 15px; right: 25px; border: solid 1px #FDE22D; width: 200px; padding: 5px; color: #FDE22D; font-size: 1em; font-weight: bold; }"));
				doc.getElementsByTagName("head")[0].appendChild(style);

				var ftsDiv = doc.createElement("div");
				ftsDiv.setAttribute("id", "FTSTrader");
				ftsDiv.appendChild(doc.createTextNode("FTS Trader :"));
				doc.getElementsByTagName("body")[0].appendChild(ftsDiv);
			}
			
			ftsDiv.appendChild(doc.createElement("br"));
			ftsDiv.appendChild(doc.createTextNode("> " + msg));
			
		}
		catch(ex) { alert(msg); }
	}
};
