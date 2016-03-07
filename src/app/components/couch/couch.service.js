(function() {
  'use strict';

  angular
    .module('simCityAdmin')
    .service('CouchService', CouchService);

  /** @ngInject */
  function CouchService(pouchDB, $q, $log, couchdbHost, $location) {
    var vm = this;

    vm.db = pouchDB(couchdbHost + '/configurator');
    vm.loggedIn = 'unknown';
    vm.username = undefined;
    vm.login = login;
    vm.logout = logout;
    vm.getUsername = getUsername;
    vm.isLoggedIn = isLoggedIn;
    vm.reset = reset;

    updateSession();

    function login(username, password) {
      return vm.db.login(username, password).then(
        function() {
          vm.username = username;
          vm.loggedIn = 'yes';
        },
        function(err) {
          vm.loggedIn = 'no';
          if (err.name === 'unauthorized') {
            return $q.reject('Name or password incorrect.');
          } else {
            $log.error(err);
            return $q.reject('Application failure. Try again later.');
          }
        });
    }

    function logout() {
      return vm.db.logout().then(vm.reset);
    }

    function reset() {
      vm.username = '';
      vm.loggedIn = 'no';
    }

    function getUsername() {
      if (typeof(vm.username) === "undefined") {
        return updateSession()
          .then(function() { return vm.username; });
      } else {
        return $q.when(vm.username);
      }
    }

    function isLoggedIn() {
      if (vm.loggedIn === 'yes') {
        return $q.when(true);
      } else if (vm.loggedIn === 'no') {
        return $q.when(false);
      } else {
        return updateSession().then(function(name) {
          return name !== '';
        });
      }
    }

    function updateSession() {
      return vm.db.getSession().then(
        function(res) {
          if (!res.ok) {
            return $q.reject('Session invalid.');
          }
          if (res.userCtx.name) {
            vm.username = res.userCtx.name;
            vm.loggedIn = 'yes';
          } else {
            vm.username = '';
            vm.loggedIn = 'no';
            $location.path('/login');
          }
        });
    }
  }
})();
