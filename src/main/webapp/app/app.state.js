(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('app', {
            abstract: true,
            views: {
                'navbar@': {
                    templateUrl: 'app/layouts/navbar/navbar.html',
                    controller: 'NavbarController',
                    controllerAs: 'vm'
                },
                'sidebar@': {
                    templateUrl: 'app/layouts/sidebar/sidebar.html',
                    controller: 'SideBarController',
                    controllerAs: 'vm'
                },
                'footer@': {
                    templateUrl: 'app/layouts/footer/footer.html',
                    controller: 'FooterController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('global');
                }]
            },
            onEnter: ['$rootScope','Principal', function($rootScope,Principal) {
                $rootScope.isAuthenticated = Principal.isAuthenticated;
            }]
        });
    }
})();
