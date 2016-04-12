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

    //iLayer();

    //var a = {
    //    x: 10,
    //    calculate: function (z) {
    //        return this.x + this.y + z
    //    }
    //};
    //var b = {
    //    y: 20,
    //    __proto__: a
    //};
    //
    //var c = {
    //    y: 30,
    //    __proto__: a
    //};
    //
    //
    //console.log(b.x);

    //function func(){
    //    this.x = 1;
    //}
    //
    //var b = new func();
    //
    //console.log(typeof b);
    //function a(){
    //
    //}
    //
    //alert(typeof a.prototype); // object
    //alert(typeof a.__proto__); // function

    //function x(){
    //    var c = 4;
    //    this.z = 7;
    //    this.y = 10;
    //    this.getName = function(){
    //        console.log("this.getName");
    //    }
    //}
    //
    //x.prototype.y = 11;
    //
    //x.prototype.getName = function(){
    //    console.log("x.prototype.getName");
    //};
    //x.getName = function(){
    //    console.log("x.getName");
    //};
    //
    //var d = new x();
    //var g =  new x();
    //
    //console.log(d.z); // 7
    //console.log(g.z); // 7
    //
    //console.log(g.y); // 10
    //console.log(g.getName());
    //
    //console.log(x.prototype.z); // undefined
    //console.log(x.getName.__proto__); // Function.prototype
    //
    //console.log(d.constructor);
    //console.log(x.prototype.constructor);

    /**/


   // var name = "The Window";
   //
   //  var object = {
   //     name : "My Object",
   //
   //     getNameFunc : function(){
   //             return function(){
   //                     return this.name;
   //             };
   //         }
   // };
   //
   //alert(object.getNameFunc()());

    function sfer(){
        var li=document.getElementsByTagName("li");
        for(var i = 0; i<li.length; i++){
            li[i].onclick = function(){
                    alert(i);
            };
        }
    }
    sfer();



});

/*
*对像
*->原型（[[Prototype]].property）
* */

/*
* 原型
* ->原型
* */