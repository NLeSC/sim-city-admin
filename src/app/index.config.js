(function() {
  'use strict';

  angular
    .module('dockerCouchAdmin')
    .constant('couchdbDatabase', 'configuration')
    .config(logConfig)
    .config(pouchDBConfig);

  /** @ngInject */
  function logConfig($logProvider) {
    // Enable log
    $logProvider.debugEnabled(true);
  }

  /** @ngInject */
  function pouchDBConfig($httpProvider, pouchDBProvider, POUCHDB_METHODS) {
    // For nolanlawson/pouchdb-authentication
    pouchDBProvider.methods = angular.extend({}, POUCHDB_METHODS, {
      login: 'qify',
      logout: 'qify',
      getSession: 'qify'
    });

    $httpProvider.interceptors.push(CheckCouchLogin);

    /** @ngInject */
    function CheckCouchLogin(CouchService, $location, $q) {
      return {
        'responseError': function(rejection) {
          // if we're not logged-in to the web service, redirect to login page
          if (rejection.status === 401 && $location.path() != '/login') {
            CouchService.reset();
            return rejection;
          }
          return $q.reject(rejection);
        }
      };
    }
  }
})();
