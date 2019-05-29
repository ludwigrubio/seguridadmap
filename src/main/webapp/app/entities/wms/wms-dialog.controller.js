(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('WmsDialogController', WmsDialogController);

    WmsDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'Wms', 'User','Principal'];

    function WmsDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, Wms, User, Principal) {
        var vm = this;

        vm.wms = entity;
        vm.clear = clear;
        vm.save = save;
        //No es necesario cargar la lista de usuarios, quita error acceso denegado al crear un nuevo PANEL como usuario no ADMIN
        //vm.users = User.query();
				vm.users = {};

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;

                if (vm.wms.id !== null) {
                    Wms.update(vm.wms, onSaveSuccess, onSaveError);
                } else {
                    Principal.identity().then(function (user) {
                        vm.wms.author=user;
                        Wms.save(vm.wms, onSaveSuccess, onSaveError);
                    });
                }

        }

        function onSaveSuccess (result) {
            $scope.$emit('seguridMapApp:wmsUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();
