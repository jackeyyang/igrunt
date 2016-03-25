/**
 * Created by Administrator on 2016/3/25.
 */
define(function (require) {
    'use strict';

    var layer = require('jqlayer');

    var iLayer = function () {
        $.layer({
            shade: [0],
            area: ['auto', 'auto'],
            dialog: {
                msg: '您是如何看待前端开发？',
                btns: 2,
                type: 4,
                btn: ['重要', '奇葩'],
                yes: function () {
                    layer.msg('重要', 1, 1);
                }, no: function () {
                    layer.msg('奇葩', 1, 13);
                }
            }
        });
    };

    iLayer();


});