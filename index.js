
(function() {
	var VERSION_RESOURCE = "gatewayResource";
	var VERSION = "version";
	var CLASS = "class";
	var CONTEXT = "context";
	var BASE_URL = "https://galop.connectors.tableau.com";

	var parseInitialQueryParams = function(location) {
		var uri = new URI(location.href);

		var requiredParams = [VERSION_RESOURCE, VERSION, CLASS, CONTEXT];
		for(var i in requiredParams) {
			if (!uri.hasQuery(requiredParams[i])) {
				return undefined;
			}
		}

		var result = URI.parseQuery(location.search);
		return result;
	}

	var buildGALOPUrl = function(queryParams, location) {
		// Get rid of our query string for the callback
		var callerUrl = URI(location.href).search("").toString();

		var uri = URI(BASE_URL).path(
			URI.joinPaths(
				queryParams[VERSION_RESOURCE],
				queryParams[VERSION],
				"auth",
				queryParams[CLASS],
				queryParams[CONTEXT]))
			.setSearch({ "caller" : callerUrl});

		return uri.toString();
	}

	var myConnector = tableau.makeConnector();

	myConnector.init = function(initCallback) {
		if (tableau.phase !== tableau.phaseEnum.authPhase) {
			tableau.abortWithError("This connector is only valid in the auth phase");
			return;
		}

		var initialParams = parseInitialQueryParams(window.location);
		if (initialParams) {
			var redirectUrl = buildGALOPUrl(initialParams, window.location);
			console.log(redirectUrl);
			window.location = redirectUrl;
		} else {
			// This is the case where we've already been redirected. Set the query string as the password and submit
			var password = new URI(window.location.href).query();
			tableau.password = password;
			initCallback();
			tableau.submit();
		}
	}

	myConnector.getSchema = function(schemaCallback) {
		tableau.abortWithError("This connector is only valid in the auth phase");
	}

	myConnector.getData = function(table, doneCallback) {
		tableau.abortWithError("This connector is only valid in the auth phase");
	}

	tableau.registerConnector(myConnector);

})();