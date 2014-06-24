'use strict';

window.app = angular.module('StockJsApp', ['ui.router','restangular']);

(function(){
	function redirectToLogin(){
    location.href = '/api.php?type=redirect&callback='+encodeURIComponent(document.location.href);
  }

	app.constant('ENV', _.extend({
		ACCESS_TOKEN: StockJs.ACCESS_TOKEN,
  	redirectToLogin: redirectToLogin
  	}, StockJs));
})();

// fix '+' in url, see https://github.com/angular/angular.js/issues/3042
app.config(['$provide', function($provide) {
  $provide.decorator('$browser', function($delegate) {
    var superUrl = $delegate.url;
    $delegate.url = function(url, replace) {
      if(url !== undefined) {
        return superUrl(url.replace(/\%20/g,"+"), replace);
      } else {
        return superUrl().replace(/\+/g,"%20");
      }
    };
    return $delegate;
  });
}]);

app.config(["$locationProvider", "RestangularProvider", "ENV", function($locationProvider, RestangularProvider, ENV) {
  $locationProvider.html5Mode(true);

  RestangularProvider.setDefaultHttpFields({cache: false});
  RestangularProvider.setBaseUrl('/api/v1');

  RestangularProvider.setDefaultRequestParams({
    access_token:ENV.ACCESS_TOKEN
  });

  RestangularProvider.setErrorInterceptor( function(response, status /*, headers, config*/) {
    if(response && response.status === 401){// not authenticated
      ENV.redirectToLogin();
      // stop the promise resolution
      return false;
    }

    console.error("RESTANGULAR ERROR", response, status);
  });

  RestangularProvider.setRequestInterceptor(function(elem, operation) {
    if (operation === "remove") {
      // send deletes WITHOUT a body
      return null;
    }
    return elem;
  });
}]);