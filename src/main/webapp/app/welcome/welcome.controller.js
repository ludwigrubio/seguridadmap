(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .controller('WelcomeController', WelcomeController);

    WelcomeController.$inject = ['$scope', 'Principal', 'LoginService', '$state', 'olData', 'Geoserver', 'GeoLayers','WMS_URL'];

    function WelcomeController($scope, Principal, LoginService, $state, olData, Geoserver, GeoLayers,WMS_URL) {
        var vm = this;

        vm.serverWMSUrl= WMS_URL;
        vm.$state = $state;
        vm.goDashboard = goDashboard;
        vm.register = register;
        vm.login = login;


        /****************************************************************************************************************
         *                                                L  A   Y  E  R  S
         ***************************************************************************************************************/
        var map = {};


        var baseLayer = new ol.layer.Tile({
            title: '',
            type: 'base',
            source: new ol.source.XYZ({
                url: 'https://api.mapbox.com/styles/v1/ludwigrubio/ciuf0zt6k007y2ipigftnfrpy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHVkd2lncnViaW8iLCJhIjoiY2l1ZjB6MnJhMDBkdzJ0cDQ2N2FpY2U4diJ9.z9ei1Q9VGwW3EbCaZV9k-Q'
            })
        });
        var jaliscoContorno = new ol.layer.Tile({
            title: 'Jalisco',
            source: new ol.source.TileWMS({
                url: vm.serverWMSUrl,
                params: {
                    'LAYERS' : 'mapa_jalisco:estado',
                    'tiled' : true
                },
                serverType: 'geoserver',
            })
        }); //-
        var regiones = new ol.layer.Tile({
            title: 'Regiones',
            source: new ol.source.TileWMS({
                url: vm.serverWMSUrl,
                params: {
                    'LAYERS' : 'mapa_jalisco:regiones',
                    'tiled' : true,
                },
                serverType: 'geoserver',
            })
        }); //-
        var municipios = new ol.layer.Tile({
            title: 'Municipios',
            source: new ol.source.TileWMS({
                url: vm.serverWMSUrl,
                params: {
                    'LAYERS' : 'mapa_jalisco:municipios',
                    'tiled' : true,
                },
                serverType: 'geoserver',
            })
        }); //-
        municipios.setVisible(false);
        var colonias = new ol.layer.Tile({
            title: 'Colonias',
            source: new ol.source.TileWMS({
                url: vm.serverWMSUrl,
                params: {
                    'LAYERS' : 'mapa_jalisco:marginacion_colonias',
                    'tiled' : true
                },
                serverType: 'geoserver',
            })
        });
        colonias.setVisible(false);
        var agebs = new ol.layer.Tile({
            title: 'AGEBS',
            source: new ol.source.TileWMS({
                url: vm.serverWMSUrl,
                params: {
                    'LAYERS' : 'mapa_jalisco:marginacion_agebs',
                    'tiled' : true
                },
                serverType: 'geoserver',
            })
        });
        agebs.setVisible(false);

        var bares = new ol.layer.Image({
            title: 'Centros nocturnos y bares',
            source: new ol.source.ImageWMS({
                url: vm.serverWMSUrl,
                params: {
                    'LAYERS': 'mapa_jalisco:bares_comercios',
                    'cql_filter': "nombre_act like '%Bares, cantinas%' OR nombre_act like '%Centros nocturnos%'"
                },
                serverType: 'geoserver'
            })
        });
        bares.setVisible(false);

        var comerciosAuto = new ol.layer.Image({
            title: 'Tiendas de autoservicio',
            source: new ol.source.ImageWMS({
                url: vm.serverWMSUrl,

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
                url: vm.serverWMSUrl,

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
                url: vm.serverWMSUrl,

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
            title: 'Mapa de calor (Delitos)',
            source: new ol.source.ImageWMS({
                url: vm.serverWMSUrl,
                params: {
                    'LAYERS': 'mapa_jalisco:geodelitos',
                },
                serverType: 'geoserver',
            })
        }); //-


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

        /**
         * Map configuration
         */
        olData.getMap("frontmap").then(function (oMap) {
            oMap.setTarget(null);

            map = new ol.Map({
                interactions: olgm.interaction.defaults({mouseWheelZoom: false}),
                layers: [
                    baseLayer,
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
                        layers: [
                            jaliscoContorno,
                            regiones,
                            municipios,
                            agebs,
                            colonias,
                            vector,
                            heatMapDelitos]
                    })
                ],
                target: "frontmap",
                view: view
            });
            //Init base layer
            setTimeout(function () {

                map.updateSize();

            }, 2000);
            map.updateSize();

            map.addControl(layerSwitcher);
            layerSwitcher.showPanel();
        });

        function goDashboard() {
            $state.go("home");
        }
        function register(role) {
            $state.go("register",{ "role": role});
        }
        function login() {
            $state.go("login");
        }
    }

})();
