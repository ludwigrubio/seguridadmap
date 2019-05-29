(function () {
    'use strict';

    angular
        .module('seguridMapApp')
        .factory('FileUpload', FileUpload);

    FileUpload.$inject = ['$resource'];

    function FileUpload ($resource) {
        var service = $resource('api/upload', {}, {
            'save': { method:'POST' },
        });
        return service;
    }
})();
