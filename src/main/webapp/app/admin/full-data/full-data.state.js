(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('full-data', {
            parent: 'admin',
            url: '/full-data',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'full-data.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/full-data/full-data.html',
                    controller: 'FullDataController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('full-data');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
