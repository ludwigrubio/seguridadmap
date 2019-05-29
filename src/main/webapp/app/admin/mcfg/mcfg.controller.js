(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('McfgController', McfgController);

    McfgController.$inject = ['$timeout', '$scope', '$stateParams', 'User','Principal','ConfigStore', 'AlertService'];

    function McfgController ($timeout, $scope, $stateParams, User, Principal,ConfigStore,AlertService) {
        var vm = this;
        vm.config = {};
        vm.save = save;
        vm.savedConfig = null;
        // Load data
        ConfigStore.byKey.get({key : 'config'}).$promise.then(function(config){
            if(config.value != null ){
                vm.savedConfig = config;
                var cfg = JSON.parse(config.value);
                vm.config = cfg;
                vm.config.cacheDuration = (parseFloat(vm.config.cacheDuration / 60)).toFixed(2) * 1;
                vm.config.maxFileUpload = (parseFloat(vm.config.maxFileUpload / 1024 / 1024)).toFixed(2) * 1;
                vm.config.translations = JSON.stringify(cfg.translations);
            }
        });


        function save () {
            // Prepare object
            vm.isSaving = true;
            var cfgObj = Object.assign({}, vm.config);
            cfgObj.cacheDuration = (parseFloat(cfgObj.cacheDuration * 60)).toFixed(2) * 1;
            cfgObj.maxFileUpload = (parseFloat(cfgObj.maxFileUpload * 1024 * 1024)).toFixed(2) * 1;
            if (cfgObj.translations != null && cfgObj.translations != "")
                cfgObj.translations = JSON.parse(cfgObj.translations);
            vm.savedConfig.key = "config";
            vm.savedConfig.value = angular.toJson(cfgObj);

            if(vm.savedConfig != null && vm.savedConfig.key == 'config') {
                // Update
                ConfigStore.update(vm.savedConfig).$promise.then(function(d){
                    vm.isSaving = false;
                }).catch(function (e) {
                    vm.isSaving = false;
                    AlertService.error("seguridMapApp.mcfg.unexpectedError");
                });
            } else {
                // Create
                ConfigStore.save(vm.savedConfig).$promise.then(function(d){
                    vm.isSaving = false;
                }).catch(function (e) {
                    vm.isSaving = false;
                    AlertService.error("seguridMapApp.mcfg.unexpectedError");
                });
            }
        }
    }
})();
