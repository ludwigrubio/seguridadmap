(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('wms', {
            parent: 'entity',
            url: '/wms?page&sort&search',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN'],
                pageTitle: 'seguridMapApp.wms.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/wms/wms.html',
                    controller: 'WmsController',
                    controllerAs: 'vm'
                }
            },
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                sort: {
                    value: 'id,asc',
                    squash: true
                },
                search: null
            },
            resolve: {
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                    return {
                        page: PaginationUtil.parsePage($stateParams.page),
                        sort: $stateParams.sort,
                        predicate: PaginationUtil.parsePredicate($stateParams.sort),
                        ascending: PaginationUtil.parseAscending($stateParams.sort),
                        search: $stateParams.search
                    };
                }],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('wms');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('wms-detail', {
            parent: 'entity',
            url: '/wms/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'seguridMapApp.wms.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/wms/wms-detail.html',
                    controller: 'WmsDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('wms');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Wms', function($stateParams, Wms) {
                    return Wms.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'wms',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('wms-detail.edit', {
            parent: 'wms-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/wms/wms-dialog.html',
                    controller: 'WmsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Wms', function(Wms) {
                            return Wms.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('wms.new', {
            parent: 'wms',
            url: '/new',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/wms/wms-dialog.html',
                    controller: 'WmsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                nombre: null,
                                url: null,
                                capa: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('wms', null, { reload: 'wms' });
                }, function() {
                    $state.go('wms');
                });
            }]
        })
        .state('wms.edit', {
            parent: 'wms',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/wms/wms-dialog.html',
                    controller: 'WmsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Wms', function(Wms) {
                            return Wms.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('wms', null, { reload: 'wms' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('wms.delete', {
            parent: 'wms',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/wms/wms-delete-dialog.html',
                    controller: 'WmsDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Wms', function(Wms) {
                            return Wms.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('wms', null, { reload: 'wms' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
