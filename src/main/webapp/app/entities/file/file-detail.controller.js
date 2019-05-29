(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('FileDetailController', FileDetailController);

    FileDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'File', 'User'];

    function FileDetailController($scope, $rootScope, $stateParams, previousState, entity, File, User) {
        var vm = this;

        vm.file = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('seguridMapApp:fileUpdate', function(event, result) {
            vm.file = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
