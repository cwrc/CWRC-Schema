define(["jquery", "whf_config", "localization", "comments-admin"],
    function ($, whf_config, i18n, utils) {

        var productName = whf_config.productName;
        var productVersion = whf_config.productVersion;


        $(document).ready(function () {
            utils.showAdminPage();

            $('#l_cancelVer').html(i18n.getLocalization('label.close'));
            $('#l_cancelMsg').html(i18n.getLocalization('label.cancel'));

            $('#l_cancelEdit').html(i18n.getLocalization('label.cancel'));
            $('#checkAll').html(i18n.getLocalization('label.invertSel'));

            $('#ll_remember').html(i18n.getLocalization('label.rememberme'));

            $('#logIn').html(i18n.getLocalization('label.login'));

            $('#bt_confirmUserEdit').html(i18n.getLocalization('label.updateUser'));
            $('#l_cancelEditU').html(i18n.getLocalization('label.cancel'));

            if ($("html").attr("dir") != "rtl") {
                $('#cm_title').append(productName + "&nbsp;" + productVersion + "&nbsp; - &nbsp;" + i18n.getLocalization('label.admin.title'));
            } else {
                $('#cm_title').append(i18n.getLocalization('label.admin.title') + "&nbsp; - &nbsp;" + productVersion + "&nbsp;" + productName);
            }
            $('#bt_logOff').attr("value", i18n.getLocalization('label.logOff'));
            $('#bt_logIn').attr("value", i18n.getLocalization('label.login'));
            $('#l_Search').append(i18n.getLocalization('label.search.user'));
            $('#l_plsWait').html(i18n.getLocalization('label.plsWait'));
            $('#ll_pswd').html(i18n.getLocalization('label.pswd'));
            $('#ll_editUser').append(i18n.getLocalization('label.editUser'));
            $('#bt_lostPwd').append(i18n.getLocalization('label.lostPswd'));
            $('#bt_signUp').attr("value", i18n.getLocalization('label.signUp'));
            $('#ll_level').append(i18n.getLocalization('admin.level.label'));
            $('#ll_name').append(i18n.getLocalization('admin.name.label'));
            $('#leveluser').html(i18n.getLocalization('label.user'));
            $('#levelmoderator').html(i18n.getLocalization('label.moderator'));
            $('#ll_company').append(i18n.getLocalization('admin.company.label'));
            $('#ll_email').append(i18n.getLocalization('admin.email.label'));
            $('#ll_date').append(i18n.getLocalization('admin.date.label'));
            $('#ll_wh_notify').append(i18n.getLocalization('admin.notifyAll.label'));
            $('#ll_r_notify').append(i18n.getLocalization('admin.notifyReply.label'));
            $('#ll_p_notify').append(i18n.getLocalization('admin.notifyPage.label'));
            $('#ll_status').append(i18n.getLocalization('admin.status.label'));
            $('#statuscreated').html(i18n.getLocalization('label.created'));
            $('#statusvalidated').html(i18n.getLocalization('label.validated'));
            $('#statussuspended').html(i18n.getLocalization('label.suspendend'));
            $('#leveladmin').html(i18n.getLocalization('label.admin'));
            $('#ll_login').append(i18n.getLocalization('label.login'));
            $('#ll_username').append(i18n.getLocalization('admin.userName.label'));
            $('#bt_setVersion').html(i18n.getLocalization('label.setVersion')).attr("title", i18n.getLocalization('label.setVersionTooltip'));
            $('#bt_export').html(i18n.getLocalization('label.export')).attr("title", i18n.getLocalization('label.exportTooltip'));
            $('#ll_setVersion').html(i18n.getLocalization('label.version'));
            $('#setVersionInfo').html(i18n.getLocalization('label.versionInfo'));
            $('#bt_do_export').html(i18n.getLocalization('label.confirmGo'));
            $('#bt_viewPosts').html(i18n.getLocalization('label.viewAllPosts')).attr("title", i18n.getLocalization('label.viewAllPostsTooltip'));
            $('#ll_viewAll_tit').html(i18n.getLocalization('label.allPosts'));
            $('#bt_deleteCmts').html(i18n.getLocalization('delete'));
            $('#cleanDbBtn').html(i18n.getLocalization('label.cleanComments')).attr("title", i18n.getLocalization('label.cleanCommentsTooltip'));
            $('#bt_cleanCmts').html(i18n.getLocalization('label.cleanComments'));
            $('#cleanDbUsrBtn').html(i18n.getLocalization('label.cleanUsers')).attr("title", i18n.getLocalization('label.cleanUsersTooltip'));
            $('#bt_cleanUsr').html(i18n.getLocalization('label.cleanUsers'));

            $("#bt_cleanUsr").on("click", function () {
                utils.cleanDeleteUsr();
            });

            $("#bt_deleteCmts").on("click", function () {
                utils.deleteCmts();
            });

            $("#bt_cleanCmts").on("click", function () {
                utils.cleanDeleteCmts();
            });

            $("#editUser form").on("submit", function (ev) {
                ev.preventDefault();
                return utils.persistEdit();
            });

            $("#loginData form").on("submit", function (ev) {
                ev.preventDefault();
                return utils.logInAdmin();
            });
        });
    });