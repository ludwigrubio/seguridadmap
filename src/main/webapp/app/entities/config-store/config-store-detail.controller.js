(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('ConfigStoreDetailController', ConfigStoreDetailController);

    ConfigStoreDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'ConfigStore'];

    function ConfigStoreDetailController($scope, $rootScope, $stateParams, previousState, entity, ConfigStore) {
        var vm = this;

        vm.configStore = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('seguridMapApp:configStoreUpdate', function(event, result) {
            vm.configStore = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
