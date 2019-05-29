(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('ConfigStoreDeleteController',ConfigStoreDeleteController);

    ConfigStoreDeleteController.$inject = ['$uibModalInstance', 'entity', 'ConfigStore'];

    function ConfigStoreDeleteController($uibModalInstance, entity, ConfigStore) {
        var vm = this;

        vm.configStore = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            ConfigStore.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();
