(function() {
    'use strict';
    angular
        .module('seguridMapApp')
        .factory('GeoCapabilities', GeoCapabilities);

    GeoCapabilities.$inject = ['Geoserver','$q'];


    function GeoCapabilities (Geoserver,$q) {
        var vm = {};
        vm.getGeoCapabilities = getGeoCapabilities;

        function getGeoCapabilities() {
            return Geoserver.query({
                'service': 'wfs',
                'request': 'GetCapabilities',
            }).$promise;
        }

        return vm;
    }
})();
