(function() {
    'use strict';
    angular
        .module('seguridMapApp')
        .factory('ConfigStore', ConfigStore);

    ConfigStore.$inject = ['$resource'];

    function ConfigStore ($resource) {
        var resourceUrl =  'api/config-stores/:id';
        var resourceByKey = 'api/config-stores/by-key/:key';
        var basic =  $resource(resourceUrl, {}, {
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
        basic.byKey = $resource(resourceByKey, {}, {
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
        });
        return basic;
    }
})();
