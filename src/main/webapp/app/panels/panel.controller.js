(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('PagePanelController', PagePanelController);

    PagePanelController.$inject = ['$scope', 'Principal', 'LoginService', '$state','olData','entity','Geoserver','GeoLayers','GeoCapabilities','$http','$filter','ConfigStore','WMS_URL','BASE_DOMAIN','BASE_DOMAIN_TEXT'];

    function PagePanelController ($scope, Principal, LoginService, $state,olData,entity,Geoserver,GeoLayers,GeoCapabilities,$http,$filter,ConfigStore,WMS_URL,BASE_DOMAIN,BASE_DOMAIN_TEXT) {

        /**
         *  V A R I A B L E S
         * */
        /********************************************************************************************************/
        var vm = this;
        var baseWMSURL= WMS_URL;
        vm.account = null;
        vm.isAuthenticated = null;
        vm.itemsPerPage = 3;
        vm.login = LoginService.open;
        vm.entity = entity;
        vm.register = register;
        vm.abstracts = {};
        vm.filters = {};
        vm.catalogs = {};
        vm.blocks = {};
        vm.max_delitos = [];
        vm.download = { format:{} ,link:{}};
        vm.lastValueArea="";
        vm.lastValueRadio="";
        vm.maxAreaLimit = 250;
        vm.maxRadioLimit = 10;
        vm.typeErrorMeasure=null;
        vm.delitoTipo = [];
        vm.delitoAnio = [];
        vm.selectedAG = {};
        vm.objectsAG=[];
        vm.captionDescription="<p class=\"text-right\"><strong>Cifras  preliminares.</strong>  Información  proveniente  de  las  Averiguaciones "+
            "Previas  y/o  Carpetas  de  Investigación  iniciadas  en  las  agencias del "+
            "Ministerio Público."+
            "</p>"+
            "<p> <strong>Notas:</strong> " +
            "<ul>" +
            "<li>"+
            "La  información  puede  modificarse  en  base a los resultados de la "+
            "investigación,  puede  sufrir  cambio  en  el  tipo  de  delito  o pudieran "+
            "presentarse  delitos  adicionales,  por  lo  que debe de ser considerada la "+
            "información con las reservas a estas aclaraciones."+
            "</li>"+
            "<li>"+
            "La información contenida en el gráfico, hace referencia a los eventos que cuentan con los datos "+
            " suficientes para ser georreferenciados."+
            "</li>"+
            "</ul>" +
            "</p><br>";
        var sketch;
        var measureTooltip;
        var measureTooltipElement;
        vm.catalogs.regiones = null;
        vm.catalogs.formats = [
            {id: 'application%2Fvnd.google-earth.kml%2Bxml', name: 'KML'},
            {id: 'SHAPE-ZIP', name: 'SHP'},
            {id: 'csv', name: 'CSV'},
            {id: 'application%2Fjson', name: 'GeoJSON'}
        ];
        vm.catalogs.tipos_delitos = [];
        vm.catalogs.sexo_delitos =[
            {key:'m', prop:'Masculino'},
            {key:'f', prop:'Femenino' },
        ];
        vm.columnFilterCLass="col-xs-12 col-sm-12 col-md-4";

        Principal.identity().then(function (user) {
            if(user!=null) {
                vm.authorMap=user;
                if (user.authorities.indexOf("ROLE_INVESTIGADOR") > -1 ||
                    user.authorities.indexOf("ROLE_ADMIN") > -1)
                    vm.columnFilterCLass = "col-xs-12 col-sm-6 col-md-3";
            }
        });

        // Load full data file config
        ConfigStore.byKey.get({key : 'full-data'}).$promise.then(function(config){
            if(config.value != null && (angular.fromJson(config.value)).fileName != null){
                vm.fullDataFileSrc = "/files/" + (angular.fromJson(config.value)).fileName;
            }
        });

        // Load date
        ConfigStore.byKey.get({key : 'update-date'}).$promise.then(function(config){

            if(config.value != null){
                vm.updateDate = angular.fromJson(config.value);

                var d=new Date(vm.updateDate.date);
                var formatted =  ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" +
                    d.getFullYear();

                var formatedInitial= d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2)  + "-" +
                    ("0" + d.getDate()).slice(-2) +" 00:00:00";

                vm.filters.pickerEnd.date= new Date(formatedInitial);
                console.log(vm.filters.pickerEnd.date);
                vm.updateDate=formatted;
            }

        });

        $scope.years_delitos={
            minValue: new Date().getFullYear(),
            maxValue: new Date().getFullYear(),
            value:'',
            options: {
                floor: 2013,
                ceil:  new Date().getFullYear(),
                step: 1
            }
        };

        vm.filters.pickerStart = {
            date:new Date("2013-01-01 00:00:00"),
            datepickerOptions: {
                maxDate: null
            }
        };
        // max date picker
        vm.filters.pickerEnd = {
            datepickerOptions: {
                minDate: null
            }
        };
        vm.filters.type_filter_year= false;
        vm.filters.style_marginacion={
            municipios: { status:false,  style:'mapa_jalisco:marginacion_municipios'},
            agebs: { status:false,  style:'mapa_jalisco:marginacion_agebs'},
            colonias: { status:false, style:'mapa_jalisco:marginacion_colonias'},
            default: {style:'mapa_jalisco:green_border'}
        };
        vm.filters.style_delitos={
            heatmap: { status:true,  style:'mapa_jalisco:heatmap_delitos_blue'},
            compare: { status:true,  style:'mapa_jalisco:delitos_compare'},
        };
        vm.filters.visible_layers={
            municipios: false,
            agebs: false,
            colonias: false,
        };
        vm.cql_filter_region = "INCLUDE";
        vm.cql_filter_mun = "INCLUDE";

        vm.cql = {
            region : {
                lr : ['INCLUDE'],
                hm : ['INCLUDE']
            },
            municipios: {
                lm : ['INCLUDE']
            },
            colonias: {
                lc : ['INCLUDE']
            },
            agebs: {
                la : ['INCLUDE']
            },
            map:{
                gm: null,
                gmPosList: null,
                gmo: null
            },
            delito:[''],
            wms:null
        };
        vm.orig = {
            region : {
                lr : ['INCLUDE'],
                hm : ['INCLUDE']
            },
            municipios: {
                lm : ['INCLUDE']
            },
            colonias: {
                lc : ['INCLUDE']
            },
            agebs: {
                la : ['INCLUDE']
            },
            map:{
                gm: null,
                gmPosList: null,
                gmo: null
            },
            delito:[''],
            wms:null
        };
        vm.graphs_filters={
            last:{
                mun: null
            }
        }

        //For select row in table WMS

        $scope.idSelectedRow= null;
        $scope.setSelectedRow = function (idSelectedRow) {
            $scope.idSelectedRow = idSelectedRow;
        };


        var map = {};

        //Init catalog regiones

        Geoserver.query({
            'service': 'wfs',
            'version': '2.0.0',
            'typename': 'mapa_jalisco:regiones',
            'outputFormat': 'application/json',
            'request': 'GetFeature',
            'PROPERTYNAME': 'region',
            'sortBy':'region',

        }).$promise.then(function (res) {
            vm.catalogs.regiones = res;
            $(".ol-attribution").click(function() {
                $('.instructions').show();
            });
        });

        //Init catalog municipios
        Geoserver.query({
            'service': 'wfs',
            'version': '2.0.0',
            'typename': 'mapa_jalisco:municipios',
            'outputFormat': 'application/json',
            'request': 'GetFeature',
            'PROPERTYNAME': 'clave,nombre',
            'sortBy':'nombre',

        }).$promise.then(function (res) {
            vm.catalogs.municipios = res;
        });


        //Init catalog delitos
        GeoLayers.getCatalogByAtributte('mapa_jalisco','mapa_jalisco:geodelitos','delito').then(function (res) {

            angular.forEach(res.FeatureCollection.featureMember, function(tipo_delito) {
                vm.catalogs.tipos_delitos.push(tipo_delito.UniqueValue.value.__text);
            });
        });

        //Get capabilties
        GeoCapabilities.getGeoCapabilities().then(function (res) {

            var x2js = new X2JS();
            var queryResult = x2js.xml_str2json(res.xml);
            var layers= queryResult.WFS_Capabilities.FeatureTypeList.FeatureType;

            angular.forEach(layers, function(layer) {
                switch (layer.Name){
                    case 'mapa_jalisco:marginacion_municipios':
                        vm.abstracts.municipios=layer.Abstract;
                        break;
                    case 'mapa_jalisco:marginacion_agebs':
                        vm.abstracts.agebs=layer.Abstract;
                        break;
                    case 'mapa_jalisco:marginacion_colonias':
                        vm.abstracts.colonias=layer.Abstract;
                        break;
                    case 'mapa_jalisco:geodelitos':
                        vm.abstracts.delitos=layer.Abstract;
                        break;
                }
            });
        });

        //Refresh slider
        setTimeout(function(){
            $scope.$broadcast('rzSliderForceRender');
        },170);

        //Instructions
        $scope.removeInstructions = function() {
            $('.instructions').hide();
        };

        //Close alert
        $scope.closeAlert = function(index) {
            $('#delitos-abstract').remove();
        };

        //Custom date format
        function getCustomFormatDate(date,mode){
            var dd = date.getDate();
            var mm = date.getMonth()+1; //January is 0!

            var yyyy = date.getFullYear();
            if(dd<10){
                dd='0'+dd;
            }
            if(mm<10){
                mm='0'+mm;
            }
            if(mode==1)
                return yyyy+'-'+mm+'-'+dd;
            else
                return yyyy+'/'+mm+'/'+dd;
        }
        /**
         * Get 80% of data from array
         * @param {array} data to check.
         * @return {array} truncked array when get 80%.
         */
        function applyPareto(data){


            if(data.length<=13)
                return data;

            var arrayPareto=[];
            var total= 0;
            var sobrante= 0;
            var eightyPercent=0;
            var partialSum=0;
            var liveFree=true;
            //Get 100% value
            $.each(data, function (index, pob) {
                total+= pob.y;
            });
            eightyPercent=(total*80)/100;

            $.each(data, function (index, pob) {
                partialSum+= pob.y;
                if(partialSum<=eightyPercent)
                    arrayPareto.push(pob);
                else {
                    if(liveFree){
                        arrayPareto.push(pob);
                        liveFree=false;
                    }else
                        sobrante += pob.y;
                }
            });

            arrayPareto.push({name:"Otros",y:sobrante});

            return arrayPareto;
        }

        /**
         *  S  E  A  R  C  H     I   N   I   T
         **/
        /********************************************************************************************************/
        Geoserver.query({
            'service': 'wfs',
            'version': '2.0.0',
            'typename': 'mapa_jalisco:marginacion_municipios',
            'outputFormat': 'application/json',
            'request': 'GetFeature',
            'PROPERTYNAME': 'cve_mun,nombre',
            'sortBy':'nombre',

        }).$promise.then(function (res) {
            $.each(res.features,function(id,object){
                object.properties.description="( MUNICIPIO | JALISCO )";
                object.properties.type="municipios";
                vm.objectsAG.push(object.properties);
            });
        });

        Geoserver.query({
            'service': 'wfs',
            'version': '2.0.0',
            'typename': 'mapa_jalisco:marginacion_agebs',
            'outputFormat': 'application/json',
            'request': 'GetFeature',
            'PROPERTYNAME': 'cve_geoage,nom_mun',
            'sortBy':'cve_geoage',

        }).$promise.then(function (res) {
            $.each(res.features,function(id,object){
                object.properties.description="( AGEB | "+ object.properties.nom_mun.toUpperCase()+" )";
                object.properties.type="agebs";
                object.properties.nombre=object.properties.cve_geoage;
                vm.objectsAG.push(object.properties);
            });
        });

        Geoserver.query({
            'service': 'wfs',
            'version': '2.0.0',
            'typename': 'mapa_jalisco:marginacion_colonias',
            'outputFormat': 'application/json',
            'request': 'GetFeature',
            'PROPERTYNAME': 'cid,nombre,municipio,nom_mun',
            'sortBy':'nombre',

        }).$promise.then(function (res) {
            $.each(res.features,function(id,object){
                object.properties.description="( COLONIA | "+ object.properties.nom_mun+" )";
                object.properties.type="colonias";
                vm.objectsAG.push(object.properties);
            });
        });
        $scope.clearInput = function(e){
            vm.selectedAG=null;
            $scope.$broadcast('angucomplete-alt:clearInput');
        }

        /**
         *  L  A   Y  E  R  S
         **/
        /********************************************************************************************************/

        var inegi1 = new ol.layer.Tile({
            title: 'OpenStreetMap',
            type: 'base',
            visible: true,
            source: new ol.source.OSM()
        });

        var inegi2 = new ol.layer.Tile({
            title: 'Topográfico 6 (INEGI)',
            type: 'base',
            source: new ol.source.TileWMS({
                url: 'https://seguridadmap.app.jalisco.gob.mx/gaiamapas3/mdmCache/service/wms?',
                params: {
                    'LAYERS' : 'MapaBaseTopograficov61_consombreado_2017',
                    'SRS': "EPSG:900913",
                    'FORMAT': 'image/jpeg',
                }
            })
        });
        var inegi3 = new ol.layer.Tile({
            title: 'Topográfico 6 Gris (INEGI)',
            type: 'base',
            source: new ol.source.TileWMS({
                url: 'https://seguridadmap.app.jalisco.gob.mx/gaiamapas3/mdmCache/service/wms?',
                params: {
                    'LAYERS' : 'MapaBaseTopograficov61_sinsombreado_gris',
                    'SRS': "EPSG:900913",
                    'FORMAT': 'image/jpeg',
                }
            })
        });
        var inegi4 = new ol.layer.Tile({
            title: 'Ortofoto (INEGI)',
            type: 'base',
            source: new ol.source.TileWMS({
                url: 'https://seguridadmap.app.jalisco.gob.mx/gaiamapas3/mdmCache/service/wms?',
                params: {
                    'LAYERS' : 'MapaBaseOrtofoto',
                    'SRS': "EPSG:900913",
                    'FORMAT': 'image/jpeg',
                }
            })
        });
        var jaliscoContorno = new ol.layer.Tile({
            title: 'Jalisco',
            source: new ol.source.TileWMS({
                url: baseWMSURL,
                params: {
                    'LAYERS' : 'mapa_jalisco:estado',
                    'tiled' : true
                },
                serverType: 'geoserver',
            })
        });
        var regiones = new ol.layer.Tile({
            title: 'Regiones',
            source: new ol.source.TileWMS({
                url: baseWMSURL,
                params: {
                    'LAYERS' : 'mapa_jalisco:regiones',
                    'cql_filter' : vm.cql.region.lr.slice(-1),
                    'tiled' : true
                },
                serverType: 'geoserver',
            })
        });
        var municipios = new ol.layer.Image({
            title: 'Municipios',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,
                params: {
                    'LAYERS' : 'mapa_jalisco:marginacion_municipios',
                    'cql_filter' : vm.cql.municipios.lm.slice(-1),
                    'STYLES':'',
                    'tiled' : false
                },
                serverType: 'geoserver',
            })
        });
        municipios.on('change:visible', function(evt){
            setTimeout(function(){
                $scope.$apply(function(){
                    vm.filters.visible_layers.municipios=!evt.oldValue;
                });
            },0);
        });
        municipios.setVisible(false);
        var agebs =  new ol.layer.Image({
            title: 'AGEBS',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,
                params: {
                    'LAYERS' : 'mapa_jalisco:marginacion_agebs',
                    'cql_filter' : vm.cql.agebs.la.slice(-1),
                    'STYLES':'',
                    'tiled' : false
                },
                serverType: 'geoserver',
            })
        });
        agebs.on('change:visible', function(evt){
            setTimeout(function(){
                $scope.$apply(function(){
                    vm.filters.visible_layers.agebs=!evt.oldValue;
                });
            },0);
        });
        agebs.setVisible(false);
        var colonias = new ol.layer.Image({
            title: 'Colonias',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,
                params: {
                    'LAYERS' : 'mapa_jalisco:marginacion_colonias',
                    'cql_filter' : vm.cql.colonias.lc.slice(-1),
                    'STYLES':'',
                    'tiled' : false
                },
                serverType: 'geoserver',
            })
        });
        colonias.on('change:visible', function(evt){
            setTimeout(function(){
                $scope.$apply(function(){
                    vm.filters.visible_layers.colonias=!evt.oldValue;
                });
            },0);
        });
        colonias.setVisible(false);

        var bares = new ol.layer.Image({
            title: 'Centros nocturnos y bares',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,
                params: {
                    'LAYERS': 'mapa_jalisco:bares_comercios',
                    'cql_filter': "nombre_act like '%Bares, cantinas%' OR nombre_act like '%Centros nocturnos%'",
                    'tiled' : false
                },
                serverType: 'geoserver'
            })
        });
        bares.setVisible(false);

        var comerciosAuto = new ol.layer.Image({
            title: 'Tiendas de autoservicio',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,

                params: {
                    'LAYERS': 'mapa_jalisco:bares_comercios',
                    'cql_filter': "nombre_act like '%Comercio al por menor en supermercados%'",
                    'tiled' : false
                },
                serverType: 'geoserver'
            })
        });
        comerciosAuto.setVisible(false);

        var comerciosDepto = new ol.layer.Image({
            title: 'Tiendas departamentales',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,

                params: {
                    'LAYERS': 'mapa_jalisco:bares_comercios',
                    'cql_filter': "nombre_act like '%Comercio al por menor en minisuper%'",
                    'tiled' : false
                },
                serverType: 'geoserver'
            })
        });
        comerciosDepto.setVisible(false);

        var restaurantes = new ol.layer.Image({
            title: 'Restaurantes',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,

                params: {
                    'LAYERS': 'mapa_jalisco:bares_comercios',
                    'cql_filter': "nombre_act like '%Restaurantes%'",
                    'tiled' : false
                },
                serverType: 'geoserver'
            })
        });
        restaurantes.setVisible(false);

        var heatMapDelitos = new ol.layer.Image({
            title: 'Delitos',
            source: new ol.source.ImageWMS({
                url: baseWMSURL,
                params: {
                    'LAYERS': 'mapa_jalisco:geodelitos',
                },
                serverType: 'geoserver'
            })
        }); //-

        /*** Added Custom WMS*/
        var customWMS = new ol.layer.Tile({
            title:  vm.entity.wms.nombre,
            source: new ol.source.TileWMS({
                url: vm.entity.wms.url,
                params: {
                    'LAYERS' : vm.entity.wms.capa,
                    'cql_filter' : vm.cql.customwms,
                    'tiled' : true,
                    srsName:'EPSG:4326'
                },

            })
        });

        var source = new ol.source.Vector({wrapX: false});
        var vector = new ol.layer.Vector({
            source: source
        });
        /**
         * Views
         */
        var view = new ol.View({
            center: ol.proj.fromLonLat([-103.7251757,20.8369366]),
            zoom: 7
        });
        /**
         * Controls
         */
        var layerSwitcher = new ol.control.LayerSwitcher({
            tipLabel: 'Leyenda'
        });


        /*
         Declarate popup cross ol3-popup librarie
         * */
        var popup = new ol.Overlay.Popup();

        /**
         * Get popup layout
         * @param {data} array data to render.
         * @return {string} HTML layout.
         */

        function getPopupLayout(data){

            var code="";
            var inf={};
            var numberFilter = $filter('number');

            if(data.municipios!=undefined){
                inf=data.municipios;
                code+='<div class="panel panel-default">'+
                    '<div class="panel-heading">Municipio</div>'+
                    '<div class="panel-body">' +
                    '<table class="jh-table table table-striped">' +
                    '<thead>'+
                    '<tr>'+
                    '<th>Nombre</th>'+
                    '<th>Número de delitos</th>'+
                    '<th>Población</th>'+
                    '<th>Analfabetismo</th>'+
                    '<th>Sin primaria</th>'+
                    '<th>Sin drenaje</th>'+
                    '<th>Sin energía eléctrica</th>'+
                    '<th>Sin agua entubada</th>'+
                    '<th>Hacinamiento</th>'+
                    '<th>Ingreso 2 salarios mínimos</th>'+
                    '<th>Grado de marginación</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody>' +
                    '<tr>'+
                    '<td>'+inf.nombre+'</td>'+
                    '<td>'+numberFilter(inf.delitos,0).toString()+'</td>'+
                    '<td>'+numberFilter(inf.pob_tot,0).toString()+'</td>'+
                    '<td>'+inf.analf+'%</td>'+
                    '<td>'+inf.sprim+'%</td>'+
                    '<td>'+inf.ovsde+'%</td>'+
                    '<td>'+inf.ovsee+'%</td>'+
                    '<td>'+inf.ovsae+'%</td>'+
                    '<td>'+inf.vhac+'%</td>'+
                    '<td>'+inf.po2sm+'%</td>'+
                    '<td>'+inf.gmm+'</td>'+
                    '</tr>'+
                    '</tbody></table>' +
                    '</div>'+
                    '</div>';
            }
            if(data.agebs!=undefined){
                inf=data.agebs;
                code+='<div class="panel panel-default">'+
                    '<div class="panel-heading">AGEB</div>'+
                    '<div class="panel-body">' +
                    '<table class="jh-table table table-striped">' +
                    '<thead>'+
                    '<tr>'+
                    '<th>Clave AGEB</th>'+
                    '<th>Número de delitos</th>'+
                    '<th>Población</th>'+
                    '<th>6 a 14 años que no asiste a escuela</th>'+
                    '<th>15 ó más años sin secundaria completa</th>'+
                    '<th>Sin servicios de salud</th>'+
                    '<th>Hijos fallecidos de mujeres de 15 a 49 años</th>'+
                    '<th>Viviendas sin agua entubada</th>'+
                    '<th>Viviendas sin drenaje</th>'+
                    '<th>Hacinamiento</th>'+
                    '<th>Viviendas sin refrigerador</th>'+
                    '<th>Grado de marginación</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody>' +
                    '<tr>'+
                    '<td>'+inf.ageb+'</td>'+
                    '<td>'+numberFilter(inf.delitos,0).toString()+'</td>'+
                    '<td>'+numberFilter(inf.pob_tot,0).toString()+'</td>'+
                    '<td>'+numberFilter(inf.p6a14nae,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.p15ymssc,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.psdss,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.hfm15a49,2).toString()+'</td>'+
                    '<td>'+numberFilter(inf.vsadv,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.vsdrpfs,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.vhacina,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.vsrefri,2).toString()+'%</td>'+
                    '<td>'+inf.gmu+'</td>'+
                    '</tr>'+
                    '</tbody></table>'+
                    '</div>'+
                    '</div>';

            }
            if(data.colonias!=undefined){
                inf=data.colonias;
                code+='<div class="panel panel-default">'+
                    '<div class="panel-heading">Colonia</div>'+
                    '<div class="panel-body">' +
                    '<table class="jh-table table table-striped">' +
                    '<thead>'+
                    '<tr>'+
                    '<th>Nombre</th>'+
                    '<th>Número de delitos</th>'+
                    '<th>CP</th>'+
                    '<th>Población</th>'+
                    '<th>6 a 14 años que no asiste a escuela</th>'+
                    '<th>15 ó más años sin secundaria completa</th>'+
                    '<th>Sin servicios de salud</th>'+
                    '<th>Hijos fallecidos de mujeres de 15 a 49 años</th>'+
                    '<th>Viviendas sin agua entubada</th>'+
                    '<th>Viviendas sin drenaje</th>'+
                    '<th>Hacinamiento</th>'+
                    '<th>Viviendas sin refrigerador</th>'+
                    '<th>Grado de Marginación</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody>' +
                    '<tr>'+
                    '<td>'+inf.nombre+'</td>'+
                    '<td>'+numberFilter(inf.delitos,0).toString()+'</td>'+
                    '<td>'+numberFilter(inf.cp,0).toString().replace(",", "")+'</td>'+
                    '<td>'+numberFilter(inf.pob1,0).toString()+'</td>'+
                    '<td>'+numberFilter(inf.ind1,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.ind2,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.ind3,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.ind4,2).toString()+'</td>'+
                    '<td>'+numberFilter(inf.ind5,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.ind6,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.ind7,2).toString()+'%</td>'+
                    '<td>'+numberFilter(inf.ind8,2).toString()+'%</td>'+
                    '<td>'+inf.grado+'</td>'+
                    '</tr>'+
                    '</tbody></table>'+
                    '</div>'+
                    '</div>';
            }


            return code;
        }

        /*
         * Commun tool to repalce all words
         * */
        function tools_replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

        /**
         * Invert polygon filter for standard WFS 2.0
         **/
        var axisInvert = function(data) {

            data=data.replace("POLYGON((", "");
            data=data.replace("))", "");
            var prev= data.split(",");

            var polygon="POLYGON((";

            angular.forEach(prev, function(coord) {

                var inverted = coord.split(" ");
                inverted=inverted[1]+" "+inverted[0]+",";
                polygon+=inverted;
            });

            polygon=polygon.slice(0,-1);
            polygon=polygon+"))";

            return polygon;

        };

        /**
         * Convert WKT to PosList geometry representation
         **/
        var wktToPosList = function(data) {

            data=data.replace("POLYGON((", "");
            data=data.replace("))", "");
            data=tools_replaceAll(data, ",", " ");
            console.log(data);
            return data;

        };

        /**
         * C O N F U G U R A T I O N S
         */
        /********************************************************************************************************/

        olData.getMap("main1").then(function (oMap) {
            oMap.setTarget(null);

            map = new ol.Map({
                interactions: olgm.interaction.defaults({mouseWheelZoom:false}),
                layers: [
                    new ol.layer.Group({
                        'title': 'Capas Base',
                        layers: [inegi4,
                            inegi3,
                            inegi2,
                            inegi1]
                    }),
                    new ol.layer.Group({
                        'title': 'Capas de comercio',
                        layers: [
                            comerciosAuto,
                            comerciosDepto,
                            restaurantes,
                            bares
                        ]
                    }),
                    new ol.layer.Group({
                        'title': 'Capas de datos',
                        layers: [jaliscoContorno,
                            regiones,
                            municipios,
                            agebs,
                            colonias,
                            vector,
                            /*** Added Custom WMS */
                            customWMS,
                            heatMapDelitos
                        ]
                    })
                ],
                target: "main1",
                view: view,
                controls: ol.control.defaults().extend([
                    new ol.control.ScaleLine ()
                ])
            });


            //Adding popup
            map.addOverlay(popup);

            /**
             * Download table of delitos data.
             */
            $scope.downloadDelitosAnio = function(){
                var header = '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
                var blob = new Blob([ header + document.getElementById('table-delitos-anio').innerHTML], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                });
                saveAs(blob, "delitosPorAnio.xls");
            };
            $scope.downloadDelitosTipo = function(){
                var header = '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
                var blob = new Blob([ header + document.getElementById('table-delitos-tipo').innerHTML], {
                    type:"data:application/vnd.ms-excel;charset=UTF-8"
                });
                saveAs(blob, "delitosPorTipo.xls");
            };

            /**
             * Format area output.
             * @param {ol.geom.Polygon} polygon The polygon.
             * @return {string} Formatted area.
             */
            var formatArea = function(polygon) {
                var area;

                area = polygon.getArea();

                var output;
                vm.lastValueArea = (Math.round(area / 1000000 * 100) / 100);
                if (area > 10000) {
                    output = (Math.round(area / 1000000 * 100) / 100) +
                        ' ' + 'km<sup>2</sup>';
                } else {
                    output = (Math.round(area * 100) / 100) +
                        ' ' + 'm<sup>2</sup>';
                }
                return output;
            };

            /**
             * Format length output.
             * @param {ol.geom.Circle} line The line.
             * @return {string} The formatted length.
             */
            var formatLength = function(circle) {
                var radio;

                radio = Math.round(circle.getRadius() * 100) / 100;

                var output;
                vm.lastValueRadio = (Math.round(radio / 1000 * 100) / 100) ;
                if (radio > 100) {
                    output = (Math.round(radio / 1000 * 100) / 100) +
                        ' ' + 'km';
                } else {
                    output = (Math.round(radio * 100) / 100) +
                        ' ' + 'm';
                }
                return output;
            };

            /**
             * Creates a new measure tooltip
             */
            function createMeasureTooltip() {


                if (measureTooltipElement) {
                    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
                }
                map.removeOverlay(measureTooltip);
                measureTooltipElement = document.createElement('div');
                measureTooltipElement.className = 'tooltip tooltip-measure';
                measureTooltip = new ol.Overlay({
                    element: measureTooltipElement,
                    offset: [0, -15],
                    positioning: 'bottom-center'
                });

                map.addOverlay(measureTooltip);


            }

            var pointerMoveHandler = function(evt) {
                if (evt.dragging) {
                    return;
                }

                if (sketch) {
                    //ya se comenzó a dibujar
                }
            };


            map.on('pointermove', pointerMoveHandler);
            createMeasureTooltip();

            /**
             * DRAW POLYGON SECTION
             * */

            var drawPolygon = new ol.interaction.Draw({
                source: source,
                type: /** @type {ol.geom.GeometryType} */ 'Polygon'
            });
            var listener;

            drawPolygon.on('drawstart', function(evt){
                sketch = evt.feature;
                source.clear();

                /** @type {ol.Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;

                listener = sketch.getGeometry().on('change', function(evt) {
                    var geom = evt.target;
                    var output;
                    if (geom instanceof ol.geom.Polygon) {
                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            });
            drawPolygon.on('drawend', function(evt){

                measureTooltipElement.className = 'tooltip tooltip-static';
                if(vm.lastValueArea>vm.maxAreaLimit){
                    $scope.$apply();

                    setTimeout(function(){
                        $('#modalDistanceAlert').modal('show');
                        source.clear();
                        createMeasureTooltip();
                    }, 100);


                }else {
                    measureTooltip.setOffset([0, -7]);
                    // unset sketch
                    sketch = null;
                    // unset tooltip so that a new one can be created
                    measureTooltipElement = null;
                    createMeasureTooltip();

                    ol.Observable.unByKey(listener);

                    setTimeout(function () {
                        var features = vector.getSource().getFeatures();
                        var format = new ol.format.WKT();
                        var wktRepresenation = format.writeGeometry(features[0].getGeometry().transform('EPSG:3857', 'EPSG:4326'));
                        vm.cql.map.gmo = features[0].getGeometry();
                        vm.cql.map.gm = wktRepresenation;
                        vm.cql.map.gmPosList = wktToPosList(wktRepresenation);
                        $scope.$apply();
                        map.removeInteraction(drawPolygon);
                    }, 100);
                }
            });

            var drawPolygonButton = document.createElement('button');
            drawPolygonButton.innerHTML = 'N';
            drawPolygonButton.addEventListener('click', function(e) {
                if(!map.removeInteraction(drawPolygon)){
                    map.addInteraction(drawPolygon);
                    vm.typeErrorMeasure=1;
                }
            }, false);

            var drawPolygonElement = document.createElement('div');
            drawPolygonElement.className = 'draw-polygon ol-unselectable ol-control';
            drawPolygonElement.title = 'Realiza búsquedas por polígonos';
            drawPolygonElement.appendChild(drawPolygonButton);


            /**
             * DRAW CIRCLE SECTION
             * */
            var drawCircle = new ol.interaction.Draw({
                source: source,
                type: /** @type {ol.geom.GeometryType} */ 'Circle'
            });
            drawCircle.on('drawstart', function(evt){
                sketch = evt.feature;
                source.clear();

                /** @type {ol.Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;

                listener = sketch.getGeometry().on('change', function(evt) {
                    var geom = evt.target;
                    var output;

                    if (geom instanceof ol.geom.Circle) {
                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            });


            drawCircle.on('drawend', function(evt){

                measureTooltipElement.className = 'tooltip tooltip-static';
                if(vm.lastValueRadio>vm.maxRadioLimit){
                    $scope.$apply();

                    setTimeout(function(){
                        $('#modalDistanceAlert').modal('show');
                        source.clear();
                        createMeasureTooltip();
                    }, 100);

                }else {

                    measureTooltip.setOffset([0, -7]);
                    // unset sketch
                    sketch = null;
                    // unset tooltip so that a new one can be created
                    measureTooltipElement = null;
                    createMeasureTooltip();

                    ol.Observable.unByKey(listener);

                    var features = vector.getSource().getFeatures();
                    setTimeout(function(){
                        var features = vector.getSource().getFeatures();
                        var format = new ol.format.WKT();
                        var center = features[0].getGeometry().getCenter();
                        center = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
                        var radius = features[0].getGeometry().getRadius();
                        var lowpoly = ol.geom.Polygon.circular(
                            /* WGS84 Sphere */
                            new ol.Sphere(6378137),
                            center,
                            radius,
                            60);
                        vm.cql.map.gmo = lowpoly;

                        var wktRepresenation  = format.writeGeometry(lowpoly);
                        vm.cql.map.gm = wktRepresenation;
                        vm.cql.map.gmPosList = wktToPosList(wktRepresenation);

                        $scope.$apply();
                        map.removeInteraction(drawCircle);
                    }, 100);

                }

            });

            var drawCircleButton = document.createElement('button');
            drawCircleButton.innerHTML = 'N';
            drawCircleButton.addEventListener('click', function(e) {
                if(!map.removeInteraction(drawCircle)){
                    map.addInteraction(drawCircle);
                    vm.typeErrorMeasure=0;
                }
            }, false);

            var drawCircleElement = document.createElement('div');
            drawCircleElement.className = 'draw-circle ol-unselectable ol-control';
            drawCircleElement.title = 'Realiza búsquedas por círculos';
            drawCircleElement.appendChild(drawCircleButton);


            /**
             * DRAW POINT SECTION
             * */
            var drawPoint = new ol.interaction.Draw({
                source: source,
                type: 'Point'
            });

            drawPoint.on('drawend', function(evt){

                vector.getSource().clear();
                var  coord= evt.feature.getGeometry().getCoordinates();

                var data={};
                var urls={};
                var sources={};
                var drawActive= false;
                var vistaResolution = /** @type {number} */ (map.getView().getResolution());
                sources.municipios = new ol.source.ImageWMS({
                    url: baseWMSURL,
                    params: {
                        'LAYERS' : 'mapa_jalisco:marginacion_municipios',
                        'tiled' : false
                    },
                    serverType: 'geoserver'
                });
                urls.municipios=sources.municipios.getGetFeatureInfoUrl(
                    coord, vistaResolution, 'EPSG:3857',
                    {'INFO_FORMAT': 'application/json'});

                sources.agebs = new ol.source.ImageWMS({
                    url: baseWMSURL,
                    params: {
                        'LAYERS' : 'mapa_jalisco:marginacion_agebs',
                        'tiled' : false
                    },
                    serverType: 'geoserver'
                });
                urls.agebs=sources.agebs.getGetFeatureInfoUrl(
                    coord, vistaResolution, 'EPSG:3857',
                    {'INFO_FORMAT': 'application/json'});

                sources.colonias = new ol.source.ImageWMS({
                    url: baseWMSURL,
                    params: {
                        'LAYERS' : 'mapa_jalisco:marginacion_colonias',
                        'tiled' : false
                    },
                    serverType: 'geoserver'
                });
                urls.colonias=sources.colonias.getGetFeatureInfoUrl(
                    coord, vistaResolution, 'EPSG:3857',
                    {'INFO_FORMAT': 'application/json'});

                //Get features from Municipios
                $http({
                    method : "GET",
                    url : urls.municipios
                }).then(function mySucces(response) {
                    if(response.data.features[0]!=undefined)
                        data.municipios=response.data.features[0].properties;
                    //Get features from AGEBS
                    $http({
                        method : "GET",
                        url : urls.agebs
                    }).then(function mySucces(response) {
                        if(response.data.features[0]!=undefined)
                            data.agebs=response.data.features[0].properties;

                        //Get features from colonias
                        $http({
                            method : "GET",
                            url : urls.colonias
                        }).then(function mySucces(response) {
                            if(response.data.features[0]!=undefined)
                                data.colonias=response.data.features[0].properties;
                            if(data.municipios!=undefined) {
                                data.municipios.delitos='0';
                                Geoserver.query({
                                    'service': 'wfs',
                                    'version': '2.0.0',
                                    'typename': 'mapa_jalisco:geodelitos',
                                    'outputFormat': 'application/json',
                                    'request': 'GetFeature',
                                    'cql_filter': "WITHIN(geom, querySingle('mapa_jalisco:marginacion_municipios', 'geom','cve_geomun = " + data.municipios.cve_geomun + "'))",
                                    'PROPERTYNAME': 'delito',

                                }).$promise.then(function (res) {
                                    data.municipios.delitos = res.totalFeatures;

                                    if(data.agebs!=undefined) {
                                        data.agebs.delitos='0';
                                        Geoserver.query({
                                            'service': 'wfs',
                                            'version': '2.0.0',
                                            'typename': 'mapa_jalisco:geodelitos',
                                            'outputFormat': 'application/json',
                                            'request': 'GetFeature',
                                            'cql_filter': "WITHIN(geom, querySingle('mapa_jalisco:marginacion_agebs', 'geom','cve_geoage = " + data.agebs.cve_geoage + "'))",
                                            'PROPERTYNAME': 'delito',

                                        }).$promise.then(function (res) {
                                            data.agebs.delitos = res.totalFeatures;

                                            if(data.colonias!=undefined) {
                                                data.colonias.delitos='0';

                                                Geoserver.query({
                                                    'service': 'wfs',
                                                    'version': '2.0.0',
                                                    'typename': 'mapa_jalisco:geodelitos',
                                                    'outputFormat': 'application/json',
                                                    'request': 'GetFeature',
                                                    'cql_filter': "WITHIN(geom, querySingle('mapa_jalisco:marginacion_colonias', 'geom','cid = " + data.colonias.cid + "'))",
                                                    'PROPERTYNAME': 'delito',

                                                }).$promise.then(function (res) {
                                                    data.colonias.delitos = res.totalFeatures;
                                                    popup.show(coord, getPopupLayout(data));
                                                });
                                            }else
                                                popup.show(coord, getPopupLayout(data));
                                        });
                                    }else
                                        popup.show(coord, getPopupLayout(data));
                                });
                            }



                        });
                    });
                });

                setTimeout(function () {
                    map.removeInteraction(drawPoint);
                }, 100);
            });

            var drawPointButton = document.createElement('span');
            drawPointButton.className = 'glyphicon glyphicon-pencil';
            drawPointButton.addEventListener('click', function(e) {
                if(!map.removeInteraction(drawPoint)){
                    map.addInteraction(drawPoint);
                    vm.typeErrorMeasure=0;
                }
            }, false);

            var drawPointElement = document.createElement('div');
            drawPointElement.className = 'draw-point ol-unselectable ol-control';
            drawPointElement.title = 'Realiza búsquedas por coordenada';
            drawPointElement.appendChild(drawPointButton);


            /**
             * A D D   C O N T R O L S
             */
            /********************************************************************************************************/

            map.addControl(layerSwitcher); layerSwitcher.showPanel();

            map.addControl(new ol.control.Control({
                element: drawPolygonElement
            }));

            map.addControl(new ol.control.Control({
                element: drawCircleElement
            }));
            map.addControl(new ol.control.Control({
                element: drawPointElement
            }));
        });

        //Update heatMap & region by map query
        $scope.$watch('vm.cql.map.gm', function (newGeometry, oldGeometry) {

            if(newGeometry!=oldGeometry){
                if(newGeometry!=undefined && newGeometry!=null){
                    vm.cql.region.hm.push("INTERSECTS(geom,"+vm.cql.map.gm+")");
                    vm.cql.municipios.lm.push("INTERSECTS(geom,"+newGeometry+")");
                    vm.cql.agebs.la.push("INTERSECTS(geom,"+newGeometry+")");
                    vm.cql.colonias.lc.push("INTERSECTS(geom,"+newGeometry+")");
                    map.getView().fit(vm.cql.map.gmo.transform('EPSG:4326', 'EPSG:3857').getExtent(), map.getSize());

                }else{
                    vm.blocks.im_mun.cql="INCLUDE";
                    vm.blocks.im_agebs.cql="INCLUDE";
                    vm.blocks.im_colonias.cql="INCLUDE";
                    vm.blocks.im_mun_graph.cql="INCLUDE";
                    vm.blocks.im_ageb_graph.cql="INCLUDE";
                    vm.blocks.im_col_graph.cql="INCLUDE";
                    vm.cql.region.hm.push("INCLUDE");
                    vm.cql.municipios.lm.push("INCLUDE");
                    vm.cql.agebs.la.push("INCLUDE");
                    vm.cql.colonias.lc.push("INCLUDE");

                    GeoLayers.getLayerCenterByProperty('mapa_jalisco', 'mapa_jalisco:estado', 'estado0', 14).then(function (result) {
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]), parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]), parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight, bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });
                    source.clear();

                    imMun();
                    imMunGraphs(vm.blocks.im_mun);
                }
                if(newGeometry!=undefined){

                    vm.blocks.im_mun.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_agebs.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_colonias.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_mun_graph.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_ageb_graph.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_col_graph.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    imColonias();
                    imAgebs();
                    imMun();
                    imMunGraphs(vm.blocks.im_mun);
                    imAgebGraphs();
                    imColGraphs();

                }else{
                    vm.blocks.im_mun.cql="INCLUDE";
                    vm.blocks.im_agebs.cql="INCLUDE";
                    vm.blocks.im_colonias.cql="INCLUDE";
                    vm.blocks.im_mun_graph.cql="INCLUDE";

                    imMunGraphs();
                    imAgebGraphs();
                    imColGraphs();
                    delitosGraphs('');
                }

                regiones.getSource().updateParams({"cql_filter": vm.cql.region.lr.slice(-1)});
                municipios.getSource().updateParams({"cql_filter": vm.cql.municipios.lm.slice(-1)});
                colonias.getSource().updateParams({"cql_filter": vm.cql.colonias.lc.slice(-1)});
                agebs.getSource().updateParams({"cql_filter": vm.cql.agebs.la.slice(-1)});
                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.region.hm.slice(-1) + vm.cql.delito});

            }
        });

        //Update heatMap & region by region field
        $scope.$watch('vm.filters.region', function(newRegion, oldRegion) {
            if(newRegion!=oldRegion){
                if(newRegion != undefined) {
                    regiones.setVisible(true);
                    vm.cql.region.hm.push("WITHIN(geom, querySingle('mapa_jalisco:regiones', 'geom','region = ''" + newRegion.properties.region + "'' '))");
                    vm.cql.region.lr.push("region = '" + newRegion.properties.region+"' ");
                    //Center map
                    GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:regiones','region',newRegion.properties.region).then(function (result) {
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]), parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]), parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight, bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    })
                }else {
                    vm.cql.region.hm.pop();
                    vm.cql.region.lr.pop();

                    //Center map;
                    vm.cql.region.hm.push("INTERSECTS(geom, querySingle('estado','geom','estado0 = 14'))");
                    GeoLayers.getLayerCenterByProperty('mapa_jalisco', 'mapa_jalisco:estado', 'estado0', 14).then(function (result) {
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]), parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]), parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight, bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });
                }
                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.region.hm.slice(-1) +vm.cql.delito});
                regiones.getSource().updateParams({"cql_filter": vm.cql.region.lr.slice(-1)});
            }
        });

        //Fill select municipios
        $scope.$watch('vm.filters.region', function(newRegion, oldRegion) {

            var filter=null;

            if(newRegion!=oldRegion){
                if(newRegion != undefined) {
                    filter="INTERSECTS(geom, querySingle('regiones', 'geom','region = ''"+newRegion.properties.region+"'' '))";
                }else {
                    vm.filters.municipios = null;
                    vm.catalogs.municipios = null;
                    filter=null;
                }

                Geoserver.query({
                    'service': 'wfs',
                    'version': '2.0.0',
                    'typename': 'mapa_jalisco:municipios',
                    'outputFormat': 'application/json',
                    'request': 'GetFeature',
                    'cql_filter' : filter,
                    'PROPERTYNAME': 'clave,nombre',
                    'sortBy':'nombre',

                }).$promise.then(function (res) {
                    vm.catalogs.municipios = res;
                });


            }
        });

        //Update heatMap & municipios layer by municipios field
        $scope.$watch('vm.filters.municipios', function(newMunicipio, oldMunicipio) {
            if (newMunicipio != oldMunicipio) {
                if (newMunicipio != undefined) {
                    vm.filters.agebs=null;
                    vm.filters.colonia=null;
                    municipios.setVisible(true);
                    vm.cql.region.hm.push("WITHIN(geom, querySingle('municipios', 'geom','clave = "+newMunicipio.properties.clave+"'))");
                    vm.cql.municipios.lm.push("WITHIN(geom, querySingle('municipios', 'geom','clave = "+newMunicipio.properties.clave+"'))");
                    GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:municipios','clave',newMunicipio.properties.clave).then(function (result){
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]),parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]),parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight,bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });
                }else{
                    municipios.setVisible(false);
                    vm.cql.municipios.lm.pop();
                    if(vm.filters.region==undefined){
                        vm.cql.region.hm.push("INTERSECTS(geom, querySingle('estado','geom','estado0 = 14'))");
                        GeoLayers.getLayerCenterByProperty('mapa_jalisco', 'mapa_jalisco:estado', 'estado0', 14).then(function (result) {
                            var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                            var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                            topRight = ol.proj.fromLonLat([parseFloat(topRight[0]), parseFloat(topRight[1])]);
                            bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]), parseFloat(bottomLeft[1])]);
                            var boundingExtent = ol.extent.boundingExtent([topRight, bottomLeft]);
                            map.getView().fit(boundingExtent, map.getSize());
                        });
                    }else{
                        vm.cql.municipios.lm.pop();
                        //Center map
                        GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:regiones','region',vm.filters.region.properties.region).then(function (result) {
                            var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                            var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                            topRight = ol.proj.fromLonLat([parseFloat(topRight[0]), parseFloat(topRight[1])]);
                            bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]), parseFloat(bottomLeft[1])]);
                            var boundingExtent = ol.extent.boundingExtent([topRight, bottomLeft]);
                            map.getView().fit(boundingExtent, map.getSize());
                        });
                    }
                }

                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.region.hm.slice(-1) + vm.cql.delito});
                municipios.getSource().updateParams({"cql_filter": vm.cql.municipios.lm.slice(-1)});
            }
        });

        //Fill colonia municipios
        $scope.$watch('vm.filters.municipios', function(newMunicipio, oldMunicipio) {
            if (newMunicipio != oldMunicipio) {
                if (newMunicipio != undefined) {
                    Geoserver.query({
                        'service': 'wfs',
                        'version': '2.0.0',
                        'typename': 'mapaseguridad:marginacion_colonias',
                        'outputFormat': 'application/json',
                        'request': 'GetFeature',
                        'cql_filter' : vm.cql.municipios.lm.slice(-1).toString().replace("WITHIN","INTERSECTS"),
                        'PROPERTYNAME': 'cid,nombre',
                        'sortBy':'nombre',
                    }).$promise.then(function (res) {
                        vm.catalogs.colonias = res;
                    });
                }else{
                    vm.catalogs.colonias = null;
                    vm.filters.colonia = null;

                }
            }
        });

        //Fill AGEB by municipios
        $scope.$watch('vm.filters.municipios', function(newMunicipio, oldMunicipio) {
            if (newMunicipio != oldMunicipio) {
                if (newMunicipio != undefined) {
                    Geoserver.query({
                        'service': 'wfs',
                        'version': '2.0.0',
                        'typename': 'mapaseguridad:marginacion_agebs',
                        'outputFormat': 'application/json',
                        'request': 'GetFeature',
                        'cql_filter' : vm.cql.municipios.lm.slice(-1),
                        'PROPERTYNAME': 'cve_geoage'
                    }).$promise.then(function (res) {
                        vm.catalogs.agebs = res;
                    });
                }else{
                    vm.catalogs.agebs = null;
                    vm.filters.agebs = null;
                }
            }
        });

        //Update heatMap by AGEBS
        $scope.$watch('vm.filters.agebs', function(newCol, oldCol) {
            if (newCol != oldCol) {
                if (newCol != null) {
                    vm.filters.colonia=null;
                    agebs.setVisible(true);
                    jaliscoContorno.setVisible(false);
                    vm.cql.region.hm.push("WITHIN(geom, querySingle('mapa_jalisco:marginacion_agebs', 'geom','cve_geoage = "+newCol.properties.cve_geoage+"'))");
                    vm.cql.agebs.la.push("WITHIN(geom, querySingle('mapa_jalisco:marginacion_agebs', 'geom','cve_geoage = "+newCol.properties.cve_geoage+"'))");

                    GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:marginacion_agebs','cve_geoage',newCol.properties.cve_geoage).then(function (result){
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]),parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]),parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight,bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });
                }else{

                    vm.cql.region.hm.pop();
                    vm.cql.agebs.la.pop();

                    agebs.setVisible(false);
                    municipios.setVisible(true);
                    //Center map
                    GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:municipios','clave',vm.filters.municipios.properties.clave).then(function (result){
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]),parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]),parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight,bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });
                }

                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.region.hm.slice(-1)  + vm.cql.delito });
                agebs.getSource().updateParams({"cql_filter": vm.cql.agebs.la.slice(-1)});
            }
        });

        //Update heatMap by colonia
        $scope.$watch('vm.filters.colonia', function(newCol, oldCol) {
            if (newCol != oldCol) {
                if (newCol != undefined) {
                    vm.filters.agebs=null;
                    colonias.setVisible(true);
                    jaliscoContorno.setVisible(false);
                    vm.cql.region.hm.push("WITHIN(geom, querySingle('mapa_jalisco:marginacion_colonias', 'geom','cid = "+newCol.properties.cid+"'))");
                    vm.cql.colonias.lc.push("WITHIN(geom, querySingle('mapa_jalisco:marginacion_colonias', 'geom','cid = "+newCol.properties.cid+"'))");

                    GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:marginacion_colonias','cid',newCol.properties.cid).then(function (result){
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]),parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]),parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight,bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });
                }else{
                    vm.cql.region.hm.pop();
                    vm.cql.colonias.lc.pop();

                    colonias.setVisible(false);
                    jaliscoContorno.setVisible(true);
                    //Center map
                    GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:municipios','clave',vm.filters.municipios.properties.clave).then(function (result){
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]),parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]),parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight,bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });
                }

                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.region.hm.slice(-1) + vm.cql.delito});
                colonias.getSource().updateParams({"cql_filter": vm.cql.colonias.lc.slice(-1)});
            }
        });

        /*Update view style Compare delitos*/
        $scope.$watchGroup(['vm.filters.delitos','vm.filters.delitos_compare',
            'vm.filters.compare_delito','years_delitos.minValue',
            'years_delitos.maxValue','vm.filters.pickerStart.date',
            'vm.filters.pickerEnd.date','vm.filters.type_filter_year'], function(newDelito) {

            //Update Estyle
            if(newDelito[2]==true&&newDelito[0]!=null){
                if(vm.filters.compare_delito) {
                    heatMapDelitos.getSource().updateParams(
                        {
                            "STYLES": vm.filters.style_delitos.compare.style,
                            'env': 'tipo_delito:' + newDelito[0] + ';tipo_compare:' + newDelito[1]
                        });
                }
            }else {

                heatMapDelitos.getSource().updateParams(
                    {
                        "STYLES": vm.filters.style_delitos.heatmap.style,
                        'env': ''
                    });
                vm.filters.compare_delito = false;
                vm.filters.delitos_compare = null;
            }

            //Update type filters
            if(newDelito[0]!=undefined&&newDelito[1]==null){
                vm.cql.delito=" AND delito = '"+ newDelito[0] +"'";
                heatMapDelitos.getSource().updateParams({"cql_filter": "delito = '" + newDelito[0] + "'"});
            }else{
                vm.cql.delito="";
                heatMapDelitos.getSource().updateParams({"cql_filter": "INCLUDE"});
            }
            //Update dates filters
            vm.cql.dates="";

            if(vm.filters.type_filter_year==false&&newDelito[3]!=null&&newDelito[4]!=null) {
                vm.cql.dates = "AND fecha BETWEEN '" + newDelito[3] + "/01/01 00:00:00' and '" + newDelito[4] + "/12/31 23:59:59'";
            }
            if(vm.filters.type_filter_year==true&&newDelito[5]!=null&&newDelito[6]!=null) {
                vm.cql.dates = "AND fecha BETWEEN '" + getCustomFormatDate(newDelito[5]) + " 00:00:00' and '" + getCustomFormatDate(newDelito[6]) + " 23:59:59'";
            }

            if(vm.cql.colonias.lc!="INCLUDE"&&vm.cql.colonias.lc!=undefined) {
                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.colonias.lc.slice(-1) + vm.cql.delito + vm.cql.dates });
            }else if(vm.cql.agebs.la!="INCLUDE"&&vm.cql.agebs.la!=undefined){
                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.agebs.la.slice(-1) + vm.cql.delito + vm.cql.dates});
            }else if(vm.cql.municipios.lm!="INCLUDE"&&vm.cql.municipios.lm!=undefined){
                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.municipios.lm.slice(-1) + vm.cql.delito + vm.cql.dates });
            }else if(vm.cql.region.hm!="INCLUDE"&&vm.cql.region.hm!=undefined){
                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.region.hm.slice(-1) + vm.cql.delito + vm.cql.dates});
            }else{
                if(vm.filters.type_filter_year==false&&newDelito[3]!=null&&newDelito[4]!=null){
                    if(vm.cql.delito!="")
                        heatMapDelitos.getSource().updateParams({"cql_filter": "delito = '" + newDelito[0] + "' AND fecha BETWEEN '" + newDelito[3] + "/01/01 00:00:00' and '" + newDelito[4] + "/12/31 23:59:59'"});
                    else
                        heatMapDelitos.getSource().updateParams({"cql_filter":  "fecha BETWEEN '" + newDelito[3] + "/01/01 00:00:00' and '" + newDelito[4] + "/12/31 23:59:59'"});
                }
                if(vm.filters.type_filter_year==true&&newDelito[5]!=null&&newDelito[6]!=null){
                    if(vm.cql.delito!="")
                        heatMapDelitos.getSource().updateParams({"cql_filter": "delito = '" + newDelito[0] + "' AND fecha BETWEEN '" + getCustomFormatDate(newDelito[5]) + " 00:00:00' and '" + getCustomFormatDate(newDelito[6],1) + " 23:59:59'"});
                    else
                        heatMapDelitos.getSource().updateParams({"cql_filter": "fecha BETWEEN '" + getCustomFormatDate(newDelito[5]) + " 00:00:00' and '" + getCustomFormatDate(newDelito[6]) + " 23:59:59'"});
                }
            }
        });

        //Update map by search
        $scope.$watch('vm.selectedAG', function (newSearch, oldSearch) {

            if(newSearch!=null){
                if(newSearch!=oldSearch) {
                    newSearch=newSearch.originalObject;
                    var atribute="";
                    var attrValue="";
                    var filter="";

                    if(newSearch.cve_mun!=null) {
                        atribute="cve_mun";
                        attrValue=newSearch.cve_mun;
                        municipios.setVisible(true);
                        municipios.getSource().updateParams({"cql_filter": atribute+"= "+attrValue});
                    }else if(newSearch.cve_geoage!=null) {
                        atribute="cve_geoage";
                        attrValue=newSearch.cve_geoage;
                        agebs.getSource().updateParams({"cql_filter": atribute+"= "+attrValue});
                        agebs.setVisible(true);
                    }else if(newSearch.cid!=null){
                        atribute="cid";
                        attrValue=newSearch.cid;
                        colonias.setVisible(true);
                        colonias.getSource().updateParams({"cql_filter": atribute+"= "+attrValue});
                    }

                    filter="INTERSECTS(geom, querySingle('marginacion_"+newSearch.type+"','geom','"+atribute+"= "+attrValue+"'))";
                    heatMapDelitos.getSource().updateParams({"cql_filter": filter});

                    GeoLayers.getLayerCenterByProperty('mapa_jalisco','mapa_jalisco:marginacion_'+newSearch.type,atribute,attrValue).then(function (res) {
                        var topRight = res.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = res.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]),parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]),parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight,bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });

                    GeoLayers.getLayerCentroid('mapa_jalisco','mapa_jalisco:marginacion_'+newSearch.type,atribute,attrValue).then(function (res) {
                        var x= res.FeatureCollection.boundedBy.Box.coord[0].X.__text;
                        var y= res.FeatureCollection.boundedBy.Box.coord[0].Y.__text;
                        var centroid=ol.proj.fromLonLat([parseFloat(x),parseFloat(y)]);
                        var data={};

                        Geoserver.query({
                            'service': 'wfs',
                            'version': '2.0.0',
                            'typename': 'mapa_jalisco:marginacion_'+newSearch.type,
                            'outputFormat': 'application/json',
                            'request': 'GetFeature',
                            'cql_filter': atribute+" = " + attrValue
                        }).$promise.then(function (res) {

                            if(res.features[0]!=undefined)
                                data[newSearch.type]=res.features[0].properties;
                            Geoserver.query({
                                'service': 'wfs',
                                'version': '2.0.0',
                                'typename': 'mapa_jalisco:geodelitos',
                                'outputFormat': 'application/json',
                                'request': 'GetFeature',
                                'cql_filter': "WITHIN(geom, querySingle('mapa_jalisco:marginacion_" + newSearch.type + "', 'geom','" + atribute + " = " + attrValue + "'))",
                                'PROPERTYNAME': 'delito',

                            }).$promise.then(function (res) {

                                data[newSearch.type].delitos = res.totalFeatures;
                                popup.show(centroid, getPopupLayout(data));
                            });
                        });
                    });
                }
            }else{
                filter="INTERSECTS(geom, querySingle('estado','geom','estado0 = 14'))";
                heatMapDelitos.getSource().updateParams({"cql_filter": filter});
                municipios.setVisible(false);
                agebs.setVisible(false);
                colonias.setVisible(false);

                GeoLayers.getLayerCenterByProperty('mapa_jalisco', 'mapa_jalisco:estado', 'estado0', 14).then(function (result) {
                    var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                    var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                    topRight = ol.proj.fromLonLat([parseFloat(topRight[0]), parseFloat(topRight[1])]);
                    bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]), parseFloat(bottomLeft[1])]);
                    var boundingExtent = ol.extent.boundingExtent([topRight, bottomLeft]);
                    map.getView().fit(boundingExtent, map.getSize());
                });
                popup.hide();
            }
        });

        /**
         *   S  T  Y  L  E  S
         * */

        $scope.$watch('vm.filters.style_marginacion.municipios.status', function(status) {
            if(status)
                municipios.getSource().updateParams({"STYLES": vm.filters.style_marginacion.municipios.style });
            else
                municipios.getSource().updateParams({"STYLES":  vm.filters.style_marginacion.default.style });
        });
        $scope.$watch('vm.filters.style_marginacion.agebs.status', function(status) {
            if(status)
                agebs.getSource().updateParams({"STYLES": vm.filters.style_marginacion.agebs.style });
            else
                agebs.getSource().updateParams({"STYLES":  vm.filters.style_marginacion.default.style });
        });
        $scope.$watch('vm.filters.style_marginacion.colonias.status', function(status) {
            if(status)
                colonias.getSource().updateParams({"STYLES": vm.filters.style_marginacion.colonias.style });
            else
                colonias.getSource().updateParams({"STYLES":  vm.filters.style_marginacion.default.style });
        });


        /**
         *   T   A   B   L   E        W    M   S
         ***/
        /********************************************************************************************************/

        /*Table WMS Custom*/
        vm.blocks.wms = {};
        vm.blocks.wms.page = 1;
        vm.blocks.wms.cql = [""];
        vm.blocks.wms.totalItems = 1;
        vm.blocks.wms.itemsPerPage = 12;
        vm.blocks.wms.headers=[];

        //Get total items
        $http({
            method : "GET",
            url : '/proxy/getWFSCountFeatures',
            params: {
                'baseurl': entity.wms.url,
                'typename': entity.wms.capa
            }
        }).then(function wmsSuccess(resCount) {

            var x2js = new X2JS();
            var queryResult = x2js.xml_str2json(resCount.data);

            if(queryResult.FeatureCollection!=undefined)
                vm.blocks.wms.totalItems = queryResult.FeatureCollection._numberOfFeatures;

               //Get Header
                $http({
                    method : "GET",
                    url : '/proxy/GetWFSProperties',
                    params: {
                        'baseurl': entity.wms.url,
                        'typename': entity.wms.capa
                    }
                }).then(function wmsSuccess(resHeader) {

                   if(resHeader.data.featureTypes[0].properties!=undefined){

                       vm.blocks.wms.headers=[];
                       vm.blocks.wms.headers.push("Filtrar");

                       angular.forEach(resHeader.data.featureTypes[0].properties, function(value, key) {

                                  if(value.name!='the_geom'&&value.name!='geom'){
                                      vm.blocks.wms.headers.push(value.name);
                                  }
                       });
                   }
                    wms();
                });
        });

        function wms(){
                //Then get features
                $http({
                    method : "GET",
                    url : '/proxy/getWFService',
                    params: {
                        'baseurl': entity.wms.url,
                        'typename': entity.wms.capa,
                        'startIndex' : (vm.blocks.wms.page -1) * vm.blocks.wms.itemsPerPage,
                        'maxFeatures': vm.blocks.wms.itemsPerPage
                    }
                }).then(function wmsSuccess(res) {

                    var x2js = new X2JS();
                    var queryResult = x2js.xml_str2json(res.data);

                    var prev= entity.wms.capa.split(":");
                    vm.scope_wms= prev[1];

                    var numberMatched = queryResult.FeatureCollection.featureMembers[vm.scope_wms].length;

                    if(numberMatched == undefined){
                        vm.blocks.wms.result = [queryResult.FeatureCollection.featureMembers[vm.scope_wms]];
                    }else {
                        vm.blocks.wms.result = queryResult.FeatureCollection.featureMembers[vm.scope_wms];
                    }

                    var stockUsefullRows={};
                    angular.forEach(vm.blocks.wms.result, function(value, key) {

                        stockUsefullRows[key]=[];
                        var pendingGeom="";
                        var fid="";

                        angular.forEach(value, function(innerValue, innerkey) {

                            if(innerkey=="the_geom"||innerkey=="geom"){

                                var polygon=innerValue.MultiSurface.surfaceMember.Polygon.exterior.LinearRing.posList.toString();
                                pendingGeom="<a>Filtrar por <strong>esta Fila</strong></a><span class='hidden'>"+polygon+"<span>";
                            }
                            if(innerValue['__text']!=undefined){
                                stockUsefullRows[key].push(innerValue['__text']);
                            }
                            if (innerkey=="_gml:id") {
                                fid=innerValue;
                            }
                        });
                        stockUsefullRows[key].splice(0, 0, pendingGeom);

                        if(stockUsefullRows[key].length==1){
                            delete stockUsefullRows[key];
                        }else
                            stockUsefullRows[key]['fid']=fid;
                    });
                    vm.blocks.wms.result=stockUsefullRows;

                });
        }

        $scope.$watch('vm.blocks.wms.page', function(page, prevPage) {
            if (page != prevPage) {
                wms();
            }
        });

        $scope.refreshDataWMS = function(data){

            var prev= data.split("<span class='hidden'>");

            var polygon="POLYGON((";
            prev=prev[1].replace("<span>", "");
            vm.cql.wmsPosList=prev;
            prev= prev.split(" ");

            for (var i=0; i<prev.length; i=i+2) {
                polygon+=prev[i]+" "+prev[i+1]+",";
            }

            polygon=polygon.slice(0,-1);
            polygon=polygon+"))";

            vm.cql.wms=polygon;

        };

        $scope.$watch('vm.cql.wms', function (newGeometry, oldGeometry) {

            if(newGeometry!=oldGeometry){
                if(newGeometry!=undefined && newGeometry!=null){
                    vm.cql.region.hm.push("INTERSECTS(geom,"+newGeometry+")");
                    vm.cql.municipios.lm.push("INTERSECTS(geom,"+newGeometry+")");
                    vm.cql.agebs.la.push("INTERSECTS(geom,"+newGeometry+")");
                    vm.cql.colonias.lc.push("INTERSECTS(geom,"+newGeometry+")");


                    var feature = new ol.format.WKT().readFeature(vm.cql.wms);
                    map.getView().fit(feature.getGeometry().transform('EPSG:4326', 'EPSG:3857').getExtent(), map.getSize());



                }else{
                    vm.blocks.im_mun.cql="INCLUDE";
                    vm.blocks.im_agebs.cql="INCLUDE";
                    vm.blocks.im_colonias.cql="INCLUDE";
                    vm.blocks.im_mun_graph.cql="INCLUDE";
                    vm.blocks.im_ageb_graph.cql="INCLUDE";
                    vm.blocks.im_col_graph.cql="INCLUDE";
                    vm.cql.region.hm.push("INCLUDE");
                    vm.cql.municipios.lm.push("INCLUDE");
                    vm.cql.agebs.la.push("INCLUDE");
                    vm.cql.colonias.lc.push("INCLUDE");


                    GeoLayers.getLayerCenterByProperty('mapa_jalisco', 'mapa_jalisco:estado', 'estado0', 14).then(function (result) {
                        var topRight = result.BoundingBox.LowerCorner.__text.split(" ");
                        var bottomLeft = result.BoundingBox.UpperCorner.__text.split(" ");
                        topRight = ol.proj.fromLonLat([parseFloat(topRight[0]), parseFloat(topRight[1])]);
                        bottomLeft = ol.proj.fromLonLat([parseFloat(bottomLeft[0]), parseFloat(bottomLeft[1])]);
                        var boundingExtent = ol.extent.boundingExtent([topRight, bottomLeft]);
                        map.getView().fit(boundingExtent, map.getSize());
                    });

                    imMun();
                    imMunGraphs(vm.blocks.im_mun);
                }

                if(newGeometry!=undefined){

                    vm.blocks.im_mun.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_agebs.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_colonias.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_mun_graph.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_ageb_graph.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    vm.blocks.im_col_graph.cql="INTERSECTS(geom,"+axisInvert(newGeometry)+")";
                    imColonias();
                    imAgebs();
                    imMun();
                    imMunGraphs(vm.blocks.im_mun);
                    imAgebGraphs();
                    imColGraphs();

                }else{
                    vm.blocks.im_mun.cql="INCLUDE";
                    vm.blocks.im_agebs.cql="INCLUDE";
                    vm.blocks.im_colonias.cql="INCLUDE";
                    vm.blocks.im_mun_graph.cql="INCLUDE";

                    imMunGraphs();
                    imAgebGraphs();
                    imColGraphs();
                    delitosGraphs('');
                }


                regiones.getSource().updateParams({"cql_filter": vm.cql.region.lr.slice(-1)});
                municipios.getSource().updateParams({"cql_filter": vm.cql.municipios.lm.slice(-1)});
                colonias.getSource().updateParams({"cql_filter": vm.cql.colonias.lc.slice(-1)});
                agebs.getSource().updateParams({"cql_filter": vm.cql.agebs.la.slice(-1)});
                heatMapDelitos.getSource().updateParams({"cql_filter": vm.cql.region.hm.slice(-1) + vm.cql.delito});

            }
        });


        /**
         *   T   A   B   L   E   S
         ***/
        /********************************************************************************************************/


        /*Table municipios*/
        vm.blocks.im_mun = {};
        vm.blocks.im_mun.page = 1;
        vm.blocks.im_mun.cql = "INCLUDE";
        vm.blocks.im_mun.totalItems = 1;
        vm.blocks.im_mun.itemsPerPage = 8;
        function imMun(){


            Geoserver.query({
                'service': 'wfs',
                'version': '2.0.0',
                'typename': 'mapa_jalisco:marginacion_municipios',
                'request': 'GetFeature',
                'srsName':'EPSG:4326',
                'outputFormat': 'application/json',
                'CQL_FILTER' : vm.blocks.im_mun.cql,
                'propertyname': 'nombre,cve_geomun,cve_mun,pob_tot,analf,sprim,ovsde,ovsee,ovsae,vhac,po2sm,gmm',
                'sortBy': 'nombre'

            }).$promise.then(function (res) {

                vm.blocks.im_mun.totalItems = res.totalFeatures;
                vm.blocks.im_mun.result = res.features;

                $.each(vm.blocks.im_mun.result, function (index, value) {
                    vm.blocks.im_mun.result[index]=value.properties;
                });
            });
        }
        // imMun();
        $scope.$watch('vm.blocks.im_mun.page', function(page, prevPage) {
            if (page != prevPage) {
                imMun();
            }
        });
        $scope.$watch('vm.filters.region', function(newRegion, oldRegion) {
            if(newRegion!=oldRegion){
                if(newRegion != undefined)
                    vm.blocks.im_mun.cql = "INTERSECTS(geom, querySingle('regiones', 'geom','region =''"+ newRegion.properties.region +"'''))";
                else
                    vm.blocks.im_mun.cql = "INCLUDE";
                imMun();
                resetDownload();
            }
        });
        $scope.$watch('vm.filters.municipios', function(newMun, oldMun) {
            if(newMun!=oldMun && newMun!=undefined){
                vm.blocks.im_mun.cql  = "cve_mun = "+parseInt(newMun.properties.clave);
            }else{
                if(vm.filters.region!=undefined) {
                    vm.blocks.im_mun.cql = "INTERSECTS(geom, querySingle('regiones', 'geom','region =''" + vm.filters.region.properties.region + "'''))";
                }else{
                    vm.blocks.im_mun.cql= "INCLUDE";
                }
            }
            imMun();
            resetDownload();
        });

        /*Table AGEBS*/
        vm.blocks.im_agebs = {};
        vm.blocks.im_agebs.page = 1;
        vm.blocks.im_agebs.cql = "INCLUDE";
        vm.blocks.im_agebs.totalItems = 1;
        vm.blocks.im_agebs.itemsPerPage = 8;
        function imAgebs(){
            Geoserver.query({
                'service': 'wfs',
                'version': '2.0.0',
                'typename': 'mapa_jalisco:marginacion_agebs',
                'request': 'GetFeature',
                'outputFormat': 'application/json',
                'CQL_FILTER' : vm.blocks.im_agebs.cql,
                'PROPERTYNAME': 'ageb,pob_tot,p6a14nae,p15ymssc,psdss,hfm15a49,vsadv,vsdrpfs,vhacina,vsrefri,gmu',
                'sortBy': 'ageb'
            }).$promise.then(function (res) {
                vm.blocks.im_agebs.totalItems = res.totalFeatures;
                vm.blocks.im_agebs.result = res.features;

                $.each(vm.blocks.im_agebs.result, function (index, value) {
                    vm.blocks.im_agebs.result[index]=value.properties;
                });
            });
        }
        imAgebs();
        $scope.$watch('vm.blocks.im_agebs.page', function(page, prevPage) {
            if (page != prevPage) {
                imAgebs();
            }
        });
        $scope.$watch('vm.filters.municipios', function(newMun, oldMun) {
            if(newMun!=oldMun){
                if(newMun != undefined)
                    vm.blocks.im_agebs.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ newMun.properties.clave +"'))";
                else
                    vm.blocks.im_agebs.cql = "INCLUDE";
                imAgebs();
            }
        });
        $scope.$watch('vm.filters.agebs', function(newAgeb, oldAgeb) {
            if(newAgeb!=oldAgeb && newAgeb!=undefined) {
                vm.blocks.im_agebs.cql = "cve_geoage = " + newAgeb.properties.cve_geoage;
                vm.blocks.im_colonias.cql = "INTERSECTS(geom, querySingle('marginacion_agebs', 'geom','cve_geoage=" + newAgeb.properties.cve_geoage +"'))";
            }else{

                try{
                    vm.blocks.im_agebs.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ vm.filters.municipios.properties.clave +"'))";
                    vm.blocks.im_colonias.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ vm.filters.municipios.properties.clave +"'))";
                }catch(e){}
            }
            imAgebs();
            imColonias();
            resetDownload();

        });

        /*Table colonias*/
        vm.blocks.im_colonias = {};
        vm.blocks.im_colonias.page = 1;
        vm.blocks.im_colonias.cql = "INCLUDE";
        vm.blocks.im_colonias.totalItems = 1;
        vm.blocks.im_colonias.itemsPerPage = 8;
        function imColonias(){
            Geoserver.query({
                'service': 'wfs',
                'version': '2.0.0',
                'typename': 'mapa_jalisco:marginacion_colonias',
                'request': 'GetFeature',
                'outputFormat': 'application/json',
                'CQL_FILTER' : vm.blocks.im_colonias.cql,
                'PROPERTYNAME': 'nombre,cp,pob1,ind1,ind2,ind3,ind4,ind5,ind6,ind7,ind8,ind9,ind10,grado',
                'sortBy': 'nombre'
            }).$promise.then(function (res) {
                vm.blocks.im_colonias.totalItems = res.totalFeatures;
                vm.blocks.im_colonias.result = res.features;

                $.each(vm.blocks.im_colonias.result, function (index, value) {
                    vm.blocks.im_colonias.result[index]=value.properties;
                });
            });
        }
        imColonias();
        $scope.$watch('vm.blocks.im_colonias.page', function(page, prevPage) {
            if (page != prevPage) {
                imColonias();
            }
        });
        $scope.$watch('vm.filters.municipios', function(newMun, oldMun) {
            if(newMun!=oldMun){
                if(newMun != undefined)
                    vm.blocks.im_colonias.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ newMun.properties.clave +"'))";
                else
                    vm.blocks.im_colonias.cql = "INCLUDE";
                imColonias();
            }
        });
        $scope.$watch('vm.filters.colonia', function(newCol, oldCol) {
            if(newCol!=oldCol && newCol!=undefined){
                vm.blocks.im_colonias.cql = "cid = "+newCol.properties.cid;
                vm.blocks.im_agebs.cql = "INTERSECTS(geom, querySingle('marginacion_colonias', 'geom','cid=" +newCol.properties.cid +"'))";

            }else{
                try{
                    vm.blocks.im_agebs.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ vm.filters.municipios.properties.clave +"'))";
                    vm.blocks.im_colonias.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ vm.filters.municipios.properties.clave +"'))";
                }catch(e){}
            }

            imAgebs();
            imColonias();
            resetDownload();
        });



        /**
         *  G   R   A    P   H   S
         **/
        /********************************************************************************************************/


        //Gráfica por Municipios
        vm.blocks.im_mun_graph = {};
        vm.blocks.im_mun_graph.cql = "INCLUDE";
        function imMunGraphs(){
            Geoserver.query({
                'service': 'wfs',
                'version': '2.0.0',
                'typename': 'mapa_jalisco:marginacion_municipios',
                'outputFormat': 'application/json',
                'request': 'GetFeature',
                'PROPERTYNAME': 'nombre,pob_tot,analf,sprim,vhac,anio',
                'CQL_FILTER': vm.blocks.im_mun_graph.cql,
            }).$promise.then(function (res) {
                var pobTotalData = [];
                var pobTotalDataPareto = [];
                var analfData = [];
                var hacinaData = [];
                var sprimData = [];

                $.each(res.features, function (index, value) {

                    pobTotalData.push({'name':value.properties.nombre,
                        'y':parseFloat(value.properties.pob_tot)});
                    analfData.push({'name':value.properties.nombre,
                        'y':parseFloat(value.properties.analf)});
                    hacinaData.push({'name':value.properties.nombre,
                        'y':parseFloat(value.properties.vhac)});
                    sprimData.push({'name':value.properties.nombre,
                        'y':parseFloat(value.properties.sprim)});
                });

                pobTotalData = $filter('orderBy')(pobTotalData, '-y');
                pobTotalDataPareto= applyPareto(pobTotalData);
                analfData = $filter('orderBy')(analfData, '-y');
                hacinaData = $filter('orderBy')(hacinaData, '-y');
                sprimData = $filter('orderBy')(sprimData, '-y');

                vm.blocks.im_mun_graph.pob_tot = {
                    options: {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: 'pie'
                        },
                        title: {
                            text: ' '
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                depth: 35,
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b>: {point.percentage:.2f}%',
                                }
                            }
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Población total'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    pie: {
                                        depth: 35,
                                        dataLabels: {
                                            enabled: true,
                                            format: '<b>{point.name}</b>: {point.percentage:.2f}%',
                                        }
                                    }
                                },
                            },
                        },
                    },
                    series: [{
                        name: 'Población total',
                        colorByPoint: true,
                        data: pobTotalDataPareto,
                    }]
                };

                vm.blocks.im_mun_graph.analfb ={};
                vm.blocks.im_mun_graph.analfb = {
                    options: {
                        chart: {
                            type: 'column',
                            marginBottom: 200,
                            marginLeft: 100
                        },
                        title: {
                            text: ' '
                        },
                        xAxis: {
                            type: 'category',
                            max: analfData.length-1,
                            labels: {
                                rotation: -45,
                                formatter: function() {
                                    if(analfData[this.value]!=undefined){
                                        return analfData[this.value].name;
                                    }else{
                                        return this.value;
                                    }
                                },
                                style: {
                                    fontSize: '12px',
                                    fontFamily: 'Verdana, sans-serif'
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Analfabetismo'
                            },
                        },
                        legend: {
                            enabled: false
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Analfabetismo'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    series: {
                                        dataLabels: {
                                            enabled: true,
                                            format: '{point.y}%',
                                            rotation: -45,
                                            style: {
                                                fontSize: '5px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                    series: [{
                        name: 'analfabetismo',
                        colorByPoint: true,
                        data: analfData,
                        turboThreshold: 20000
                    }]
                };

                vm.blocks.im_mun_graph.hacina = {
                    options: {
                        chart: {
                            type: 'column',
                            marginBottom: 200,
                            marginLeft: 100
                        },
                        title: {
                            text: ' '
                        },
                        xAxis: {
                            type: 'category',
                            max: hacinaData.length-1,
                            labels: {
                                rotation: -45,
                                style: {
                                    fontSize: '12px',
                                    fontFamily: 'Verdana, sans-serif'
                                },
                                formatter: function() {
                                    if(hacinaData[this.value]!=undefined){
                                        return hacinaData[this.value].name;
                                    }else{
                                        return this.value;
                                    }
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Hacinamiento'
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Hacinamiento'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    series: {
                                        dataLabels: {
                                            enabled: true,
                                            format: '{point.y}%',
                                            rotation: -45,
                                            style: {
                                                fontSize: '5px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                    series: [{
                        name: 'Hacinamiento',
                        data: hacinaData,
                        colorByPoint: true,
                    }]
                };

                vm.blocks.im_mun_graph.sprim = {
                    options: {
                        chart: {
                            type: 'column',
                            marginBottom: 200,
                            marginLeft: 100
                        },
                        title: {
                            text: ' '
                        },
                        xAxis: {
                            type: 'category',
                            max: sprimData.length-1,
                            labels: {
                                rotation: -45,
                                style: {
                                    fontSize: '12px',
                                    fontFamily: 'Verdana, sans-serif'
                                },
                                formatter: function() {
                                    if(sprimData[this.value]!=undefined){
                                        return sprimData[this.value].name;
                                    }else{
                                        return this.value;
                                    }
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Sin primaria'
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Población sin primaria'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    series: {
                                        dataLabels: {
                                            enabled: true,
                                            format: '{point.y}%',
                                            rotation: -45,
                                            style: {
                                                fontSize: '5px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                    series: [{
                        name: 'Sin primaria',
                        data: sprimData,
                        colorByPoint: true,
                    }],
                };

            });
        }
        imMunGraphs();
        $scope.$watch('vm.filters.region', function(newRegion, oldRegion) {
            if(newRegion!=oldRegion){
                if(newRegion != undefined)
                    vm.blocks.im_mun_graph.cql = "INTERSECTS(geom, querySingle('regiones', 'geom','region = ''" + newRegion.properties.region + "'' '))";
                else
                    vm.blocks.im_mun_graph.cql = "INCLUDE";
                imMunGraphs();
            }
        });



        /*
         *  G  R  A  P  H  S      O  F      A  G  E   B  S
         * */

        //Gráfica por Municipios
        vm.blocks.im_ageb_graph = {};
        vm.blocks.im_ageb_graph.cql = "INCLUDE";
        function imAgebGraphs(){
            Geoserver.query({
                'service': 'wfs',
                'version': '2.0.0',
                'typename': 'mapa_jalisco:marginacion_agebs',
                'outputFormat': 'application/json',
                'request': 'GetFeature',
                'PROPERTYNAME': 'cve_geoage,pob_tot,vhacina',
                'sortBy': 'cve_geoage',
                'CQL_FILTER': vm.blocks.im_ageb_graph.cql,
            }).$promise.then(function (res) {
                var pobTotalData = [];
                var hacinaData = [];

                $.each(res.features, function (index, value) {

                    pobTotalData.push({'name':value.properties.cve_geoage,
                        'y':parseFloat(value.properties.pob_tot)});
                    hacinaData.push({'name':value.properties.cve_geoage,
                        'y':parseFloat(value.properties.vhacina)});
                });

                pobTotalData = $filter('orderBy')(pobTotalData, '-y');
                hacinaData = $filter('orderBy')(hacinaData, '-y');

                vm.blocks.im_ageb_graph.pob_tot = {
                    options: {
                        chart: {
                            type: 'column',
                            marginBottom: 200,
                            marginLeft: 100
                        },
                        title: {
                            text: ' '
                        },
                        xAxis: {
                            type: 'category',
                            max: pobTotalData.length-1,
                            labels: {
                                rotation: -45,
                                style: {
                                    fontSize: '12px',
                                    fontFamily: 'Verdana, sans-serif'
                                },
                                formatter: function() {
                                    if(pobTotalData[this.value]!=undefined){
                                        return pobTotalData[this.value].name;
                                    }else{
                                        return this.value;
                                    }
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Población total'
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Población total'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    series: {
                                        dataLabels: {
                                            enabled: true,
                                            format: '{point.y}%',
                                            rotation: -45,
                                            style: {
                                                fontSize: '5px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                    series: [{
                        name: 'Población Total',
                        data: pobTotalData,
                        colorByPoint: true,
                    }]
                };
                vm.blocks.im_ageb_graph.hacina = {
                    options: {
                        chart: {
                            type: 'column',
                            marginBottom: 200,
                            marginLeft: 100
                        },
                        title: {
                            text: ' '
                        },
                        xAxis: {
                            type: 'category',
                            max: hacinaData.length-1,
                            labels: {
                                rotation: -45,
                                style: {
                                    fontSize: '12px',
                                    fontFamily: 'Verdana, sans-serif'
                                },
                                formatter: function() {
                                    if(hacinaData[this.value]!=undefined){
                                        return hacinaData[this.value].name;
                                    }else{
                                        return this.value;
                                    }
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Hacinamiento'
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Hacinamiento'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    series: {
                                        dataLabels: {
                                            enabled: true,
                                            format: '{point.y}%',
                                            rotation: -45,
                                            style: {
                                                fontSize: '5px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                    series: [{
                        name: 'Hacinamiento',
                        data: hacinaData,
                        colorByPoint: true,
                    }]
                };

            });
        }
        $scope.$watch('vm.filters.municipios', function(newMun, oldMun) {
            if(newMun!=oldMun) {
                if (newMun != undefined) {
                    vm.graphs_filters.last.mun=newMun.properties.clave;
                    vm.blocks.im_ageb_graph.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave=" + newMun.properties.clave + "'))";
                }else
                    vm.blocks.im_ageb_graph.cql = "INCLUDE";

                imAgebGraphs();
            }
        });
        $scope.$watch('vm.filters.colonia', function(newCol, oldCol) {
            if(newCol!=oldCol) {
                if (newCol != undefined)
                    vm.blocks.im_ageb_graph.cql = "INTERSECTS(geom, querySingle('marginacion_colonias', 'geom','cid=" + newCol.properties.cid + "'))";
                else
                    vm.blocks.im_ageb_graph.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ vm.graphs_filters.last.mun +"'))";

                imAgebGraphs();

            }
        });






        /*
         *  G  R  A  P  H  S      O  F       C  O  L  O  N  I  A  S
         * */

        //Gráfica por Colonia
        vm.blocks.im_col_graph = {};
        vm.blocks.im_col_graph.cql = "INCLUDE";
        function imColGraphs(){
            Geoserver.query({
                'service': 'wfs',
                'version': '2.0.0',
                'typename': 'mapa_jalisco:marginacion_colonias',
                'outputFormat': 'application/json',
                'request': 'GetFeature',
                'PROPERTYNAME': 'nomcolonia,pob1',
                'sortBy': 'pob1',
                'CQL_FILTER': vm.blocks.im_col_graph.cql,
            }).$promise.then(function (res) {
                var pobTotalData = [];

                $.each(res.features, function (index, value) {
                    pobTotalData.push({'name':value.properties.nomcolonia,
                        'y':parseFloat(value.properties.pob1)});
                });

                pobTotalData = $filter('orderBy')(pobTotalData, '-y');

                vm.blocks.im_col_graph.pob_tot = {
                    options: {
                        chart: {
                            type: 'column',
                            marginBottom: 200,
                            marginLeft: 100
                        },
                        title: {
                            text: ' '
                        },
                        xAxis: {
                            type: 'category',
                            max: pobTotalData.length-1,
                            labels: {
                                rotation: -45,
                                style: {
                                    fontSize: '12px',
                                    fontFamily: 'Verdana, sans-serif'
                                },
                                formatter: function() {
                                    if(pobTotalData[this.value]!=undefined){
                                        return pobTotalData[this.value].name;
                                    }else{
                                        return this.value;
                                    }
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Población total'
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Población total'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    series: {
                                        dataLabels: {
                                            enabled: true,
                                            format: '{point.y}%',
                                            rotation: -45,
                                            style: {
                                                fontSize: '5px',
                                                fontFamily: 'Verdana, sans-serif'
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                    series: [{
                        name: 'Población Total',
                        data: pobTotalData,
                        colorByPoint: true,
                    }]
                };
            });
        }
        $scope.$watch('vm.filters.municipios', function(newMun, oldMun) {
            if(newMun!=oldMun) {
                if (newMun != undefined) {
                    vm.graphs_filters.last.mun=newMun.properties.clave;
                    vm.blocks.im_col_graph.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave=" + newMun.properties.clave + "'))";
                }else
                    vm.blocks.im_col_graph.cql = "INCLUDE";

                imColGraphs();
            }
        });
        $scope.$watch('vm.filters.agebs', function(newAgeb, oldAgeb) {
            if(newAgeb!=oldAgeb){
                if(newAgeb != undefined)
                    vm.blocks.im_col_graph.cql ="INTERSECTS(geom, querySingle('marginacion_agebs', 'geom','cve_geoage=" + newAgeb.properties.cve_geoage +"'))";
                else
                    vm.blocks.im_col_graph.cql = "INTERSECTS(geom, querySingle('municipios', 'geom','clave="+ vm.graphs_filters.last.mun +"'))";

                imColGraphs();
            }
        });

        /*
         *           G   R  A  P  H  S     O F    D  E  L  I  T  O  S
         * */
        vm.blocks.delitos_graph = {};
        function delitosGraphs(filtersWFS){

            if(vm.filters.compare_delito==false || vm.filters.delitos_compare==null) {
                GeoLayers.getCountByAtributte('mapa_jalisco','mapa_jalisco:geodelitos','anio',filtersWFS).then(function (res) {

                    vm.delitoAnio = [];

                    //Transforming grouped by results
                    $.each(res.AggregationResults.GroupByResult['object-array'], function (index, value) {
                        var obj = {};
                        if(value.int!=undefined){
                            obj.name = value.int[0];
                            obj.y = parseFloat(value.int[1]);
                            vm.delitoAnio.push(obj);
                        }else if(value[0]!=undefined){
                            obj.name = value[0];
                            obj.y = parseFloat(value[1]);
                            vm.delitoAnio.push(obj);
                        }
                    });

                    vm.delitoAnio = $filter('orderBy')(vm.delitoAnio, 'name');


                    /*Data to build graphic*/
                    vm.blocks.delitos_graph.anio = {
                        options: {
                            chart: {
                                plotBackgroundColor: null,
                                plotBorderWidth: null,
                                plotShadow: false,
                                type: 'column',
                                options3d: {
                                    enabled: true,
                                    alpha: 20,
                                    beta: 0
                                },
                            },
                            title: {
                                text: ' '
                            },
                            exporting: {
                                chartOptions: {
                                    title: {
                                        text: 'Delitos por año'
                                    },
                                    subtitle: {
                                        text: BASE_DOMAIN_TEXT
                                    },
                                },
                            },
                            plotOptions: {
                                column: {
                                    allowPointSelect: true,
                                    cursor: 'pointer',
                                    depth: 55,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y:,.0f}',
                                    }
                                }
                            },
                            xAxis: {
                                type: 'category',

                            },
                            yAxis: {
                                title: {
                                    text: 'Número de delitos'
                                }
                            },
                            legend: {
                                enabled: false
                            }
                        },
                        series: [{
                            name: 'Delitos por año',
                            colorByPoint: true,
                            data: vm.delitoAnio,
                        }]
                    };

                });
            }else{
                GeoLayers.getCountByAtributteGrouped('mapa_jalisco','mapa_jalisco:geodelitos','delito','anio',filtersWFS).then(function (res) {

                    vm.delitoAnio = [];
                    var serie1=[];
                    var serie2=[];

                    //Transforming grouped by results
                    $.each(res.AggregationResults.GroupByResult['object-array'], function (index, value) {
                        var obj = {};

                        if(value.int!=undefined){
                            obj.name = value.int[0];
                            obj.y = parseFloat(value.int[1]);
                            vm.delitoAnio.push(obj);
                            if(value.string==vm.filters.delitos)
                                serie1.push(obj);
                            if(value.string==vm.filters.delitos_compare)
                                serie2.push(obj);
                        }else if(value[0]!=undefined){
                            obj.name = value[0];
                            obj.y = parseFloat(value[1]);
                            vm.delitoAnio.push(obj);
                            if(value.string==vm.filters.delitos)
                                serie1.push(obj);
                            if(value.string==vm.filters.delitos_compare)
                                serie2.push(obj);
                        }

                    });

                    vm.delitoAnio = $filter('orderBy')(vm.delitoAnio, 'name');
                    serie1 = $filter('orderBy')(serie1, 'name');
                    serie2 = $filter('orderBy')(serie2, 'name');

                    /*Data to build graphic*/
                    vm.blocks.delitos_graph.anio = {
                        options: {
                            chart: {
                                plotBackgroundColor: null,
                                plotBorderWidth: null,
                                plotShadow: false,
                                type: 'column',
                                options3d: {
                                    enabled: true,
                                    alpha: 20,
                                    beta: 0
                                },
                            },
                            title: {
                                text: ' '
                            },
                            exporting: {
                                chartOptions: {
                                    title: {
                                        text: 'Delitos por año'
                                    },
                                    subtitle: {
                                        text: BASE_DOMAIN_TEXT
                                    },
                                },
                            },
                            plotOptions: {
                                column: {
                                    allowPointSelect: true,
                                    cursor: 'pointer',
                                    depth: 55,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y:,.0f}',
                                    }
                                }
                            },
                            xAxis: {
                                type: 'category',

                            },
                            yAxis: {
                                title: {
                                    text: 'Número de delitos'
                                }
                            },
                            legend: {
                                enabled: true
                            }
                        },
                        series: [{
                            name: vm.filters.delitos,
                            color:'#9929fb',
                            data: serie1
                        },{
                            name: vm.filters.delitos_compare,
                            color:'#26b9fb',
                            data: serie2
                        }]
                    };

                });
            }

            GeoLayers.getCountByAtributte('mapa_jalisco','mapa_jalisco:geodelitos','delito',filtersWFS).then(function (res) {

                vm.delitoTipo = [];
                var delitoTipoPareto = [];

                //Transforming grouped by results
                if(res.AggregationResults.GroupByResult['object-array'].length != undefined ){

                    $.each(res.AggregationResults.GroupByResult['object-array'], function (index, value) {
                        var obj = {};

                        if(value.string!=undefined){

                            obj.name =value.string ;
                            obj.y = parseFloat(value.int);
                            if(vm.filters.compare_delito){
                                if(obj.name==vm.filters.delitos_compare)
                                    obj.color='#26b9fb';
                                if(obj.name==vm.filters.delitos)
                                    obj.color='#9929fb';
                            }
                            vm.delitoTipo.push(obj);

                        }
                    });
                }
                else{
                    var value=res.AggregationResults.GroupByResult['object-array'];
                    var obj = {};

                    obj.name = value.string;
                    obj.y = parseFloat(value.int);
                    vm.delitoTipo.push(obj);

                }

                vm.max_delitos=[];
                $.each(vm.delitoTipo,function(index,value){
                    vm.max_delitos.push({name: value.name, y: value.y});
                }) ;

                vm.delitoTipo = $filter('orderBy')(vm.delitoTipo , '-y');
                delitoTipoPareto=applyPareto(vm.delitoTipo);

                vm.blocks.delitos_graph.tipo = {
                    options: {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: 'pie',
                            options3d: {
                                enabled: true,
                                alpha: 45,
                                beta: 0
                            },
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                depth: 35,
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b>: {point.percentage:.2f}%',
                                }
                            }
                        },
                        title: {
                            text: ' '
                        },
                        exporting:{
                            chartOptions:{
                                title: {
                                    text:'Delitos por tipo'
                                },
                                subtitle: {
                                    text: BASE_DOMAIN_TEXT
                                },
                                plotOptions: {
                                    pie: {
                                        depth: 35,
                                        dataLabels: {
                                            enabled: true,
                                            format: '<b>{point.name}</b>: {point.percentage:.2f}%',
                                        }
                                    }
                                },
                            },
                        },
                    },

                    series: [{
                        name: 'Número de delitos',
                        colorByPoint: true,
                        data: delitoTipoPareto,
                    }],
                };
            });

        }


        /**
         *  D O W N L O A D   O P T I O N S
         * */
        /********************************************************************************************************/

        $('#download-chart-delitos-tipo').click(function () {
            var index = $("#delitos-tipo").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-chart-delitos-anio').click(function () {
            var index = $("#delitos-anio").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-chart-delitos-sexo').click(function () {
            var index = $("#delitos-sexo").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-chart-pob-total').click(function () {
            var index = $("#pob-total").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-chart-ana-mun').click(function () {
            var index = $("#ana-mun").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-chart-hacina-mun').click(function () {
            var index = $("#hacina-mun").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-chart-sprim-mun').click(function () {
            var index = $("#sprim-mun").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-ageb-chart-pob-total').click(function () {
            var index = $("#pob-total-ageb").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-ageb-chart-hacina-total').click(function () {
            var index = $("#hacina-ageb").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });
        $('#download-colonia-chart-pob-total').click(function () {
            var index = $("#pob-total-colonia").data('highchartsChart');
            var chart=Highcharts.charts[index];
            chart.exportChart();
        });

        $scope.$watchGroup(['vm.filters.region', 'vm.filters.municipios',
            'vm.filters.agebs','vm.filters.colonia',
            'vm.filters.delitos','vm.filters.delitos_compare',
            'years_delitos.minValue','years_delitos.maxValue',
            'vm.filters.pickerStart.date','vm.filters.pickerEnd.date',
            'vm.cql.map.gmPosList', 'vm.cql.wms',
            'vm.filters.type_filter_year'], function(newValue) {

            var filtersWFS=[''];

            function doXMLFilterWhitin(layer,field,value){

                return '<ogc:Intersects>'+
                    '<ogc:PropertyName>geom</ogc:PropertyName>'+
                    '<ogc:Function name="querySingle">'+
                    '<ogc:Literal>mapa_jalisco:'+layer+'</ogc:Literal>'+
                    '<ogc:Literal>geom</ogc:Literal>'+
                    '<ogc:Literal>'+field+'=\''+value+'\'</ogc:Literal>'+
                    '</ogc:Function>'+
                    '</ogc:Intersects>';
            }

            var filterGeo="";
            $.each(newValue, function (index, value) {
                if(value!="")
                    if(index<=11) {
                        if (value != undefined) {
                            value=value.properties;
                            switch(index){
                                case 0:
                                    filterGeo = doXMLFilterWhitin('regiones','region',value.region);
                                    break;
                                case 1:
                                    filterGeo = doXMLFilterWhitin('municipios','clave',value.clave);
                                    break;
                                case 2:
                                    filterGeo = doXMLFilterWhitin('marginacion_agebs','cve_geoage',value.cve_geoage);
                                    break;
                                case 3:
                                    filterGeo = doXMLFilterWhitin('marginacion_colonias','cid',value.cid);
                                    break;
                                case 4:
                                    if (newValue[4] != undefined && newValue[5]==null) {

                                        var $filterType ='<ogc:PropertyIsEqualTo>' +
                                            '<ogc:PropertyName>delito</ogc:PropertyName>' +
                                            '<ogc:Literal>' + newValue[4] + '</ogc:Literal>' +
                                            '</ogc:PropertyIsEqualTo>';
                                        filtersWFS.push($filterType);
                                    }
                                    break;
                                case 5:
                                    if(newValue[5]!=null){
                                        var $filterType = '<ogc:Or>' +
                                            '<ogc:PropertyIsEqualTo>'+
                                            '<ogc:PropertyName>delito</ogc:PropertyName>'+
                                            '<ogc:Literal>'+newValue[4]+'</ogc:Literal>'+
                                            '</ogc:PropertyIsEqualTo>'+
                                            '<ogc:PropertyIsEqualTo>'+
                                            '<ogc:PropertyName>delito</ogc:PropertyName>'+
                                            '<ogc:Literal>'+newValue[5]+'</ogc:Literal>'+
                                            '</ogc:PropertyIsEqualTo>'+
                                            '</ogc:Or>';
                                        filtersWFS.push($filterType);
                                    }
                                    break;
                                case 6:
                                    if(vm.filters.type_filter_year==false){
                                        var $filterAnio = '<ogc:And>' +
                                            '<ogc:PropertyIsGreaterThanOrEqualTo>' +
                                            '<ogc:PropertyName>anio</ogc:PropertyName>' +
                                            '<ogc:Literal>' + newValue[6] + '</ogc:Literal>' +
                                            '</ogc:PropertyIsGreaterThanOrEqualTo>' +
                                            '<ogc:PropertyIsLessThanOrEqualTo>' +
                                            '<ogc:PropertyName>anio</ogc:PropertyName>' +
                                            '<ogc:Literal>' + (newValue[7]) + '</ogc:Literal>' +
                                            '</ogc:PropertyIsLessThanOrEqualTo>' +
                                            '</ogc:And>';
                                        filtersWFS.push($filterAnio);
                                    }
                                    break;
                                case 8:
                                    if(vm.filters.type_filter_year){
                                        var $filterDate = '<ogc:And>' +
                                            '<ogc:PropertyIsGreaterThanOrEqualTo>' +
                                            '<ogc:PropertyName>fecha</ogc:PropertyName>' +
                                            '<ogc:Function name="dateParse">' +
                                            '<ogc:Literal>yyyy-MM-dd</ogc:Literal>' +
                                            '<ogc:Literal>' + getCustomFormatDate(newValue[8],1) + '</ogc:Literal>' +
                                            '</ogc:Function>' +
                                            '</ogc:PropertyIsGreaterThanOrEqualTo>' +
                                            '<ogc:PropertyIsLessThanOrEqualTo>' +
                                            '<ogc:PropertyName>fecha</ogc:PropertyName>' +
                                            '<ogc:Function name="dateParse">' +
                                            '<ogc:Literal>yyyy-MM-dd</ogc:Literal>' +
                                            '<ogc:Literal>' + getCustomFormatDate(newValue[9],1) + '</ogc:Literal>' +
                                            '</ogc:Function>' +
                                            '</ogc:PropertyIsLessThanOrEqualTo>' +
                                            '</ogc:And>';

                                        filtersWFS.push($filterDate);
                                    }
                                    break;
                                case 10:
                                    if (newValue[10]!=null) {

                                        var $filterType = '<ogc:Not>'+
                                            '<ogc:Disjoint>'+
                                            '<ogc:PropertyName>geom</ogc:PropertyName>'+
                                            '<gml:Polygon srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">'+
                                            '<gml:exterior>'+
                                            '<gml:LinearRing>'+
                                            '<gml:posList>'+
                                            vm.cql.map.gmPosList+
                                            '</gml:posList>'+
                                            '</gml:LinearRing>'+
                                            '</gml:exterior>'+
                                            '</gml:Polygon>'+
                                            '</ogc:Disjoint>'+
                                            '</ogc:Not>';

                                        filtersWFS.push($filterType);
                                    }
                                    break;
                                case 11:
                                    if (newValue[11]!=null) {

                                       var $filterType = '<ogc:Not>'+
                                               '<ogc:Disjoint>'+
                                                   '<ogc:PropertyName>geom</ogc:PropertyName>'+
                                                       '<gml:Polygon srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">'+
                                                           '<gml:exterior>'+
                                                               '<gml:LinearRing>'+
                                                                   '<gml:posList>'+
                                                                      vm.cql.wmsPosList+
                                                                   '</gml:posList>'+
                                                               '</gml:LinearRing>'+
                                                           '</gml:exterior>'+
                                                       '</gml:Polygon>'+
                                               '</ogc:Disjoint>'+
                                           '</ogc:Not>';

                                        filtersWFS.push($filterType);
                                        }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
            });
            filtersWFS.push(filterGeo);

            delitosGraphs(filtersWFS);
            filtersWFS=[];

        });

        function resetDownload(){

            vm.download.format.mun = {};
            vm.download.format.ageb = {};
            vm.download.format.col = {};
            vm.download.link.mun = "";
            vm.download.link.ageb = "";
            vm.download.link.col = "";
        }

        $scope.$watch('vm.download.format.mun', function(newFormat,oldFormat) {
            vm.download.link={};

            if(newFormat!=oldFormat)
                if(newFormat != undefined){
                    vm.download.link.mun = "/geoserver/mapa_jalisco/ows?" +
                        "service=WFS&version=2.0.0&request=GetFeature&typeName=mapa_jalisco:marginacion_municipios" +
                        "&outputFormat=" + newFormat.id+
                        "&propertyname=nombre,cve_mun,pob_tot,analf,sprim,ovsde,ovsee,ovsae,vhac,po2sm,gmm" +
                        "&cql_filter="+ vm.blocks.im_mun.cql;
                    if(jQuery.isEmptyObject( newFormat ))
                        vm.download.link.mun = "";
                }else{
                    vm.download.link.mun = "";
                }
        });

        $scope.$watch('vm.download.format.ageb', function(newFormat,oldFormat) {
            vm.download.link={};

            if(newFormat!=oldFormat)
                if(newFormat != undefined){
                    vm.download.link.ageb = "/geoserver/mapa_jalisco/ows?" +
                        "service=WFS&version=2.0.0&request=GetFeature&typeName=mapa_jalisco:marginacion_agebs" +
                        "&outputFormat=" + newFormat.id+
                        "&propertyname=ageb,cve_geoage,pob_tot,p6a14nae,p15ymssc,psdss,hfm15a49,vsadv,vsdrpfs,vhacina,vsrefri,gmu"+
                        "&cql_filter="+ vm.blocks.im_agebs.cql;
                    if(jQuery.isEmptyObject( newFormat ))
                        vm.download.link.ageb = "";
                }else{
                    vm.download.link.ageb = "";
                }
        });

        $scope.$watch('vm.download.format.col', function(newFormat,oldFormat) {
            vm.download.link={};

            if(newFormat!=oldFormat)
                if(newFormat != undefined){
                    vm.download.link.col = "/geoserver/mapa_jalisco/ows?" +
                        "service=WFS&version=2.0.0&request=GetFeature&typeName=mapa_jalisco:marginacion_colonias" +
                        "&outputFormat=" + newFormat.id+
                        "&propertyname=nombre,cp,pob1,ind1,ind2,ind3,ind4,ind5,ind6,ind7,ind8,ind9,ind10,grado"+
                        "&cql_filter="+ vm.blocks.im_colonias.cql;
                    if(jQuery.isEmptyObject( newFormat ))
                        vm.download.link.col = "";
                }else{
                    vm.download.link.col = "";
                }
        });



        $scope.$on('authenticationSuccess', function() {
            getAccount();

        });

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }
        function register () {
            $state.go('register');
        }
    }
})();
