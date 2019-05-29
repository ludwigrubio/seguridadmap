(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('panel', {
            parent: 'entity',
            url: '/panel?page&sort&search',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN'],
                pageTitle: 'seguridMapApp.panel.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/panel/panels.html',
                    controller: 'PanelController',
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
                    $translatePartialLoader.addPart('panel');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        /*
        .state('panel-detail', {
            parent: 'entity',
            url: '/panel/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'seguridMapApp.panel.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/panel/panel-detail.html',
                    controller: 'PanelDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('panel');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Panel', function($stateParams, Panel) {
                    return Panel.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'panel',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        */
        .state('panel-detail.edit', {
            parent: 'panel-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/panel/panel-dialog.html',
                    controller: 'PanelDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Panel', function(Panel) {
                            return Panel.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('panel.new', {
            parent: 'panel',
            url: '/new',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/panel/panel-dialog.html',
                    controller: 'PanelDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                nombre: null,
                                descripcion: null,
                                id: null,
                                wms: null,
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('panel', null, { reload: 'panel' });
                }, function() {
                    $state.go('panel');
                });
            }]
        })
        .state('panel.edit', {
            parent: 'panel',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/panel/panel-dialog.html',
                    controller: 'PanelDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Panel', function(Panel) {
                            return Panel.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('panel', null, { reload: 'panel' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('panel.delete', {
            parent: 'panel',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_INVESTIGADOR','ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/panel/panel-delete-dialog.html',
                    controller: 'PanelDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Panel', function(Panel) {
                            return Panel.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('panel', null, { reload: 'panel' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
