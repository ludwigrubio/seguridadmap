(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('config-store', {
            parent: 'entity',
            url: '/config-store?page&sort&search',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'seguridMapApp.configStore.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/config-store/config-stores.html',
                    controller: 'ConfigStoreController',
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
                    $translatePartialLoader.addPart('configStore');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('config-store-detail', {
            parent: 'entity',
            url: '/config-store/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'seguridMapApp.configStore.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/config-store/config-store-detail.html',
                    controller: 'ConfigStoreDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('configStore');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'ConfigStore', function($stateParams, ConfigStore) {
                    return ConfigStore.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'config-store',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('config-store-detail.edit', {
            parent: 'config-store-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/config-store/config-store-dialog.html',
                    controller: 'ConfigStoreDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['ConfigStore', function(ConfigStore) {
                            return ConfigStore.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('config-store.new', {
            parent: 'config-store',
            url: '/new',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/config-store/config-store-dialog.html',
                    controller: 'ConfigStoreDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                key: null,
                                value: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('config-store', null, { reload: 'config-store' });
                }, function() {
                    $state.go('config-store');
                });
            }]
        })
        .state('config-store.edit', {
            parent: 'config-store',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/config-store/config-store-dialog.html',
                    controller: 'ConfigStoreDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['ConfigStore', function(ConfigStore) {
                            return ConfigStore.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('config-store', null, { reload: 'config-store' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('config-store.delete', {
            parent: 'config-store',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/config-store/config-store-delete-dialog.html',
                    controller: 'ConfigStoreDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['ConfigStore', function(ConfigStore) {
                            return ConfigStore.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('config-store', null, { reload: 'config-store' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
