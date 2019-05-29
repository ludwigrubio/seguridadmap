(function() {
    'use strict';
    angular
        .module('seguridMapApp')
        .factory('Geoserver', Geoserver);

    Geoserver.$inject = ['$resource','WMS_URL'];

    function Geoserver ($resource,WMS_URL) {

        var geoService = $resource(WMS_URL, {}, {
            'query': { method: 'GET',
                transformResponse: function (data,header) {
                    var contentType = header('Content-Type');
                    if(contentType.indexOf('json') !== -1){
                        var jsonData = angular.fromJson(data);
                        return jsonData;
                    }

                    return {xml:data};
                }
            },
            'post': { method: 'POST',
                transformResponse: function (data) {
                    var x2js = new X2JS();
                    var jsonResponse = x2js.xml_str2json(data);
                    return jsonResponse;
                }
            },
        });

        return geoService;
    }
})();
