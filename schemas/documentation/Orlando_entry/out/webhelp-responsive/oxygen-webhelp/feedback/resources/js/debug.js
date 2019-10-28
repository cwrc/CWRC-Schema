/**
 * Created by bogdan_cercelaru on 8/10/2018.
 */
define(function(){
    /**
     * @description info function used for display messages in INFO mode
     */
    if (typeof info !== 'function') {
        function info(msg, obj) {
            if (top !== self) {
                if (typeof parent.info !== 'function') {
                    //
                } else {
                    parent.info("[" + src + ']' + msg, obj);
                }
            } else {
                // local log
            }
        }
    }

    /**
     * @description warn function used for display messages in WARN mode
     */
    if (typeof warn !== 'function') {
        function warn(msg, obj) {
            if (top !== self) {
                if (typeof parent.warn !== 'function') {
                    //
                } else {
                    parent.warn("[" + src + ']' + msg, obj);
                }
            } else {
                // local log
            }
        }
    }

    /**
     * @description error function used for display messages in ERROR mode
     */
    if (typeof error !== 'function') {
        function error(msg, obj) {
            if (top !== self) {
                if (typeof parent.error !== 'function') {
                    //
                } else {
                    parent.error("[" + src + ']' + msg, obj);
                }
            } else {
                // local log
            }
        }
    }

    return function(msg, obj) {
        if (obj !== undefined) {
            console.log(msg, obj);
        } else {
            console.log(msg);
        }
    }
});