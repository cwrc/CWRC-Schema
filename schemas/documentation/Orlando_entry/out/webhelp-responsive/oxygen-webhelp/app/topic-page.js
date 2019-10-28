/**
 * Load the libraries for the DITA topics pages.
 */
define(["require", "config"], function() {
    require([
        'menu',
        'toc',
        'searchAutocomplete',
        'webhelp',
        'search-init',
        'expand',
        'image-map',
        'template-module-loader',
        'bootstrap',
        'whf_config',
        'debug',
        'parseuri',
        'strings',
        'init',
        'comments-functions',
        'comments'
    ]);
});