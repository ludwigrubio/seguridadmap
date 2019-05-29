(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('PanelDialogController', PanelDialogController);

    PanelDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'Panel', 'Wms', 'User','Principal'];

    function PanelDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, Panel, Wms, User, Principal) {
        var vm = this;

        vm.panel = entity;
        vm.clear = clear;
        vm.save = save;
        vm.wms = Wms.spec.query();
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
            if (vm.panel.id !== null) {
                Panel.update(vm.panel, onSaveSuccess, onSaveError);
            } else {
                Principal.identity().then(function (user) {
                    vm.panel.author=user;
                    Panel.save(vm.panel, onSaveSuccess, onSaveError);
                });
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('seguridMapApp:panelUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();
