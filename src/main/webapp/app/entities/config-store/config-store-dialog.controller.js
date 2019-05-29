(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('ConfigStoreDialogController', ConfigStoreDialogController);

    ConfigStoreDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'ConfigStore'];

    function ConfigStoreDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, ConfigStore) {
        var vm = this;

        vm.configStore = entity;
        vm.clear = clear;
        vm.save = save;

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.configStore.id !== null) {
                ConfigStore.update(vm.configStore, onSaveSuccess, onSaveError);
            } else {
                ConfigStore.save(vm.configStore, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('seguridMapApp:configStoreUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();
