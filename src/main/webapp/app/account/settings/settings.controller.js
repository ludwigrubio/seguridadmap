(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('SettingsController', SettingsController);

    SettingsController.$inject = ['$rootScope','$scope','Principal', 'Auth', 'JhiLanguageService', '$translate','Upload','AlertService'];

    function SettingsController ($rootScope, $scope,Principal, Auth, JhiLanguageService, $translate,Upload,AlertService) {
        var vm = this;

        vm.error = null;
        vm.save = save;
        vm.settingsAccount = null;
        vm.success = null;
        vm.fileUploaded = null;

        //File uplod
        $scope.$watch('vm.settingsAccount.imageProfile', function(newVal, oldVal){
            if (newVal == undefined && oldVal!=undefined){
                vm.settingsAccount.imageProfile = oldVal;
            }
        });

        /**
         * Store the "settings account" in a separate variable, and not in the shared "account" variable.
         */
        var copyAccount = function (account) {
            return {
                activated: account.activated,
                email: account.email,
                firstName: account.firstName,
                langKey: account.langKey,
                lastName: account.lastName,
                imageProfile: account.imageProfile,
                login: account.login
            };
        };

        Principal.identity().then(function(account) {
            vm.settingsAccount = copyAccount(account);
        });

        function save () {
            if ( vm.settingsAccount.imageProfile!=null &&  vm.settingsAccount.imageProfile.size > 0 ){
                Upload.upload({
                    url: 'api/upload',
                    data: {file:  vm.settingsAccount.imageProfile }
                }).then(function (resp) {
                    if (resp.data != null){
                        vm.fileUploaded = resp.data;
                        vm.settingsAccount.imageProfile = vm.fileUploaded;
                        stepTwo();
                    }
                }, function (resp) {
                    AlertService.error("global.file.error");
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                });
            }else{
                stepTwo();
            }

            function stepTwo() {

                Auth.updateAccount(vm.settingsAccount).then(function() {
                    vm.error = null;
                    vm.success = 'OK';
                    Principal.identity(true).then(function(account) {

                        // Change image profile without refresh page
                        $rootScope.$broadcast('UPDATE_ACCOUNT',account);

                        vm.settingsAccount = copyAccount(account);
                    });
                    JhiLanguageService.getCurrent().then(function(current) {
                        if (vm.settingsAccount.langKey !== current) {
                            $translate.use(vm.settingsAccount.langKey);
                        }
                    });
                }).catch(function() {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
            }
        }
    }
})();
