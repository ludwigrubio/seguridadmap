(function() {
    'use strict';
    angular
        .module('seguridMapApp')
        .factory('Panel', Panel);

    Panel.$inject = ['$resource'];

    function Panel ($resource) {
        var resourceUrl =  'api/panels/:id';
        var resourceSpecUrl = 'api/panels/byuser';

        var service =   $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                    }
                    return data;
                }
            },
            'update': { method:'PUT' }
        });

        service.spec  =  $resource(resourceSpecUrl, {}, {
            'query': { method: 'GET', isArray: true},
        });

        return service;
    }
})();
