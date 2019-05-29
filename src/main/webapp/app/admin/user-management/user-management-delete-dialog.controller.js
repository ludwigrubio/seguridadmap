(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('UserManagementDeleteController', UserManagementDeleteController);

    UserManagementDeleteController.$inject = ['$uibModalInstance', 'entity', 'User','File'];

    function UserManagementDeleteController ($uibModalInstance, entity, User, File) {
        var vm = this;

        vm.user = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (login) {

            User.delete({login: login},
                function () {
                    $uibModalInstance.close(true);
            });
        }
    }
})();
