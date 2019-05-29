(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('WmsDeleteController',WmsDeleteController);

    WmsDeleteController.$inject = ['$uibModalInstance', 'entity', 'Wms'];

    function WmsDeleteController($uibModalInstance, entity, Wms) {
        var vm = this;

        vm.wms = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            Wms.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();
