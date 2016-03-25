define(function (require) {
    'use strict';

    var CLASS_HAS_JOINED = '你已经加入该班级了',
    	EXERCISE_NO_TIME_TO_REMOVE = '练习还没到发布时间，还不能删除',
    	CART_COUPON_EXPIRED = '对不起，您使用的优惠码已经过期或者还没到启用时间',
    	CART_COUPON_UNAVAILABLE = '对不起，该商品已经不能再使用优惠码',
    	CART_INCORRECT_COUPON = '优惠码不正确',
    	NOT_CLASS_CREATER = '对不起，只有班级创建人才有权限操作',
    	Z = '';

    return {
    	'2423': NOT_CLASS_CREATER,
    	'2430': CLASS_HAS_JOINED,
    	'2436': EXERCISE_NO_TIME_TO_REMOVE,
    	'2446': CART_INCORRECT_COUPON,
    	'2449': CART_COUPON_EXPIRED,
    	'2457': CART_COUPON_UNAVAILABLE,
    	'0000': ''
    };

});