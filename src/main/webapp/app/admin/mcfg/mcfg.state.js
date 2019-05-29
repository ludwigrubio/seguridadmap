(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('mobile-config', {
            parent: 'admin',
            url: '/mobile-config',
            data: {
                authorities: ["ROLE_ADMIN"]
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/mcfg/mcfg.html',
                    controller: 'McfgController',
                    controllerAs: 'vm'

                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('mcfg');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
