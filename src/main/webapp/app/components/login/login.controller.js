(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$rootScope', '$state', '$timeout', 'Auth','Principal'];

    function LoginController ($rootScope, $state, $timeout, Auth,Principal) {
        var vm = this;

        vm.authenticationError = false;
        vm.credentials = {};
        vm.login = login;
        vm.password = null;
        vm.register = register;
        vm.rememberMe = true;
        vm.requestResetPassword = requestResetPassword;
        vm.username = null;

        $timeout(function (){angular.element('#username').focus();});

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
                if(vm.isAuthenticated())
                    $state.go("home");
            });
        }

        function login (event) {
            event.preventDefault();
            Auth.login({
                username: vm.username,
                password: vm.password,
                rememberMe: vm.rememberMe
            }).then(function () {
                vm.authenticationError = false;
                if ($state.current.name === 'register' || $state.current.name === 'activate' ||
                    $state.current.name === 'finishReset' || $state.current.name === 'requestReset') {
                    $state.go('home');
                }

                $rootScope.$broadcast('authenticationSuccess');

                // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                // since login is successful, go to stored previousState and clear previousState
                $state.go('home');
            }).catch(function () {
                vm.authenticationError = true;
            });
        }

        function register () {
            $state.go('register');
        }

        function requestResetPassword () {
            $state.go('requestReset');
        }
    }
})();
