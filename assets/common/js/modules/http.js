/**
 * Created by jiuwei.stone on 2015/4/27.
 */
define(function(require) {
    "use strict";
    var dialog = require('cm_plugins/accdialog'),
        errorCode = require('cm_modules/code-map');

    return {
        http: function(url, data, options, uurl) {
            /**
             * @请求url
             * @data 请求参数 json格式
             * @options  {object} 可配置参数
             */
            var myOptions = $.extend({
                "project": "exam",
                "type": "post",
                "timeout": 5000
            }, options || {});

            var dtd = $.Deferred(),
                thisUrl = uurl ? uurl : "/" + myOptions.project + "/api.do?pa=" + url + "&pv=ajax";

            $.ajax({
                url: thisUrl,
                dataType: "json",
                data: data,
                cache: false,
                type: myOptions.type
            })

            .done(function(json) {
                if (json && !json.error) {
                    dtd.resolve(json);
                } else {
                    dtd.reject(json);
                    if (json.error && json.error.code != 111 && !myOptions.ignoreError) {

                        if (typeof myOptions.onReqestError === 'function') {
                            myOptions.onReqestError(json);

                        } else {
                            var reason = json.error.reason || json.error.message,
                                errorInfo = "";

                            if (!reason || reason === "undefined" || reason === "null") {
                                errorInfo = "网络出现异常，请重试！";
                            } else {
                                errorInfo = errorCode[json.error.code] || reason;
                            }

                            dialog.alert(myOptions.eMessage || errorInfo, {
                                title: '369会计教育',
                                liveTime: 0,
                                buttons: [{
                                    id: 'back',
                                    value: '确认',
                                    callback: function(box) {
                                        box.removeSelf();

                                        if (typeof myOptions.eCallback == 'function') {
                                            myOptions.eCallback(json.error);
                                        } else if (myOptions.eUrl) {
                                            window.location.href = myOptions.eUrl;
                                        }
                                    }
                                }]
                            });
                        }
                    }

                    return false;
                }
            })

            .fail(function(json) {
                dialog.alert('网络不给力......', {
                    title: '369会计教育'
                });

                dtd.reject(json);
            });
            return dtd.promise();
        }
    };
});
