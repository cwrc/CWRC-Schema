/*

 Oxygen WebHelp Plugin
 Copyright (c) 1998-2019 Syncro Soft SRL, Romania.  All rights reserved.

 */

define(["jquery", "parseuri", "localization", "debug"], function ($, parseUri, i18n, debug) {

    var pageLocation = window.location.href;

    /**
     * @description Page associated with comments
     */
    var pagePath;

    function showCommentsFor(page) {
        console.log('showCommentsFor(' + page + ')');
        init(page, $('#cmts'));

        return false;
    }

    try {
        var p = parseUri(pageLocation);
        console.log(p);
        pagePath = p.path;
        showCommentsFor(pagePath);
    } catch (e) {
        debug(e);
    }

    /**
     * @desc Localize feedback related elements
     * @param data HTML that will be localized
     * @returns {HTML} Localized HTML
     */
    function localizeWebHelp(data){
        var container = $('<html/>');

        var $lLogin2 = '#l_login2';
        var $lSignUp2 = '#l_signUp2';
        var $lBtSubmitNc = '#l_bt_submit_nc';
        var $lCancelLogBtn = '#l_cancelLogBtn';
        var $linkLostPwd = '#link_lostPwd';

        container.html(data);
        container.find($lLogin2).attr("aria-label", i18n.getLocalization('label.login') );
        container.find($lLogin2).html(i18n.getLocalization('label.login'));

        container.find('#cm_title').html(i18n.getLocalization('label.comments'));
        container.find('#bt_logIn').html(i18n.getLocalization('label.login'));
        container.find('#bt_signUp').html(i18n.getLocalization('label.signUp'));

        container.find($lSignUp2).attr("aria-label", i18n.getLocalization('label.signUp'));
        container.find($lSignUp2).html(i18n.getLocalization('label.signUp'));

        container.find('#l_userName').html(i18n.getLocalization('label.userName'));

        container.find('#l_pswd').html(i18n.getLocalization('label.pswd'));

        container.find("#bt_close_dialog").attr("aria-label", i18n.getLocalization('label.closeDialog'));
        container.find('#ll_remember').html(i18n.getLocalization('label.rememberme'));

        container.find('#l_bt_submit_log').html( i18n.getLocalization('label.login') );

        container.find('#l_cancelLog').html( i18n.getLocalization('label.cancel') );

        container.find('#shareWithTitle').html(i18n.getLocalization('label.shareFrom'));

        container.find('#l_signUp_userName').html(i18n.getLocalization('label.signUp_userName'));

        container.find('#l_signUp_email').html(i18n.getLocalization('label.signUp_email'));

        container.find('#l_signUp_name').html(i18n.getLocalization('label.signUp_name'));

        container.find('#l_signUp_password').html(i18n.getLocalization('label.signUp_password'));
        container.find('#l_signUp_rPassword').html(i18n.getLocalization('label.signUp_rPassword'));

        container.find('#bt_submit').html(i18n.getLocalization('label.submit'));

        container.find('#l_cancelSign').html(i18n.getLocalization('label.cancel'));
        container.find($linkLostPwd).html(i18n.getLocalization('label.lostPswd'));

        container.find('#l_profile').html(i18n.getLocalization('label.userProfile'));

        container.find('#l_CPwd').html(i18n.getLocalization('label.currentPwd'));

        container.find('#l_name').html(i18n.getLocalization('label.yourName'));

        container.find('#l_email').html(i18n.getLocalization('label.yourEmail'));
        container.find('#l_wantEmail').html(i18n.getLocalization('label.IwantEmail'));
        container.find('#l_cmtPage').html(i18n.getLocalization('label.commentPage'));
        container.find('#l_cmtTopic').html(i18n.getLocalization('label.commentTopic'));

        container.find('#l_cmtMy').html(i18n.getLocalization('label.commentMy'));

        container.find('#l_newPwd').html(i18n.getLocalization('label.newPwd'));

        container.find('#l_reNew').html(i18n.getLocalization('label.reNewPwd'));
        container.find('#bt_profile').html(i18n.getLocalization('label.apply'));

        container.find('#l_cancelp').html(i18n.getLocalization('label.cancel'));

        container.find('#bt_editProfile').html(i18n.getLocalization('label.editAccount'));

        container.find('#bt_logOff').html(i18n.getLocalization('label.logOff'));

        container.find('#bt_approveAll').html(i18n.getLocalization('label.approveAll'));
        container.find('#bt_yesApprove').html(i18n.getLocalization('label.yes'));

        container.find('#bt_noApprove').html(i18n.getLocalization('label.no'));

        container.find('#l_addNewCmt').html(i18n.getLocalization('label.addNewCmt'));
        container.find($lBtSubmitNc).html(i18n.getLocalization('label.submit'));
        container.find($lBtSubmitNc).attr("title", i18n.getLocalization('title.submit'));
        container.find($lCancelLogBtn).html(i18n.getLocalization('label.cancel'));
        container.find($lCancelLogBtn).attr("title", i18n.getLocalization('title.cancel'));

        container.find('#question').html(i18n.getLocalization('label.question'));

        container.find('#bt_yesDelete').html(i18n.getLocalization('label.yes'));
        container.find('#bt_noDelete').html(i18n.getLocalization('label.no'));

        container.find('#l_recoverPwd').html(i18n.getLocalization('label.recoverPwd'));

        container.find('#l_recoverEmail').html(i18n.getLocalization('label.recoverEmail'));

        container.find('#bt_recover').attr('value', i18n.getLocalization('label.bt_recover'));
        container.find('#l_cancelRec').attr("value", i18n.getLocalization('label.cancel'));

        return container.html();
    }

    /**
     * start, last, dif used for display date in logs when debug mode enabled
     * @description Time elapsed from last registered log until current log
     * @type {number}
     */
    var dif = 0;
    /**
     * @description Time when current log occurred
     * @type {number}
     */
    var last = 0;
    /**
     * @description Time when first log occurred
     * @type {number}
     */
    var start = 0;

    var isInstaller;

    /**
     * @description Array - stores the htpath and baseUrl
     * @type {Object}
     */
    var conf = null;

    /**
     * @description Log messages
     * @param msg Message to be logged in the console
     * @param obj Object to be logged in the console
     */
    function logLocal(msg, obj) {
        var date = new Date();
        if (start == 0) {
            start = date.getTime();
        }
        dif = date.getTime() - last;
        last = date.getTime();
        var total = last - start;
        console.log(total + ":" + dif + " " + msg, obj);
    }

    /**
     * Define debug(msg, obj) function
     */
    if (typeof debug !== 'function') {
        function debug(msg, obj) {
            logLocal(msg, obj);
        }
    }

    /**
     * Define error(msg, obj) function
     */
    if (typeof error !== 'function') {
        function error(msg, obj) {
            logLocal(msg, obj);
        }
    }

    /**
     * Define info(msg, obj) function
     */
    if (typeof info !== 'function') {
        function info(msg, obj) {
            logLocal(msg, obj);
        }
    }

    /**
     * Define warn(msg, obj) function
     */
    if (typeof warn !== 'function') {
        function warn(msg, obj) {
            logLocal(msg, obj);
        }
    }

    /**
     * @description Converts object to string
     * @param obj
     * @returns {string}
     */
    function objToString(obj) {
        var str = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += p + '::' + obj[p] + '\\n';
            }
        }
        return str;
    }

    $.ajaxSetup({
        cache: true,
        timeout: 60000,
        error: function (jqXHR, errorType, exception) {
            error("[AJX] error :[" + jqXHR.status + ":" + jqXHR.responseText + "]:" + errorType + ":" + objToString(exception));
        },
        complete: function (jqXHR, textStatus) {
            if (textStatus != "success") {
                //console.log(\"?complete :\"+jqXHR+\":\"+textStatus);
            }
        }
    });

    window.onerror = function (msg, url, line) {
        console.log("[JS]: " + msg + " in page: " + url + " at line: " + line);
    };

    function getDepth(relPath) {
        debug("getDepth(" + relPath + ");");
        var toReturn = "";

        var split = relPath.split("/");
        for (var i = 0; i < split.length; i++) {
            if (split[i] !== "") {
                toReturn += "../";
            }
        }

        return toReturn;
    }

    isInstaller = true;

    function myLoc(root){
        root = '<div>' + root + '</div>';
        console.log('myLoc: ', $(root).find('#cm_title'));
        $(root).append($("span").text(" - asa"));
        //console.log('myLoc: ', $(root).append($("span").text(" - asa")));

        return $(root).html();
    }

    /**
     * @description Initialize comments
     *              Calculate htpath and baseUrl. Ex: For http://www.example.com/webhelp/topics/intro.html page the htpath is /webhelp/ and the baseUrl is
     *              http://www.example.com/webhelp/
     * @param page Relative path to the WebHelp root directory
     * @param feedbackDestination jQuery object where the feedback module will be loaded
     */
    function init(page, feedbackDestination) {
        debug("init(" + page + ");");
        pagePath = page;
        var scripts = $('script[src*="/init.js"]');
        var source = scripts[0].src;
        var searchString = "resources/js/init.js";
        var baseURL = source.substring(0, source.indexOf(searchString));

        try {
            var parsedUrl = parseUri(baseURL);
        } catch (e) {
            debug(e);
        }
        var relPath = parsedUrl.directory;

        var depth;
        if (relPath.lastIndexOf("/") == relPath.length - 1) {
            depth = relPath.substring(0, relPath.length - 1);
        } else {
            depth = relPath;
        }

        conf = {"htpath": relPath, "baseUrl": baseURL};
		if (typeof webHelpType === 'undefined') {
        	webHelpType = "classic";
        }
        var url = depth + "/resources/php/cmts.php?type="+webHelpType;
        var data = "&depth=" + depth + "&isInstaller=" + isInstaller;

        if (window.location.href.indexOf('file://') !== 0) {
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success: function (data_response) {
                    try {
                        $(feedbackDestination).html(localizeWebHelp(data_response));
                    } catch (e) {
                        debug(e);
                    }
                }
            });
        }
        debug("Conf obj: ", conf);
        return conf;
    }

    return {
        pagePath: pagePath,
        //conf: conf
        conf: init(pagePath, $('#cmts'))
    }
});

//init(whUrl+pageName);
