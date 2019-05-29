(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('FullDataController', FullDataController);

    FullDataController.$inject = ['$scope','File','Upload','AlertService','ConfigStore'];

    function FullDataController ($scope,File,Upload,AlertService,ConfigStore) {
	    var vm = this;
			vm.isSaving = false;
			vm.fullData = {};
            vm.fullUpdateDate = {};

			// Watch file select
			$scope.$watch('vm.file', function(newVal, oldVal){
              if (newVal == undefined){
                  vm.file = oldVal;
              }
          });

			// Watch date select
            $scope.$watch('vm.updateDate', function(newVal, oldVal){
                if (newVal == undefined){
                    vm.updateDate = oldVal;
                }
            });

			// Load file
			ConfigStore.byKey.get({key : 'full-data'}).$promise.then(function(config){
				vm.fullData = config;
				if(config.value != null){
					vm.file = angular.fromJson(config.value);
				}
			});

            // Load date
           ConfigStore.byKey.get({key : 'update-date'}).$promise.then(function(config){
               vm.fullUpdateDate =config;
                if(config.value != null){
                    vm.updateDate = angular.fromJson(config.value);
                    vm.updateDate=new Date(vm.updateDate.date);
                }
            });

        //Custom date format
        function getCustomFormatDate(date,mode){
            var dd = date.getDate();
            var mm = date.getMonth()+1; //January is 0!

            var yyyy = date.getFullYear();
            if(dd<10){
                dd='0'+dd;
            }
            if(mm<10){
                mm='0'+mm;
            }
            if(mode==1)
                return yyyy+'-'+mm+'-'+dd+"T06:00:00.000Z";
            else
                return yyyy+'/'+mm+'/'+dd;
        }

			// Update file
			vm.save = function() {

            if (vm.updateDate!=null){

                var objectValue={'date':getCustomFormatDate(vm.updateDate,1)};

                if (vm.fullUpdateDate.value == null) {
                    var config = {};
                    config.key = 'update-date';

                    config.value = angular.toJson(objectValue);
                    ConfigStore.save(config);
                } else {
                    vm.fullUpdateDate.value = angular.toJson(objectValue);
                    ConfigStore.update(vm.fullUpdateDate);
                }

            }else
                AlertService.error("global.file.error");

	      if (vm.file!=null && vm.file.size > 0){
	          Upload.upload({
	              url: 'api/upload',
	              data: {file: vm.file }
	          }).then(function (resp) {
	              if (resp.data != null){
		              if (vm.fullData.value == null) {
			              var config = {};
			              config.key = 'full-data';
			              config.value = angular.toJson(resp.data);
			              ConfigStore.save(config);
		              } else {
			              vm.fullData.value = angular.toJson(resp.data);
                        ConfigStore.update(vm.fullData);
		              }
	              }
	          }, function (resp) {
							AlertService.error("global.file.error");
	          }, function (evt) {
	              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	          });
	      }
			}



    }
})();
