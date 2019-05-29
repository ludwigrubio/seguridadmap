(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('FooterController', NavbarController);

    NavbarController.$inject = ['$state', 'Auth', 'Principal', 'ProfileService','Panel'];

    function NavbarController ($state, Auth, Principal, ProfileService, LoginService,Panel) {
        var vm = this;

        vm.isNavbarCollapsed = true;
        vm.isAuthenticated = Principal.isAuthenticated;
        vm.$state = $state;


    }
})();
