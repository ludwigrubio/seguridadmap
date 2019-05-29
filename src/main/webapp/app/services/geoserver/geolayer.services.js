(function() {
    'use strict';
    angular
        .module('seguridMapApp')
        .factory('GeoLayers', GeoLayers);

    GeoLayers.$inject = ['Geoserver','$q'];

    function GeoLayers (Geoserver,$q) {
        var vm = {};

        vm.getLayerCenterByProperty = getLayerCenterByProperty;
        vm.getCountByAtributte = getCountByAtributte;
        vm.getCountByAtributteGrouped = getCountByAtributteGrouped;
        vm.getCatalogByAtributte = getCatalogByAtributte;
        vm.getLayerCentroid = getLayerCentroid;

        function getLayerCenterByProperty(workspace,layer,property,propertyValue) {
            return Geoserver.post('<?xml version="1.0" encoding="UTF-8"?>' +
                '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"> ' +
                '<ows:Identifier>vec:Bounds</ows:Identifier> ' +
                '<wps:DataInputs> ' +
                '<wps:Input> ' +
                '<ows:Identifier>features</ows:Identifier> ' +
                '<wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST"> ' +
                '<wps:Body> ' +
                '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML1" xmlns:'+workspace+'="'+workspace+'"> ' +
                '<wfs:Query typeName="'+layer+'">' +
                '<ogc:Filter>' +
                '<ogc:PropertyIsEqualTo>' +
                '<ogc:PropertyName>'+property+'</ogc:PropertyName>' +
                '<ogc:Literal>'+propertyValue+'</ogc:Literal>' +
                '</ogc:PropertyIsEqualTo>' +
                '</ogc:Filter>' +
                '</wfs:Query>' +
                '</wfs:GetFeature> ' +
                '</wps:Body> ' +
                '</wps:Reference> ' +
                '</wps:Input> ' +
                '</wps:DataInputs> ' +
                '<wps:ResponseForm> ' +
                '<wps:RawDataOutput> ' +
                '<ows:Identifier>bounds</ows:Identifier> ' +
                '</wps:RawDataOutput> ' +
                '</wps:ResponseForm> ' +
                '</wps:Execute>').$promise;
        }

        function getCountByAtributte(workspace,layer,agregattionAttr,filters) {

            var xml_filters ="<ogc:Filter>";

           if(filters.length==1){
               xml_filters += value;
           }else{
               xml_filters += "<ogc:And>";
                $.each(filters, function (index, value) {
                    xml_filters += value;
                });
               xml_filters += "</ogc:And>";
           }
            xml_filters += "</ogc:Filter>";

            return Geoserver.post('<?xml version="1.0" encoding="UTF-8"?>' +
            '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"> ' +
            '<ows:Identifier>gs:Aggregate</ows:Identifier>' +
            '<wps:DataInputs> ' +
            '<wps:Input> ' +
            '<ows:Identifier>features</ows:Identifier> ' +
            '<wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST"> ' +
            '<wps:Body> ' +
            '<wfs:GetFeature xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs" service="WFS" version="1.1.0" outputFormat="GML1" xmlns:' + workspace + '="' + workspace + '"> ' +
            '<wfs:Query typeName="' + layer + '"> ' +
                '<ogc:SortBy>'+
            '<ogc:SortProperty>'+
            '<ogc:PropertyName>'+ agregattionAttr +'</ogc:PropertyName>'+
             '<ogc:SortOrder>ASC</ogc:SortOrder>'+
                '</ogc:SortProperty>'+
            '</ogc:SortBy>'+
            xml_filters +
            '</wfs:Query> ' +
            '</wfs:GetFeature> ' +
            '</wps:Body> ' +
            '</wps:Reference> ' +
            '</wps:Input> ' +
            '<wps:Input>' +
            '<ows:Identifier>aggregationAttribute</ows:Identifier>' +
            '<wps:Data>' +
            '<wps:LiteralData>' + agregattionAttr + '</wps:LiteralData>' +
            '</wps:Data>' +
            '</wps:Input>' +
            '<wps:Input>' +
            '<ows:Identifier>groupByAttributes</ows:Identifier>' +
            '<wps:Data>' +
            '<wps:LiteralData>' + agregattionAttr + '</wps:LiteralData>' +
            '</wps:Data>' +
            '</wps:Input>' +
            '<wps:Input>' +
            '<ows:Identifier>function</ows:Identifier>' +
            '<wps:Data>' +
            '<wps:LiteralData>Count</wps:LiteralData>' +
            '</wps:Data>' +
            '</wps:Input>' +
            '<wps:Input>' +
            '<ows:Identifier>singlePass</ows:Identifier>' +
            '<wps:Data>' +
            '<wps:LiteralData>false</wps:LiteralData>' +
            '</wps:Data>' +
            '</wps:Input>' +
            '</wps:DataInputs>' +
            '<wps:ResponseForm>' +
            '<wps:RawDataOutput mimeType="text/json">' +
            '<ows:Identifier>result</ows:Identifier>' +
            '</wps:RawDataOutput>' +
            '</wps:ResponseForm>' +
            '</wps:Execute>').$promise;

        }

        function getCountByAtributteGrouped(workspace,layer,agregattionAttr,groupAttr,filters) {

            var xml_filters ="<ogc:Filter>";

            if(filters.length==1){
                xml_filters += value;
            }else{
                xml_filters += "<ogc:And>";
                $.each(filters, function (index, value) {
                    xml_filters += value;
                });
                xml_filters += "</ogc:And>";
            }

            xml_filters += "</ogc:Filter>";

            return Geoserver.post('<?xml version="1.0" encoding="UTF-8"?>' +
                '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"> ' +
                '<ows:Identifier>gs:Aggregate</ows:Identifier>' +
                '<wps:DataInputs> ' +
                '<wps:Input> ' +
                '<ows:Identifier>features</ows:Identifier> ' +
                '<wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST"> ' +
                '<wps:Body> ' +
                '<wfs:GetFeature xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs" service="WFS" version="1.1.0" outputFormat="GML1" xmlns:' + workspace + '="' + workspace + '"> ' +
                '<wfs:Query typeName="' + layer + '"> ' +
                '<ogc:SortBy>'+
                '<ogc:SortProperty>'+
                '<ogc:PropertyName>'+ agregattionAttr +'</ogc:PropertyName>'+
                '<ogc:SortOrder>desc</ogc:SortOrder>'+
                '</ogc:SortProperty>'+
                '</ogc:SortBy>'+
                xml_filters +
                '</wfs:Query> ' +
                '</wfs:GetFeature> ' +
                '</wps:Body> ' +
                '</wps:Reference> ' +
                '</wps:Input> ' +
                '<wps:Input>' +
                '<ows:Identifier>aggregationAttribute</ows:Identifier>' +
                '<wps:Data>' +
                '<wps:LiteralData>' + agregattionAttr + '</wps:LiteralData>' +
                '</wps:Data>' +
                '</wps:Input>' +
                '<wps:Input>' +
                '<ows:Identifier>groupByAttributes</ows:Identifier>' +
                '<wps:Data>' +
                '<wps:LiteralData>' + groupAttr + '</wps:LiteralData>' +
                '</wps:Data>' +
                '</wps:Input>' +
                '<wps:Input>' +
                '<ows:Identifier>groupByAttributes</ows:Identifier>' +
                '<wps:Data>' +
                '<wps:LiteralData>' + agregattionAttr + '</wps:LiteralData>' +
                '</wps:Data>' +
                '</wps:Input>' +
                '<wps:Input>' +
                '<ows:Identifier>function</ows:Identifier>' +
                '<wps:Data>' +
                '<wps:LiteralData>Count</wps:LiteralData>' +
                '</wps:Data>' +
                '</wps:Input>' +
                '<wps:Input>' +
                '<ows:Identifier>singlePass</ows:Identifier>' +
                '<wps:Data>' +
                '<wps:LiteralData>false</wps:LiteralData>' +
                '</wps:Data>' +
                '</wps:Input>' +
                '</wps:DataInputs>' +
                '<wps:ResponseForm>' +
                '<wps:RawDataOutput mimeType="text/json">' +
                '<ows:Identifier>result</ows:Identifier>' +
                '</wps:RawDataOutput>' +
                '</wps:ResponseForm>' +
                '</wps:Execute>').$promise;

        }

        function getCatalogByAtributte(workspace,layer,attr,filters) {

            var xml_filters ="";

            $.each(filters, function (index, value) {
                xml_filters += value;
            });

            return Geoserver.post('<?xml version="1.0" encoding="UTF-8"?>' +
                '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"> ' +
                '<ows:Identifier>gs:Unique</ows:Identifier>' +
                '<wps:DataInputs> ' +
                '<wps:Input> ' +
                '<ows:Identifier>features</ows:Identifier> ' +
                '<wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST"> ' +
                '<wps:Body> ' +
                '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML1" xmlns:' + workspace + '="' + workspace + '"> ' +
                '<wfs:Query typeName="' + layer + '"> ' +
                xml_filters +
                '</wfs:Query> ' +
                '</wfs:GetFeature> ' +
                '</wps:Body> ' +
                '</wps:Reference> ' +
                '</wps:Input> ' +
                '<wps:Input>'+
                '<ows:Identifier>attribute</ows:Identifier>'+
                '<wps:Data>'+
                '<wps:LiteralData>'+attr+'</wps:LiteralData>'+
                '</wps:Data>'+
                '</wps:Input>'+
                '</wps:DataInputs>' +
                '<wps:ResponseForm>' +
                '<wps:RawDataOutput mimeType="text/json">' +
                '<ows:Identifier>result</ows:Identifier>' +
                '</wps:RawDataOutput>' +
                '</wps:ResponseForm>' +
                '</wps:Execute>').$promise;

        }

        function getLayerCentroid(workspace,layer,property,propertyValue) {
            return Geoserver.post('<?xml version="1.0" encoding="UTF-8"?>' +
                '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"> ' +
                '<ows:Identifier>gs:Centroid</ows:Identifier> ' +
                '<wps:DataInputs> ' +
                '<wps:Input> ' +
                '<ows:Identifier>features</ows:Identifier> ' +
                '<wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST"> ' +
                '<wps:Body> ' +
                '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML1" xmlns:'+workspace+'="'+workspace+'"> ' +
                '<wfs:Query typeName="'+layer+'">' +
                '<ogc:Filter>' +
                '<ogc:PropertyIsEqualTo>' +
                '<ogc:PropertyName>'+property+'</ogc:PropertyName>' +
                '<ogc:Literal>'+propertyValue+'</ogc:Literal>' +
                '</ogc:PropertyIsEqualTo>' +
                '</ogc:Filter>' +
                '</wfs:Query>' +
                '</wfs:GetFeature> ' +
                '</wps:Body> ' +
                '</wps:Reference> ' +
                '</wps:Input> ' +
                '</wps:DataInputs> ' +
                '<wps:ResponseForm> ' +
                '<wps:RawDataOutput> ' +
                '<ows:Identifier>centroid</ows:Identifier> ' +
                '</wps:RawDataOutput> ' +
                '</wps:ResponseForm> ' +
                '</wps:Execute>').$promise;
        }

        return vm;
    }
})();
