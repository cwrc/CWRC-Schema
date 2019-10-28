/**
 * Created by bogdan_cercelaru on 8/8/2018.
 */
/**
 * Load the libraries for the DITA topics pages.
 */
define(["require", "feedback_config"], function() {
    require([
        'jquery',
        'whf_config',
        'bootstrap',
        'debug',
        'parseuri',
        'strings',
        'init',
        'comments-functions',
        'comments'
    ]);
});