(function() {
    'use strict';

    angular
        .module('seguridMapApp')
        .config(bootstrapMaterialDesignConfig);

    function bootstrapMaterialDesignConfig() {
        $.material.init();

    }
})();
