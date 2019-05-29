angular
    .module('seguridMapApp')
    .config(['tableSortConfigProvider', function(tableSortConfigProvider){
        //Globally configured filtering & pagination templates
        /* Template Tokens - all are replaced by Angular expressions
         * TOTAL_COUNT         - The number for the total count of items in the table
         * FILTERED_COUNT      - The number for the total count of items in the table after the filter has been applied
         * FILTER_STRING       - The string used for the `ng-model` of the text filter
         * PER_PAGE_OPTIONS    - The array of numbers for the verious page size options
         * ITEMS_PER_PAGE      - The number for the selected number of items to display per page (the selected item from PER_PAGE_OPTIONS)
         * CURRENT_PAGE_NUMBER - The number for the page that is currently being viewed
         * CURRENT_PAGE_RANGE  - The number for the current viewable range of pages
         * ITEM_NAME_SINGULAR  - The singular version of the name of the items being iterated over
         * ITEM_NAME_PLURAL    - The plural version of the name of the items being iterated over
         */
        var filterString = "<div class='row'>";
        filterString +=      "<div class='col-sm-4 col-md-3 col-sm-offset-8 col-md-offset-9'>";
        filterString +=        "<div class='form-group has-feedback'>";
        filterString +=          "<input type='search' class='form-control' placeholder='filter {{ITEM_NAME_PLURAL}}' ng-model='FILTER_STRING'/>";
        filterString +=          "<span class='glyphicon glyphicon-search form-control-feedback' aria-hidden='true'></span>";
        filterString +=        "</div>";
        filterString +=      "</div>";
        filterString +=    "</div>";
        tableSortConfigProvider.filterTemplate = filterString;
        var pagerString = "<div class='text-center'>";
        pagerString +=      "<div><uib-pagination style='vertical-align:top; margin-top:0;' ng-if='ITEMS_PER_PAGE < TOTAL_COUNT' ng-model='CURRENT_PAGE_NUMBER' total-items='FILTERED_COUNT' items-per-page='ITEMS_PER_PAGE' max-size='5' force-ellipses='true'></uib-pagination></div>";
        pagerString +=       "<small class='text-muted'>Mostrando {{CURRENT_PAGE_RANGE}} {{FILTERED_COUNT === 0 ? '' : 'de'}} ";
        pagerString +=           "<span ng-if='FILTERED_COUNT === TOTAL_COUNT'>{{TOTAL_COUNT | number}} {{TOTAL_COUNT === 1 ? 'elemento' : 'elementos'}}</span>";
        pagerString +=          "<span ng-if='FILTERED_COUNT !== TOTAL_COUNT'>{{FILTERED_COUNT | number}} {{FILTERED_COUNT === 1 ? ITEM_NAME_SINGULAR : ITEM_NAME_PLURAL}} (filtered from {{TOTAL_COUNT | number}})</span>";
        pagerString +=      "</small>";
        pagerString +=    "</div>";
        tableSortConfigProvider.paginationTemplate = pagerString;
    }]);
