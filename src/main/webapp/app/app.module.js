(function() {
    'use strict';

    angular
        .module('seguridMapApp', [
            'ngStorage',
            'tmh.dynamicLocale',
            'pascalprecht.translate',
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngCacheBuster',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.router',
            'infinite-scroll',
            'highcharts-ng',
            // jhipster-needle-angularjs-add-module JHipster will add new module here
            'openlayers-directive',
            'leaflet-directive',
            'angular-loading-bar',
            'bw.paging',
            'ui.select',
            'ngSanitize',
            'rzModule',
            'tableSort',
            'angucomplete-alt'
        ])
        .run(run);

    run.$inject = ['stateHandler', 'translationHandler'];

    function run(stateHandler, translationHandler) {
        stateHandler.initialize();
        translationHandler.initialize();
    }
})();
