(function() {
    'use strict';
    angular
        .module('seguridMapApp')
        .factory('File', File);

    File.$inject = ['$resource', 'DateUtils'];

    function File ($resource, DateUtils) {
        var resourceUrl =  'api/files/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        data.creationDate = DateUtils.convertDateTimeFromServer(data.creationDate);
                    }
                    return data;
                }
            },
            'update': { method:'PUT' }

        });
    }
})();
