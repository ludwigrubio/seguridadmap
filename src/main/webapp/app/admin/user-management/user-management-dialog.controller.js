(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('UserManagementDialogController',UserManagementDialogController);

    UserManagementDialogController.$inject = ['$scope','$stateParams', '$uibModalInstance', 'entity', 'User', 'JhiLanguageService','Upload','AlertService'];

    function UserManagementDialogController ($scope,$stateParams, $uibModalInstance, entity, User, JhiLanguageService,Upload,AlertService) {
        var vm = this;
        vm.fileUploaded = null;
        vm.authorities = ['ROLE_USER', 'ROLE_ADMIN','ROLE_CIUDADANO','ROLE_INVESTIGADOR'];
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.user = entity;


        //File uplod
        $scope.$watch('vm.user.imageProfile', function(newVal, oldVal){
            if (newVal == undefined && oldVal!=undefined){
                vm.user.imageProfile = oldVal;
            }
        });

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function onSaveSuccess (result) {
            vm.isSaving = false;
            $uibModalInstance.close(result);
        }

        function onSaveError () {
            vm.isSaving = false;
        }

        function save () {
            vm.isSaving = true;
            //Step one
            //Upload image profile
            if (vm.user.imageProfile!=null && vm.user.imageProfile.size > 0 ){
                Upload.upload({
                    url: 'api/upload',
                    data: {file: vm.user.imageProfile }
                }).then(function (resp) {
                    if (resp.data != null){
                        vm.fileUploaded = resp.data;
                        vm.user.imageProfile = vm.fileUploaded;
                        console.log(vm.user.imageProfile);
                        stepTwo();
                    }
                }, function (resp) {
                    AlertService.error("global.file.error");
                    vm.isSaving = false;
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                });
            }else{
                stepTwo();
            }
            function stepTwo() {
                if($scope.userManagement!=undefined && $scope.userManagement.password != undefined ){
                    if ($scope.userManagement.password !== $scope.userManagement.confirmPassword) {
                        vm.user.password = $scope.userManagement.password;
                        vm.doNotMatch = 'ERROR';
                        vm.isSaving = false;
                        return;
                    }else{
                        vm.user.password = $scope.userManagement.password;
                        console.log( vm.user.password );
                        vm.doNotMatch = null;
                    }
                }
                if (vm.user.id !== null) {
                    User.update(vm.user, onSaveSuccess, onSaveError);
                } else {
                    User.save(vm.user, onSaveSuccess, onSaveError);
                }
            }
        }
    }
})();
