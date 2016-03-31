'use strict';

module.exports = function (grunt) {

    var config, myConfig;
    config = require('./config.json');
    myConfig = require('./myconfig.json');

    //  防止找不到个人配置文件
    try {
        myConfig = require('./myconfig.json');
    }catch(err) {
        myConfig = {};
    }

    //  配置文件和个人配置合并
    for(var key in myConfig) {
        config[key] = myConfig[key];
    }

    //  项目名 前后有依赖关系，逗号分隔多个项目
    var APP_NAME = config.app || 'common',
    //  兼容多个项目和单个项目的匹配字符
        APP_NAME_STR = '{'+APP_NAME+', __}';


    //  开发环境静态文件目录
    var DEV_ASSET_DIR = 'assets/',
        TEM_CSS_DIR = 'sass_dist/',
        DIST_ASSET_DIR = 'dist/',
    //  rjs打包输出目录，中间产物
        REQUIRE_BUILT_DIR = 'require_built/',
        TEM_TMOD_DIR = 'tmod_temp/',
        TMOD_DIR = 'tmod/';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    // 设置端口号
                    port: 8000,
                    hostname: 'localhost',
                    livereload: true
                }
            }
        },

        //Sass任务
        sass: {
            dev: {
                //Sass开发选项
                options: {
                    style: 'expanded',
                    sourcemap: 'none'// 不生成.map
                },
                files: [{
                    expand: true,
                    cwd: DEV_ASSET_DIR,
                    src: [APP_NAME_STR+'/sass/**/*.scss'],
                    dest: TEM_CSS_DIR,
                    ext: '.css'
                }]
            },
            //Sass发布选择
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'// 不生成.map
                },
                files: [{
                    expand: true,
                    cwd: DEV_ASSET_DIR,
                    src: [APP_NAME_STR+'/sass/**/*.scss'],
                    dest: TEM_CSS_DIR,
                    ext: '.css'
                }]
            }
        },

        //  复制操作
        copy: {
            // 复制css
            sassToCss: {
                expand: true,
                cwd: TEM_CSS_DIR, //指向的目录是相对的,全称Change Working Directory更改工作目录
                src: '**/*.css', //指向源文件，**是一个通配符，用来匹配Grunt任何文件
                dest: TEM_CSS_DIR, //用来输出结果任务
                options: {
                    process: function(content, srcpath) {
                        grunt.file.write(srcpath.replace('/sass/','/css/').replace(TEM_CSS_DIR,DEV_ASSET_DIR), content);
                        return false;
                    }
                }
            },
            outputCss: {
                expand: true,
                cwd: TEM_CSS_DIR,
                src: '**/*.css',
                dest: DIST_ASSET_DIR,
                options: {
                    process: function(content, srcpath) {
                        grunt.file.write(srcpath.replace('/sass/','/css/').replace(TEM_CSS_DIR,DIST_ASSET_DIR), content);
                        return false;
                    }
                }
            },
            tmodToJs: {
                expand: true,
                cwd: TEM_TMOD_DIR,
                src: '**/*.js',
                dest: TEM_TMOD_DIR,
                options: {
                    process: function(content, srcpath) {
                        var tpath = srcpath.replace(TEM_TMOD_DIR, DEV_ASSET_DIR).replace(/\/tmod\/([^\/].*?)\//, '/$1/tpl/');
                        grunt.file.write(tpath, content);
                        return false;
                    }
                }
            },
            template: {
                src: DEV_ASSET_DIR + 'template.js',
                dest: REQUIRE_BUILT_DIR + 'template.js'
            }
        },

        //  清除文件
        clean: {
            options: {
                force: true
            },
            sass: [TEM_CSS_DIR]
        },

        tmod: {
            dev: {
                src: TMOD_DIR + '**/*.tpl',
                dest: TEM_TMOD_DIR,
                options: {
                    base: 'tmod/',
                    combo: false,
                    runtime: "template.js"
                }
            }
        },

        // 通过watch实时监听代码变化
        watch: {
            sass: {
                files: [DEV_ASSET_DIR+APP_NAME_STR+'/**/*.scss'],
                tasks: ['sass:dev', 'copy:sassToCss', 'clean:sass'],
                options: {
                    livereload: true
                }
            },
            html: {
                //监听的文件
                files: ['pages/'+APP_NAME_STR+'/v/*.html'],
                options: {
                    livereload: true
                }
            },
            css: {
                files: [DEV_ASSET_DIR+APP_NAME_STR+'/**/*.css'],
                options: {
                    livereload: true
                }
            }

        }
    });

    // 加载插件
    require('load-grunt-tasks')(grunt);

    //创建默认任务
    grunt.registerTask('default', [
        'connect',
        'sass:dev',// 编译Sass开发设置
        'copy:sassToCss', // copy sass_dis内容到css文件夹
        'clean:sass',// 删除临时由sass生成的sass_dis
        'tmod','copy:tmodToJs','copy:template',
        'watch'//
    ]);

    //创建默认任务
    grunt.registerTask('dist', [
        'connect',
        'sass:dist',// 编译Sass开发设置
        'copy:outputCss', // copy sass_dis内容到css文件夹
        'clean:sass'// 删除临时由sass生成的sass_dis
    ]);
};
