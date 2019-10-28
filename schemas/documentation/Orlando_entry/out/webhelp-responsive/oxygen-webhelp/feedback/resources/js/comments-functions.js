/*

 Oxygen WebHelp Plugin
 Copyright (c) 1998-2019 Syncro Soft SRL, Romania.  All rights reserved.

 */

define(["jquery", "whf_config", "init", "localization", "debug", "base64", "bootstrap", "jquery.cleditor"],
    function ($, whf_config, init, i18n, debug, Base64)
{

    var pagePath = init.pagePath;

    var productName = whf_config.productName;
    var productVersion = whf_config.productVersion;
    var conf = init.conf;

    debug("whf_config: ", whf_config);

    // Attach 'submit' events
    var $whFeedback = $('#cmts');
    $whFeedback.on('submit', '#form_newCmt', function (ev) {
        debug("add new comment..");
        ev.preventDefault();
        postNewComment(pagePath);
        return false;
    });
    $whFeedback.on('submit', '#loginFormData', loggInUser);
    $whFeedback.on('submit', '#signUpFormData', function (ev) {
        debug("submit form...");
        ev.preventDefault();
        signUp();
        return false;
    });

    $whFeedback.on('click', '.bt_edit', function(){
        debug('edit comment');
        var commentId = $(this).attr('data-comment-id');
        editPost(commentId);
    });

    $whFeedback.on('click', '.bt_delete', function(){
        debug('delete comment');
        var commentId = $(this).attr('data-comment-id');
        showConfirmDeleteDialog(commentId);
    });

    $whFeedback.on('click', '.bt_approve', function(){
        debug('approve comment');
        var commentId = $(this).attr('data-comment-id');
        moderatePost(commentId, "approved");
    });

    $whFeedback.on('click', '.bt_reply', function(){
        debug('reply comment');
        var commentId = $(this).attr('data-comment-id');
        debug('reply to ' + commentId + ' comment');
        reply(this, commentId);
    });

    $whFeedback.on('click', '#bt_approveAll', function(){
        debug('approve all comments');
        showApproveAllDialog();
    });

    /**
     * init.js must be included before and var conf must be defined after call of init();
     */

    /**
     * @description Browser URL hash (anchor)
     * @type {string}
     */
    var pageHash = window.location.hash;

    /**
     * @description TRUE if authenticated user is moderator, FALSE otherwise
     * @type {boolean}
     */
    var isModerator = false;

    /**
     * @description TRUE if anonymous user, FALSE otherwise
     * @type {boolean}
     */
    var isAnonymous = false;

    /**
     * @description Element id to scroll to after AJAX execution
     * @type {string}
     */
    var scrollAfterAjax = "";

    /**
     * @description Comments position: 0 - invisible; 1 - partial visible; 2 - full visible
     * @type {number}
     */
    var commentsPosition = 0; // default 0 not visible

    /**
     * @description TRUE if Add New Comment is available, FALSE otherwise
     * @type {boolean}
     */
    var showAddNewComment = true;

    /**
     * @description Browser URL without query and hash
     * @type {string}
     */
    var pageWSearch = pagePath;

    /**
     * @description Last message from preload DIV
     * @type {null}
     */
    var lastPreloadMessage = null;

    /**
     * @description Location where last command occurred (px)
     * @type {null}
     */
    var lastCmdLocation = null;

    window.onerror = function (msg, url, line) {
        debug("[JS]: " + msg + " in page: " + url + " al line: " + line);
    };

    /**
     * @description Reset data from forms
     */
    function resetData() {
        var $loginData = $("#loginData");
        var $newComment = $("#newComment");
        var $uProfile = $('#u_Profile');
        var $confirmDelete = $("#confirmDelete");

        $loginData.hide();
        initNewComment();
        if ($newComment.length>0 && $newComment.parent().get(0).tagName != "BODY") {
            $newComment.appendTo("body");
        }

        $('#commentTitle').html(i18n.getLocalization('newPost'));
        $newComment.hide();
        $('#signUp').hide();
        $('#editedId').val("");
        $uProfile.hide();
        $uProfile.find("input").attr("type", function () {
            var inputType = $(this).attr("type");
            if (inputType == "text" || inputType == "password") {
                $(this).val("");
            }
        });
        $('#recoverPwd').hide();
        if ($confirmDelete.length>0 && $confirmDelete.parent().get(0).tagName != "BODY") {
            $confirmDelete.appendTo("body").hide();
            $("#commentToDelete").html('');
        }

        $newComment.find("textarea").val("");
        $("#loginResponse").html("");
        $loginData.find("input").attr("type", function () {
            var inputType = $(this).attr("type");
            if (inputType == "text" || inputType == "password") {
                $(this).val("");
            }
        });
    }

    /**
     * @description Check if webhelp system is installed
     * @returns {boolean}
     */
    function checkConfig() {
        var page = conf.htpath + "resources/php/checkInstall.php";
        var response = false;
        var $commentsContainer = $("#commentsContainer");

        $.ajax({
            type: "POST",
            url: page,
            data: "",
            async: false,
            success: function (data_response) {
                debug('check page:' + page);
                var config = JSON.parse(data_response);
                if (config.installPresent == "true" && config.configPresent == "true") {
                    $commentsContainer.parent().append("<div id='fbUnavailable'>" + i18n.getLocalization('label.fbUnavailable') + "<br/>" + i18n.getLocalization('label.removeInst') + "</div>");
                    $commentsContainer.hide().remove();
                    debug('showComments() - red');
                } else if (config.configPresent == "true") {
                    response = true;
                    // show comments
                } else {
                    debug('Redirect to Install ...');
                    $('#bt_logIn').hide();
                    $('#bt_signUp').hide();
                    $('#bt_new').hide();
                    $('#cm_title').append(' - ' + i18n.getLocalization('configInvalid'));
                    window.parent.location.href = conf.htpath + "install/";
                }
            }
        });
        debug('checkConfig() -', response);

        return response;
    }

    /**
     * @description Load and display comments
     */
    function showComments(pagePath) {
        debug('showComments(' + pagePath + ')');
        hideAll();
        displayUserAccount();
        var $comments = $('#comments');
        if ($comments && (!lastCmdLocation)) {
            lastCmdLocation = $comments.css('top');
        }
        showPreload(i18n.getLocalization('label.plsWaitCmts'));
        resetData();
        var processComments = conf.htpath + "resources/php/showComments.php";
        var page = {page: pagePath, productName: productName, productVersion: productVersion};

        $.ajax({
            type: "POST",
            url: processComments,
            contentType: "application/x-www-form-urlencoded",
            data: page,
            success: function (data_response) {
                hidePreload();
                var $oldComments = $('#oldComments');
                $oldComments.html(data_response).show();
                var count = $(".commentStyle").children('li').length;
                var toApprove = $("li .bt_approve").length;
                if (isModerator && count > 0 && toApprove > 0) {
                    $("#approveAll").show();
                } else {
                    $("#approveAll").hide();
                }
                if (count > 0) {
                    $('#cm_count').html(count);
                } else {
                    $('#cm_count').html("");
                }
                if ($.trim(pageHash) != '') {
                    window.location.href = pageHash;
                }
                if (scrollAfterAjax) {
                    goToByScroll(scrollAfterAjax);
                }
                // Open links in new tab
                $oldComments.find('a').click(function () {
                    $(this).attr("target", "blank");
                });
            },
            error: function () {
                hidePreload();
            }
        });

        if (getParam('a') != '') {
            $("#loginResponse").html(i18n.getLocalization('recoveryConfirmation'));
            showLoggInDialog();
        }
    }

    /**
     * @description Get value of @name parameter
     * @param name
     * @returns String Value of @name parameter
     */
    function getParam(name) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results != null && results.length > 1) {
            return results[1];
        } else {
            return "";
        }
    }

    /**
     * @description Display user account information and buttons that apply to account type
     */
    function displayUserAccount() {
        $("#cmt_info").removeClass('textError').removeClass('textInfo');
        var url = conf.htpath + "resources/php/checkUser.php";
        var data = "check=true&productName=" + productName + "&productVersion=" + productVersion + "&delimiter=|";

        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: function (data_response) {

                var response = JSON.parse(data_response);
                var $accountInfo = $("#accountInfo");
                var $approveAll = $("#approveAll");
                var $userAccount = $('#userAccount');

                isAnonymous = (response.isAnonymous == 'true');
                showMessage(response);

                if (response.loggedIn == 'true') {
                    $accountInfo.html(response.name);
                    $(".avatar_userName").html(response.userName);

                    if (response.level == "admin" || response.level == "moderator") {
                        isModerator = true;
                        if (isModerator == true) {
                            if ($approveAll.parent().attr('id') != "bt_new") {
                                $approveAll.appendTo('#bt_new');
                            }
                        }
                        if ($("html").attr("dir") != "rtl") {
                            $accountInfo.append(" <span class='level'>" + i18n.getLocalization("label." + response.level) + "</span>");
                        } else {
                            $accountInfo.html(" <span class='level'>" + i18n.getLocalization("label." + response.level) + "</span>" + $accountInfo.html());
                        }
                    } else {
                        isModerator = false;
                    }
                    if (response.level != "user" && $('#adminLink').length < 1) {
                        var $adminLink = $('<li/>').append($('<a/>').attr('class', 'dropdown-item')
                                                                    .attr('id', 'adminLink')
                                                                    .attr('href', '#')
                                                                    .html(i18n.getLocalization("label.adminPanel")));
                        $adminLink.on('click', '#adminLink', function(ev){
                            ev.preventDefault();
                            setLastPage();
                            window.location = conf.htpath + "resources/admin.html";
                        });
                        $("#show_profile").find('#divider-admin').after($adminLink);
                    }

                    if (isAnonymous) {
                        $userAccount.find('#show_profile').hide();
                        $('#bt_editProfile').hide();
                        $userAccount.show();
                        $userAccount.find('#bt_logIn').show();
                        $userAccount.find('#bt_signUp').show();
                        $("#loginData").hide();
                        $("#o_captcha").show();
                    } else {
                        $("#o_captcha").hide();
                        $userAccount.show();
                        $userAccount.find('#show_profile').show();
                        $userAccount.find('#bt_logIn').hide();
                        $userAccount.find('#bt_signUp').hide();
                        $('#bt_editProfile').show();
                        $("#loginData").hide();
                    }
                    if (response.minVisibleVersion <= productVersion) {
                        $('#bt_new').show();
                    }
                    showAddNewComment = true;
                    //loggin to moderatePost
                    if (getParam('l') != '') {
                        $("#loginResponse").html(i18n.getLocalization('label.logAdmin'));
                        showLoggInDialog();
                    }
                } else {
                    $accountInfo.html(i18n.getLocalization("label.guest"));
                    $userAccount.find('#show_profile').hide();
                    $userAccount.find('#bt_logIn').show();
                    $userAccount.find('#bt_signUp').show();
                    $userAccount.show();
                    $('#newComment').hide();
                    if (response.minVisibleVersion <= productVersion) {
                        $('#bt_new').show();
                    }
                    showAddNewComment = false;
                }
            }
        });
    }

    /**
     * @description Show message @response
     * @param response Message to be displayed
     */
    function showMessage(response) {
        if (response.msgType) {
            var $cmtInfo = $("#cmt_info");
            if (response.msgType == 'error') {
                $cmtInfo.addClass('textError').removeClass('textInfo');
            } else {
                $cmtInfo.removeClass('textError').addClass('textInfo');
            }
            $cmtInfo.html(i18n.getLocalization('checkUser.' + response.msg));
        }
    }

    /**
     * @description Write last page URL to cookie
     */
    function setLastPage() {
        setCookie("backLink", window.location.href, 7);
    }

    /**
     * @description Check if user is logged on
     * @param button - Element clicked when invoked
     */
    function checkUser(button) {
        debug("checkUser(" + button.attr('id') + ")");
        // check if user is logged on
        var processLogin = conf.htpath + "resources/php/checkUser.php";

        $("#loginResponse").html("");
        $.ajax({
            type: "POST",
            url: processLogin,
            data: "check=true&productName=" + productName + "&productVersion=" + productVersion + "&delimiter=|",
            success: function (data_response) {
                debug("checkUser.php=", data_response);
                var response = JSON.parse(data_response);
                var $newComment = $("#newComment");
                var $recoverPwd = $("#recoverPwd");

                isAnonymous = (response.isAnonymous == 'true');

                if ($newComment.parent().attr('id') != button.attr('id')) {
                    $newComment.appendTo(button);
                }

                if ($recoverPwd.parent().attr('id') != button.attr('id')) {
                    $recoverPwd.appendTo(button);
                }

                if (response.loggedIn == 'true') {
                    $('#commentTitle').html(i18n.getLocalization('newPost'));
                    showNewComment();
                    refreshEditor();
                    $("#commentText").cleditor()[0].clear();
                } else {
                    isModerator = false;
                    $("#signUp").hide();
                    $recoverPwd.hide();
                    showLoggInDialog();
                }
            }
        });
    }

    /**
     * @description Set scroll to after ajax execution on show comments
     * @param ids - element id to scroll to
     */
    function setScrollTo(ids) {
        scrollAfterAjax = ids;
    }

    /**
     * @description Scroll to element with @id
     * @param id - the element id to scroll to
     */
    function goToByScroll(id) {
        debug("goToByScroll(" + id + ")");
        var rowpos = $('#' + id).position();
        try {
            // IE
            $('html').scrollTop(rowpos.top);
            // FF Chrome
            $('body').scrollTop(rowpos.top);
        } catch (e) {
            debug(e);
        }
    }

    /**
     * @description Scroll to newComment element
     */
    function goToNewComment() {
        debug("goToByScroll('newComment')");
        var $newComment = $('#newComment');
        var idHeight = parseInt($newComment.height());
        var diff = parseInt($(window).height()) - idHeight - 30;

        var rowpos = $newComment.position();
        try {
            // IE
            $('html').scrollTop(parseInt(rowpos.top) - diff);
            // FF Chrome
            $('body').scrollTop(parseInt(rowpos.top) - diff);
        } catch (e) {
            debug(e);
        }
    }

    /**
     * {Refactored}
     * @description Show Reset Password dialog
     */
    function showLostPwd() {
        debug("CLICK!!! showLostPwd");
        $('#loginResponse').removeClass("textInfo").removeClass("textError").html("").hide();

        hideAll();
        //reset email input text
        $("#recoverEmail").val("");
        $('#recoverPwdResponse').removeClass("textInfo").removeClass("textError").html("").hide();
        $('#recoverPwd').modal('show');
    }

    /**
     * @description Show/Hide replies
     * @param id - Comment ID
     */
    function toggleReply(id) {
        var currentNode = "li#" + id;
        $(currentNode + " ul").slideToggle("1000");

        var $toggleId = $("#toggle_" + id);
        if ($toggleId.attr('class') == 'minus') {
            $toggleId.removeClass('minus').addClass('plus');
        } else {
            $toggleId.removeClass('plus').addClass('minus');
        }
    }

    /**
     * @description Show confirm delete dialog
     * @param id - Id of comment to be deleted
     */
    function showConfirmDeleteDialog(id) {
        hideAll();
        var confDialog = $("#confirmDelete");
        confDialog.remove();
        var content = $("#cmt_text_" + id).html();
        $("#" + id + " .head").first().append(confDialog);
        $("#commentToDelete").html(content);
        $("#idToDelete").val(id);
        $("#bt_yesDelete").click(deleteComment);

        confDialog.modal('show');

        /*$("#confirmDelete").css('top', 'auto');
         $("#confirmDelete").show();

         reposition('confirmDelete');*/
    }

    /**
     * @description Moderate comment (approve / delete)
     * @param id - Id of comment to be moderated
     * @param action - Action to pe performed
     * @returns {boolean} - TRUE if action performed successfully
     *                    - FALSE if action not performed
     */
    function moderatePost(id, action) {
        if (action == 'suspended') {
            toggleReply(id);
        }
        $.ajax({
            type: "POST",
            url: conf.htpath + "resources/php/moderate.php",
            data: "uncodedId=" + id + "&action=" + action + '&product=' + productName + '&version=' + productVersion,
            success: function (data_response) {
                if (data_response != "") {
                    setScrollTo(id);
                    showComments(pagePath);
                } else {
                    $("#cmt_info").html("Action not performed !");
                }
            }
        });
        return false;
    }

    /**
     * @description Reply to other comment
     * @param element - Clicked button
     * @param commentId - ID of comment to reply to
     */
    function reply(element, commentId) {
        hideAll();
        setScrollTo(commentId);
        $('#referedCmtId').val(commentId);
        $('#editedId').val('');
        checkUser($(element).parent());
        setTimeout(goToByScroll(commentId), 100);
    }

    /**
     * {Refactored}
     * @description Refresh CLEditor
     */
    function refreshEditor() {
        var $commentText = $("#commentText");
        if ($("html").attr("dir") != "rtl") {
            $commentText.cleditor({
                "width": "98%",
                "height": "300",
                controls: "bold italic underline strikethrough subscript superscript | font size " +
                "style | color highlight removeformat | bullets numbering | outdent " +
                "indent | alignleft center alignright justify | undo redo | " +
                "rule image link unlink | cut copy paste pastetext",
                styles: [["Paragraph", "<p>"], ["Preformatted", "<pre>"], ["Header 1", "<h1>"], ["Header 2", "<h2>"],
                    ["Header 3", "<h3>"], ["Header 4", "<h4>"], ["Header 5", "<h5>"],
                    ["Header 6", "<h6>"]]
            });
        } else {
            $commentText.cleditor({
                "width": "98%",
                "height": "300",
                bodyStyle: "direction:rtl",
                controls: "bold italic underline strikethrough subscript superscript | font size " +
                "style | color highlight removeformat | bullets numbering | outdent " +
                "indent | alignleft center alignright justify | undo redo | " +
                "rule image link unlink | cut copy paste pastetext"
            });
        }
        var editor = $commentText.cleditor()[0];
        editor.refresh().focus();
        editor.$area.hide();
        editor.$frame.show();
        var $cleditorMain = $(".cleditorMain");
        $cleditorMain.find("iframe").contents().find("body").attr("aria-label", i18n.getLocalization("label.cleditorControls"));
        $cleditorMain.find("iframe").contents().find("html").on("keydown", function (ev) {
            if (ev.altKey && ev.key == "s") {
                $("#l_bt_submit_nc").trigger("click");
            }
            if (ev.altKey && ev.key == "`") {
                $("#l_cancelLogBtn").trigger("click");
                $("#comments").focus();
            }
        });
    }

    /**
     * @description Edit comment
     * @param id - Id of the comment to be edited
     */
    function editPost(id) {
        hideAll();
        var comment = "#" + id + " div#cmt_text_" + id;
        var getComment = $(comment).html();
        var $newComment = $("#newComment");
        if ($newComment.parent().attr('id') != 'c_' + id) {
            $newComment.appendTo("div#c_" + id);
        }
        $('#commentTitle').html(i18n.getLocalization('editPost'));
        $('#editedId').val(id);
        $('#referedCmtId').val('');
        $('#commentText').val(getComment);
        showNewComment();
        refreshEditor();
        setTimeout(goToNewComment(), 100);
    }

    /**
     * @description Show Edit Account dialog
     * @returns {boolean} return FALSE
     */
    function showProfileChange(e) {
        e.preventDefault();

        var dataString = 'select=true' + '&delimiter=|&product=' + productName + '&version=' + productVersion;
        var processLogin = conf.htpath + "resources/php/profile.php";
        var $uName = $("#u_name");
        var $uEmail = $("#u_email");
        var $uResponse = $('#u_response');
        var $uProfile = $('#u_Profile');
        var $uNotifyPage = $("#u_notify_page");

        hideAll();

        $uResponse.html('');
        $uNotifyPage.attr('checked', true);
        $uProfile.modal('show').on('shown.bs.modal', function () {
            $('#u_Cpass').focus();
        });

        showPreload(i18n.getLocalization('label.plsWaitChProfile'));
        $.ajax({
            type: "POST",
            url: processLogin,
            data: dataString,
            success: function (data_response) {
                hidePreload();
                if (data_response != '') {
                    var response = JSON.parse(data_response);
                    if (response.isLogged == 'true') {
                        $uName.val(response.name);
                        $uEmail.val(response.email);
                        var $uPass = $("#u_pass");
                        var $uPass1 = $("#u_pass1");
                        if (response.ldapUser == 'true') {
                            $uName.attr('disabled', 'disabled');
                            $uEmail.attr('disabled', 'disabled');
                            $uPass.attr('disabled', 'disabled');
                            $uPass1.attr('disabled', 'disabled');
                        } else {
                            $uName.removeAttr('disabled');
                            $uEmail.removeAttr('disabled');
                            $uPass.removeAttr('disabled');
                            $uPass1.removeAttr('disabled');
                        }
                        if (response.notifyPage == 'yes') {
                            $uNotifyPage.attr('checked', true);
                        } else {
                            $uNotifyPage.attr('checked', false);
                        }
                        var $uNotifyReply = $("#u_notify_reply");
                        if (response.notifyReply == 'yes') {
                            $uNotifyReply.attr('checked', true);
                        } else {
                            $uNotifyReply.attr('checked', false);
                        }
                        var $uNotifyAll = $("#u_notify_all");
                        if (response.notifyAll == 'yes') {
                            $uNotifyAll.attr('checked', true);
                        } else {
                            $uNotifyAll.attr('checked', false);
                        }
                    }
                } else {
                    $uProfile.show();
                    $uResponse.html('').show();
                }
            },
            error: function () {
                hidePreload();
            }
        });
        return false;
    }

    /**
     * @description Read Cookies
     * @param a - Cookie name
     * @returns {string} Value of cookie
     */
    function readCookie(a) {
        var b = "";
        a = a + "=";
        if (document.cookie.length > 0) {
            var offset = document.cookie.indexOf(a);
            if (offset != -1) {
                offset += a.length;
                var end = document.cookie.indexOf(";", offset);
                if (end == -1)
                    end = document.cookie.length;
                b = unescape(document.cookie.substring(offset, end));
            }
        }
        return b;
    }

    /**
     * @description Set Cookie
     * @param c_name - Cookie name
     * @param value - Cookie value
     * @param exdays - Days until cookie will expire
     */
    function setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value + "; path=/";
    }

    /**
     * @description Delete cookie
     * @param name - Cookie name
     */
    function eraseCookie(name) {
        setCookie(name, "", -1);
    }

    /**
     * @description Show recover password dialog
     */
    function recover() {
        debug("recover...");
        var email = $("#recoverEmail").val();
        var username = $("#recoverUser").val();
        var dataString = 'userName=' + username + '&email=' + email + '&product=' + productName + '&version='
            + productVersion;

        var $loginResponse = $('#loginResponse');
        var $recoverPwd = $("#recoverPwd");
        var $recoverPwdResponse = $('#recoverPwdResponse');

        showPreload(i18n.getLocalization('label.plsWaitRecover'));
        $.ajax({
            type: "POST",
            url: conf.htpath + "resources/php/recover.php",
            data: dataString,
            success: function (data_response) {
                setCookie("page", pagePath, 7);
                var response = JSON.parse(data_response);

                hidePreload();
                if (response.success == "true") {
                    $recoverPwd.find("input").attr("type", function () {
                        var inputType = $(this).attr("type");
                        if (inputType == "text") {
                            $(this).val("");
                        }
                    });
                    $(".modal").modal('hide');
                    showLoggInDialog();
                    $loginResponse.addClass("textInfo");
                    $loginResponse.html(response.message);
                    $loginResponse.show();
                    $('#newComment').hide();
                } else {
                    $recoverPwd.show();
                    $recoverPwdResponse.addClass("textError");
                    $recoverPwdResponse.html(response.message).show();
                }
            },
            error: function () {
                hidePreload();
            }
        });
        return false;
    }

    /**
     * @description Process login form
     * @returns {boolean}
     */
    function loggInUser() {
        $("#comments").focus();
        // process form
        var userName = $("#myUserName").val();
        var password = $("#myPassword").val();
        var rememberMe = "no";
        if ($("#myRemember").is(':checked')) {
            rememberMe = "yes";
        }
        var dataString = '&userName=' + userName + '&password=' + password + "&productName=" + productName + "&productVersion=" + productVersion;
        var processLogin = conf.htpath + "resources/php/checkUser.php";

        var $loginResponse = $('#loginResponse');
        var $userAccount = $("#userAccount");
        var $reloadComments = $('#reloadComments');
        var $loginData = $('#loginData');

        if (userName != '' && password != '') {
            showPreload(i18n.getLocalization("label.plsWaitAuth"));
            $.ajax({
                type: "POST",
                url: processLogin,
                data: dataString,
                success: function (data_response) {
                    var msg, pss;
                    var response = JSON.parse(data_response);
                    if (typeof pageWSearch !== 'undefined' && window.location.href != pageWSearch) {
                        if (response.authenticated == 'false') {
                            hidePreload();
                            if (response.error) {
                                msg = i18n.getLocalization('checkUser.loginError');
                                msg = msg + "<!--" + response.error + " -->";
                                $loginResponse.html(msg).show();
                            } else {
                                $loginResponse.html(i18n.getLocalization('checkUser.loginError')).show();
                            }
                        } else {
                            if (rememberMe == "yes") {
                                pss = Base64.encode(userName + "|" + password);
                                setCookie("oxyAuth", pss, 14);
                            } else {
                                eraseCookie("oxyAuth");
                            }
                            $loginResponse.html("").hide();
                            $userAccount.show();

                            // instead of loading only comments and user data
                            showComments(pagePath);
                            $loginData.modal('hide');
                            $('#comments').focus();
                        }
                    } else {
                        hidePreload();
                        if (response.authenticated == 'true') {
                            $userAccount.hide();
                            $loginResponse.html("").hide();
                            if (isAnonymous) {
                                $('#bt_editProfile').hide();
                                $("#o_captcha").show();
                            } else {
                                $("#o_captcha").hide();
                            }
                            $userAccount.find('#bt_logIn').hide();
                            $userAccount.find('#bt_signUp').hide();
                            if ($reloadComments.val() == "true") {
                                showComments(pagePath);
                                $reloadComments.val("");
                                if (rememberMe == "yes") {
                                    pss = Base64.encode(userName + "|" + password);
                                    setCookie("oxyAuth", pss, 14);
                                } else {
                                    eraseCookie("oxyAuth");
                                }
                                $loginData.on('hidden.bs.modal', function () {
                                    document.activeElement.blur();
                                });
                            } else {
                                $userAccount.show();
                                $('#newComment').show();
                                var $commentText = $("#commentText");
                                $commentText.cleditor();
                                $commentText.focus();
                                setTimeout(goToByScroll('l_bt_submit_nc'), 100);
                            }
                        } else {
                            if (response.error) {
                                msg = i18n.getLocalization('checkUser.loginError');
                                msg = msg + "<!-- " + response.error + " -->";
                                $loginResponse.html(msg).show();
                            } else {
                                $loginResponse.html(i18n.getLocalization('checkUser.loginError')).show();
                            }
                        }
                    }
                },
                error: function () {
                    hidePreload();
                }
            });
        }
        //return false; //false or the form will post your data to login.php
        return false;
    }

    /**
     * @description Close dialog
     * @returns {boolean} - FALSE
     */
    function closeDialog() {
        $("#editedId").val("");
        $(this).parent().hide();
        return false;
    }

    /**
     * @description Show new comment form
     */
    function showNewCommentDialog() {
        debug("showNewCommentDialog()");
        hideAll();
        setScrollTo('new_comment');
        checkUser($("#new_comment"));
        setTimeout(goToByScroll("l_bt_submit_nc"), 100);
    }

    /**
     * @description Display / Scroll to new added comment
     */
    function showNewComment() {
        $("#newComment").show();
        if (scrollAfterAjax) {
            goToByScroll(scrollAfterAjax);
        }
        $("#l_bt_submit_nc").prop("disabled", false);
    }

    /**
     * @description Verify CAPTCHA
     * @returns {boolean}
     */
    function checkReal() {
        debug('checkReal()');
        if (isAnonymous) {
            return "" === $('#question_212').val();
        } else {
            return true;
        }
    }

    /**
     * @description Post new comment
     * @returns {boolean} - Always return FALSE
     */
    function postNewComment(pagePath) {
        if (!checkReal()) {
            return false;
        } else {
            // process form
            $(".bt_edit").prop("disabled", true);
            $(".bt_delete").prop("disabled", true);
            $("#l_bt_submit_nc").prop("disabled", true);

            var commentNo = $('#referedCmtId').val();
            var text = $.trim($("#commentText").val());
            var dataString = {
                text: text,
                page: pagePath,
                comment: commentNo,
                product: productName,
                version: productVersion,
                editedId: $('#editedId').val()
            };
            var postComment = conf.htpath + "resources/php/comment.php";
            var $lPlsWait = $('#l_plsWait');
            $lPlsWait.html(i18n.getLocalization('label.insertCmt'));
            if ((text != '') && (text != '<br>')) {
                $.ajax({
                    type: "POST",
                    url: postComment,
                    contentType: "application/x-www-form-urlencoded",
                    data: dataString,
                    success: function (data_response) {
                        var result = data_response.split("|");

                        if (result[0] == 'Comment not inserted!') {
                            $('#cmt_info').html(data_response);
                        } else {
                            $('#referedCmtId').val(0);
                            setScrollTo(result[1]);
                            //showComments();
                            hideAll();
                            if (isAnonymous && result[1] == "moderated") {
                                $(".anonymous_post_cmt").remove();
                                $("#bt_new").append("<div class='anonymous_post_cmt'>" + i18n.getLocalization('comment.moderate.info') + "</div>");
                                goToByScroll("commentsContainer");
                            } else {
                                showComments(pagePath);
                            }
                        }
                    }
                });
            }
            $lPlsWait.html(i18n.getLocalization('label.plsWait'));
            return false;
        }
    }

    /**
     * @description Validate email address
     * @param email - String that will be validated as email
     * @returns {boolean} - TRUE if email is valid
     *                    - FALSE if email is invalid
     */
    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    /**
     * @description Check user name to have minimum 5 alphanumeric characters without spaces
     * @param name - String that will be validated as name
     * @returns {boolean} - TRUE if email is valid
     *                    - FALSE if email is invalid
     */
    function validateUserName(name) {
        var patt = /^[^\W]{2,}$/;
        return patt.test(name);
    }

    /**
     * @description Check password to have minimum 5 characters
     * @param pswd - String that will be validated as password
     * @returns {boolean} - TRUE if email is valid
     *                    - FALSE if email is invalid
     */
    function validatePassword(pswd) {
        var patt = /^.{5,}$/;
        return patt.test(pswd);
    }

    /**
     * @description Show error information in sign up dialog
     * @param key - The field that trigger this error
     */
    function signUpShowInfo(key) {
        var info = i18n.getLocalization(key);
        var keyInfo = i18n.getLocalization(key + '.info');
        if (keyInfo != key + '.info') {
            info = info + "<br/><div class='info'>" + i18n.getLocalization(key + '.info') + "<div>";
        }
        $('#signUpResponse').html(info).show();
        $('#signUp').show();
    }

    /**
     * {Refactored}
     * @description Process sign up form
     * @returns {boolean} - Always return FALSE
     */
    function signUp() {
        debug("signUp...");

        var userName = $("#myNewUserName").val();
        var myName = $("#myName").val();
        var myEmail = $("#myEmail").val();
        var password = $("#myNewPassword").val();
        var password1 = $("#myNewPassword1").val();
        var $signUpResponse = $('#signUpResponse');
        var $signUp = $('#signUp');

        $signUpResponse.css('color', '#cc0000');
        if (!validateUserName(userName)) {
            signUpShowInfo('signUp.err.6');
        } else if (!validateEmail(myEmail)) {
            signUpShowInfo('signUp.err.3');
        } else if (!validatePassword(password)) {
            signUpShowInfo('pwd.tooShort');
        } else if (password == password1) {
            var dataString = 'userName=' + userName + '&name=' + myName + '&password=' + password + '&email=' + myEmail
                + '&product=' + productName + '&version=' + productVersion;
            var processLogin = conf.htpath + "resources/php/signUp.php";
            showPreload(i18n.getLocalization('label.plsWaitSignUp'));
            $.ajax({
                type: "POST",
                url: processLogin,
                data: dataString,
                success: function (data_response) {
                    hidePreload();
                    $signUpResponse.hide();
                    var response = JSON.parse(data_response);
                    if (response.error == 'false') {
                        setCookie("page", pagePath, 7);

                        $signUp.find("tbody tr").hide();
                        $signUpResponse.html(i18n.getLocalization('checkEmail-signUp'));
                        $signUpResponse.css('color', '#378b18');

                        $('#newComment').hide();
                        $signUpResponse.show();
                        $signUp.show();
                        $('#signUpFormData').trigger('reset');
                    } else {
                        $signUpResponse.css('color', '#cc0000');
                        $signUpResponse.html(i18n.getLocalization("signUp.err." + response.errorCode));
                        $signUpResponse.show();
                    }
                },
                error: function () {
                    hidePreload();
                }
            });
        } else {
            signUpShowInfo('pwd.repeat');
        }
        return false;
    }

    /**
     * @description Delete comment
     */
    function deleteComment() {
        moderatePost($("#idToDelete").val(), "deleted");
    }

    /**
     * @description Hide all dialogs and preloaders
     *   1. #u_Profile - Edit user profile dialog (logged in users)
     *   2. #preload - TOC preoader
     *   3. #preload1 - Content preloader
     *   4. #newComment - New comment dialog
     *   5. #recoverPwd - Reset password dialog
     *   6. #loginData - Log in dialog
     *   7. #signUp - Sign up dialog
     *   8. #confirmDelete - Confirm delete comment dialog (moderator / admin panel)
     *   9. #showConfirmApproveAll - Approve all comments dialog (moderator / admin panel)
     */
    function hideAll() {
        debug("hideAll()");
        $('#preload').hide();
        $('#preload1').hide();
        $('#newComment').hide();
        $('#recoverPwd').hide();
        $('#loginData').hide();
        $('#signUp').hide();
        $("#confirmDelete").hide();
        $(".modal").modal("hide");
    }

    /**
     * @description Show approve all dialog
     */
    function showApproveAllDialog() {
        /*hideAll();*/
        $("#approveInfo").html(i18n.getLocalization('approveAllConfirmation'));
        $('#showConfirmApproveAll').modal('show');
    }

    /**
     * @description Approve all comments
     * @returns {boolean} - Always return FALSE
     */
    function approveAllComments() {
        hideAll();
        var url = conf.htpath + "resources/php/moderate.php";
        var data = "page=" + pagePath + '&product=' + productName + '&version=' + productVersion;
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: function (data_response) {
                if (data_response != "") {
                    showComments(pagePath);
                    $('#showConfirmApproveAll').hide();
                } else {
                    $("#approveInfo").html("Action not performed !");
                }
            }
        });
        return false;
    }

    /**
     * @description Hide approve all comments dialog
     */
    function hideApproveDialog() {
        $("#showConfirmApproveAll").hide();
    }

    /**
     * @description Show log in dialog (and populate fields with data from cookie if is set)
     * @returns {boolean} - Always return FALSE
     */
    function showLoggInDialog() {
        debug("showLoggInDialog()");
        var encoded = readCookie("oxyAuth");
        var pss = Base64.decode(encoded);
        var auth = pss.split("|");
        var $loginData = $('#loginData');

        hideAll();
        $("#reloadComments").val("true");
        $('#myUserName').val(auth[0]);
        $('#myPassword').val(auth[1]);
        $("#myRemember").attr('checked', (readCookie("oxyAuth") != ""));

        $loginData.on('shown.bs.modal', function () {
            $('#l_login2').trigger('click');
            $('#myUserName').trigger('focus');
        });

        $loginData.modal('show');

        $("#recoverPwd").hide();
        $("#u_Profile").hide();
        $("#signUp").hide();

        return false;
    }

    /**
     * @description Show Sign Up form
     */
    function sharedWith() {
        debug('sharedWith()');
        showPreload(i18n.getLocalization('label.plsWaitUpProfile'));
        $.ajax({
            type: "POST",
            url: conf.htpath + "resources/php/sharedFrom.php",
            data: 'version=' + productVersion,
            success: function (data_response) {
                debug("Share comments from: " + data_response);
                hidePreload();
                if (data_response != "") {
                    $('#shareWith').html(data_response).show();
                }
            },
            error: function () {
                hidePreload();
            }
        });


    }


    /**
     * {Refactored}
     * @description Update user profile
     * @returns {boolean}
     */
    function updateUserProfile() {
        var name = $("#u_name").val();
        var email = $("#u_email").val();
        var notifyPage = "no";
        if ($("#u_notify_page").is(':checked')) {
            notifyPage = "yes";
        }

        var notifyAll = "no";
        if ($("#u_notify_all").is(':checked')) {
            notifyAll = "yes";
        }

        var notifyReply = "no";
        if ($("#u_notify_reply").is(':checked')) {
            notifyReply = "yes";
        }

        var oldPassword = $("#u_Cpass").val();
        var dataString = 'update=true' + '&name=' + name + '&notifyReply=' + notifyReply + '&notifyAll=' + notifyAll
            + '&notifyPage=' + notifyPage + '&email=' + email + '&product=' + productName + '&version=' + productVersion
            + '&oldPassword=' + oldPassword;
        var password = $("#u_pass").val();
        var password1 = $("#u_pass1").val();

        if (password == password1) {
            if (password != '') {
                dataString = dataString + '&password=' + password;
            }
            var processLogin = conf.htpath + "resources/php/profile.php";

            showPreload(i18n.getLocalization('label.plsWaitUpProfile'));
            $('#u_response').removeClass('textError').removeClass('textInfo').html("");
            $.ajax({
                type: "POST",
                url: processLogin,
                data: dataString,
                success: function (data_response) {
                    hidePreload();
                    var response = JSON.parse(data_response);
                    if (response.updated != 'true') {
                        var $uResponse = $('#u_response');
                        if (response.msgType == 'error') {
                            $uResponse.removeClass('textInfo').addClass('textError');
                        } else {
                            $uResponse.removeClass('textError').addClass('textInfo');
                        }
                        $uResponse.html(response.msg);
                    } else {
                        $("#u_Profile").modal('hide');
                        showComments(pagePath);
                    }
                },
                error: function () {
                    hidePreload();
                }
            });
        } else {
            $('#u_response').html(i18n.getLocalization('pwd.repeat')).show();
        }
        return false;
    }

    /**
     * @description Log off user
     * @returns {boolean} - Always return FALSE
     */
    function loggOffUser() {
        $('comments').focus();
        // process form
        var dataString = "&logOff=true&productName=" + productName + "&productVersion=" + productVersion;
        var processLogin = conf.htpath + "resources/php/checkUser.php";
        $.ajax({
            type: "POST",
            url: processLogin,
            data: dataString,
            success: function () {
                isModerator = false;
                showComments(pagePath);
                $("#approveAll").hide();
            }
        });
        resetData();
        return false;
    }

    /**
     * @description Show preload in right pane (#comments bar)
     * @param text
     */
    function showPreload(text) {
        var $lPlsWait = $('#l_plsWait');
        if (text) {
            lastPreloadMessage = $lPlsWait.html();
            $lPlsWait.html(text);
        } else {
            $lPlsWait.html(i18n.getLocalization('label.plsWait'));
        }
        $('#cm_count').hide();
        $('#cm_title').hide();
        $('#preload').show();
    }

    /**
     * @description Hide preload from right pane (#comments bar)
     */
    function hidePreload() {
        $('#preload').hide();
        $('#cm_count').show();
        $('#cm_title').show();
        if (lastPreloadMessage) {
            $('#l_plsWait').html(lastPreloadMessage);
        }
    }

    /**
     * @description Evaluate comments container position (full visible / partial visible / invisible)
     */
    function evaluateCmtPos() {
        var p = $("#commentsContainer");
        if (p.length) {
            var offset = p.offset();
            if (offset) {
                if (offset.top < $(document).scrollTop()) {
                    commentsPosition = 2; //full visible
                } else if (offset.top > ($(document).scrollTop() + $(window).height())) {
                    commentsPosition = 0; //invisible
                } else if (offset.top < ($(document).scrollTop() + $(window).height())) {
                    commentsPosition = 1; //partial visible
                }
            }
        }
    }

    /**
     * Inform user about losing data when leave page if an edited comment is not submitted
     */
    top.window.onbeforeunload = function () {
        var $commentText = $('#commentText');
        var text = $commentText.val();
        if (text) {
            if ((text != "") && ($commentText.val() != "<br>") && ($commentText.val() != "<p></p>") && $("#newComment").is(":visible")) {
                return i18n.getLocalization('label.Unsaved');
            } else {
                //return true;
            }
        }
    };

    /**
     * @description Display comments floating top
     */
    function float() {
        evaluateCmtPos();
        var $comments = $('#comments');
        if (commentsPosition == 2) {
            $comments.css('top', $(document).scrollTop() + 'px').css('position', 'absolute');
            $(window).css("margin-top", "100px");
        } else {
            $comments.css('top', lastCmdLocation + 'px').css('position', 'static');
        }
    }

    function initNewComment() {
        var $newComment = $("#newComment");

        if ($newComment.length < 1) {
            debug("nu este nici un #newComment");
            return
        }

        var $commentText = $("#commentText");
        var $commentTitle = $('#commentTitle');

        if ($newComment.length>0 && $newComment.parent().get(0).tagName != "BODY") {
            $newComment.appendTo("body");
        }
        if (showAddNewComment) {
            $commentTitle.html(i18n.getLocalization('newPost'));
            $newComment.show();
        }
        $commentText.cleditor()[0].clear();
        $newComment.hide();
    }

    evaluateCmtPos();
    $(window).scroll(evaluateCmtPos);

    return {
        evaluateCmtPos : evaluateCmtPos,
        hidePreload : hidePreload,
        showPreload : showPreload,
        loggOffUser : loggOffUser,
        updateUserProfile : updateUserProfile,
        sharedWith : sharedWith,
        showLoggInDialog : showLoggInDialog,
        hideApproveDialog : hideApproveDialog,
        approveAllComments : approveAllComments,
        showApproveAllDialog : showApproveAllDialog,
        deleteComment : deleteComment,
        signUp : signUp,
        showNewCommentDialog : showNewCommentDialog,
        closeDialog : closeDialog,
        showProfileChange : showProfileChange,
        showComments : showComments,
        checkConfig : checkConfig,
        recover : recover,
        float : float,
        showLostPwd : showLostPwd
    }

});