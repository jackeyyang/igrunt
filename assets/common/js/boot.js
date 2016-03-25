requirejs.config({
    baseUrl: "/assets/",
    paths:{
        "jquery": "common/js/jquery-1.11.1",
        "cm_modules": "common/js/modules",
        "cm_plugins": "common/js/plugins",
        "exam": "exam/js",
        /*以下不支持AMD*/
        "jqlayer": "common/js/plugins/layer/layer.min"
    },
    map:{
        '*': {
            'css': 'common/js/css'
        }
    },
    shim: {
        "jqlayer": {
            deps: ["jquery","css!common/js/plugins/layer/skin/layer.css"],
            exports: "layer"
        }
    }
});
