(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('SideBarController', SideBarController);

    SideBarController.$inject = ['$scope','$state', 'Auth', 'Principal', 'ProfileService','Panel','leafletData'];

    function SideBarController ($scope,$state, Auth, Principal, ProfileService,Panel,leafletData) {
        var vm = this;
        vm.isAuthenticated = Principal.isAuthenticated;
        vm.go = go;
        vm.logout = logout;
        vm.imageProfile="";
        vm.user = {};

        // UPDATE ACCOUNT - ON USER UPDATE
        $scope.$on('UPDATE_ACCOUNT', function(event, user) {
            Principal.identity().then(function (user) {
                vm.user = user;
                if(vm.user.imageProfile!=undefined)
                    vm.imageProfile="../files/"+vm.user.imageProfile.fileName;
                else{
                    vm.imageProfile="../content/images/avatar.jpg";
                }
            });
        });

        function logout() {
            Auth.logout();
            $state.go('home');
            leafletData.getMap("main1").then(
                function (map) {
                    setTimeout(function(){ map.invalidateSize()}, 400);
                }
            );
        }

        Principal.identity().then(function (user) {
            vm.user = user;
            if(vm.user.imageProfile!=undefined)
                vm.imageProfile="../files/"+vm.user.imageProfile.fileName;
            else{
                vm.imageProfile="../content/images/avatar.jpg";
            }
        });

        Panel.query({
            sort: 'id,asc'
        }, function onSuccess(data, headers) {
            vm.panels = data;
        }, function onError(error) {

        });

        function go(panel) {
            $state.go("page-panel",{id:panel.id});
        }

        ProfileService.getProfileInfo().then(function(response) {
            vm.inProduction = response.inProduction;
            vm.swaggerEnabled = response.swaggerEnabled;
        });

    }
})();
