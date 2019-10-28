define(["jquery", "whf_config"],
    function ($, whf_config) {

        var productName = whf_config.productName;
        var productVersion = whf_config.productVersion;

        $(document).ready(function () {
            confirm();
        });

        function loadPageVar(sVar) {
            return unescape(window.location.search.replace(new RegExp(
                "^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&")
                + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        function confirm() {
            var commentId = loadPageVar("c");
            //var action = loadPageVar("act");
            if (commentId != "") {
                $("#preload").show();

                //console.log("c:"+commentId+" ; act="+action);
                $.ajax({
                    type: "POST",
                    url: "./php/moderate.php",
                    data: "id=" + commentId + "&productName=" + productName + "&productVersion=" + productVersion,
                    success: function (data_response) {
                        // display old comments
                        //console.log(data_response);
                        $("#preload").hide();
                        $('#info').show();
                        if (data_response != "") {
                            //console.log(data_response);
                            window.location.href = data_response;
                        } else {
                            $("#info").html("Action not performed !")
                        }
                    },
                    error: function (data_response) {
                        $("#preload").hide();
                        $('#info').show();
                        $('#info').html(data_response);
                    }
                });

            }
        }
    });