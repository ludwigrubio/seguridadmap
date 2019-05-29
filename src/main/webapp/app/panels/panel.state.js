(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('page-panel', {
            parent: 'app',
            //Fix Error: Internal server on panel create
            url: '/panel/{id:int}',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN'],
            },
            views: {
                'content@': {
                    templateUrl: 'app/panels/panel.html',
                    controller: 'PagePanelController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('home');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Panel', function($stateParams, Panel) {
                    return Panel.get({id : $stateParams.id}).$promise;
                }],
            }
        });
    }
})();
