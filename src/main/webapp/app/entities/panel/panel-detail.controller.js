(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('PanelDetailController', PanelDetailController);

    PanelDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Panel', 'Wms', 'User'];

    function PanelDetailController($scope, $rootScope, $stateParams, previousState, entity, Panel, Wms, User) {
        var vm = this;

        vm.panel = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('seguridMapApp:panelUpdate', function(event, result) {
            vm.panel = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
