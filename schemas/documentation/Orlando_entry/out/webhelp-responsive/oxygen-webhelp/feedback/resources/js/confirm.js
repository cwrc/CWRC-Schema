define(["jquery", "whf_config", "localization"],
    function ($, whf_config, i18n) {

        var productName = whf_config.productName;
        var productVersion = whf_config.productVersion;

        function loadPageVar(sVar) {
            return unescape(window.location.search.replace(new RegExp(
                "^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&")
                + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }
        function redirect() {
            var cookie = getCookie("page");
            if (cookie == null || cookie == "") {
                var loc = window.location.pathname.split('/');
                var basePath = "/";
                for (var i = (loc.length - 4); i > 0; i--) {
                    basePath = '/' + loc[i] + basePath;
                }
                var baseUrl = window.location.protocol + '//' + window.location.host + basePath;
                window.location.href = baseUrl;
            } else {
                var pageSignUp = encodeURI(getCookie("page"));
                window.location.href = pageSignUp;
            }
            return false;
        }
        function confirm() {
            var id = loadPageVar("id");
            console.log('id: ', id);
            if (id != "") {
                $("#preload").show();
                $.ajax({
                    type: "POST",
                    url: "./php/confirmUser.php",
                    data: "id=" + id + "&productName=" + productName + "&productVersion=" + productVersion,
                    success: function (data_response) {
                        console.log('data_response: ', data_response);
                        try {
                            var response = JSON.parse(data_response);

                            $("#preload").hide();
                            $('#ll_remember').html(response.msg);
                            $("#newPassword").show();
                        } catch (e) {
                            $('#info').html("Error while parsing the result.").show();
                        }
                    },
                    error: function (data_response) {
                        $("#preload").hide();
                        $('#info').html(data_response).show();
                    }
                });

            }
        }
        function getCookie(c_name) {
            var i, x, y, cookies = document.cookie.split(";");
            var toReturn = "";
            for (i = 0; i < cookies.length; i++) {
                x = cookies[i].substr(0, cookies[i].indexOf("="));
                y = cookies[i].substr(cookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    toReturn = unescape(y);
                }
            }
            return toReturn;
        }

        $(document).ready(function () {
            confirm();

            $('#ll_remember').html(i18n.getLocalization('recoveryConfirmation'));
            $('#l_bt_redirec_log').attr('value', i18n.getLocalization('label.confirmGo'));

            $('#newPassword form').on('submit', function(ev){
                ev.preventDefault();
                return redirect();
            })
        });

    });