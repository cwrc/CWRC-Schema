/**
 * Created by bogdan_cercelaru on 8/9/2018.
 */
define(function() {

    var modulePaths = {
        // core
        "whf_config" : "../../config/config",
        "init" : "init",
        "base64" : "base64",
        "comments" : "comments",
        "comments-functions" : "comments-functions",
        "comments-admin" : "comments-admin",
        "confirm" : "confirm",
        "admin" : "admin",
        "moderate" : "moderate",
        "parseuri" : "parseuri",
        "localization" : "../localization/localization",
        "strings" : "../localization/strings",
        "debug" : "debug",

        /********************************************************
         **************** 3rd Party Libraries *******************
         ********************************************************/

        // JQuery CLEditor
        "jquery.cleditor.amd" : "jquery.cleditor.amd",
        "jquery.cleditor" : "jquery.cleditor.min",

        // JQuery QuickSearch
        "jquery.quicksearch.amd" : "jquery.quicksearch.amd",
        "jquery.quicksearch" : "jquery.quicksearch",

        // jquery-private
        "jquery-private" : "jquery-private",

        // JQuery
        "jquery" : "jquery-3.1.1.min",

        // Bootstrap
        "bootstrap" : "../bootstrap/js/bootstrap.min"
    };

    var shimConfig = {
        // JQuery CLEditor
        "jquery.cleditor" : {
        deps: ["jquery"],
            exports : "jQuery.fn.cleditor"
        },

        // JQuery Plugin
        "jquery.plugin.min" : {
            deps: ["jquery"],
            exports: "jquery.plugin.min"
        },

        // JQuery Quick Search
        "jquery.quicksearch" : {
            deps: ["jquery"],
            exports: "jQuery.fn.quicksearch"
        }

    };

    requirejs.config({
        paths : modulePaths,
        shim : shimConfig,
        map: {
            // @see http://requirejs.org/docs/jquery.html#noconflictmap

            // '*' means all modules will get 'jquery-private'
            // for their 'jquery' dependency.
            "*": {
                "jquery": "jquery-private",
                "jquery.cleditor" : "jquery.cleditor.amd",
                "jquery.plugin.min" : "jquery.plugin.min",
                "jquery.quicksearch" : "jquery.quicksearch.amd"
            },

            "jquery-private": { "jquery": "jquery" },
            "jquery.cleditor.amd" : {"jquery.cleditor" : "jquery.cleditor"},
            "jquery.plugin.min.amd" : {"jquery.plugin.min" : "jquery.plugin.min"},
            "jquery.quicksearch.amd" : {"jquery.quicksearch" : "jquery.quicksearch"}

        }
    });
});