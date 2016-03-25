/**
* @fileoverview 弹层组件
*/

define(function (require) {
    'use strict';
    var PREFIX = 'acc-dialog';

    var isIE6 = /MSIE 6/i.test(navigator.userAgent);

    var $$ = function() {
        var selector = arguments[0];

        if(typeof selector === 'string') {
            arguments[0] = '.'+PREFIX+'-'+selector;
        }

        return $.apply($, arguments);
    };

    var tpl = {
        parseStr: function(str, cfg) {
            var re = /({%([\w]+?)%})/g;

            return str.replace(re, function() {
                var val = cfg[arguments[2]];

                if(typeof val === 'undefined') {
                    val = '';
                }
                return val.toString();
            });
        },

        //加个table兼容IE7，容器宽度适应的问题
        frame:
        '<div id="{%id%}" class="{%prefix%}-layer {%type%}">\
            <div class="{%prefix%}-wrapper">\
                <table><tr><td>\
                {%header%}\
                {%close_icon%}\
                <div class="{%prefix%}-content">{%content%}</div>\
                {%buttons%}\
                {%arrow%}\
                </td></tr></table>\
            </div>\
        </div>',

        header:
        '<h4 class="{%prefix%}-header">\
            <span class="{%prefix%}-title">{%title%}</span>\
        </h4>',

        closeIcon:
        '<i class="{%prefix%}-icon-x"></i>',

        buttons:
        '<div class="{%prefix%}-buttons">{%button_list%}</div>',
        buttonItem:
        '<a href="{%link%}" {%target%} class="{%prefix%}-btn-item {%classname%}" rel="{%btn_type%}"><i>{%btn_name%}</i></a>',

        arrow:
        '<i class="{%prefix%}-arrow {%dir%}"></i>',

        mask:
        '<div class="{%prefix%}-mask"></div>',

        fixLayer:
        '<iframe class="{%prefix%}-iframe" src="about:blank"></ifarme>'
    };

    /**
    * 用来管理各种盒子
    */
    var base = (function() {

        $(window)
        .on('accdialog_hide', function() {
            base.checkMask();
        })
        .on('accdialog_show', function(e, data) {
            if(data.box.__withMask) {
                base.showMask();
            }
        })
        .on('resize', function() {
            base.setPosition();
        });

        return {
            uid: 0,
            cache: {},

            /**
            * 删除指定弹层相关DOM
            */
            removeBox: function(uid) {
                var box = base.cache[uid];

                if(box) {
                    box.__liveTimeout && clearTimeout(box.__liveTimeout);

                    base.cache[uid] = null;
                    delete base.cache[uid];

                    base.checkMask();

                    box.trigger('box_remove');

                    box.remove();
                    box = null;

                }
            },

            setPosition: function() {
                $.each(base.cache, function(i, box) {
                    box.setPosition();
                });
            },

            checkMask: function() {
                var remove_mask = true;

                for(var i in base.cache) {

                    //判断是否可见
                    if(base.cache[i][0].offsetWidth) {
                        remove_mask = false;
                        break;
                    }
                }

                remove_mask && base.removeMask();
            },

            /**
            * 删除所有弹层, type不传为删除全部
            */
            removeAll: function(type) {
                $.each(this.cache, function(i, box) {
                    if(box.settings.alone !== 0 && (typeof type === 'undefined' || box.type == type)) {
                        box.removeSelf();
                    }
                });

                $(window).trigger('all_accdialog_removed', type);
            },

            /**
            * 蒙层控制
            */
            showMask: function() {
                if(!$$('mask').length) {

                    var mask = tpl.parseStr(tpl.mask,{prefix:PREFIX}),
                        iframe = tpl.parseStr(tpl.fixLayer,{prefix:PREFIX});

                    $(mask).css({
                        width: $(document).width(),
                        height: $(document).height()
                    }).appendTo(document.body);

                    isIE6 && $(iframe).css({
                        width: $(document).width(),
                        height: $(document).height()
                    }).appendTo(document.body);
                }
            },
            removeMask: function() {
                $$('mask').remove();
                isIE6 && $$('iframe').remove();
            }
        };
    })();

    /**
    * 暴露各种盒子的方法
    */
    var boxProto = {
        removeSelf: function() {
            base.removeBox(this.uid);
        },

        setPosition: function(settings, notAdjust) {
            settings = settings || this.settings;

            var box = base.cache[this.uid];

            if(box.outerWidth() < core.minWidth) {
                $('table',box).width(core.minWidth);
            }

            if(settings.reTarget) {
                var SPACE = settings.arrowSpace || 0;

                var target = $(settings.reTarget);

                if(!target.length) {
                    return this.setPosition();
                }

                var arrow = $$('arrow', box),
                    boxArrowSize = [0,0];

                if(arrow.length) {
                    boxArrowSize = [arrow.width(),arrow.height()];
                }

                if(typeof settings.arrowPos == 'undefined') {
                    settings.arrowPos = .5;
                }
                if(typeof settings.rePos == 'undefined') {
                    settings.rePos = .5;
                }

                var target_offset = target.offset();

                switch(settings.dir) {
                    case 'left': {
                        if(settings.autoAdjust && !notAdjust) {
                            if(target_offset.left - box.outerWidth() - boxArrowSize[0] - SPACE < 0) {
                                settings.dir = 'right';

                                arrow.removeClass(PREFIX+'-arrow-left').addClass(PREFIX+'-arrow-right');

                                return box.setPosition(settings, true);
                            }
                        }

                        arrow.css({
                            left: box.width()-2,
                            top: box.height()*settings.arrowPos - boxArrowSize[1]/2
                        }).removeClass(PREFIX+'-arrow-right').addClass(PREFIX+'-arrow-left');

                        box.css({
                            left: target_offset.left - box.outerWidth() - boxArrowSize[0] - SPACE,
                            top: target_offset.top + target.outerHeight()*settings.rePos - box.outerHeight()*settings.arrowPos
                        });

                        break;
                    }
                    case 'right': {
                        if(settings.autoAdjust && !notAdjust) {
                            if(target_offset.left + target.outerWidth() + boxArrowSize[0] + SPACE + box.outerWidth() > $(document).width()) {
                                settings.dir = 'left';

                                arrow.removeClass(PREFIX+'-arrow-right').addClass(PREFIX+'-arrow-left');

                                return box.setPosition(settings, true);
                            }
                        }

                        arrow.css({
                            left: -boxArrowSize[0],
                            top: box.height()*settings.arrowPos - boxArrowSize[1]/2
                        }).removeClass(PREFIX+'-arrow-left').addClass(PREFIX+'-arrow-right');

                        box.css({
                            left: target_offset.left + target.outerWidth() + boxArrowSize[0] + SPACE,
                            top: target_offset.top + target.outerHeight()*settings.rePos - box.outerHeight()*settings.arrowPos
                        });

                        break;
                    }
                    case 'up': {
                        if(settings.autoAdjust && !notAdjust) {
                            if(target_offset.top - box.outerHeight() - boxArrowSize[1] - SPACE < 0) {
                                settings.dir = 'down';

                                arrow.removeClass(PREFIX+'-arrow-up').addClass(PREFIX+'-arrow-down');

                                return box.setPosition(settings, true);
                            }
                        }

                        arrow.css({
                            left: box.width()*settings.arrowPos - boxArrowSize[0]/2,
                            top: box.height()-2
                        }).removeClass(PREFIX+'-arrow-down').addClass(PREFIX+'-arrow-up');

                        box.css({
                            left: target_offset.left + target.outerWidth()*settings.rePos - box.outerWidth()*settings.arrowPos,
                            top: target_offset.top - box.outerHeight() - boxArrowSize[1] - SPACE
                        });

                        break;
                    }
                    case 'down': {
                        if(settings.autoAdjust && !notAdjust) {
                            if(target_offset.top + target.outerHeight() + boxArrowSize[1] + SPACE + box.outerHeight() > $(document).height()) {
                                settings.dir = 'up';

                                arrow.removeClass(PREFIX+'-arrow-down').addClass(PREFIX+'-arrow-up');

                                return box.setPosition(settings, true);
                            }
                        }

                        arrow.css({
                            left: box.width()*settings.arrowPos - boxArrowSize[0]/2,
                            top: -boxArrowSize[1]
                        }).removeClass(PREFIX+'-arrow-up').addClass(PREFIX+'-arrow-down');

                        box.css({
                            left: target_offset.left + target.outerWidth()*settings.rePos - box.outerWidth()*settings.arrowPos,
                            top: target_offset.top + target.outerHeight() + boxArrowSize[1] + SPACE
                        });
                        break;
                    }

                    case 'center': {
                        arrow.hide();

                        box.css({
                            left: target_offset.left + target.outerWidth()/2 - box.outerWidth()/2,
                            top: target_offset.top + target.outerHeight()/2 - box.outerHeight()/2
                        });

                        break;
                    }


                }

            }else {
                var top, left;

                if(settings.position) {
                    top = settings.position.y;
                    left = settings.position.x;
                }

                top = isNaN(top) ? ($(window).height()-box.outerHeight())/2 : top;
                left = isNaN(left) ? ($(window).width()-box.outerWidth())/2 : left;

                box.css({
                    position: (settings.fixed && !isIE6) ? 'fixed':'absolute',
                    top: top,
                    left: left
                });
            }

            return this;
        },
        setContent: function(str) {
            var box = base.cache[this.uid];

            if(box) {
                $$('content', box).html(str);
            }

            return this;
        }
    };

    var core = {
        /**
        * 弹窗最小宽度
        */
        minWidth: 350,
        /**
        * 弹窗创建方法
        * @return {jQuery Element Object}
        * @param {String} type 类型
        * @param {Object} settings 配置
        *
        *   基本配置
        *   settings.content {String} 弹层的内容
        *   settings.title {String} 弹层的标题
        *   settings.fixed {Boolean} 弹层的position是否是fixed
        *   settings.hasX {Boolean} 弹层是否有关闭的叉
        *   settings.noMask {Boolean} 是否不需要后面的蒙层
        *   settings.liveTime {Number} 弹层多长时间后自动消失，默认0为不自动消失
        *   settings.width {Number} 弹层宽度
        *   settings.minWidth {Number} 弹层最小宽度
        *   settings.position {Object} 指定弹层绝对位置，例如｛x:0,y:0｝
        *   settings.alone {Number} 弹层显示时，是否需要移除其他弹层
        *       说明 2:同类弹层互斥，1:与所有弹层互斥，0:不互斥。默认值为1.
        *   settings.buttons {Array} 弹层的按钮列表，长度为0时不显示
        *       说明 配置内置按钮：['ok','cancel']
        *            配置自定义按钮：[{id:'btnid',value:'点我',callback:function(box){console.log('呵呵')}}]
        *            混合配置：['ok',{id:'btnid',value:'点我',callback:function(box){console.log('呵呵')}}]
        *            重置内置按钮：[{id:'ok',value:'接受',style:'lightgray'},{id:'cancel',value:'不接受',callback:function(){console.log('呵呵')}}]
        *            纯链接：[{id:'link-xx',value:'点我',link:'http://g.cn', target:'_blank'}]
        *
        *   相对位置与箭头配置
        *   settings.reTarget {HTML Element|JQ Element Object} 弹层定位的参考元素对象
        *   settings.dir {String} 弹层相对reTarget的方向 取值:left right up down center
        *   settings.arrowPos {Number} 指定弹层箭头的偏移位置，取值区间[0,1]，例如中间就为0.5，超出取值范围不显示箭头
        *   settings.rePos {Number} 指定弹层相对reTarget的偏移位置，取值区间[0,1]，例如中间就为0.5
        *   settings.autoAdjust {Boolean} 位置不够显示时是否自动调整方向
        *   settings.arrowSpace {Number} 箭头与reTarget的间隔
        *
        *   事件配置
        *   settings.okCallback {Function} 弹层点了OK按钮后的回调
        *   settings.cancelCallback {Function} 弹层点了cancel按钮后的回调
        *   settings.xCallback {Function} 弹层点了x后的回调
        *   settings.closedCallback {Function} 弹层消失后的回调
        */
        create: function(type, settings) {
            var header = '',close_icon = '',buttons = '',arrow = '',mask = '';

            core.minWidth = settings.minWidth || core.minWidth;

            //标题模板
            if(settings.title) {
                header = tpl.parseStr(tpl.header, {
                    title:settings.title,
                    prefix: PREFIX
                });
            }

            //XX模板
            if(settings.hasX) {
                close_icon = tpl.parseStr(tpl.closeIcon, {
                    prefix: PREFIX
                });
            }

            //箭头模板
            if(settings.dir) {
                settings.arrowPos = isNaN(settings.arrowPos) ? 0.5 : settings.arrowPos;

                if(settings.arrowPos>=0 && settings.arrowPos<=1) {
                    arrow = tpl.parseStr(tpl.arrow, {
                        dir: PREFIX+'-arrow-'+settings.dir,
                        prefix: PREFIX
                    });
                }else {
                    settings.arrowPos = 0;
                }
            }

            //按钮生成
            if(settings.buttons && settings.buttons.length) {
                buttons = this.createButtonsTpl(settings.buttons);
            }


            //整体模板
            var html = tpl.parseStr(tpl.frame, {
                id: PREFIX+'-box-'+ base.uid++,
                type: PREFIX+'-layer-'+type,
                header: header,
                close_icon: close_icon,
                content: settings.content,
                buttons: buttons,
                arrow: arrow,
                prefix: PREFIX
            });

            //判断互斥
            if(typeof settings.alone == 'undefined') {
                settings.alone = 1;
            }

            if(settings.alone === 1) {
                base.removeAll();
            }else if(settings.alone === 2) {
                base.removeAll(type);
            }

            //加入到页面，放到cache中，暴露一些方法
            var box = $(html).appendTo(document.body);
            $('table',box).width(settings.width || 'auto');
            box.uid = base.uid;
            box.type = type;
            box.settings = settings;

            base.cache[box.uid] = $.extend(box, boxProto);

            //有X没标题的时候，移出一点空间
            if(settings.hasX && !settings.title && !settings.noXSpace) {
                $$('content', box).css('paddingRight', '20px');
            }

            //蒙层控制
            if(!settings.noMask) {
                base.showMask();
                box.__withMask = true;
            }

            //持续时间控制
            var _this = this;

            if(settings.liveTime) {
                box.__liveTimeout && clearTimeout(box.__liveTimeout);

                box.__liveTimeout = setTimeout(function(){
                    base.removeBox(box.uid);
                }, settings.liveTime);
            }

            //事件初始化
            this.eventInit(box, settings);

            //如果是异步加载数据
            if(settings.ajaxUrl) {
                box.setContent('<p class="'+PREFIX+'-loading">数据加载中...</p>');

                $.ajax({
                    url: settings.ajaxUrl,
                    dataType: 'json',
                    data: settings.ajaxParams || {}
                }).done(settings.ajaxCallback);
            }

            //各种定位
            box.setPosition(settings);

            return box;
        },

        /**
        * 各种事件监听
        */
        eventInit: function(box, settings) {
            $$('buttons', box).on('click','.'+PREFIX+'-btn-item', function(e) {
                var type = $(this).attr('rel');
                box.trigger(type+'_onclick');

                e.preventDefault();
            });

            if(settings.buttons && settings.buttons.length) {
                $.each(settings.buttons, function(i, data) {
                    if(data.callback) {
                        box.bind(data.id+'_onclick', function() {
                            data.callback.call(box, box);
                        });
                    }
                });
            }

            $$('icon-x', box).bind('click', function() {
                if(typeof settings.xCallback == 'function') {
                    settings.xCallback.call(box, box);
                }else {
                    base.removeBox(box.uid);
                }

                box.trigger('x_onclick', $.proxy(settings.okCallback, box));
            });

            if(typeof settings.okCallback == 'function') {
                box.bind('ok_onclick', $.proxy(settings.okCallback, box));
            }else {
                box.bind('ok_onclick', function() {
                    base.removeBox(box.uid);
                });
            }

            if(typeof settings.cancelCallback == 'function') {
                box.bind('cancel_onclick', $.proxy(settings.cancelCallback, box));
            }else {
                box.bind('cancel_onclick', function() {
                    base.removeBox(box.uid);
                });
            }

            if(typeof settings.closedCallback == 'function') {
                box.bind('box_remove', $.proxy(settings.closedCallback, box));
            }
        },

        createButtonsTpl: function(list) {
            var html = '';

            for(var i=0,l=list.length;i<l;i++) {
                switch(list[i]) {
                    case 'ok': {
                        html += tpl.parseStr(tpl.buttonItem, {
                            btn_name: '确定',
                            btn_type: 'ok',
                            prefix: PREFIX
                        });
                        break;
                    }
                    case 'cancel': {
                        html += tpl.parseStr(tpl.buttonItem, {
                            btn_name: '取消',
                            btn_type: 'cancel',
                            prefix: PREFIX
                        });
                        break;
                    }

                    default: {
                        if(typeof list[i] == 'object') {
                            var data = list[i];

                            html += tpl.parseStr(tpl.buttonItem, {
                                btn_type: data.id,
                                btn_name: data.value,
                                classname: data.style,
                                link: data.link,
                                target: 'target='+data.target,
                                prefix: PREFIX
                            });
                        }
                    }
                }

            }

            return tpl.parseStr(tpl.buttons,{
                button_list: html,
                prefix: PREFIX
            });

        }

    };

    return {
        alert: function(str,settings) {

            var box = core.create('alert', $.extend({
                content: str,
                fixed: true,
                liveTime: 3000,
                arrowPos: -1
            },settings||{}));

            return box;
        },

        confirm: function(str,settings) {
            var box = core.create('confirm', $.extend({
                content: str,
                buttons: ['ok',{id:'cancel',style:PREFIX+'-btn-orange',value:'取消'}]
            },settings||{}));

            return box;
        },

        notice: function(str,settings) {
            var box = core.create('notice', $.extend({
                content: str,
                liveTime: 3000,
                reTarget: document.body,
                dir: 'center',
                noMask: true
            },settings||{}));

            return box;
        },

        dialog: function(url,settings) {
            var box = core.create('dialog', $.extend({
                ajaxUrl: url,
                ajaxCallback: function(data) {

                    if(data && data.error && data.reason) {
                        box.setContent('<p class="'+PREFIX+'-noresult">'+data.reason+'</p>');

                    }else if(typeof settings.contentAdapter === 'function') {
                        box.setContent(settings.contentAdapter(data));

                    }else if(data) {
                        box.setContent(data);

                    }else {
                        box.setContent('<p class="'+PREFIX+'-noresult">暂无内容</p>');
                    }

                    box.setPosition(settings);
                },
                hasX: true
            },settings||{}));

            return box;
        },
        customBox: function(type, settings) {
            return core.create(type, settings);
        }
    };

});
