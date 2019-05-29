(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('PanelDeleteController',PanelDeleteController);

    PanelDeleteController.$inject = ['$uibModalInstance', 'entity', 'Panel'];

    function PanelDeleteController($uibModalInstance, entity, Panel) {
        var vm = this;

        vm.panel = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            Panel.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();
