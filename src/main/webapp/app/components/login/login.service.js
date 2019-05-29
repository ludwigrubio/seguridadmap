(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .factory('LoginService', LoginService);

    LoginService.$inject = ['$state'];

    function LoginService ($state) {
        var service = {
            open: open
        };

        return service;

        function open () {
           // $state.go('login');
        }
    }
})();
