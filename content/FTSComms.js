function FTSComms()
{
	var httpRequest = new XMLHttpRequest();
	var thisObject = this;
	
	this.CallBack 	  = function() {}
	this.readyState   = function() { return httpRequest.readyState; }
	this.status	  = function() { return httpRequest.status; }
	this.responseText = function() { return httpRequest.responseText; }
	this.HttpRequest  = function() { return httpRequest; }
	
	this.Get = function(url)
	{	
		httpRequest.onreadystatechange = thisObject.CallBack;
		httpRequest.open("GET", url, true);
		httpRequest.send(null);
	}
	
	this.Post = function(url, postData)
	{
		if (postData == undefined)
			return;
		httpRequest.onreadystatechange = thisObject.CallBack;
		httpRequest.open("POST", url, true);
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); 
		httpRequest.send(postData);
	}
	
	this.Abort = function()
	{
		httpRequest.abort();
	}
	
	this.RetrieveCommsResponse = function()
	{
		try
		{
			//readyState of 4 represents that data has been returned 
			if (httpRequest.readyState == 4)
			{
				if (httpRequest.status == 200)
				{
					if (httpRequest.responseText.length > 0)
					{
						FTSTrader.DisplayMessage(httpRequest.responseText);
						//alert(httpRequest.responseText);
					}
				}
				else
				{
					alert(httpRequest.status + " : " + httpRequest.responseText);
					FTSTrader.DisplayMessage("Problem encountered uploading data");
				}
			}
		}
		catch(ex)
		{
			try
			{
				if (ex.name == "NS_ERROR_NOT_AVAILABLE")
					FTSTrader.DisplayMessage("Upload server unable");
				else
					FTSTrader.DisplayMessage(ex.message);
			}
			catch(ex) { alert(ex); }

		}
	}
}
