/*

 Oxygen WebHelp Plugin
 Copyright (c) 1998-2019 Syncro Soft SRL, Romania.  All rights reserved.

 */

define(["jquery", "comments-functions", "debug", "init"], function ($, utils, debug, init) {


    $(document).ready(function(){
        if (utils.checkConfig()) {
            utils.showComments(init.pagePath);
        }

        $('#link_lostPwd').on('click', utils.showLostPwd);

        $(".bt_close").on("click", utils.closeDialog);
        $(".bt_cancel").on("click", function (ev) {
            $(".bt_close").trigger(ev);
        });

        $("#l_addNewCmt").on("click", utils.showNewCommentDialog);
        $("#recoverPwd").find("form").on("submit", utils.recover);
        $("#bt_yesDelete").on("click", utils.deleteComment);
        //$("#bt_approveAll").on("click", utils.showApproveAllDialog());
        $("#bt_yesApprove").on("click", utils.approveAllComments);
        $("#bt_noApprove").on("click", utils.hideApproveDialog);

        $('#bt_editProfile').on("click", function (e) {
            e.preventDefault();
            utils.showProfileChange(e);
        });

        $("#bt_logIn").on('click', function () {
            $(".anonymous_post_cmt").remove();
            $('#loginData').off('shown.bs.modal');
            $('#loginResponse').html('');
            utils.showLoggInDialog();
        });

        $("#bt_signUp").on("click", function () {
            var $loginData = $('#loginData');
            $loginData.off('shown.bs.modal');
            // show signup form
            $("#signUpResponse").html('');
            $loginData.modal('show');
            $loginData.on('shown.bs.modal', function () {
                $('#l_signUp2').trigger('click');
            });

            // get the shared projects
            utils.sharedWith();
        });

        $("#bt_profile").on("click", utils.updateUserProfile);
        $("#bt_logOff").on("click", utils.loggOffUser);

        $(window).on("scroll", function () {
            var $comments = $("#comments");
            try {
                if ((parseInt($("#bt_new").position().top) - parseInt($(window).scrollTop()) < $comments.height()) && $("#l_addNewCmt").is(":visible")) {
                    $comments.addClass('float_comments');
                } else {
                    $comments.removeClass('float_comments');
                }
            } catch (e) {
                debug(e);
            }
        });
    });
});