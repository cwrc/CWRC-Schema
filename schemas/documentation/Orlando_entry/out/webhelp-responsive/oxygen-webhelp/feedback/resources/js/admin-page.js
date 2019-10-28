/**
 * Load the libraries for the DITA topics pages.
 */
define(["require", "feedback_config"], function() {
    require([
        "whf_config",
        "init",
        "base64",
        "bootstrap",
        "debug",
        "strings",
        "admin"
    ]);
});