//test modify
if(typeof HdPortal == 'undefined') {
	var HdPortal = {};
}


(function (HdPortal) {

	var arrPro = Array.prototype;
	if(!arrPro.every) {
		arrPro.every = function (fn) {
			if(typeof fn != 'function') {
				throw fn + ' is not a function';
			}
			for(var i = 0, n = this.length; i < n; i++) {
				if(!fn(this[i], i)) {
					return false;
				}
			}
			return true;
		};
	}
	if(!arrPro.contains) {
		arrPro.contains = function (val) {
			var _this = this;
			if(arguments.length > 1) {
				return arrPro.every.call(arguments, function (val) {
					return _this.contains(val);
				});
			}
			return _this.indexOf(val) !== -1;
		};
	}
	if(!arrPro.remove) {
		arrPro.remove = function (val) {
			var index = this.indexOf(val);
			if(index !== -1) {
				return this.splice(index, 1);
			}
			return null;
		};
	}
	//replace无法正确替换带$符号的字符串，加一个safeReplace方法
	if(!String.prototype.safeReplace) {
		String.prototype.safeReplace = function (search, replacement) {
			if(typeof replacement == 'string') {
				var replaceStr = replacement;
				replacement = function () {
					return replaceStr;
				};
			}
			return this.replace(search, replacement);
		};
	}

	HdPortal.versionURL = '';
	if(document.URL.indexOf('/hp/') != -1) {
		HdPortal.versionURL = '/hp' + HdPortal.versionURL;
	}

	//判断是否系统默认appid， 参照HdProfDef，isDefaultAppid方法
	HdPortal.isDefaultAppId = function (isOem, appid) {
		var appidList = ['wx25367438c8ce0799', 'wx50775cad5d08d7ad'];

		if(HdPortal.m_debug) {
			appidList = ['wx25367438c8ce0799', 'wx41f769366ad460e1'];
		}

		if(isOem) {
			appidList = ['wx7953611d4b208753', 'wx0f863578a9b0ca9c', 'wxd40dde5516fa9024'];
		}

		return Boolean(appid && appidList.contains(appid));
	};

	HdPortal.checkPhone = function(phoneNum){
		// return /^[01][3456789]\d{9}$/.test(phoneNum) || /^([0-9]{3,4}-?)?[0-9]{7,8}$/.test(phoneNum);
		return /^([0-9]{3,4}-?)?[0-9]{5,12}$/.test(phoneNum);
	};

	/*
    把日期转换为时间戳
    */
	HdPortal.getDateForLong = function (time) {
		var date = new Date(time);
		var year = HdPortal.pad(date.getFullYear(), 4);
		var month = HdPortal.pad(date.getMonth(), 2);
		var day = HdPortal.pad(date.getDate(), 2);
		return new Date(year, month, day).getTime();
	};
	HdPortal.getDateString = function (time) {
		var date = new Date(time);
		return HdPortal.pad(date.getFullYear(), 4) + '-' + HdPortal.pad(date.getMonth() + 1, 2) + '-' + HdPortal.pad(date.getDate(), 2);
	};
	HdPortal.getDateStringSecond = function (time) {
		var date = new Date(time);
		return HdPortal.pad(date.getFullYear(), 4) + '-' + HdPortal.pad(date.getMonth() + 1, 2) + '-' + HdPortal.pad(date.getDate(), 2) + ' ' + HdPortal.pad(date.getHours(), 2) + ':' + HdPortal.pad(date.getMinutes(), 2);
	};

	HdPortal.getServerTime = function(){
		var time = Date.now();
		if(typeof g_timeDeviation !== 'undefined'){
			time += g_timeDeviation;
		}
		return time;
	};

	//为对象添加回调机制
	HdPortal.initCallBack = function (target, args) {
		var callBackObj = new hdFai.CallBack();
		target = target || {};
		$.each(callBackObj.getApiKeys(), function (i, key) {
			target[key] = function () {
				var rt = callBackObj[key].apply(callBackObj, arguments);
				return rt === callBackObj ? this : rt;
			};
		});
		if($.type(args) == 'array') {
			callBackObj.register(args);
		}
		return target;
	};

	/*
		互动平台的操作提示框
		optIcon为操作完成显示的图标，有两个参数 right:正确的图标，error：错误的图标
		msg为提示框要显示的文字
		msgWidth:msg的宽度（可选，避免固定宽度后出现 多出一个字就换行 的情况）
    */
	HdPortal.hdShowMsg = function (optIcon, msg, callBack, msgWidth) {
		if(!top) {
			console.log(top);
		}
		if(top !== window) {
			return top.HdPortal.hdShowMsg.apply(this, arguments);
		}
		//对第三个参数类型做判断
		if(arguments.length == 3 && typeof callBack !== "function"){
			msgWidth = parseInt(callBack) + "px";
		}
		if(callBack && typeof callBack == 'function'){
			HdPortal.hdShowMsg.callBack = callBack;
		}
		var html = '';
		html = '<div id="hdShowMsg"></div>';
		if(top.$('#hdShowMsg').length == 0) {
			top.$(html).appendTo('body');
		}

		var hdShowMsg = top.$('#hdShowMsg');

		var bodyTop = top.$('body').scrollTop();
		if(hdFai.isIE() && bodyTop == 0) {
			bodyTop = top.$('html').scrollTop();
		}
		if(bodyTop > 0) {
			hdShowMsg.css('top', (bodyTop + 20) + 'px');
		}
		var id = parseInt(Math.random() * 10000);
		var hdMsgBox = '<div class="hdMsgBox" style="' + (msgWidth ? "width:" + msgWidth : "") + '" id="' + id + '"></div>';
		hdShowMsg.find('.hdMsgBox').remove();
		top.$(hdMsgBox).appendTo(hdShowMsg);
		var getMsgBox = top.$('#hdShowMsg .hdMsgBox');
		getMsgBox.addClass('hdMsgDown');
		var icon = '<div class="icon ' + optIcon + '"></div>';
		getMsgBox.find('.icon').remove();
		top.$(icon).appendTo(getMsgBox);
		getMsgBox.find('.msg').remove();
		top.$('<div class="msg">' + msg + '</div>').appendTo(getMsgBox);

		HdPortal.hdShowMsg.autoCloseTime = optIcon == 'right' ? 2000 : 3000;
		//msg消失逻辑
		top.HdPortal.removeHdShowMsg(id);
	};

	HdPortal.removeHdShowMsg = function (id) {
		if(top !== window) {
			return top.HdPortal.hdShowMsg.apply(this, arguments);
		}
		if(typeof id != 'undefined' && top.$('#' + id).length > 0) {
			top.window.setTimeout(function () {
				top.$('#' + id).removeClass('hdMsgDown');
				top.$('#' + id).addClass('hdMsgUp');
				top.window.setTimeout(function () {
					top.$('#' + id).remove();
					if(typeof HdPortal.hdShowMsg.callBack == 'function'){
						HdPortal.hdShowMsg.callBack();
					}
				}, 400);
			}, HdPortal.hdShowMsg.autoCloseTime);
		}else{
			top.window.setTimeout(function () {
				top.$('#' + id).removeClass('hdMsgDown');
				top.$('#' + id).addClass('hdMsgUp');
				top.window.setTimeout(function () {
					top.$('#hdShowMsg').remove();
					if(typeof HdPortal.hdShowMsg.callBack == 'function'){
						HdPortal.hdShowMsg.callBack();
					}
				}, 400);
			}, HdPortal.hdShowMsg.autoCloseTime);
		}
	};

	HdPortal.logout = function (jump) {
		HdPortal.poupUpBox('确定要退出系统吗？', 1, '', '', true, 'nav_logout', function () {
			$.ajax({
				type: 'post',
				url: '/ajax/login_h.jsp?cmd=logout',
				error: function () {
					HdPortal.hdShowMsg('error', '服务繁忙，请稍后重试。');
				},
				success: function (result) {
					result = jQuery.parseJSON(result);
					if(result.success) {
						if(jump) {
							top.location.href = jump;
						}else{
							top.location.href = '/';
						}
					}else{
						HdPortal.hdShowMsg('error', result.msg);
					}
				}
			});
		}, true);
	};

	/*  设置flag操作
        key:需要设置的整数
        checkFlag:需要设置的位数
        value:设置的是true还是false
    */
	HdPortal.setFlag = function (key, checkFlag, value) {
		if(HdPortal.getType(checkFlag) == 'object') {
			for(var i = 0; i < 31; i++) {
				var check = 0x1 << i;
				var val = checkFlag[check + ''];
				if(typeof val == 'boolean') {
					key = HdPortal.setFlag(key, check, val);
				}
			}
		}else{
			if(value) {
				key |= checkFlag;
			}else{
				key &= ~checkFlag;
			}
		}
		return key;
	};

	/**
     * 编译模板字符串（参考ES6模板字符串语法）
     * @param {String} string 要编译的模板字符串
     * @return {Function}
     * @example
     *  HdPortal.compileTemplateString('<div class="${ scope.className } ${ scope.hasShow ? "" : "hide" }">${ scope.text }${ scope.page + "/" + scope.count }</div>')({
     *    className: "pagination",
     *    text: "当前页数：",
     *    page: 1,
     *    count: 30,
     *    hasShow: false
     *  });
     *  output ==> '<div class="pagination hide">当前页数：1/30</div>'
     */
	HdPortal.compileTemplateString = function (string) {
		var SPECIAL_WRAP_REG = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}|$/g; // 匹配特殊包裹层 `${}`
		var index = 0;
		var source = '__p += \'';
		var stringEscapes = {
			'\\': '\\',
			'\'': '\'',
			'\n': 'n',
			'\r': 'r',
			'\u2028': 'u2028',
			'\u2029': 'u2029'
		};

		string = String(string);

		string.replace(SPECIAL_WRAP_REG, function (match, specialWrapValue, offset) {
			source += string.slice(index, offset).replace(/['\n\r\u2028\u2029\\]/g, function (match) {
				return '\\' + stringEscapes[match];
			});

			if(specialWrapValue) {
				source += '\' + \n((__t = (' + specialWrapValue + ')) == null ? \'\' : __t) + \n\'';
			}

			index = offset + match.length;
			return match;
		});
		source += '\';\n';

		// source = 'with (obj) {\n' + source + '\n}\n';
		source = 'function(scope) {\n' +
            'scope || (scope = {});\n' +
            'var __t, __p = \'\';\n' +
            source +
            'return __p;\n}';

		var result = new Function('return ' + source)();

		return result;
	};
	/*
        author: hth
        功能说明：flag控制器，将一个int数据和一个对象进行关联
        使用方法：
            //生成控制器
            var flagCtrl = HdPortal.getFlagCtrl({
                base_hight: 1,      // 数值代表这个key使用 flag 的二进制第几位 从0开始计数
                award_hight: 2,     
                base_otherInfo: 3,
                base_share: 4,    
                base_compay: 5,   
                base_redPacket: 6,
            }, 1); 初始值，可以不传默认为 0 

            //设值
            flagCtrl.set('base_share_set', false);
            flagCtrl.set({  //设值
                base_hight: game.style == 69,
                base_compay: true,
            });
            
            var showBaseShare = flagCtrl.get('base_share');  //取值
            var flagObj = flagCtrl.get();
    */
	HdPortal.getFlagCtrl = (function () {

		function FlagCtrl(ctrl, flag, noFixed){
			if(!(this instanceof FlagCtrl)){
				return new FlagCtrl(ctrl, flag, noFixed);
			}
			this.ctrl = ctrl;
			this.flag = flag || 0;
			this.fixed = !noFixed;
		}

		$.extend(FlagCtrl.prototype, {
			get: handleFn(function(seftFlag, flag, bit){
				if(bit == undefined){
					var obj = {}, _this = this;
					$.each(this.ctrl, function(key){
						obj[key] = _this.get(flag, key);
					});
					return obj;
				}
				return hdFai.checkBit(flag, bit);
			}),
			set: handleFn(function(seftFlag, flag, bit, val){
				if($.type(bit) == 'object'){
					var _this = this;
					$.each(bit, function(key, val){
						flag = _this.set(flag, key, val);
					});
				}else{
					flag = HdPortal.setFlag(flag, bit, val);
				}
				if(seftFlag){
					this.flag = flag;
				}
				return flag;
			})
		});

		return FlagCtrl;

		function handleFn(fn){
			return function(flag){
				var args = arrPro.slice.call(arguments);
				var seftFlag = $.type(flag) != 'number';
				if(seftFlag){
					args.unshift(this.flag);
				}
				if(args[1] != undefined && $.type(args[1]) != 'object'){
					var bitIndex = this.ctrl[args[1]];
					if( bitIndex === undefined ){
						if(this.fixed){
							console.warn('flagCtrl not this key: ' + args[1]);
							return;
						}else{
							bitIndex = getNewBitIndex(this.ctrl);
							if(bitIndex < 0){
								console.warn('flagCtrl bit full');
								return;
							}else{
								this.ctrl[args[1]] = bitIndex;
							}
						}
					}
					args[1] = 0x1 << bitIndex;
				}
				args.unshift(seftFlag);
				return fn.apply(this, args);
			};
		}

		function getNewBitIndex(ctrl){
			for(var i = 0; i < 31; i++) {
				var isBreak = false;
				for(var key in ctrl) {
					if(i == ctrl[key]){
						isBreak = true;
						break;
					}
				}
				if(!isBreak){
					return i;
				}
			}
			return -1;
		}
	})();

	// 注意不能用于未声明的顶层变量的判断，例如不能Fai.isNull(abc)，只能Fai.isNull(abc.d)
	HdPortal.isNull = function (obj) {
		return (typeof obj == 'undefined') || (obj == null);
	};

	/*
    弹出框（在top显示）
    title               弹出框的标题
    width               内容区宽度（数字/字符串）
    height              内容区高度（数字/字符串）
    opacity             背景遮盖层的透明度，默认0.3
    displayBg           是否加背景遮盖层，默认true
    frameSrcUrl         内容区iframe的src地址
    frameScrolling      iframe是否有scrolling(yes/no/auto)，默认auto
    bannerDisplay       是否显示标题栏和边框，默认true
    closeBtnClass       关闭按钮样式
    framePadding        是否去掉内容区的padding
    bgClose             是否点击背景关闭，默认false
    divId               以div的html来作为内容
    divContent          以html来作为内容
    frameHeight         内嵌iframe的高度
    frameWidth          内嵌iframe的宽度
    frameOverFlow       iframe的内容是否超出弹出框

    closeFunc           关闭popup window时执行的函数，可以通过Fai.closePopupWindow(popupID, closeArgs)来传递closeFunc的回调参数，即调用：closeFunc(closeArgs)
    helpLink            帮助按钮的link url
    */
	HdPortal.popupWindow = function (options) {
		if(top !== window) {
			return top.HdPortal.popupWindow.apply(this, arguments);
		}
		var settings = {
			title: '',
			width: 500,
			height: 300,
			frameSrcUrl: 'about:_blank',
			frameHeight: '100%',
			frameWidth: '100%',
			frameOverFlow: false,
			frameScrolling: 'auto',
			bannerDisplay: true,
			framePadding: true,
			opacity: '0.3',
			displayBg: true,
			bgClose: true,
			closeBtnClass: '',
			className: ''
		};
		settings = $.extend(settings, options);
		var contentWidth = parseInt(settings.width);
		var contentHeight = parseInt(settings.height);

		var browserWidth = top.document.documentElement.clientWidth;
		if(!$.browser.msie) {
			browserWidth = top.document.body.clientWidth;
		}
		var browserHeight = top.document.documentElement.clientHeight;
		var bgDisplay = '';
		var bannerStyle = '';
		var trans = '';
		if(!settings.bannerDisplay) {
			bannerStyle = 'display:none;';
			bgDisplay = 'background:none;';
			if(!settings.closeBtnClass) {
				settings.closeBtnClass = 'formX_old';   // 没有边框时使用另一个样式（如幻灯片）
			}
		}
		if(!settings.framePadding) {
			bgDisplay += 'padding:0;';
			trans = 'allowtransparency="true"';
		}

		var id = parseInt(Math.random() * 10000);
		var displayModeContent = '<iframe ' + trans + ' id="popupWindowIframe' + id + '" class="popupWindowIframe" src="" frameborder="0" scrolling="' + settings.frameScrolling + '" style="width:' + settings.frameWidth + ';height:' + settings.frameHeight + ';display:block;"></iframe>';
		var iframeMode = true;
		if(settings.divId != null) {
			iframeMode = false;
			displayModeContent = $(settings.divId).html();
		}
		if(settings.divContent != null) {
			iframeMode = false;
			displayModeContent = settings.divContent;
		}

		//加背景
		if(settings.displayBg) {
			var str = '';
			var opacityHtml = '';
			str = '<div id="popupBg' + id + '" class="popupBg" style=\'' + opacityHtml + 'display:none;\' >' +
                '</div>';
			var el = top.$(str);
			el.appendTo('body');
			el.show().addClass('bg-mask-animate');
		}

		//加弹出窗口
		var scrollTop = top.$('body').scrollTop();
		if(scrollTop == 0) {
			scrollTop = top.$('html').scrollTop();
		}

		var winStyle = 'left:0px;right:0px;margin:auto;' + (settings.frameOverFlow ? 'overflow:visible;' : '');
		var formMSGStyle = 'position:relative;width:' + contentWidth + 'px;height:' + contentHeight + 'px;';
		var html = [
			'<div id="popupWindow' + id + '" class="formDialog ' + (settings.className ? settings.className : '') + '" style="' + winStyle + '">',
			'<div class="formTL" style=\'' + bannerStyle + '\'><div class="formTR"><div class="formTC">' + settings.title + '</div></div></div>',
			'<div class="formBL" style=\'' + bgDisplay + '\'>',
			'<div class="formBR" style=\'' + bgDisplay + '\'>',
			'<div class="formBC" id="formBC' + id + '" style="height:auto;' + bgDisplay + '">',
			'<div class="formMSG" style="' + formMSGStyle + '">',
			displayModeContent,
			'</div>',
			'</div>',
			'</div>',
			'</div>',
			'<a href="javascript:;" class="formX ' + settings.closeBtnClass + '" hidefocus=\'true\' onclick=\'return false;\'></a>',
			'</div>'];

		var popupWin = top.$(html.join('')).appendTo('body');
		var btnsHeight = 40;
		var offHeight = 20;
		if(!settings.bannerDisplay) {
			btnsHeight = 0;
		}
		/*if (popupWin.height() + btnsHeight > (browserHeight - offHeight)) {
            var diffHeight = popupWin.height() + btnsHeight - popupWin.find('.formMSG').height();   // 40预留给button区
            popupWin.find('.formMSG').css('height', (browserHeight - offHeight - diffHeight) + 'px');
            popupWin.css('top', (10 + scrollTop) + 'px');
        }*/
		if(settings.divInit != null) {
			settings.divInit(id);
		}
		popupWin.addClass('poup-box-animate').ready(function () {
			popupWin.find('.formX').on('click', function () {
				if(top.expInput && (top.expInput.hasClass('ERR_hasErr') || top.expInput.hasClass('inputErr'))) {
					return;
				}
				HdPortal.closePopupWindow(id);
				return false;
			});
			// 如果开启了点击背景关闭
			if(settings.bgClose) {
				top.$('#popupBg' + id).on('click', function () {
					popupWin.find('.formX').click();
				});
			}
			if(HdPortal.isNull(top._popupOptions)) {
				top._popupOptions = {};
			}
			if(HdPortal.isNull(top._popupOptions['popup' + id])) {
				top._popupOptions['popup' + id] = {};
			}
			if(!HdPortal.isNull(options.callArgs)) {
				top._popupOptions['popup' + id].callArgs = options.callArgs;
			}
			top._popupOptions['popup' + id].options = options;
			top._popupOptions['popup' + id].change = false;
			if(iframeMode) {
				top.$('#popupWindowIframe' + id).attr('src', HdPortal.addUrlParams(settings.frameSrcUrl, 'popupID=' + id)).load(function () {
					var ready = null;
					try{
						ready = this.contentWindow._popupWindowReady;
					}catch(e) {
						console.warn(e);
					}
					ready && ready.call(this, settings.data);
					/*
                setTimeout(function(){
                    top.$('#popupBg'+id).show().addClass('bg-mask-animate');
                    popupWin.addClass('poup-box-animate');
                },100);
                */
				});
			}
		});
		return id;
	};

	/*
    灰色透明背景
    */
	HdPortal.bg = function (id, opacity, callBack) {
		var html = '';
		var opacityHtml = '';
		if(opacity) {
			opacityHtml = 'filter: alpha(opacity=' + opacity * 100 + '); opacity:' + opacity + ';';
		}

		html = '<div id="popupBg' + id + '" class="popupBg" style=\'' + opacityHtml + 'display:none;\' >' +
            // ($.browser.msie && $.browser.version == 6.0 ?
            // '<iframe id="fixSelectIframe' + id + '" wmode="transparent" style="filter: alpha(opacity=0);opacity: 0;" class="popupBg" style="z-index:-111" src="javascript:"></iframe>'
            // :
            // '')
            '</div>';
		var el = top.$(html);
		el.appendTo('body');
		el.addClass('bg-mask-animate').fadeIn(0, callBack);
		//hdFai.stopInterval(null);
	};

	/**
     * 给链接添加参数
     * @param {String} url 要拼接参数的链接
     * @param {String|Object} params 要拼接的参数
     * @return {String} 拼接好的参数
     * @example
     *  HdPortal.addUrlParams(url, 'page=3&count=5');
     *  HdPortal.addUrlParams(url, { page: 3, count: 5 });
     * 
     * TODO: 检查参数是否重复
     */
	HdPortal.addUrlParams = function (url, params){
		var hasQuestion = url.indexOf('?') > 0;
		var type = typeof params;
		var splicedParams;

		if(type === 'undefined'){
			return url;
		}else if(type === 'string'){
			splicedParams = params.indexOf('?') === 0 ? params.slice(1) : params;
		}else if(params !== null && type === 'object'){
			splicedParams = [];

			for(var param in params){
				if(params.hasOwnProperty(param)){
					var val = params[param];

					if (val != null && typeof val === 'object') {
						val = JSON.stringify(val);
					}

					splicedParams.push(param + '=' + val);
				}
			}

			splicedParams = splicedParams.join('&');
		}

		return url + (hasQuestion ? '&' : '?') + splicedParams;
	};

	HdPortal.closePopupWindow = function (id, closeArgs) {
		var popupBg = top.$('.popupBg');
		var formDialog = top.$('.formDialog');
		formDialog.removeClass('poup-box-animate');
		popupBg.removeClass('bg-mask-animate');
		setTimeout(function () {
			popupBg.remove();
			formDialog.remove();
		}, 300);
		var popupOption = top._popupOptions['popup' + id];
		var options = popupOption.options;

		if(!hdFai.isNull(options.closeFunc)) {
			if(closeArgs) {
				options.closeFunc(closeArgs);
			}else{
				options.closeFunc(top._popupOptions['popup' + id].closeArgs);
			}
		}
		top._popupOptions['popup' + id] = {};
	};
    
	/*
        author: hth
        功能说明：获取变量类型
    */
	HdPortal.getType = function (obj) {
		return Object.prototype.toString.call(obj).match(/\[object\s(\w+)]/)[1].toLowerCase();
	};
    
	/**
     * 图片头数据加载就绪事件 - 更快获取图片尺寸
     * @version 2011.05.27
     * @see     http://blog.phpdr.net/js-get-image-size.html
     * @param   {String}    图片路径
     * @param   {Function}  尺寸就绪
     * @param   {Function}  加载完毕 (可选)
     * @param   {Function}  加载错误 (可选)
     * @example imgReady('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', function () {
            alert('size ready: width=' + this.width + '; height=' + this.height);
        });
     */
	HdPortal.imgReady = (function () {
		var list = [], intervalId = null,
			// 用来执行队列
			tick = function () {
				var i = 0;
				for(; i < list.length; i++) {
					list[i].end ? list.splice(i--, 1) : list[i]();
				}
				!list.length && stop();
			},
			// 停止所有定时器队列
			stop = function () {
				clearInterval(intervalId);
				intervalId = null;
			};
		return function (url, ready, load, error) {
			var onready, width, height, newWidth, newHeight,
				img = new Image();
			img.src = url;
			// 如果图片被缓存，则直接返回缓存数据
			if(img.complete) {
				ready.call(img);
				load && load.call(img);
				return;
			}
			width = img.width;
			height = img.height;
			// 加载错误后的事件
			img.onerror = function () {
				error && error.call(img);
				onready.end = true;
				img = img.onload = img.onerror = null;
			};
			// 图片尺寸就绪
			onready = function () {
				if(!img)return;
				newWidth = img.width;
				newHeight = img.height;
				if(newWidth !== width || newHeight !== height ||
                    // 如果图片已经在其他地方加载可使用面积检测
                    newWidth * newHeight > 2
				) {
					ready.call(img);
					onready.end = true;
				}
			};
			onready();
			// 完全加载完毕的事件
			img.onload = function () {
				// onload在定时器时间差范围内可能比onready快
				// 这里进行检查并保证onready优先执行
				!onready.end && onready();

				load && load.call(img);

				// IE gif动画会循环执行onload，置空onload即可
				img = img.onload = img.onerror = null;
			};
			// 加入队列中定期执行
			if(!onready.end) {
				list.push(onready);
				// 无论何时只允许出现一个定时器，减少浏览器性能损耗
				if(intervalId === null) intervalId = setInterval(tick, 40);
			}
		};
	})();

	/**
     * logDog
     * 每日标准行为
     */
	HdPortal.logDog = $.throttle(function (dogList) {
		if(dogList.length == 1) {
			HdPortal.logDogSynch.apply(HdPortal, dogList[0]);
		}else{
			HdPortal.logDogList($.map(dogList, function (v) {
				var dog = {id: parseInt(v[0])};
				var src = parseInt(v[1]);
				var objId = parseInt(v[2]);
				!isNaN(src) && (dog.src = src);
				!isNaN(objId) && (dog.objId = objId);
				return dog;
			}));
		}
	}, 0, true);

	//每日实例行为 objId设gameId
	HdPortal.logObjDog = function (dogId, dogSrc, objId) {
		HdPortal.logDog(dogId, dogSrc, objId);
	};

	HdPortal.logDogList = function (dogList) {
		$.ajax({
			type: 'post',
			url: '/ajax/log_h.jsp?cmd=dogList',
			data: {dogList: $.toJSON(dogList)},
		});
	};

	HdPortal.logDogSynch = function (dogId, dogSrc, objId) {
		var objIdStr = isNaN(objId) ? '' : '&objId=' + hdFai.encodeUrl(objId);
		$.ajax({
			type: 'get',
			url: '/ajax/log_h.jsp?cmd=dog&dogId=' + hdFai.encodeUrl(dogId) + '&dogSrc=' + hdFai.encodeUrl(dogSrc) + objIdStr,
		});
	};

	HdPortal.logBss = function (bss, content, flow, aid) {
		var data = {
			bss: bss,
			content: content,
		};
		aid && (data.aid = aid);
		flow && (data.flow = flow);
		$.ajax({
			type: 'post',
			url: '/ajax/log_h.jsp?cmd=bss',
			data: data,
		});
	};

	/*
        author: hth
        功能说明：获取字符串长度，中文算两个字符
        参数说明：
            str：处理字符串
            limit：长度限制，传这个参数，会截取对应中文长度的字符串返回
    */
	HdPortal.getHanziSize = function (str, limit) {
		str = str || '';
		var reg = /[^\x00-\xff]/;
		var count = 0, count1 = 0;
		for(var i = 0; i < str.length; i++) {
			var flat = str.charAt(i);
			if(reg.test(flat)) {
				count += 2;
			}else{
				count1++;
			}
			if(limit && count + count1 > limit) {
				return str.substr(0, i);
			}
		}
		if(limit) {
			return str;
		}
		return count + count1;
	};

	HdPortal.checkMaxTextLength = function (byteLength, obj, type, allawEmpty, parentBox, css, position) {
		return HdPortal.checkMaxLen(obj.val(), byteLength, obj, type, allawEmpty, parentBox, css, position);
	};

	//限制输入框的字符数，如要求只能输入10个中文或20个英文字母  noLimitType-不限制输入的字符,noLimitTypeAll-不限制输入的字符且不区分中英文字符长度, limitNumType-限制为数字,limitSizeType-限制大小,allawEmpty-是否允许输入为空
	HdPortal.checkMaxLen = function (val, byteLength, obj, type, allawEmpty, parentBox, css, position) {
		if(obj.length > 1) {
			var args = arrPro.slice.call(arguments);
			var rt = true;
			obj.each(function (index) {
				args[2] = $(this);
				if(!HdPortal.checkMaxLen.apply(HdPortal, args)) {
					rt = false;
				}
			});
			return rt;
		}
		val = typeof val == 'undefined' ? '' : val + '';
		var str = val.replace(/[^\x00-\xff]/g, '**');
		var length = str.trim().length;
		var emptyText = allawEmpty ? '' : '输入不能为空且';
		var parentBox = parentBox ? parentBox : '';
		if(type == 'noLimitType' || type == 'limitNumType') {
			if(length == 0 || HdPortal.getHanziSize(val) > byteLength) {
				if(type == 'noLimitType') {
					if(length == 0 && allawEmpty) {
						ERR.removeErr(obj);
					}else{
						ERR.addErr(obj, emptyText + '长度不超过' + byteLength / 2 + '个汉字或' + byteLength + '个英文字母', parentBox, css, position);
						return false;
					}
				}else{
					if(length == 0 && allawEmpty) {
						ERR.removeErr(obj);
					}else{
						ERR.addErr(obj, emptyText + '长度不超过' + byteLength + '个数字', parentBox, css, position);
						return false;
					}
				}
			}else{
				ERR.removeErr(obj);
			}
		}

		if(type == 'noLimitTypeAll') {
			if(length == 0 || val.trim().length > byteLength) {
				if(length == 0 && allawEmpty) {
					ERR.removeErr(obj);
				}else{
					ERR.addErr(obj, emptyText + '长度不超过' + byteLength + '个汉字或英文字母', parentBox, css, position);
					return false;
				}
			}else{
				ERR.removeErr(obj);
			}
		}
		if(type == 'limitSizeType') {
			var value = parseInt(val);
			if(length == 0 || (value && value > byteLength)) {
				if(length == 0 && allawEmpty) {
					ERR.removeErr(obj);
				}else{
					ERR.addErr(obj, emptyText + '大小不超过' + byteLength, parentBox, css, position);
					return false;
				}
			}else{
				ERR.removeErr(obj);
			}
		}
		return true;
	};

	//用于编辑页中某些输入框的输入限制优化，字数统计方式由字符串改为字，去掉type这个参数
	HdPortal.checkMaxLenForEditActive = function (val, length, obj, allawEmpty, parentBox, css, position) {
		if(obj.length > 1) {
			var args = arrPro.slice.call(arguments);
			var rt = true;
			obj.each(function (index) {
				args[2] = $(this);
				if(!HdPortal.checkMaxLen.apply(HdPortal, args)) {
					rt = false;
				}
			});
			return rt;
		}
		var size = val && val.trim().length;

		var emptyText = allawEmpty ? '' : '输入不能为空且';
		var parentBox = parentBox ? parentBox : '';
		if(size == 0 || size > length) {
			if(size == 0 && allawEmpty) {
				ERR.removeErr(obj);
			}else{
				ERR.addErr(obj, emptyText + '长度不超过' + length + '个字', parentBox, css, position);
				return false;
			}
		}else{
			ERR.removeErr(obj);
		}
		return true;
	};

	var sensitWordAndAdvance = [
		{'sensword': '游戏', 'adVance': '活动'},
		{'sensword': '红包', 'adVance': 'hong包'},
		{'sensword': '紅包', 'adVance': 'hong包'},
		{'sensword': '分享', 'adVance': 'fen享'},
		{'sensword': '朋友圈', 'adVance': 'peng友圈'},
		{'sensword': '现金', 'adVance': 'xian金'},
		{'sensword': '福利', 'adVance': 'fu利'}
	];
	HdPortal.checkSensitword = function (text, callBack) {
		if(typeof text === 'object') {
			if(text.val()) {
				text = text.val().trim();
			}else{
				var objClone = text.clone();
				objClone.find(':nth-child(n)').remove();
				text = objClone.html();
			}
		}
        
		var obj = {sensword: '', replaceWord: ''};

		text && $.each(sensitWordAndAdvance, function (i, item) {
			if(text.indexOf(item.sensword) > -1) {
				obj.sensword = ('“' + item.sensword + '”');
				obj.replaceWord = ('“' + item.adVance + '”');
				return false;
			}
		});
		if(obj.sensword) {
			callBack && callBack(obj);
			return obj;
		}else{
			return false;
		}
	};

	//限制输入框的字符数，如要求只能输入10个中文或20个英文字母
	HdPortal.checkTextLength = function (byteLength, obj) {
		var str = obj.val().replace(/[^\x00-\xff]/g, '**');
		var length = str.length;
		if(length < byteLength) {
			return;
		}
		var limitDate = str.substr(0, byteLength);
		var count = 0;
		var limitvalue = '';
		for(var i = 0; i < limitDate.length; i++) {
			var flat = limitDate.charAt(i);
			if(flat == '*') {
				count++;
			}
		}
		var size = 0;
		if(count % 2 == 0) {
			//当为偶数时
			size = count / 2 + (byteLength * 1 - count);
			limitvalue = obj.val().substr(0, size);
		}else{
			//当为奇数时
			size = (count - 1) / 2 + (byteLength * 1 - count);
			limitvalue = obj.val().substr(0, size);
		}
		obj.val(limitvalue);
	};

	/*
        author: hth
        功能说明：补零函数
    */
	HdPortal.pad = function (num, n) {
		num = num + '';
		while(num.length < n) {
			num = '0' + num;
		}
		return num;
	};

	/*
        author: hth
        功能说明：将对象拼接成链接参数
    */
	HdPortal.jointParams = function(params){
		var s = [];
		$.each(params, function(key, val){
			s.push(key + '=' + val);
		});
		return s.join('&');
	};

	/*
        author: hth
        功能说明：设置链接参数
        使用方法：
            url = HdPortal.setUrlArg(url, ['a', 1], ['b',2]);
    */
	HdPortal.setUrlArg = function(){
		if(arguments.length < 2){
			return;
		}
		var argsArray = Array.prototype.slice.call(arguments),
			urlInfo = HdPortal.parseURL(argsArray.shift());
		$.each(argsArray, function(index, item) {
			if($.type(item) === 'array'){
				urlInfo.params[item[0]] = item[1];
			}
		});
		urlInfo.obj.search = HdPortal.jointUrlArg('', HdPortal.jointParams(urlInfo.params));
		return urlInfo.obj.href;
	};

	/*
        author: hth
        功能说明：移除链接参数
        使用方法：
            url = HdPortal.removeUrlArg(url, 'a', 'b');
    */
	HdPortal.removeUrlArg = function(){
		var argsArray = Array.prototype.slice.call(arguments);
		if(argsArray.length < 2){
			return;
		}
		var urlInfo = HdPortal.parseURL(argsArray.shift());
		$.each(argsArray, function(index, item) {
			if(urlInfo.params.hasOwnProperty(item)){
				delete urlInfo.params[item];
			}
		});
		urlInfo.obj.search = HdPortal.jointUrlArg('', HdPortal.jointParams(urlInfo.params));
		return urlInfo.obj.href;
	};

	/*
        author: hth
        功能说明：拼接链接参数
    */
	HdPortal.jointUrlArg = function (root, arg) {
		if(arg) {
			return root + (root.indexOf('?') >= 0 ? '&' : '?') + arg;
		}else{
			return root;
		}
	};

	/*
        author: hth
        功能说明：百分比进度条
        方法说明：
            init： 开始显示进度条
            die： 结束进度条
            end： 将进度条进度设置到100%，并结束进度条
    */
	HdPortal.percentProgress = (function () {
		var _progressEl, _progressI, _timer, _running, _updateTimer, _dieTime;
		return {
			/*
                showMask: 是否显示遮罩层
                dieTime：loading结束延迟时间，默认500毫秒
            */
			init: function (showMask, dieTime) {
				if(top.$('#hdShowMsg').length > 0) {
					top.$('#hdShowMsg .close').click();
				}
				if(_running) {
					console.warn('percentProgress _progress err');
					return;
				}
				_dieTime = dieTime || 500;
				_progressEl && _progressEl.remove();
				clearTimeout(_timer);
				if(showMask) {
					_progressEl = $('<div id="percentProgressMask"><div id="percentProgress"><div id="percentProgressIcon"><span id="percentProgressBar"></span></div><span id="percentProgressText">100%</span></div></div>');
				}else{
					_progressEl = $('<div id="percentProgress"><div id="percentProgressIcon"><span id="percentProgressBar"></span></div><span id="percentProgressText">100%</span></div>');

				}
				top.$('body').append(_progressEl);
				_progressI = 0;
				_update();
				_running = true;
				return this;
			},
			die: function (callBack) {
				if(!_running) {
					callBack && callBack();
					return this;
				}
				_running = false;
				clearTimeout(_updateTimer);
				if(_dieTime == 0) {
					_progressEl.remove();
					_progressEl = null;
					callBack && callBack();
					return this;
				}
				_timer = setTimeout(function () {
					_progressEl.remove();
					_progressEl = null;
					callBack && callBack();
				}, _dieTime);
				return this;
			},
			end: function (callBack) {
				if(!_running) {
					callBack && callBack();
					return this;
				}
				_progressEl.find('#percentProgressText').text('100%');
				_progressEl.find('#percentProgressBar').css('width', '100%');
				this.die(callBack);
				return this;
			},
		};

		function _update() {
			_progressI++;
			_progressEl.find('#percentProgressText').text((~~_progressI) + '%');
			_progressEl.find('#percentProgressBar').css('width', (~~_progressI) + '%');
			if(_progressI < 30) {
				_updateTimer = setTimeout(_update, 10);
			}else if(_progressI < 55) {
				_updateTimer = setTimeout(_update, 10 * 2);
			}else if(_progressI < 75) {
				_updateTimer = setTimeout(_update, 10 * 4);
			}else if(_progressI < 90) {
				_updateTimer = setTimeout(_update, 10 * 8);
			}else if(_progressI < 99) {
				_updateTimer = setTimeout(_update, 10 * 16);
			}
		}
	})();

	/*
        author: hth
        功能说明：关联两个节点的hover显示逻辑
        使用方法：
            HdPortal.link([$('#showActiveTable'),'.qrcodeIcon'],qrcodeDiv,{
                enter : function(e,e1,e2){
                    // 鼠标进入逻辑
                    // e: mouseenter事件对象
                    // e1: 主节点（初始hover节点）
                    // e2： 关联节点
                },
                leave : function(e,e1,e2){
                    //鼠标离开逻辑
                }
            });
    */
	(function () {
		var link = function (el1, el2, opts) {
			var opt = {
				time: 50,       //关联消失延时
				enter: null,
				leave: null,
			};
			$.extend(opt, opts);

			//el2如果设置为enter字符串，代表el2使用enter返回的节点
			var e2ByEnter = el2 == 'enter';

			//当前存在的关联列表
			var linkList = hdFai.HdList('e1');

			var leave = function (time, _this, e, data, flag) {
				if(!data)return;

				data.flag &= ~flag;

				if(data.flag)return;

				if($.type(time) == 'function'){
					time = time($(data.e1), data.e2);
				}

				clearTimeout(data.timer);
				time < 0 ? fn(true) : (data.timer = setTimeout(fn, time));

				function fn(isTrigger){
					toggle(data.e2, false);
					opt.leave && opt.leave.call(_this, e, $(data.e1), data.e2, flag == 0x1);
					offEvent(data.e2, fns[2], fns[3]);
					linkList.not(data.e1);
				}
			};

			var fns = [
				function (e) {
					var data = linkList.getByName(this);
					!data && linkList.add(data = {e1: this, flag: 0});
					if(!e2ByEnter && linkList.size() > 1){
						for(var i = 0; i < linkList.size(); i++) {
							var oData = linkList.get(i);
							if(oData.e1 != this){
								oData.flag = 0;
								leave(-1, data.e1, e, oData, 0x1);
								i--;
							}
						}
					}
					if(!data.e2){
						toggle(data.e2 = el2, true);
						if(opt.enter){
							var enterRt = opt.enter.call(this, e, $(this), el2);
							if(e2ByEnter && enterRt) {
								toggle(data.e2 = enterRt, true);
							}
						}
						onEvent(data.e2, fns[2], fns[3]);
					}
					data.flag |= 0x1;
					clearTimeout(data.timer);
				},
				function (e) {
					leave(opt.time, this, e, linkList.getByName(this), 0x1);
				},
				function (e) {
					var _this = this;
					linkList.forEach(function(data) {
						if(!isJq(data.e2) || data.e2[0] != _this)return;
						data.flag |= 0x2;
						clearTimeout(data.timer);
					});
				},
				function (e) {
					var _this = this;
					linkList.forEach(function(data) {
						if(!isJq(data.e2) || data.e2[0] != _this)return;
						leave(opt.time, _this, e, data, 0x2);
					});
				}
			];

			onEvent(el1, fns[0], fns[1]);
		};

		var unlink = function (el1) {
			el1.off('mouseenter.hp_link').off('mouseleave.hp_link');
		};

		$.each(['on', 'off'], function (i, key) {
			link[key] = function (el, event, fn) {
				if($.isArray(el)) {
					isJq(el[0]) && el[0][key](event, el[1], fn);
				}else{
					isJq(el) && el[key](event, fn);
				}
				return link;
			};
		});

		link.onMouseEvent = onEvent;
		link.offMouseEvent = offEvent;

		HdPortal.link = link;
		HdPortal.unlink = unlink;

		function isJq(el) {
			return el && (el instanceof $ || el.jquery === $.fn.jquery);
		}

		function onEvent(el, enter, leave) {
			link.on(el, 'mouseenter.hp_link', enter).on(el, 'mouseleave.hp_link', leave);
		}

		function offEvent(el, enter, leave) {
			link.off(el, 'mouseenter.hp_link', enter).off(el, 'mouseleave.hp_link', leave);
		}

		function toggle(el, flag) {
			isJq(el) && el.toggle(flag);
		}
	})();

	/*
        author: hth
        功能说明：封装localStorage的 set get remove 方法
        参数说明：
            name： localStorage的key
            value: 需要保存的值，只在set接口有效
            expires: 过期时间（单位毫秒），只在set接口有效
    */
	$.each(['set', 'get', 'remove'], function (index, key) {
		HdPortal[key + 'LocalStorage'] = function (name, value, expires) {
			if(!localStorage) {
				console.warn('不支持localStorage');
				return;
			}
			if(key == 'set'){
				var conf = {};
				if( $.isPlainObject(value) || $.isArray(value) ){
					value = $.toJSON(value);
					conf.json = 1;
				}
				if(expires && !isNaN(expires)){
					conf.expires = expires;
					conf.stime = HdPortal.getServerTime();
				}
				if( !$.isEmptyObject(conf) ){
					localStorage.setItem( name + '@{conf}', $.toJSON(conf) );
				}else{
					localStorage.removeItem( name + '@{conf}'); 
				}
			}else if(key == 'get'){
				var conf = localStorage.getItem( name + '@{conf}' ), rt;
				if(conf){
					conf = $.parseJSON(conf);
					if(conf.expires && conf.stime && HdPortal.getServerTime() - conf.stime > conf.expires){
						localStorage.removeItem(name);
						conf = null;
						rt = null;
					}else if( conf.json ){
						rt = $.parseJSON( localStorage.getItem(name) );
					}
					if( $.isEmptyObject(conf) ){
						localStorage.removeItem( name + '@{conf}');
					}
					if(rt !== undefined){
						return rt;
					}
				}
			}else{
				localStorage.removeItem( name + '@{conf}'); 
			}
			return localStorage[key + 'Item'](name, value);
		};
	});


	HdPortal.getTaskFinishKey = function(key){
		var value = HdPortal.getLocalStorage(key);
		if(value == null){
			value = $.cookie(key);
		}
		return value;
	};

	HdPortal.setTaskFinishKey = function(key, value){
		//改为存在localStorage
		HdPortal.setLocalStorage(key, value);
		//逐步删除旧数据
		$.cookie(key, '', { expires: -1, domain: document.domain, path: '/'});
	};

	/*
        author: hth
        功能说明：解析url
    */
	HdPortal.parseURL = function(url) {  
		var a = document.createElement('a');
		a.href = url;
		return {
			obj: a,
			source: url,
			protocol: a.protocol.replace(':', ''),  
			host: a.hostname,  
			port: a.port,  
			query: a.search,
			params: (function(){  
				var ret = {},  
					seg = a.search.replace(/^\?/, '').split('&'),  
					len = seg.length, i = 0, s;  
				for(;i < len; i++) {  
					if(!seg[i]) { continue; }  
					s = seg[i].split('=');  
					ret[s[0]] = s[1];  
				}  
				return ret;  
			})(),
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],  
			hash: a.hash.replace('#', ''),  
			path: a.pathname.replace(/^([^\/])/, '/$1'),  
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],  
			segments: a.pathname.replace(/^\//, '').split('/')  
		};  
	};

	/*
     * Javascript encodeBase64() base64加密函数
       用于生成字符串对应的base64加密字符串
     * @param string str 原始字符串
     * @return string 加密后的base64字符串
    */
	HdPortal.encodeBase64 = function (str) {
		var c1, c2, c3;
		var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		var i = 0, len = str.length, string = '';
		while(i < len) {
			c1 = str.charCodeAt(i++) & 0xff;
			if(i == len) {
				string += base64EncodeChars.charAt(c1 >> 2);
				string += base64EncodeChars.charAt((c1 & 0x3) << 4);
				string += '==';
				break;
			}
			c2 = str.charCodeAt(i++);
			if(i == len) {
				string += base64EncodeChars.charAt(c1 >> 2);
				string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				string += base64EncodeChars.charAt((c2 & 0xF) << 2);
				string += '=';
				break;
			}
			c3 = str.charCodeAt(i++);
			string += base64EncodeChars.charAt(c1 >> 2);
			string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			string += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
			string += base64EncodeChars.charAt(c3 & 0x3F);
		}
		return string;
	};
    
	/*
        author: hth
        功能说明：实现简单路由功能
    */
	(function () {
		function Node(name, cb){
			name && (this.name = name);
			cb && (this.cb = cb);
		}

		function Route(){
			if(!(this instanceof Route)){
				return new Route();
			}
			var rootNode = new Node();
			rootNode.isRoot = true;
			rootNode.path = '';
			$.extend(this, {
				root: rootNode,
				currentPath: null,
				defPath: '',
				conf: {},
			});

			// this.eventBus = new hdFai.Callback(true);
		}

		$.extend(Route.prototype, {
			setDefPath: function(path){
				this.defPath = path;
				return this;
			},
			// bind: function(path, fn){
			// 	conf[path] = fn;
			// 	return this;
			// },
			// go: function(path, data){
			// 	var route = this,
			// 		paths = path ? path.split('/') : [],
			// 		crrPaths = route.currentPath ? route.currentPath.split('/') : [],
			// 		node = this.root;

			// 	var samePaths = true;
			// 	var defer = $.Deferred('resolve');
			// 	var 

			// 	$.each(paths, function(i, name) {
			// 		if(samePaths && crrPaths[i] != name){
			// 	    	samePaths = false;
			// 	    }

			// 	    defer = defer.then(function(lastVal){
			// 	    	name
			// 	    });
			// 	});

			// 	return defer;

			// 	(function run(node, lastVal){
			// 		var rt = node.cb && node.cb(data, lastVal);
			// 		var end = function(val){
			// 			if(paths.length == 0){
			// 				return;
			// 			}
			// 			var nodeType = node.next[paths.shift()];
			// 			if( !nodeType ){
			// 				nodeType = node.next['newActive'];
			// 			}
			// 			run(nodeType, val);
			// 		};
			// 		rt && $.isFunction( rt.then ) ? rt.then(end) : end(rt);
			// 	})(node);


			// 	while(paths.length > 0){
			// 		if(crrPaths[0] != paths[0]){
			// 			break;
			// 		}
			// 		node = node.next[crrPaths.shift()];
			// 		paths.shift();
			// 	}

			// 	(function run(node, lastVal){
			// 		var rt = node.cb && node.cb(data, lastVal);
			// 		var end = function(val){
			// 			if(paths.length == 0){
			// 				return;
			// 			}
			// 			var nodeType = node.next[paths.shift()];
			// 			if( !nodeType ){
			// 				nodeType = node.next['newActive'];
			// 			}
			// 			run(nodeType, val);
			// 		};
			// 		rt && $.isFunction( rt.then ) ? rt.then(end) : end(rt);
			// 	})(node);
			// 	route.setPath(path);
			// 	return this;
			// },

			bind: function(path, data, node){
				var route = this, name = '';
				node = node || this.root;
				path !== null && $.each(path.split('/'), function(i, val){
					!node.next && (node.next = {});
					var nextNode = node.next[name = val];
					if(nextNode === undefined){
						node.next[val] = nextNode = new Node(val);
						nextNode.path = node.path + (node.path ? '/' : '') + val;
						nextNode.prev = node;
					}
					node = nextNode;
				});
				if($.type(data) == 'function'){
					node.cb = data;
				}else{
					if(data.next){
						node.cb = data.cb;
						data = data.next;
					}
					$.each(data, function(key, val) {
						route.bind(key, val, node);
					});
				}
				return this;
			},
			go: function(path, data){
				var route = this,
					paths = path ? path.split('/') : [],
					crrPaths = route.currentPath ? route.currentPath.split('/') : [],
					node = this.root,
					samePaths = [];

				while(paths.length > 0){
					if(crrPaths[0] != paths[0]){
						break;
					}
					node = node.next[crrPaths.shift()];
					samePaths.push(paths.shift());
				}
				(function run(node, lastVal){
					var rt = node.cb && node.cb(data, lastVal);
					var end = function(val){
						if(paths.length == 0){
							return;
						}
						var nodeType = node.next[paths.shift()];
						if( !nodeType ){
							nodeType = node.next['newActive'];
						}
						run(nodeType, val);
					};
					rt && $.isFunction( rt.then ) ? rt.then(end) : end(rt);
				})(node);
				route.setPath(path);
				return this;
			},
			init: function(path) {
				var route = this;
				window.addEventListener('popstate', function(e){
					var crrPath = route.getPath();
					if(crrPath != route.currentPath){
						route.go(crrPath);
					}
				});
				route.go(path || route.getPath());
				return this;
			},
			getPath: function () {
				var path = location.hash;
				if(path.length > 0){
					path = path.slice(1);
				}
				return path || this.defPath;
			},
			setPath: function (path) {
				this.currentPath = path;
				if(path == this.getPath())return;
				location.hash = path;
				return this;
			}
		});

		HdPortal.Route = new Route();
		HdPortal.Route.$new = Route;
	})();

	//获取第三方礼品数量
	HdPortal.getGiftAmount = function (callBack, isMainStore) {
		var storeId = HdPortal.storeId;
		var areaId = HdPortal.areaId;
		if(isMainStore) {
			storeId = 0;
			areaId = 0;
		}
		$.ajax({
			type: 'post',
			url: '/ajax/hdgift_h.jsp?cmd=getAssetAmount&storeId=' + storeId + '&areaId=' + areaId,
			error: function () {
				HdPortal.hdShowMsg('error', '服务繁忙，请稍候重试');
			},
			success: function (data) {
				var obj = $.parseJSON(data);
				callBack && callBack(obj);
			}
		});
	};

	//获取红包余额（当前门店）
	HdPortal.getBalance = function (callBack, isMainStore) {
		var storeId = HdPortal.storeId;
		var areaId = HdPortal.areaId;
		if(isMainStore) {
			storeId = 0;
			areaId = 0;
		}
		$.ajax({
			type: 'post',
			url: '/ajax/hdcash_h.jsp?cmd=getBalance&storeId=' + storeId + '&areaId=' + areaId,
			error: function () {
				HdPortal.hdShowMsg('error', '服务繁忙，请稍候重试');
			},
			success: function (data) {
				var obj = $.parseJSON(data);
				callBack && callBack(obj);
			}
		});
	};

	//获取红包余额（总部）
	HdPortal.getMainStoreBalance = function (callBack) {
		HdPortal.getBalance(callBack, true);
	};

	//精确计算方法
	(function () {
		//加
		function floatAdd(arg1, arg2) {
			var r1, r2, m;
			try{
				r1 = arg1.toString().split('.')[1].length;
			}catch(e) {
				r1 = 0;
			}
			try{
				r2 = arg2.toString().split('.')[1].length;
			}catch(e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			return (floatMul(arg1, m) + floatMul(arg2, m)) / m;
		}

		//减
		function floatSub(arg1, arg2) {
			var r1, r2, m, n;
			try{
				r1 = arg1.toString().split('.')[1].length;
			}catch(e) {
				r1 = 0;
			}
			try{
				r2 = arg2.toString().split('.')[1].length;
			}catch(e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			//动态控制精度长度
			n = (r1 >= r2) ? r1 : r2;
			return Number( ( (floatMul(arg1, m) - floatMul(arg2, m)) / m ).toFixed(n) );
		}

		//乘
		function floatMul(arg1, arg2) {
			var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
			try{
				m += s1.split('.')[1].length;
			}catch(e) {
			}
			try{
				m += s2.split('.')[1].length;
			}catch(e) {
			}
			return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
		}


		//除
		function floatDiv(arg1, arg2) {
			var t1 = 0, t2 = 0, r1, r2;
			try{
				t1 = arg1.toString().split('.')[1].length;
			}catch(e) {
			}
			try{
				t2 = arg2.toString().split('.')[1].length;
			}catch(e) {
			}

			r1 = Number(arg1.toString().replace('.', ''));

			r2 = Number(arg2.toString().replace('.', ''));
			return (r1 / r2) * Math.pow(10, t2 - t1);
		}
		//转换为英文数字
		function translate(arg1, arg2){
			var arr = (arg1 + '').split('.');
			arg1 = parseInt( arr[0] );
			var result = [], counter = 0;
			arg1 = (arg1 || 0).toString().split('');
			for(var i = arg1.length - 1; i >= 0; i--) {
				counter++;
				result.unshift(arg1[i]);
				if(!(counter % 3) && i != 0) { result.unshift(','); }
			}
			var endNum = result.join('');
			if(arr.length == 2){
				endNum = endNum + '.' + arr[1];
			}
			return endNum;
		}
		function getFn(fn) {
			return function (arg1, arg2) {
				if(isNaN(arg1) || isNaN(arg2)) {
					return NaN;
				}
				return fn(arg1, arg2);
			};
		}

		HdPortal.Num = {
			add: getFn(floatAdd),
			sub: getFn(floatSub),
			mul: getFn(floatMul),
			div: getFn(floatDiv),
			translate: getFn(translate),
		};

		$.each(['floor', 'ceil', 'round'], function(index, key) {
			HdPortal.Num[key] = function(val, power){
				if($.type(val) == 'string'){
					val = parseFloat(val);
				}
				if(!power){
					return Math[key](val);
				}
				var tmp = Math.pow(10, power);
				return Math[key](val *= tmp) / tmp;
			};
		});
	})();

	//数字加逗号
	HdPortal.foreiganNum = function(num) {
		// var arr = (num + '').split('.');
		// arr[0] = arr[0].replace(/(?=(?!\b)(\d{3})+$)/g, ',');
		// return arr.join('.');
		var result = num.toLocaleString();
		hdFai.isIE() && (result = 0 + result);
		return result;
	};

	//显示loading
	HdPortal.loading = (function () {
		var _dataKey = 'hp_loading';
		return {
			show: function (box, hideMsk, msg) {
				box = box || top.$('body');
				var loadBg = box.data(_dataKey);
				if(loadBg && loadBg.parent(box).length > 0) {
					return loadBg;
				}
				loadBg = $('<div class="loading-animate">' +
                    '<div class="loadingBg" style="width: 108px; height: 108px; border-radius: 8px; background-color: rgba(0,0,0,.75); left:50%; top: 50%; margin-top: -46px; margin-left: -54px;"></div>' +
                    '<div>' +
                        '<div class="c1"></div>' +
                        '<div class="c2"></div>' +
                        '<div class="c3"></div>' +
                        '<div class="c4"></div>' +
                    '</div>' +
                    '<span>' + (msg || '加载中') + '...</span>' +
                '</div>');
				box.append(loadBg).data(_dataKey, loadBg);
				if(!box.is('body') && !box.is('html')){
					box.addClass('loading-warp');
				}
				if($.type(hideMsk) == 'string'){
					loadBg.css('background', hideMsk);
				}else if(hideMsk){
					loadBg.css('background', 'none');
				}
				return loadBg;
			},
			hide: function (box) {
				box = box || top.$('body');
				var loadBg = box.data(_dataKey);
				if(!loadBg)return;
				box.removeClass('loading-warp');
				loadBg.remove();
				box.removeData(_dataKey);
			}
		};
	})();

	/*
        author: hth
        功能说明：异步弹窗
    */
	HdPortal.getAsynchPopup = function(opts) {
		opts = $.extend({
			resKey: '',
			popup: null,
			closeEvent: 'poupBox_close',
		}, opts);

		return function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift(load);
			return opts.popup.apply(null, args);
		};

		function load(settings){
			settings = $.extend({
				layout: null,
				box: null,
				timeOut: 0,
				setPromise: null,
			}, settings);

			var poupContent;
			if(settings.box){
				poupContent = settings.box.find('.poupContent');
			}
			var close = function(){
				settings.layout = poupContent = null;
				loadPromise.isClose = true;
			};
			opts.closeEvent && settings.box.on(opts.closeEvent, close);
			var loadPromise = top.HdPortal.Res.loadg(opts.resKey);
			var promise = settings.setPromise ? settings.setPromise(loadPromise) : loadPromise;
			if(promise.state() == 'pending'){
				poupContent && HdPortal.loading.show(poupContent, '#fff');
				var timeoutState = 'pending';
				var always = function(){
					poupContent && HdPortal.loading.hide(poupContent);
					if(settings.timeOut && settings.layout && promise.state() == 'resolved'){
						settings.layout('timeOut');
					}
				};
				if(settings.timeOut && $.type(settings.timeOut) != 'function'){
					var timeOutNum = settings.timeOut;
					settings.timeOut = function(fn){
						setTimeout(fn, timeOutNum);
					};
				}
				promise.fail(always).done(function(){
					if(!settings.timeOut || timeoutState == 'timeOut'){
						always();
					}else{
						timeoutState = 'done';
					}
					settings.layout && settings.layout();
				});
				settings.timeOut && settings.timeOut(function(){
					if(timeoutState == 'done'){
						always();
					}else{
						timeoutState = 'timeOut';
					}
				});
			}else if(promise.state() == 'resolved'){
				settings.timeOut && settings.layout && settings.layout('timeOut');
				settings.layout && settings.layout();
			}
			return close;
		}
	};

	/*
        author: hth
        功能说明：发布弹窗
    */
	HdPortal.showPublishBox = HdPortal.getAsynchPopup({
		resKey: 'publishGame',
		popup: function(load, game, verInfo, style){
			if(style === undefined){
				style = game.style;
			}
			if(!HdPortal.isStaff && $.inArray(style, [77, 84, 87]) != -1){ //支付版游戏
				if(!hdFai.checkBit(top.HdPortal.$data.profFlag, 0x4000) ){
					HdPortal.hdShowMsg('error', '该活动涉及支付功能，请先到个人中心开通公众号支付功能');
					return;
				}
				if(verInfo.realVer < HdPortal.hdVer.ZS){
					HdPortal.hdShowMsg('error', '该活动需要' + verInfo.zsName + '才能发布');
					return;
				}
			}
			var poupUpBox = HdPortal.popup({
				name: 'publishGame',
				hasBottom: false,
				title: '确认发布',
				styles: 'width: 800px;',
			});
			var loadSettings = {
				box: poupUpBox,
				layout: function(){
					top.HdPortal.showPublishBox.layout(poupUpBox, game, verInfo);
				}
			};
			if( $.type(game) == 'number' ){
				loadSettings.setPromise = function(promise){
					return $.when(promise, $.Deferred(function(defer){
						HdPortal.getGameInfo(game, function (result) {
							if(result.data) {
								game = result.data;
								defer.resolve();
							}else{
								HdPortal.hdShowMsg('error', navigator.onLine ? '系统繁忙，请稍后重试' : '网络无法连接，请检查网络');
								defer.reject();
							}
						});
					}));
				};
			}
			poupUpBox.data('loadPromise', load(loadSettings) );
			return poupUpBox;
		}
	});

	/**
     * 引导分享
     * @param {Object} game 发布/分享的游戏
     * @param {Number} type 1发布 0分享
     */
	HdPortal.showGuideShare = HdPortal.getAsynchPopup({
		resKey: 'guideShare',
		closeEvent: false,
		popup: function(load, game, type){
			var poup = HdPortal.getEditPoup('guideShare', function(poup){
				load({
					box: poup.box,
					layout: function(){
						poup.layout(top.HdPortal.showGuideShare.layout());
					}
				});
				return {title: false};
			}).show();
			load({
				layout: function(){
					top.HdPortal.showGuideShare.init(poup.box, game, type);
				}
			});
			return poup.box;
		}
	});

	/*
        功能说明：预览、渠道、宣传海报弹窗
    */
	HdPortal.showPreviewCanalBox = HdPortal.getAsynchPopup({
		resKey: 'previewCanal',
		popup: function (load, opts) {
			var poupUpBox = HdPortal.popup({
				name: 'previewCanal',
				hasBottom: false,
				width: 700, // 弹窗宽度会在 `tab` 点击时重置
				mustHideBg: true,
			}).addClass('noTitle');
			var posterDefKey = '$$posterDef';
			var game = opts.game;
			var loadSettings = {
				box: poupUpBox,
				layout: function(cmd){
					// if(cmd !== 'timeOut') return;
					poupUpBox.removeClass('noTitle');
					top.HdPortal.showPreviewCanalBox.layout(poupUpBox, opts);
				}
			};

			// TODO: 获取版本和认证信息
			if(game._setting[posterDefKey] === undefined) {
				loadSettings.setPromise = function (promise) {
					return $.when(promise, $.Deferred(function (defer) { // 获取海报默认数据
						var style = game.style;
						var modId = game.modId;
						var tplId = game._setting.tplId || game.templateId;

						$.ajax({
							url: HdPortal.versionURL + '/ajax/hdportal_h.jsp',
							data: {
								cmd: 'getGamePosterDef',
								tplId: tplId,
								modId: modId,
								style: style
							},
							dataType: 'json'
						}).then(function (response) {
							game._setting[posterDefKey] = response.posterDef;
							defer.resolve();
						}).fail(defer.reject);
					}));
				};
			}

			load(loadSettings);

			return poupUpBox;
		}
	});

	HdPortal.createInput = function (msg, titleName, className, style) { //生成输入框控件
		var msg = msg ? msg : '';
		return '<div class="input-row-baseLine"><span class="baseLineFlag">*</span><span class="baseLineTitle">' + titleName + '</span><input type="text" class="main-Input ' + className + '" placeholder="' + msg + '" style="' + style + '"></div>';
	};

	HdPortal.getHoverTipsBox = (function() {

		function HoverTips(isFixed){
			if(!(this instanceof HoverTips)){
				return new HoverTips(isFixed);
			}
			this.hoverTips = null;
			this.isFixed = !!isFixed;
		}

		HoverTips.fn = HoverTips.prototype;

		$.extend(HoverTips.fn, {
			/*  hover提示框
                obj: hover对象
                className可传: up,down， 默认up
                msg:文字内容
                opt: 特殊配置
                position: 位置，位于hover目标的坐标还是右边,默认left,可传:left,right
            */
			layout: function (obj, className, msg, settings, position, styleClassName) {

				var opts = {
					marginRight: 0,
					html: false,  //是否保留非p、br标签,保留则不encodeHtml
					outer: false, //弹窗是否出在最外层窗口
					scroll: true, //超出窗口是否滚动
					parent: null, //弹窗放置节点
					after: null,
					textClass: '',
				};

				var css = {
					'top': '',
					'left': '',
					'width': '',
					'max-width': '',
					'min-width': '',
					'height': '',
					'max-height': '',
				};

				$.extend(opts, settings);
				$.extend(css, settings);

				var objParent = opts.parent;
				var hoverTips;
				styleClassName = styleClassName ? styleClassName : '';

				if(msg instanceof $ && msg.hasClass('hoverTipsBox')){
					hoverTips = msg;
					opts.parent = true;
					hoverTips.addClass(className).addClass(styleClassName).show();
				}else{
					if(this.hoverTips){
						this.remove();
					}
					if(opts.outer) opts.parent = null; //弹窗出在最外层窗口，不允许传parent
					var jq = opts.outer ? top.$ : $;
					hoverTips = this.hoverTips = jq('<div class="hoverTipsBox ' + className + ' ' + styleClassName + '"><div class="text">' + msg + '</div><div class="tipsBoxArrow"></div></div>');
					if(!opts.parent){
						objParent = jq('body');
					}else if($.type(opts.parent) == 'string'){
						objParent = obj.closest(opts.parent);
					}else if($.type(opts.parent) == 'function'){
						objParent = opts.parent(obj, jq);
					}else if(opts.parent === true){
						objParent = obj.parent();
					}
					objParent.append(hoverTips);

					if(opts.textClass){
						hoverTips.find('.text').addClass(opts.textClass);
					}
				}
                
				var off = opts.parent ? obj.position(hoverTips.offsetParent()) : obj.offset();

				var win = window;
				if(opts.outer) {
					while(win.parent !== win && win.frameElement) {
						var newOff = win.parent.$(win.frameElement).offset();
						if(off && newOff) {
							off.left += newOff.left - win.$(win).scrollLeft();
							off.top += newOff.top - win.$(win).scrollTop();
						}
						win = win.parent;
					}
					win = top;
				}

				hoverTips.css({
					'width': css.width,
					'min-width': css['min-width'],
					'max-width': css['max-width'] || css.width,
					'height': css.height,
					'max-height': css['max-height'] || css.height,
				});

				var hoverTipsheight = hoverTips.outerHeight();
				var arrowLeft = arrowRight = '';
				var isVersion3 = $('body').hasClass('version3');

				if(!settings || settings.top === undefined){
					var tDeviation = isVersion3 ? 12 : 8;
					if(hoverTips.hasClass('down')) {
						css.top = off.top + obj.outerHeight() + tDeviation;
					}else{
						css.top = off.top - hoverTipsheight - tDeviation;
					}
				}

				if(!settings || settings.left === undefined){
					var lDeviation = isVersion3 ? 8 : 6.365;
					if(position == 'center') {
						css.left = off.left + obj.outerWidth() / 2 - hoverTips.outerWidth() / 2;
						arrowLeft = hoverTips.outerWidth() / 2 - opts.marginRight - lDeviation;
					}else if(position == 'right') {
						css.left = off.left + obj.outerWidth() - hoverTips.outerWidth() + 20;
						arrowRight = obj.width() / 2 - lDeviation + opts.marginRight + 20;
					}else{
						css.left = off.left - 20;
						arrowLeft = 20 + obj.width() / 2 - lDeviation - opts.marginRight;
					}
				}

				$.type(css.left) == 'number' && (css.left += opts.marginRight);

				if(!opts.parent && opts.scroll && css.top !== '') {
					var dev = 0, interstice = 5;
					if(className == 'down') {
						dev = css.top + hoverTipsheight - win.$(win.document).height() + interstice;
					}else if(css.top < interstice) {
						dev = interstice - css.top;
						css.top = interstice;
					}
					if(dev > 0) {
						var text = hoverTips.find('.text');
						text.height(text.height() - dev).css('overflow-y', 'scroll');
					}
				}

				hoverTips.css({
					'top': css.top,
					'left': css.left,
				});

				hoverTips.find('.tipsBoxArrow').css({
					'left': arrowLeft,
					'right': arrowRight
				});

				hoverTips.find('.downloadNorm').on('click', function(){
					window.location.href = HdPortal.versionURL + '/ajax/hdportal_h.jsp?cmd=downloadPicRule&_TOKEN=' + $('#_TOKEN').attr('value');
				});

				//弹窗定位之后，可能由于超出窗口导致换行，高度变化，要重新定位
				var diff = hoverTips.outerHeight() - hoverTipsheight;
				if(hoverTips.hasClass('up') && diff != 0) {
					hoverTips.css('top', css.top - diff);
				}

				opts.after && opts.after(hoverTips);
				return this;
			},

			showHtml: function (obj, className, msg, settings, position, styleClassName) {
				if(!this.isFixed || !this.hoverTips || arguments.length != 0){
					this._layout.apply(this, arguments);
				}
				this.hoverTips.show();
				return this.hoverTips;
			},

			show: function (obj, className, msg, settings, position, styleClassName) {
				var args = arrPro.slice.call(arguments);
				if(typeof msg === 'string' && !(settings && settings.html)) {
					args[2] = msg.replace(/<(?!\/?br|\/?p)[^<>]*>/ig, '');
				}
				return this._showHtml.apply(this, args);
			},

			hide: function(isRemove) {
				if(!this.hoverTips)return this;
				if(isRemove || !this.isFixed){
					this.remove();
				}else{
					this.hoverTips.hide();
				}
				return this;
			},

			remove: function () {
				if(!this.hoverTips)return this;
				this.hoverTips.remove();
				this.hoverTips = null;
				return this;
			},

			//与show方法参数相同，如果hover对象与箭头要指向的对象不同，第一个参数可以使用对象
			//{agent:hover节点,target:指向节点}
			hover: getFn(function (agent, args) {
				var _this = this;
				HdPortal.link.onMouseEvent(agent, function () {
					if(_this.isFixed && _this.hoverTips){
						_this.show();
						return;
					}
					args[0] = $(this);
					_this.show.apply(_this, args);
				}, function () {
					_this.hide();
				});
			}, 'hover'),

			//参数与hover方法一致，第一个参数可以对象时，agent可以为数组，即使用事件代理。
			//{agent:hover节点, target:指向节点, time:link间隔}
			link: getFn(function (agent, args, obj) {
				var _this = this;
				HdPortal.link(agent, 'enter', {
					enter: function (e, e1, e2) {
						if(_this.isFixed && _this.hoverTips){
							return _this.hoverTips;
						}
						if(obj.enter){
							var enterRt = obj.enter.call(this, e, e1, e2);
							if(enterRt === false) {
								return;
							}else if(enterRt instanceof $) {
								e1.addClass('tipsHover');
								return enterRt;
							}
						}
						var crrArgs = args.slice(0);
						//agent使用事件代理的，定位对象必须是当前hover的对象，target指向节点会失效
						//需要指定特殊节点，target必须是函数，通过函数返回值指定定位节点
						if($.isArray(agent)){
							crrArgs[0] = $(this);
							if(obj.target && $.type(obj.target) != 'function'){
								console.warn('HdPortal.hoverTipsBox.link target invalid');
							}
						}
						if(typeof args[0] == 'function') {
							var rt2 = args[0].call(this, e, e1, e2);
							if(rt2 === false) {
								return;
							}else if(rt2 instanceof $) {
								crrArgs[0] = rt2;
							}
						}
						e1.addClass('tipsHover');
						return _this.show.apply(_this, crrArgs);
					},
					leave: function (e, e1, e2) {
						e1.removeClass('tipsHover');
						if(obj.leave && obj.leave.call(this, e, e1, e2) === false){
							return;
						}
						if(e2 == _this.hoverTips) {
							_this.hide();
						}
					},
					time: obj.time,
					inertia: obj.inertia,
				});
			}, 'link'),
		});

		$.each(['show', 'showHtml', 'layout'], function(i, key) {
			var oldFn = HoverTips.fn[key];
			HoverTips.fn['_' + key] = oldFn;
			HoverTips.fn[key] = function(){
				var args = arrPro.slice.call(arguments);
				var obj = args[0];
				if(args.length == 2 && typeof args[1] == 'function'){
					args = args[1].call(obj[0], obj);
					if(args === false){
						return;
					}
				}else{
					for(var i = 1, n = args.length; i < n; i++) {
						if(typeof args[i] == 'function') {
							args[i] = args[i].call(obj[0], obj);
						}
					}
				}
				return oldFn.apply(this, args);
			};
		});

		return HoverTips;

		function getFn(fn, oneKey) {
			return function () {
				var args = arrPro.slice.call(arguments);
				var agent = args[0];
				var obj = {};
				if($.isPlainObject(agent)) {
					obj = agent;
					if(obj.agent) {
						args[0] = obj.target || obj.agent;
						agent = obj.agent;
					}
				}
				if(oneKey) {
					var agentTmp = agent;
					if($.isArray(agent)) {
						agentTmp = agent[0];
						oneKey += '_' + agent[1];
					}
					if(agentTmp.data('hoverTips_one_' + oneKey))return;
					agentTmp.data('hoverTips_one_' + oneKey, true);
				}
				fn.call(this, agent, args, obj);
			};
		}
	})();

	HdPortal.hoverTipsBox = HdPortal.getHoverTipsBox();

	/*
    msg: 显示的内容
    type值：1-没标题头部 2-有标题头部，有底部 3-没底部 4-没头部没底部 5 有标题头部 按钮名称不同
    titleName： 弹出框头部名称
    styles： 弹窗样式
    showMask：是否显示遮罩
    name： 生成弹出窗的ID，必须要传
    success：点击确定的回调
    isComfirmBox:是否后台所有确认提示
     */
	HdPortal.poupUpBox = function (msg, type, titleName, styles, showMask, name, success, isComfirmBox, contentStyles) { //确认弹出提示框
		var options = {};
		if(type == 1) {
			options.hasTitle = false;
		}else if(type == 2) {
		}else if(type == 3) {
			options.hasBottom = false;
		}else if(type == 4) {
			options.hasTitle = false;
			options.hasBottom = false;
		}else if(type == 5) {
			options.confirmBtnName = '保存';
		}

		options.name = name;
		options.content = msg;
		options.confirmFun = success;
		options.title = titleName;
		options.styles = styles;
		options.showMask = showMask;
		options.contentStyles = contentStyles;

		if(isComfirmBox) {
			options.isComfirmBox = true;
		}

		if(type == 1) {
			options.contentStyles = options.contentStyles ? options.contentStyles : '' + 'text-align: center;padding-top: 70px';
		}
		return HdPortal.popup(options);
	};

	/*
        互动新版弹窗
        options: 弹窗设置项，定义如下
        {
            name: 生成弹出窗的ID，必须要传,
            content: 显示的内容,
            hasTitle: 是否有头部,
            hasBottom: 是否有底部,
            title: 头部名称,
            width: 弹窗宽度,
            height: 弹窗高度,
            showMask: 是否显示遮罩,
            confirmBtnName: 确认按钮名称,
            cancelBtnName: 取消按钮名称,
            confirmFun: 点击确认按钮的回调,
            cancelFun: 点击取消按钮的回调,
            styles: 弹窗样式,
            contentStyles: 内容区样式,
            isOneBottomBtn: 是否只有一个底部按钮
        }
    */
	HdPortal.popup = function (options) { //确认弹出提示框
		var poupBox, bgMask;
		if(top !== window) {
			return top.HdPortal.popup.apply(this, arguments);
		}
		var opts = $.extend({
			name: '',
			content: '',
			hasTitle: true,
			title: '',
			width: 0,
			height: 0,
			showMask: true,
			confirmFun: null,
			cancelFun: null,
			closeFun: null,
			styles: '',
			contentStyles: '',
			hasAnimate: true,
			mustHideBg: false
		}, options);
		bgMask = top.$('.bg-mask');
		poupBox = top.$('#poup_' + opts.name);
		if(opts.showMask && bgMask.length == 0) {
			bgMask = $('<div class="bg-mask"></div>');
			top.$('body').append(bgMask);
		}
		if(!poupBox || poupBox.length == 0) {
			var titleStr = '';
			if(opts.hasTitle) {
				titleStr = '<div class="poupTitle">' + opts.title + '<div class="closeBtn"></div></div>';
			}
			var width = opts.width > 0 ? (' width:' + opts.width + 'px;') : '';
			var height = opts.height > 0 ? (' height:' + opts.height + 'px;') : '';
			var styles = opts.styles + width + height;
			poupBox =
                $('<div id="' + ('poup_' + opts.name) + '" class="poupBox confirmPoupBox ' + (opts.name) + '" style="' + styles + '">' +
                    titleStr +
                    '<div class="poupContent" style="' + opts.contentStyles + '">' + opts.content + '</div>' +
                    HdPortal.getPopupBottom(opts) +
                '</div>');

			top.$('body').append(poupBox);

			var closePoup = function () {
				var isHideBg = true;
				if(!opts.mustHideBg && $('.poupBox:visible').length > 1) {
					isHideBg = false;
				}
				HdPortal.hoverTipsBox.hide();//hover 消失
				var hide = function () {
					if(isHideBg) {
						bgMask.hide();
						poupBox.trigger('poupBox_hide_end');
						poupBox.remove();
					}else{
						poupBox.trigger('poupBox_hide_end');
						poupBox.remove();
						$('.poupBox:visible').last().css({'z-index': 1000});
					}
				};
				isHideBg && bgMask.removeClass('bg-mask-animate');
				poupBox.removeClass('poup-box-animate poup-box-noAnimate');
				poupBox.trigger('poupBox_hide', [opts.hasAnimate]);
				if(opts.hasAnimate) {
					setTimeout(hide, 300);
				}else{
					hide();
				}
				opts.closeFun && opts.closeFun(poupBox, bgMask);
			};

			poupBox.on('click', '.confirmBtn', function () {
				poupBox.trigger('poupBox_confirm');
				if($(this).hasClass('disabled')) {
					return;
				}
				if(opts.confirmFun) {
					var rt;//保存callback的返回值
					if($.isArray(opts.confirmFun)) {
						var arg = [];
						$.each(opts.confirmFun, function (index, item) {
							index > 0 && arg.push(item);
						});
						rt = opts.confirmFun[0].apply(this, arg);
					}else{
						rt = opts.confirmFun(poupBox, bgMask);
					}
					if(rt == 'stop') {
						return;
					}
				}
				//poupBox.find(".cancleBtn").trigger('click',['confirm']);
				closePoup();
			});

			poupBox.on('click', '.cancleBtn,.closeBtn', function (event) {
				poupBox.trigger('poupBox_close');
				var rt;
				var cancle = poupBox.data('poupBox_cancle');
				if(cancle) {
					rt = cancle(poupBox, bgMask);
					poupBox.removeData('poupBox_cancle');
				}else if(opts.cancelFun) {
					rt = opts.cancelFun(poupBox, bgMask);
				}
				if(rt == 'stop') {
					return;
				}
				closePoup();
			});
		}
		$('.poupBox:visible').not(poupBox).css({'z-index': 998});
		poupBox.add(bgMask).show();
		bgMask.addClass('bg-mask-animate');
		poupBox.addClass(opts.hasAnimate ? 'poup-box-animate' : 'poup-box-noAnimate');
		return poupBox;
	};

	HdPortal.getPopupBottom = function(options){
		var opts = $.extend({
			hasBottom: true,
			confirmBtnName: '确认',
			cancelBtnName: '取消',
			isComfirmBox: false,
			isOneBottomBtn: false
		}, options);
		var bottomStr = '';
		if(opts.hasBottom){
			var cancleClass1 = 'main-Button';
			var cancleClass2 = 'main-Button-white';
			if( $('body').hasClass('version3') ){
				cancleClass1 = cancleClass2 = 'main-Button-blue';
			}
			if(opts.isOneBottomBtn) {
				bottomStr = '<div class="poupBottom">' +
                    '<div class="poupBtn main-Button confirmBtn">' + opts.confirmBtnName + '</div>' +
                    '</div>';
			}else if(opts.isComfirmBox) {
				bottomStr = '<div class="poupBottom">' +
                    '<div class="poupBtn main-Button confirmBtn">' + opts.confirmBtnName + '</div>' +
                    '<div class="poupBtn ' + cancleClass1 + ' cancleBtn">' + opts.cancelBtnName + '</div>' +
                    '</div>';
			}else{
				bottomStr = '<div class="poupBottom">' +
                    '<div class="poupBtn main-Button confirmBtn">' + opts.confirmBtnName + '</div>' +
                    '<div class="poupBtn ' + cancleClass2 + ' cancleBtn">' + opts.cancelBtnName + '</div>' +
                    '</div>';
			}
		}
		return bottomStr;
	};

	/*
        author: hth
        功能说明：同步节点宽度
    */
	HdPortal.syncWidth = function(elements, margin){
		margin = margin || 1;
		var maxWidth = 0;
		elements.each(function(index, el) {
			var w = $(el).width() + margin;
			w > maxWidth && (maxWidth = w);
		});
		elements.width(maxWidth);
		return maxWidth;
	};

	/*
        author: hth
        功能说明：同步节点宽度（使用outerWidth计算最大宽度，更加准确）
    */
	HdPortal.syncOuterWidth = function(elements){
		var maxWidth = 0;
		var ows = [];
		elements.each(function(index) {
			var ow = $(this).outerWidth();
			ow > maxWidth && (maxWidth = ow);
			ows.push(ow);
		});
		elements.each(function(index) {
			$(this).width( $(this).width() + 1 + maxWidth - ows[index] );
		});
		return maxWidth;
	};

	HdPortal.searchInputBox = function (placeholderMsg, obj, showClearBtn, style, callback, optionsOther) {
		var searchBox = $('<div class="searchBoxCont" style="' + style + '">' +
            '<input type="text" class="input" placeholder="' + placeholderMsg + '">' +
            '<div class="searchBtn"></div>' +
            '<div class="clearBtn hide"></div>' +
        '</div>');
		if(typeof obj == 'function'){
			obj(searchBox);
		}else if(obj){
			obj.after(searchBox);
		}else{
			$('body').append(searchBox);
		}
		searchBox.on('input focus', 'input', function () {
			searchBox.add($(this)).css('border-color', '#ccc');
			//!showClearBtn && $(this).siblings('.searchBtn').css('background-position', '-154px -488px');
		}).on('input propertychange', '.input', function () {
			if(showClearBtn) {
				if($(this).val().length == 0) {
					$(this).siblings('.searchBtn').show();
					$(this).siblings('.clearBtn').hide();
				}else{
					$(this).siblings('.searchBtn').hide();
					$(this).siblings('.clearBtn').show();
				}
			}
		}).on('keyup', '.input', function () {
			optionsOther && optionsOther.keyUp && optionsOther.keyUp($(this).val());
			showClearBtn && callback && callback($(this).val().replace(/\s+/g, ''));
		}).on('blur', '.input', function () {
			searchBox.add($(this)).css('border-color', '#e7e7e7');
			$(this).siblings('.searchBtn').css('background-position', '-110px -488px');
		}).on('keydown', function (event) {
			if(event.which === 13) {
				searchBox.find('.input').click();
			}
		});

		searchBox.on('click', '.clearBtn', function () {
			$(this).siblings('.input').val('');
			callback && callback($(this).siblings('.input').val().replace(/\s+/g, ''));
			searchBox.find('.searchBtn').show();
			$(this).hide();
		});

		searchBox.on('keydown', function (event) {
			if(event.which === 13) {
				searchBox.find('.searchBtn').click();
			}
		});
		searchBox.on('click', '.searchBtn', function () {
			!showClearBtn && callback && callback($.trim(searchBox.find('.input').val()));
		});
		return searchBox;
	};

	/*
    *参数说明：
    *options：要生成下拉的数据（array，object，string）
    *insertObj: 要生成下拉的节点（jQuery对象）
    *clickFn：点击下拉项的回调（function）
	*hasSearchBox：是否有搜索框（boolean），使用该参数时只能传一个包含该参数的对象来作为函数的参数
	*initFn: 初始化下拉框之后的回调
    */
	HdPortal.createDropDownBox = function (options, insertObj, callback, hasSearchBox, initFn) {
		var $drop1, $drop2, subStr = '', opts = {};
		//整合参数
		if(arguments.length === 1 && $.type(arguments[0]) === 'object'){
			opts = $.extend({
				options: [],
				insertObj: null,
				clickFn: null,
				hasSearchBox: false
			}, arguments[0]);
		}else{
			opts = {
				options: options,
				insertObj: insertObj,
				clickFn: callback,
				hasSearchBox: hasSearchBox,
				initFn: initFn,
			};
		}
		//转换成统一的对象数组结构
		var tempOptions = [];
		$.each(opts.options, function (index, item) {
			var tempItem = null;
			if($.isArray(item)) {
				tempItem = {
					val: item[0],
					dataVal: item[1]
				};
			}else if(typeof item === 'string') {
				tempItem = {
					val: item,
					dataVal: item
				};
			}else if(typeof item === 'object') {
				tempItem = item;
			}
			if(tempItem != null) {
				tempOptions.push(tempItem);
			}
		});

		$drop1 = opts.insertObj.find('.dropDownBox_main');
		$drop2 = opts.insertObj.find('.dropDownBox_sub');
		if($drop1.length == 0) {
			$drop1 = $('<div class="dropDownBox_main"><div class="txt" data-value="' + hdFai.encodeHtml(tempOptions[0].dataVal) + '">' + (hdFai.encodeHtml(tempOptions[0].val)) + '</div><span class="icon dropDownArrow"></span></div>');
			opts.insertObj.append($drop1);
		}
		if($drop2.length == 0) {
			$drop2 = $('<div class="dropDownBox_sub hide"></div>');
			opts.insertObj.append($drop2);
			$drop2.html('');
			opts.hasSearchBox && (subStr += '<div class="searchBox"><input class="searchBoxInput" type="text" maxlength="6" size="13" placeholder="请输入搜索"></div>');
			$.each(tempOptions, function (index, item) {
				subStr += '<div class="options' + (item.disabled ? ' disable' : '') + '" data-value="' + hdFai.encodeHtml(item.dataVal) + '">' + hdFai.encodeHtml(item.val) + '</div>';
			});
			$drop1.on('click', function () {
				if($(this).hasClass('checked')) {
					$(this).removeClass('checked');
					$drop2.hide();
				}else{
					$(this).addClass('checked');
					if(opts.hasSearchBox){
						subStr = '';
						$('.dropDownBox_sub input').val('');
						$.each(tempOptions, function (index, item) {
							subStr += '<div class="options' + (item.disabled ? ' disable' : '') + '" data-value="' + hdFai.encodeHtml(item.dataVal) + '">' + hdFai.encodeHtml(item.val) + '</div>';
						});
						$drop2.find('.options').remove();
						$drop2.append(subStr);
					}
					$drop2.show();
				}

			});
			$drop2.append(subStr);
			opts.initFn && opts.initFn.call($drop2);
			$drop2.on('click', '.options', function () {
				if($(this).hasClass('disable')) {
					return;
				}
				$drop2.hide();
				$drop1.removeClass('checked');
				$drop1.find('.txt').attr('data-value', $(this).attr('data-value') ? $(this).attr('data-value') : drop1.find('.txt').attr('data-value'));
				$drop1.find('.txt').text($(this).text());
				opts.clickFn && opts.clickFn.call(this, $(this).attr('data-value') ? $(this).attr('data-value') : $(this).text());
			});

			$drop2.on('input propertychange', '.searchBoxInput', function () {
				var data = $('.dropDownBox_sub input').val().trim();
				subStr = '';
				if(data == ''){
					$.each(tempOptions, function (index, item) {
						subStr += '<div class="options' + (item.disabled ? ' disable' : '') + '" data-value="' + hdFai.encodeHtml(item.dataVal) + '">' + hdFai.encodeHtml(item.val) + '</div>';
					});
					$drop2.find('.options').remove();
				}else{
					$.each(tempOptions, function (index, item) {
						var matchIndex = item.val.indexOf(data);
						if(matchIndex >= 0 && index > 0){
							var name = '';
							var realLength = HdPortal.getHanziSize(item.val);
							if(realLength > 14 && matchIndex > 2){
								//因为字符串太长，而导致匹配字被隐藏，所以只截取匹配字的前面一段+后面显示
								var suffixLength = item.val.length - (matchIndex + data.length) > 2 ? 0 : 2;
								var length = 4 - data.length + suffixLength;
								name = '...' + hdFai.encodeHtml(item.val.slice(matchIndex - length, matchIndex)) + '<span>' + hdFai.encodeHtml(data) + '</span>' + hdFai.encodeHtml(item.val.slice(matchIndex + data.length, item.val.length));
							}else{
								name = hdFai.encodeHtml(item.val.slice(0, matchIndex)) + '<span>' + hdFai.encodeHtml(data) + '</span>' + hdFai.encodeHtml(item.val.slice(matchIndex + data.length, item.val.length));
							}
							subStr += '<div class="options' + (item.disabled ? ' disable' : '') + '" data-value="' + hdFai.encodeHtml(item.dataVal) + '">' + name + '</div>';
						}
					});
					$drop2.find('.options').filter('[data-value!=-1]').remove();
				}
				$drop2.append(subStr);
			});

			$('body').off('hideDropDownBox').on('click.hideDropDownBox', function (e) {
				if(opts.insertObj.has(e.target).length == 0) {
					$drop2.hide();
					$drop1.removeClass('checked');
				}
			});
		}
	};

	HdPortal.parseInt = function (val, def) {
		val = parseInt(val);
		if(arguments.length > 1 && isNaN(val)) {
			return def;
		}
		return val;
	};

	/*
        author: hth
        功能说明：返回只执行一次的函数
    */
	HdPortal.callOnce = function(fn, args){
		var called = false;
		return function() {
			if(called)return;
			called = true;
			fn.apply(this, $.isArray(args) ? args : arguments);
		};
	};

	/*
    author: hth
    功能说明：加载iframe回调
*/
	(function(){
		var key = '_iframeCb';
		var fireKey = '_hasFire';

		HdPortal.onIframe = function(iframe, type, cb) {
			var dataKey = key + '_' + type;
			if(arguments.length == 2){
				cb = type;
				type = iframe;
				dataKey = key + '_' + type;
				if(window[fireKey + dataKey]){
					cb && cb();
				}else{
					$(window).one(dataKey, cb);
				}
				return;
			}
			if(getIframeWinAttr(iframe, fireKey + dataKey)){
				cb && cb(iframe[0]);
				return;
			}
			var callBacks = iframe.data(dataKey);
			if(!callBacks){
				iframe.data(dataKey, callBacks = $.Callbacks('unique'));
				if(type == 'load'){
					iframe.on('load', function callback(){
						fireIframeCb(iframe, 'ready');
						iframe.off('load', callback);
					});
				}
			}
			callBacks.add(cb);
		};

		$(function(){
			if(window === parent)return;
			tryFn(function(){
				fireIframeCb(parent.$(window.frameElement), 'ready');
			});
		});

		function fireIframeCb(iframe, type) {
			var dataKey = key + '_' + type;
			var callBacks = iframe.data(dataKey);
			if(callBacks){
				callBacks.fireWith(iframe[0]);
				iframe.removeData(dataKey);
			}
			trigger(iframe, dataKey, function(win) {
				win[fireKey + dataKey] = true;
			});
		}

		HdPortal.safeReady = function (iframe, cb, timeOut) {
			HdPortal.onIframe(iframe, 'ready', handleTimeOut(cb, timeOut));
		};

		HdPortal.safeLoad = function (iframe, cb, timeOut) {
			if(hdFai.isMozilla()) {
				return setTimeout(call, 300);
			}
			HdPortal.onIframe(iframe, 'load', handleTimeOut(cb, timeOut));
		};

		function trigger(iframe, key, cb) {
			tryFn(function(){
				var win = iframe[0].contentWindow;
				win && win.$ && win.$(win).trigger(key);
				cb && cb(win);
			});
		}

		function getIframeWinAttr(iframe, key) {
			return tryFn(function() {
				return iframe[0].contentWindow[key];
			});
		}

		function tryFn(cb, err){
			try{
				return cb();
			}catch(e) {
				if(err){
					err(e);
				}else{
					console.warn(e);
				}
			}
		}

		function handleTimeOut(cb, timeOut){
			if(timeOut){
				cb = HdPortal.callOnce(cb);
				setTimeout(cb, timeOut);
			}
			return cb;
		}

	})();
    
	HdPortal.setUserCardData = function (e2, data, isCheat) {
		var noHeadImgUrl = HdPortal.resRoot + '/image/noheadimg.jpg';
		var wxInfo = data.info;
		if(!wxInfo){
			wxInfo = {};
		}else if(typeof wxInfo == 'string'){
			wxInfo = $.parseJSON(wxInfo || '{}');
		}
		var headImg = wxInfo.headImg;
		var nickName = data.name;
		var sex = wxInfo.sex;
		var playerId = data.id;
		var gameId = data.gameId;
		var ip = wxInfo.ip;
		var ipInfo;
		var flag = data.flag;
		var isCheat = data.ischeat;
		if(!wxInfo.ipProvince && !wxInfo.ipCity) {
			$.ajax({
				type: 'post',
				url: HdPortal.versionURL + '/ajax/hdportal_h.jsp',
				data: 'cmd=getAreaByIp&ip=' + ip + '&playerId=' + playerId + '&gameId=' + gameId,
				error: function (e) {
					e2.find('.ip').text(ip || '');
				},
				success: function (data) {
					ipInfo = JSON.parse(data);
					if(ipInfo.provice) {
						if(ipInfo.city == undefined || ipInfo.city == ipInfo.provice || !ipInfo.city) {
							ipInfo.city = '';
						}
						ip = ip + ' ' + ipInfo.provice + ipInfo.city;
					}	
					e2.find('.ip').text(ip || '');
				}
			});
		}else{
			if(wxInfo.ipCity == undefined || !wxInfo.ipCity || wxInfo.ipCity == wxInfo.ipProvince) {
				wxInfo.ipCity = '';
			}
			ip = ip + ' ' + wxInfo.ipProvince + wxInfo.ipCity;
			e2.find('.ip').text(ip || '');
		}

		if(wxInfo.provinceForGPS) {
			if(!wxInfo.cityForGPS || wxInfo.cityForGPS == undefined || wxInfo.provinceForGPS == wxInfo.cityForGPS) {
				wxInfo.cityForGPS = '';
			}
			e2.find('.gps').text(wxInfo.provinceForGPS + wxInfo.cityForGPS);
			e2.find('.gps').parent().show();
		}else{
			e2.find('.gps').parent().hide();
		}
		e2.find('.headImg').attr('src', headImg || noHeadImgUrl);
		e2.find('.nickName').text(nickName || '');
		e2.find('.playerId').text(playerId || '');
		// e2.find('.wxArea').text(wxArea||'未知');
		// e2.find('.ip').text(ip||'');
		e2.find('.sexIcon').removeClass('sexIconM');
		e2.find('.sexIcon').removeClass('sexIconF');
		e2.find('.sexIcon').removeClass('sexIconNone');
		if(sex == '1') {
			e2.find('.sexIcon').addClass('sexIconM');
		}else if(sex == '2') {
			e2.find('.sexIcon').addClass('sexIconF');
		}else{
			e2.find('.sexIcon').addClass('sexIconNone');
		}
		if(isCheat) {
			e2.find('.cheatHint').show();
		}else{
			e2.find('.cheatHint').hide();
			console.log(hdFai.checkBit(flag, 0x20));
			if(hdFai.checkBit(flag, 0x20)) { //HdPlayerDef.Flag.ZL_FLUSH_MAYBE
				e2.find('.zlFlushCheat').show();
			}else{
				e2.find('.zlFlushCheat').hide();
			}
		}
	};

	HdPortal.changeFrameHeight = function (iframe) {
		try{
			iframe.height = iframe.contentWindow.documentElement.clientHeight;
		}catch(e) {
			console.warn('changeFrameHeight iframe not ready —— ' + e);
		}
	};

    
	HdPortal.getGameHost = function(style){
		return this.$data.gameHost;
	};

	//获取游戏链接
	HdPortal.getGameUrl = function (id, style, createTime, isOpenStrongAtt, uriToken, hasKqFans, hasWXAuth) {
		var data = this.$data;
		var gameHost = HdPortal.getGameHost(style);
		var profFlag = top.HdPortal.$data.profFlag;
		if(top.HdPortal && profFlag !== undefined) {
			hasKqFans = hdFai.checkBit(profFlag, 0x8); //HdProfDef.Flag.WX_KQ_OEPN
			hasWXAuth = hdFai.checkBit(profFlag, 0x4); //HdProfDef.Flag.WX_AUTHORIZE_OEPN
		}
		var url = data.httpStr + '://' + gameHost + '/' + data.aid + '/' + uriToken + '/load.html?style=' + style;

		if(gameHost.indexOf('ppp.cc') >= 0) {		
			url = data.httpStr + '://hd.ppp.top/' + data.aid + '/' + uriToken + '/load.html?style=' + style;
		}
		// console.log(url);
		if(hasKqFans && isOpenStrongAtt && !hasWXAuth) {
			if(createTime < 1481029200000) {
				url += '&isOfficialLianjie=true';
			}
		}
		return url;
	};

	HdPortal.openNew3EditActive = function(gameUrl){
		if( HdPortal.getLocalStorage('openNewTab') ){
			window.open(gameUrl);
		}else{
			top.location = gameUrl;
		}
	};

	//清除iframe，释放内存
	HdPortal.clearIframe = function (iframe) {
		if(iframe) {
			iframe[0].src = 'about:blank';
			try{
				var win = iframe[0].contentWindow;
				win.document.write('');
				win.document.clear();
				win.$(win).trigger('hd_clearDocument');
			}catch(e) {
			}
		}
	};

	/*
        author: hth
        功能说明：异步加载资源文件
    */
	HdPortal.Res = (function(){
		var IS_CSS_RE = /\.css(?:\?|$)/i,
			//webkit旧内核做特殊处理
			isOldWebKit = +navigator.userAgent.replace(/.*(?:AppleWebKit|AndroidWebKit)\/?(\d+).*/i, '$1') < 536,
			doc = document,
			head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
			getErrDeferred = function(type, msg){
				console.warn('Res_' + type, msg);
				return $.Deferred().reject(type, msg);
			},
			setConf = function(key, val){
				$.extend(Res.conf[key] || (Res.conf[key] = {}), $.type(val) == 'string' ? {val: val} : val);
			},
			Res = {
				conf: {},
				groups: {},
				cache: {},
				config: function(confData){
					$.each(confData, setConf);
					return this;
				},
				setGroup: function(groupData){
					$.each(groupData, function(gkey, val){
						if($.isArray(val)){
							Res.groups[gkey] = val;
						}else if($.isPlainObject(val)){
							var arr = [];
							$.each(val, function(key, gVal){
								if(gVal.charAt(0) == '@'){
									if(gVal == '@g'){
										var group = Res.groups[key];
										if(group){
											arrPro.push.apply(arr, group);
										}
									}else{
										arr.push(key);
									}
								}else{
									key = gkey + '_' + key;
									setConf(key, gVal);
									arr.push(key);
								}
							});
							Res.groups[gkey] = arr;
						}else if($.type(val) == 'string'){
							setConf(gkey, val);
							Res.groups[gkey] = [gkey];
						}
					});
					return this;
				},
				checkLoad: function(prefix, id, cb){
					var key = prefix + '_' + id;
					var promise = this.cache[key];
					if(!promise){
						promise = cb();
						if(promise.state() !== 'rejected'){
							this.cache[key] = promise;
							promise.fail(function(){
								delete Res.cache[key];
							});
						}
					}
					return promise;
				},
				loadg: function(groupName){
					var group = this.groups[groupName]; 
					if(!group)return getErrDeferred('empty', 'loadg:' + groupName);
					return this.checkLoad('loadg', groupName, function(){
						return Res.load(group);
					});
				},
				loadUrl: function(id, url){
					url = url || id;
					var data = Res.conf[id];
					if(!data || data.val !== url){
						setConf(id, url);
						if(data){
							delete this.cache['load_' + id];
							console.warn('这个id已经存在,当前操作将覆盖旧链接,id=' + id);
						}
					}
					return this.load(id);
				},
				load: function(id){
					if($.isArray(id)){
						return $.when.apply($, $.map(id, function(val) {
							return Res.load(val);
						}));
					}
					return this.checkLoad('load', id, function(){
						var data = Res.conf[id];
						if(!data)return getErrDeferred('empty', 'load:' + id);
						if($.type(data.val) == 'function'){
							return data.val();
						}
						var defer = $.Deferred();
						var step = 1, maxStep = 2; //加载逻辑最多跑两次
						if(data.require){
							Res.load(data.require).then(load, function(type, msg){
								console.warn('Res_requireErr_' + data.require, type, msg);
								defer.reject(type == 'empty' ? 'empty' : 'require');
							});
						}else{
							load();
						}
						return defer.promise();

						function load(){
							var isCSS = IS_CSS_RE.test(data.val);
							var node = doc.createElement(isCSS ? 'link' : 'script');
							loadRes(node, isCSS, function(isResolve, type, msg){
								if(isResolve){
									defer.resolve();
								}else{
									$(node).remove();
									if(++step <= maxStep){
										load();
									}else{
										defer.reject(type, msg);
									}
								}
							});
							node[isCSS ? 'href' : 'src'] = data.val;
							if(isCSS) {
								node.rel = 'stylesheet';
							}else{
								node.async = true;
							}
							head.appendChild(node);
						}
					});
				}
			};

		return Res;

		function loadRes(node, isCSS, callback){
			var supportOnload = 'onload' in node,
				timeOut = 30, //轮询超时时间，单位秒 
				pollStartTime; //轮询开始时间
                
			// for Old WebKit and Old Firefox
			if( isCSS && ( isOldWebKit || !supportOnload) ) {
				// Begin after node insertion
				setTimeout(function() {
					pollStartTime = new Date().getTime();
					pollCss(node, 0);
				}, 1);
				return;
			}

			if(supportOnload){
				node.onload = function(){
					onload(true);
				};
				node.onerror = function(msg) {
					// 加载失败(404)
					onload(false, msg);
				};
			}else{
				node.onreadystatechange = function() {
					if(/loaded|complete/.test(node.readyState)) {
						onload(true);
					}
				};
			}

			function onload(isResolve, msg) {
				// 确保只跑一次下载操作
				node.onload = node.onerror = node.onreadystatechange = null;
				// 清空node引用，在低版本IE，不清除会造成内存泄露
				node = null;
				callback(isResolve, 'load', msg);
			}
            
			function pollCss(node, step){

				// 轮询超时
				var time = pollStartTime - new Date().getTime();
				if(time > timeOut * 1000){
					callback(false, 'timeOut', time);
					return;
				}

				var sheet = node.sheet,
					isLoaded;

				if(isOldWebKit){
					// for WebKit < 536
					if(sheet){
						isLoaded = true;
					}
				}else if(sheet){
					// for Firefox < 9.0
					try{
						if(sheet.cssRules){
							isLoaded = true;
						}
					}catch(ex){
						// 火狐特殊版本，通过特定值获知是否下载成功
						// The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
						// to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
						// in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
						if(ex.name === 'NS_ERROR_DOM_SECURITY_ERR'){
							isLoaded = true;
						}
					}
				}

				setTimeout(function() {
					if(isLoaded){
						// 延迟20ms是为了给下载的样式留够渲染的时间
						callback(true);
					}else{
						pollCss(node, step + 1);
					}
				}, 20);
			}
		}
	})();

	//异步加载css
	HdPortal.asyncCss = {
		load: function(id, cssUrl, callback){
			HdPortal.Res.loadUrl(id, cssUrl).then(callback);
			return this;
		}
	};

	HdPortal.getGameInfo = function (id, callback) {
		$.ajax({
			type: 'post',
			url: HdPortal.versionURL + '/ajax/hdportal_h.jsp',
			data: 'cmd=getGameInfo&gameId=' + id,
			error: function (e) {
				console.log('getGameInfo arguments: ', arguments);
				callback && callback({success: false, msg: e});
			},
			success: function (data) {
				callback && callback($.parseJSON(data));
			}
		});
	};

	HdPortal.easeInOut = function (t, b, c, d) {
		if((t /= d / 2) < 1)return c / 2 * t * t + b;
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	};

	/*
        author: hth
        功能说明：错误处理工具
    */
	HdPortal.getERR = function (setting) {
		var opts = $.extend({
			parentDef: 'body',  //默认容器
			onCheckErr: null,   //检测错误回调
			checkBox: 'body',   //检测错误范围
			setMargin: false,   //是否设置margin-left对齐
		}, setting);
		opts.parentDef = $(opts.parentDef);

		var eIndex = 0;
		var NAME_REG = /^\{([\w,-.]+)\}(\||$)(.*)/;
		var NAME_DEF = '_defaultName';
		var deferListeners = null;
        
		var parseName = function (msg, callback) {
			var match = NAME_REG.exec(msg);
			var data = {
				match: false,
				name: '',
				priority: 0,
				msg: msg
			};
			if(match) {
				var setting = match[1].split(',');
				data.name = setting[0];
				data.priority = parseInt(setting[1]);
				if(isNaN(data.priority)) {
					data.priority = 0;
				}
				data.msg = match[2] == '|' ? match[3] : null;
				data.match = true;
				callback && callback(data);
			}
			return data;
		};

		/*
        els     ：出错的input集合
        msg     ：错误提示语
        parents ：input的定位容器
        */
		var addErr = function (els, msg, parents, style, position) {
			var namespace = '';
			var priority = 0;
			style = style || '';
			parents = parents || opts.parentDef;
			els = getJq(els);
			if(els.length == 0)return;

			parseName(msg, function (data) {
				namespace = data.name;
				priority = data.priority;
				msg = data.msg;
			});

			if(/^_/.test(namespace)) {
				throw'命名空间请不要使用"_"前缀，"_"前缀预留给特殊指令';
			}
			if(namespace.length === 0) {
				namespace = NAME_DEF;
			}
			var errNum = 0;
			els.each(function () {
				var el = $(this);
				var hdList = el.data('ERR_errList');
				!hdList && el.data('ERR_errList', hdList = hdFai.HdList('name'));
				var data = hdList.getByName(namespace);
				!data && hdList.add(data = {name: namespace, _index: eIndex++});
				if(typeof msg === 'string' && msg.length > 0) {
					if(!data.errMsg) {
						data.errMsg = $('<div class="inputErrMsg ERR_errMsg">' + msg + '</div>');
						var isInit = true;
					}else{
						data.errMsg.html(msg);
					}
				}
				if(isInit || priority !== data.priority) {
					data.priority = priority;
					updateErrMsgByPriority(hdList);
				}
				if(data.errMsg) {
					if(isInit || parents !== data.parents || style !== data.style) {
						var crrStyle = style;
						if(parents.length > 0 && opts.setMargin && (!crrStyle || crrStyle.indexOf('margin-left') == -1)) {
							var left = el.offset().left - parents.offset().left - parseFloat(parents.css('padding-left'));
							crrStyle = 'margin-left:' + left + 'px;' + crrStyle;
						}
						data.errMsg.attr('style', crrStyle);
					}
					if(typeof position == 'function') {
						if(isInit || String(position) !== String(data.position)) {
							position.call(el[0], data.errMsg);
						}
					}else if(isInit || position !== data.position) {
						if(position instanceof $) {
							position.after(data.errMsg);
						}else if(position == '$sef') {
							el.parent().append(data.errMsg);
						}else{
							el.parent().after(data.errMsg);
						}
					}
					data.parents = parents;
					data.style = style;
					data.position = position;
				}
				if(!el.hasClass('ERR_hasErr')) {
					el.addClass('inputErr');
					el.addClass('ERR_hasErr');
					errNum++;
				}
			});
			errNum > 0 && checkErrAsynch(els);
		};

		var removeErr = function (els, name) {
			els = getJq(els);
			if(els.length == 0)return;
			if(typeof name != 'string' || name.length == 0) {
				name = NAME_DEF;
			}
			var errNum = 0;
			els.filter('.ERR_hasErr').each(function () {
				var el = $(this);
				var hdList = el.data('ERR_errList');
				if(hdList && hdList.size() > 0){
					if(name === '_all') {
						hdList.forEach(function (v) {
							v.errMsg && v.errMsg.remove();
						});
						hdList.empty();
					}else{
						var val = hdList.not(name);
						if(val && val.errMsg) {
							val.errMsg.remove();
							updateErrMsgByPriority(hdList);
						}
					}
					if(hdList.size() === 0) {
						errNum++;
					}
				}
				if(!hdList || hdList.size() === 0) {
					el.removeClass('inputErr').removeClass('ERR_hasErr');
				}
			});
			errNum > 0 && checkErrAsynch(els);
		};

		//parents 容器
		//isLock boolean  加锁或解锁
		//strict
		var lockErr = function (parents, isLock, strict) {
			if(parents.length == 0)return;
			parents.toggleClass('ERR_lock', isLock);
			checkErrAsynch(parents);
			if(strict) {
				parents.toggleClass('ERR_lock_strict', isLock);
			}
		};

		var hasErr = function (parent, unLock) {
			return getErr(parent, unLock).length;
		};

		var getErr = function (parent, unLock) {
			parent = parent || $(opts.checkBox);
			var errs = parent.find('.ERR_hasErr');
			if(!unLock) {
				errs = errs.not(function (i) {
					return $(this).closest('.ERR_lock').length > 0;
				});
			}
			return errs;
		};

		var checkEls = null;
		var checkErrAsynch = $.throttle({
			sync: function(step, args) {
				if(step == 0){
					deferListeners = [];
					checkEls = args[0];
				}else{
					checkEls = checkEls.add(args[0]);
				}
			},
			defer: function() {
				opts.onCheckErr && opts.onCheckErr(errInfo, checkEls);
				while(deferListeners.length > 0){
					deferListeners.shift()();
				}
				deferListeners = checkEls = null;
			}
		});

		var updateErrMsgByPriority = function (hdList) {
			if(hdList.size() === 0)return;
			if(hdList.size() === 1) {
				hdList.get(0).errMsg && hdList.get(0).errMsg.removeClass('hideImp');
				return;
			}
			var sortList = hdList.filter(function (v) {
				return v.errMsg;
			}).sort(function (a, b) {
				return a.priority === b.priority ? (b._index - a._index) : (b.priority - a.priority);
			});
			sortList.forEach(function (v, i) {
				if(i === 0) {
					v.errMsg.removeClass('hideImp');
				}else{
					v.errMsg.addClass('hideImp');
				}
			});
		};

		var getJq = function (selecter) {
			if(typeof selecter == 'string') {
				selecter = $(selecter);
			}
			return selecter;
		};

		var errInfo = {
			hasErr: hasErr,
			getErr: getErr,
			addErr: addErr,
			removeErr: removeErr,
			lockErr: lockErr,
			checkErr: checkErrAsynch,
			toggleErr: function () {
				var args = arrPro.slice.call(arguments);
				if(args.shift()) {
					this.addErr.apply(this, args);
				}else{
					this.removeErr(args[0], parseName(args[1]).name);
				}
			},
			defer: function(fn) {
				if(deferListeners){
					deferListeners.push(fn);
				}else{
					fn();
				}
			}
		};

		return errInfo;
	};

	/*
        author: hth
        功能说明：弹窗工具
    */
	HdPortal.getEditPoup = (function () {
		var selectors = {
			title: '.poupTitle .text',
			tips: '.poupTitle .titleTips',
			topBar: '.poupContent .topBar',
			info: '.poupContent .infoBox',
			bottom: '.editBottomBox',
		};

		var cache = {};

		//id : 弹窗Id
		//layoutData : 初始化layout数据，第一次调用show的时候使用
		function Poup(id, layoutData){
			if(!(this instanceof Poup)){
				return new Poup(id, layoutData);
			}
			if(arguments.length != 0){
				if(cache[id]){
					return cache[id];
				}
				this.id = id;
				this.box = null;
				layoutData && (this.initLayoutData = layoutData);
				this.win().HdPortal.Res.loadg('editPoupBox');
				cache[id] = this;
				this.ctrl = {}; //控制器
				HdPortal.initCallBack(this, [
					['ready', true], //ready
				]);
			}
		}
        
		var poupPrefix = 'editPoup_';
        
		Poup.get = function(id){
			if(cache[id]){
				return cache[id];
			}
			return new Poup();
		};

		Poup.remove = function(id){
			Poup.get(id).destroy();
		};

		Poup.fn = Poup.prototype;

		$.extend(Poup.fn, {
			init: function () {
				if(this.id === undefined)return this;
				var poup = this;
				if(poup.hasInit)return poup;
				poup.hasInit = true;
				poup.$(function () {
					var poupMask = poup.$('.bg-mask');
					if(poupMask.length == 0) {
						poupMask = poup.$('<div class="bg-mask hide"></div>');
						poup.$('body').append(poupMask);
					}

					var oldWarp = poup.$('#' + poupPrefix + poup.id);
					if(oldWarp.length > 0) {
						oldWarp.remove();
					}
					poup.box = poup.$(
						'<div id="' + poupPrefix + poup.id + '" class="editPoupBox poupBox confirmPoupBox edit_common hide">' +
                        '<div class="poupTitle">' +
                            '<span class="text"></span>' +
                            '<div class="titleTips"></div>' +
                            '<div class="closeBtn"></div>' +
                        '</div>' +
                        '<div class="poupContent">' +
                            '<div class="topBar"></div>' +
                            '<div class="infoBox scrollBox"></div>' +
                        '</div>' +
                        '<div class="editBottomBox"></div>' +
                    '</div>');
					poup.$('body').append(poup.box);
					poup.box.find('.closeBtn').click(function () {
						poup.hide();
					});
					$(window).on('hd_clearDocument unload', function (event) {
						poup.destroy();
					});
					poup.fireWith('ready', poup, [poup]);
				});
				return poup;
			},
			setCtrl: function(name, handle){
				if($.isPlainObject(name)){
					$.extend(this.ctrl, name);
					return;
				}
				this.ctrl[name] = handle;
			},
			show: function (opts, data) {
				if(this.id === undefined)return this;
				var poup = this;
				var mask = poup.$('.bg-mask');
				poup.box.add(mask).show();
				setTimeout(function () {
					poup.box.addClass('poup-box-animate');
					mask.addClass('bg-mask-animate');
				}, 0);
				if(!opts && poup.initLayoutData){
					opts = poup.initLayoutData;
					delete poup.initLayoutData; 
				}
				poup._layout(opts);
				this.maskClose && mask.off('click.editPoupClose').on('click.editPoupClose', function (event) {
					poup.hide();
				});
				poup.box.trigger('poupBox_show', [poup, data]);
				return poup;
			},
			hide: function(callBack, noHideMask, data) {
				if(this.id === undefined)return this;
				var poup = this;
				poup.box.trigger('poupBox_close', [poup, data]);
				var editClose = poup.box.data('editClose');
				if(editClose) {
					if(editClose() === false) {
						return poup;
					}
					poup.box.removeData('editClose');
				}
				var mask = poup.$('.bg-mask');
				mask.off('click.editPoupClose');
				poup.box.removeClass('poup-box-animate');
				mask.removeClass('bg-mask-animate');
				poup.box.trigger('poupBox_hide', [poup]);
				setTimeout(function () {
					poup.box.hide();
					if(!noHideMask){
						mask.hide();
					}
					callBack && callBack(poup);
				}, 300);
				return poup;
			},
			layout: function (opts) {
				if(this.id === undefined)return this;
				var poup = this;
				if(typeof opts == 'function'){
					opts = opts(poup);
				}
				if(!opts) {
					return;
				}
				if(opts.cover !== false){   //是否覆盖全部旧布局
					opts = $.extend({
						width: '',
						className: 'common', //特殊类
						title: '',
						tips: '',
						topBar: '',
						info: '',
						bottom: '',         //底部条 具体配置查看HdPortal.getPopupBottom
						after: null,       //布局结束回调
						maskClose: true,   //是否点击蒙板关闭弹窗
					}, opts);
				}

				$.each(selectors, function (key, selector) {
					var warp = poup.getWarp(key), html = opts[key];
					if(!warp || warp.length == 0 || html === undefined) {
						return;
					}
					if(key == 'bottom' && $.isPlainObject(html)){
						html = HdPortal.getPopupBottom(html);
					}else if(typeof html == 'function') {
						warp.html('');
						html = html.call(poup, warp, poup, poup.win());
					}
					if(key == 'title' && poup.box){
						poup.box.toggleClass('noTitle', html === false);
					}
					if(html && ($.type(html) == 'string' || html instanceof jQuery || html.nodeType)) {
						warp.html(html);
					}
				});

				this.setClass(opts.className);
				opts.width !== undefined && this.box.width(opts.width);
				opts.after && opts.after.call(poup, poup, poup.win());
				opts.maskClose !== undefined && (this.maskClose = opts.maskClose);
				return this;
			},
			setClass: function(className){
				if(!className)return this;
				this.box.attr('class', this.box.attr('class').replace(/\bedit_(\w+?)\b/, 'edit_' + className));
				return this;
			},
			destroy: function () {
				if(this.id === undefined)return this;
				if(this.box){
					this.box.remove();
					this.box = null;
				}
				delete cache[this.id];
				return this;
			},
			win: win,
			$: function (html) {
				return this.win().$(html);
			},
			getWarp: function (key) {
				return this.box && this.box.find(selectors[key]);
			}
		});

		$.each(['show', 'hide', 'layout'], function(i, key) {
			var oldKey = '_' + key;
			Poup.fn[oldKey] = Poup.fn[key];
			Poup.fn[key] = function(){
				var args = arguments,
					poup = this;
				poup.init().$(function () {
					poup[oldKey].apply(poup, args);
				});
				return poup;
			};
		});

		return Poup;
        
		function win(){
			return top;
		}

	})();

	/*
    author:hth

    说明：轮询接口

    示例1   HdPortal.poll({
                name : 'pollName',  
                time : 1000,        //计时间隔，小于0不调用setTimeout，默认为-1；
                delay ： 2000,      //开始延迟，小于0不调用setTimeout，默认为-1；
                poll : function(next,step){ //step为轮询计数，从0开始
                    $.ajax({
                        url: url,
                    }).then(function() {
                        if(判断逻辑){   //不调用next将断开轮询，或者在外部可以调用poll.stop方法停止轮询。
                            ***
                            return;
                        }
                        next(2000);     //下一步，时间间隔根据传入的参数控制
                        //next();       //不传时间间隔使用默认时间间隔
                    });
                },
            });

            HdPortal.poll.stop('pollName'); //停止轮询

    示例2   // $new方法生成的局部poll对象与HdPortal.poll用法完全一致。
            // 推荐这种用法，HdPortal.poll为全局对象，name有可能被其他地方覆盖。
            var poll = HdPortal.poll.$new();  
            poll({
                ***
            });
    */
	HdPortal.poll = (function(){
		var poll = getPoll();
		poll.$new = getPoll;
		return poll;
		function getPoll(){
			var cache = {};
			var poll = function(opts){
				opts = $.extend({
					name: '',
					time: -1,
					poll: null,
					delay: -1,
				}, opts);
				poll.stop(opts.name);
				var step = 0, timer, isStop = false;
				var next = function(){
					if(isStop)return;
					opts.poll(function(time){
						time = time || opts.time;
						timer = time < 0 ? next() : setTimeout(next, time);
					}, step++);
				};
				var stop = function(){
					clearTimeout(timer);
					isStop = true;
					delete cache[opts.name];
				};
				if(opts.name){
					cache[opts.name] = stop;
				}
				opts.delay < 0 ? next() : setTimeout(next, opts.delay);
				return stop;
			};
			poll.stop = function(name){
				if(arguments.length == 0){
					$.each(cache, function(key, val) {
						val && val();
					});
				}else if(name && cache[name]){
					cache[name]();
				}
				return poll;
			};
			return poll;
		}
	})();

	//检查是否显示切换门店按钮
	HdPortal.checkSwitchBtnShow = function () {
		$.ajax({
			type: 'post',
			url: '/ajax/hdstore_h.jsp?cmd=isShowSwitchBtn',
			error: function () {
			},
			success: function (result) {
				result = jQuery.parseJSON(result);
				if(result.success) {
					if(result.isShow) {
						top.$('#switchStoreBtn').show();
					}else{
						top.$('#switchStoreBtn').hide();
					}
				}
			}
		});
	};

	//比较员工职位高低
	HdPortal.checkPosition = function (concurrent, contrast) {
		if(concurrent == contrast) {
			return false;
		}
		switch(concurrent) {
			case 1:   //高级管理员
				return true;
			case 5:   //区域经理
			case 3:   //总店普通员工
				if(contrast == 2 || contrast == 4) {
					return true;
				}
				return false;
			case 2:   //门店店长
				if(contrast == 4) {
					return true;
				}
				return false;
			case 4:   //门店店员
			case 0:   //普通员工
				return false;
		}
		return false;
	};

	//快捷支付入口
	HdPortal.quickPayMent = (function () {
		var bgMask, _default, changePrize, getPayQrCode, initTab, changeTabLabel, getQrCode, getCoupons, useCouponRmAdv,
			checkOrderStatus, showCouponList, closePoup, tabs, polling, checkBgMaskFromEditPop;
		return function (option) {
			if(top !== window) {
				return top.HdPortal.quickPayMent.apply(this, arguments);
			}
			var def = {
				verInfo: 1,            //1免费版 2白银版 3铂金版
				type: 1,                //1代表去广告, 2代表升级版本
				payment: 'wxpay',       //wxpay-微信支付  alipay-支付宝支付
				unitPrize: 300,         //产品单价
				gameId: 0,              //去广告的游戏编号
				couponId: 0,            //优惠券id
				rmAdvsCount: 0,         //去广告券数量
				orderId: 0,             //生成的订单号
			};
			_default = $.extend({}, def, option);
			if(!_default.gameId || _default.gameId <= 0) {
				var url = HdPortal.isOem ? 'http://' + HdPortal.OemPortalHost + '/portal.jsp#appId=shop&tab=4' : 'http://' + HdPortal.HdPortalHost + '/jump.jsp?t=42';
				window.open(url);
				return;
			}
			if(!HdPortal.buyProductAuth) {
				HdPortal.hdShowMsg('error', '没有权限');
				return;
			}

			// bgMask = top.$('.bg-mask');
			//换成quickPay的mask
			bgMask = top.$('.bg-mask-quick-pay');
			if(bgMask.length == 0) { //找不到就创建一个
				bgMask = $('<div class="bg-mask-quick-pay"></div>');
				top.$('body').append(bgMask);
			}
			//修改z-index
			bgMask.css({'z-index': '1000'});

			var payContainer = top.$('.payContainer');
			if(payContainer.length == 0) {
				payContainer = init();
			}
			if($('#editPoup_edit').css('z-index') >= 1000){
				$('#editPoup_edit').css('z-index', 998);
			}
			//先判断.bg-mask是否存在，如果存在则隐藏
			checkBgMaskFromEditPop(false);
			// top.$('.bg-mask').show();
			bgMask.show();
			payContainer.show();

			if(_default.type === 2) {
				//免费版有券的情况下跳到商城
				if(_default.verInfo === 1) {
					getCoupons('', function (dataList) {
						if(dataList.length > 0) {
							var url = HdPortal.isOem ? 'http://' + HdPortal.OemPortalHost + '/portal.jsp#appId=shop&tab=4' : 'http://' + HdPortal.HdPortalHost + '/jump.jsp?t=42';
							window.open(url);
							closePoup();
							return;
						}
					});
				}
				tabs = [{name: '白银版', className: 'verBY'}, {name: '铂金版', className: 'verBJ'}];
				changeTabLabel();
				payContainer.find('.header .tab2').click();
			}else if(_default.type === 1) {
				tabs = [{name: '付款', className: 'payMoney'}, {name: '用券', className: 'useTicket'}];
				changeTabLabel();
				getCoupons('useTicket', function (dataList) {
					_default.rmAdvsCount = dataList.length;
					//新需求,需要无论什么界面都默认打开tab2
					payContainer.find('.header .tab2').click();
					//下面打开tab界面全部注释掉，原本其他逻辑没改
					if(_default.verInfo === 1) {
						initTab(payContainer, 'useTicket');     //免费版默认打开用券
					}else if(_default.verInfo === 3) {
						getCoupons('useTicket', function (dataList) {
							if(dataList.length > 0) {
								initTab(payContainer, 'useTicket');     //铂金版有券打开用券
							}
						});
					} 

				});

			}
			setTimeout(function () {
				bgMask.addClass('bg-mask-animate');
			}, 0);

			polling = setInterval(checkOrderStatus, 5000);
		};

		function init() {
			var reChargeUrl = 'http://' + HdPortal.HdPortalHost + '/portal.jsp#appId=shopCart';
			var body = $('<div class="payContainer">' +
                '<div class="header">' +
                    '<div class="tab tab1 nocheck" data-tab=""></div>' +
                    '<div class="tab tab2 check" data-tab=""></div>' +
                '</div>' +
                '<div class="tabBody noTicket hide">' +
                    '<div class="prizeBanner">' +
                        '<div class="prize"><span class="iconMoney">￥</span>1198<span class="unitDate"> /年</span></div>' +
                        '<div class="tip">升级到铂金版享有2.5折购买去广告券</div>' +
                    '</div>' +
                    '<div class="clear"></div>' +
                    '<div class="privilege">' +
                        '<div class="funcs">' +
                            '<div class="func func_1">' +
                                '<div class="iconGou inlineBlock"></div>' +
                                '<div class="inlineBlock"><span class="ft_16 orangeFont">￥200</span>去广告，<span class="ft_16 orangeFont">￥1000</span>十张去广告券</div>' +
                            '</div>' +
                            '<!--<div class="tip orangeFont ft_12" style="margin-top: 4px;"> 价值￥2,000, 用完券后五折</div>-->' +
                            '<div class="func func_2">' +
                                '<div class="iconGou inlineBlock"></div>' +
                                '<div class="inlineBlock"> 强制关注功能</diV>' +
                            '</div>' +
                            '<div class="func func_3">' +
                                '<div class="iconGou inlineBlock"></div>' +
                                '<div class="inlineBlock"> 微信红包奖品类型</div>' +
                            '</div>' +
                            '<div class="func func_4">' +
                                '<div class="iconGou inlineBlock"></div>' +
                                '<div class="inlineBlock"> 不限参与人数</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="splitLine"></div>' +
                        '<div class="upLevelBtn payBtn ft_16">升级铂金版</div>' +
                        '<div align="center" style="margin-top:10px;text-decoration:underline;"><a class="linkMore orangeFont ft_12" href="http://hd.' + HdPortal.HomeHost + '/product.html" target="_blank" style="text-decoration:underline;">更多特权</a></div>' +
                    '</div>' +
                '</div>' +
                '<div class="tabBody hasTicket hide">' +
                    '<div class="blueBg">' +
                        '<div class="ticket">' +
                            '<div class="direct">互动去广告券</div>' +
                            '<div class="amount">剩余2张</div>' +
                            '<div class="function">永久去除一个互动游戏广告</div>' +
                            '<div class="validate">有效期：永久有效</div>' +
                        '</div>' +
                        '<div class="direction">※ 消耗一张互动广告券</div>' +
                    '</div>' +
                    '<div class="btnBar">' +
                        '<div class="useTicket payBtn">去广告</div>' +
                    '</div>' +
                '</div>' +
                '<div class="tabBody hasNotTicket hide">' +
                    '<div class="blueBg">' +
                        '<div class="ticket">' +
                            '<div class="halfDiscount"></div>' +
                            '<div class="direct">您的去广告劵剩余<span>0</span>张</div>' +
                            '<div class="tip">现在购买互动去广告劵包</div>' +
                            '<div class="tipDiscount">更享<span class="ft_16">5折</span>优惠！</div>' +
                            '<div class="tipMoney">仅需<span class="orangeFont"> <span class="moneySpan"></span>/10张</span></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="btnBar">' +
                        '<div class="useTicket payBtn payBtn ft_16">前往购买</div>' +
                    '</div>' +
                '</div>' +
                '<div class="tabBody pay hide">' +
                    '<div class="payBg blueBg">' +
                        '<div class="timeExpired">' +
                            '<div class="times baiyin" data="1">一年</div>' +
                            '<div class="times baiyin big bjcheck" data="3">2年[送一年]</div>' +
                            '<div class="times baiyin" data="5">5年</div>' +
                            '<div class="times baiyin" data="10">10年</div>' +
                        '</div>' +
                        '<div class="payInfo">' +
                            '<div class="prize">' +
                                '<div class="ticket pr hide">' +
                                    '<span class="ft_16">￥</span><span class="money">100</span>' +
                                '</div>' +
                                '<div class="bojin pr hide">' +
                                    '<span class="ft_16">￥</span>' +
                                    '<span class="money">1996</span>' +
                                    '<span class="ft_16"> / <span class="year">3</span>年</span>' +
                                    '<div class="cuxiao"></div>' +
                                '</div>' +
                                '<div class="baiyin pr">' +
                                    '<span class="ft_16">￥</span>' +
                                    '<span class="money">1896</span>' +
                                    '<span class="ft_16"> / <span class="year">3</span>年</span>' +
                                    '<div class="cuxiao"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="direction">去除此活动广告</div>' +
                            '<div class="qrCode">' +
                                '<img width="100%" height="100%" src= ""/>' +
                            '</div>' +
                            '<div class="payTo wxpayment">' +
                                '<div class="wxIcon"></div>微信扫一扫支付' +
                            '</div>' +
                            '<div class="payTo alipayment hide">' +
                                '<div class="aliIcon"></div>支付宝扫一扫' +
                            '</div>' +
                        '</div>' +
                        '<div style="height: 1px;"></div>' +
                    '</div>' +
                    '<div class="clear"></div>' +
                    '<div class="payBar">' +
                        '<div class="coupon hide">' +
                            '<div class="label inlineBlock">已使用优惠券:</div>' +
                            '<div class="couponList inlineBlock"></div>' +
                        '</div>' +
                        '<div class="payment" align = "center">' +
                            '<div class="wxPay inlineBlock">' +
                                '<input type="radio" id="quickWxpay" checked name="payment" value="1" />' +
                                '<label><div class="wxIcon"></div>微信支付</label>' +
                            '</div>' +
                            '<div class="aliPay inlineBlock hide">' +
                                '<input type="radio" id="quickAlipay" name="payment" value="2" />' +
                                '<label><div class="aliIcon"></div>支付宝</label>' +
                            '</div>' +
                            '<div class="otherPay inlineBlock">' +
                                '<span >其他付款方式</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>');
			top.$('body').append(body);
			payContainer = body;

			payContainer.on('click', '.hasTicket .btnBar .useTicket', function () {
				if(_default.rmAdvsCount < 1) {
					HdPortal.hdShowMsg('error', '去广告券数量不足，请选择其他方式去除广告');
					return;
				}

				$.ajax({
					url: '/ajax/hdpay_h.jsp?cmd=useRemoveAdvs&gameId=' + _default.gameId,
					type: 'post',
					dataType: 'json',
					success: function (result) {
						if(result.success) {
							HdPortal.logDog(1000185, 1);
							_default.callback && _default.callback();
							HdPortal.hdShowMsg('right', '去除广告成功');
							closePoup();
						}else{
							HdPortal.hdShowMsg('error', '去除广告失败');
						}
					}
				});
			});

			//切换选项卡
			payContainer.on('click', '.header .tab', function () {
				$(this).parent().find('.check').removeClass('check').addClass('nocheck');
				$(this).addClass('check').removeClass('nocheck');

				var dataTab = $(this).attr('data-tab');
				initTab(payContainer, dataTab);
			});

			//切换版本年限
			payContainer.on('click', '.timeExpired .times', function () {
				var currentVer = payContainer.find('.header .check').attr('data-tab');
				if(currentVer != 'verBJ' && currentVer != 'verBY') {
					return;
				}

				var year = $(this).attr('data');
				year = parseInt(year);
				if(isNaN(year)) {
					return;
				}

				var className = currentVer === 'verBJ' ? 'bjcheck' : 'bycheck';
				$(this).parent().find('.times').removeClass(className);
				$(this).addClass(className);

				changePrize(year, currentVer);
			});

			//切换支付方式
			payContainer.on('click', '.payBar .aliPay, .payBar .wxPay', function () {
				if($(this).find('input[type = "radio"]').attr('checked') == 'checked'){ //如果是再次点击同一个，则直接返回，不重新渲染二维码
					return;
				}
				$(this).parent('.payment').find('input[type = "radio"]').removeAttr('checked');
				$(this).find('input[type = "radio"]').attr('checked', 'checked');

				if($('#quickWxpay').is(':checked')) {
					payContainer.find('.payInfo .wxpayment').show();
					payContainer.find('.payInfo .alipayment').hide();
				}else{
					payContainer.find('.payInfo .wxpayment').hide();
					payContainer.find('.payInfo .alipayment').show();
				}

				var currentVer = payContainer.find('.header .check').attr('data-tab');
				getQrCode(currentVer);
			});

			//当点击其他支付方式或者在购买去广告劵里面点击前往购买时弹出购买去广告框
			var backFromShop = function function_name(url, tip) {
				closePoup();
				if(!tip) {
					tip = _default.verInfo != 1 ? '购买去广告' : '升级版本';
				}
				HdPortal.showRechargeBox(tip, function () {
					if(_default.callback) {
						checkOrderStatus(function () {
							HdPortal.logDog(1000185, 4);
						});
						_default.callback();
					}else{
						checkOrderStatus(function () {
							HdPortal.logDog(1000184, 6);
						});
						window.location.reload();
					}
				});

				window.open(url);
			};

			payContainer.on('click', '.noTicket .privilege .upLevelBtn', function () {
				var url = 'http://' + HdPortal.HdPortalHost + '/jump.jsp?t=42';
				backFromShop(url);
			});

			//点击前往购买去广告劵的时候
			payContainer.on('click', '.hasNotTicket .btnBar .payBtn', function () {
				var url = 'http://' + HdPortal.HdPortalHost + '/portal.jsp#anchor=HdNoAdsPackage#appId=shop&tab=3';
				backFromShop(url);
			});

			//点击其他支付方式触发的事件
			payContainer.on('click', '.payBar .payment .otherPay span', function () {
				var url = 'http://' + HdPortal.HdPortalHost + '/portal.jsp#appId=shopCart&iParams=' + hdFai.encodeUrl('orderId=' + _default.orderId + '&pay=true');
				backFromShop(url, '购买去广告');
			});

			// top.$('.bg-mask').on('click', function(){
			// 快捷支付弹窗专属的弹窗
			top.$('.bg-mask-quick-pay').on('click', function () {
				closePoup();
			});

			//选择产品年限时修改界面显示价格
			changePrize = function (year, ver) {
				var cuxiaoIcon = payContainer.find('.payInfo .prize ' + (ver === 'verBJ' ? '.bojin' : '.baiyin') + ' .cuxiao');
				if(year != 3) {
					cuxiaoIcon.hide();
				}else{
					cuxiaoIcon.show();
				}

				payContainer.find('.payInfo .prize .pr .money').text(year != 3 ? _default.unitPrize * year : _default.unitPrize * 2);
				if(year == 1) {
					payContainer.find('.payInfo .prize .pr .year').text(' ');
				}else{
					payContainer.find('.payInfo .prize .pr .year').text(year);
				}

				if(ver == 'verBJ') {
					payContainer.find('.payInfo .direction').text('赠送' + year * 10 + '张互动去广告券');
				}

				getQrCode(ver);
			};

			//初始化tab标签信息
			changeTabLabel = function () {
				//更换tab属性
				$.each(payContainer.find('.header .tab'), function (index, val) {
					$(val).attr('data-tab', tabs[index].className);
					$(val).text(tabs[index].name);
				});
			};
            
			//第一次进来或者切换Tab时初始化tab的内容
			initTab = function (body, dataTab) {
				body.find('.tabBody').hide();
				body.find('.payBar .coupon').hide();
				body.find('.payInfo .prize .pr').hide();
				if(dataTab === 'payMoney') {         //去广告付款状态
					switch(_default.verInfo) {
						case 1: // 免费版
							_default.unitPrize = 400;
							break;
						case 2: // 白银版
							_default.unitPrize = 320;
							break;
						case 3: // 铂金版
							_default.unitPrize = 200;
							break;
						case 4: // 钻石版
							_default.unitPrize = 150;
							break;
					}
					body.find('.payInfo .prize .ticket .money').text(_default.unitPrize);
					body.find('.pay').show();
					body.find('.payInfo .prize .ticket').show();
					body.find('.timeExpired').hide();
					body.find('.payInfo .direction').show();
					body.find('.payInfo .direction').text('去除此活动广告');
					getQrCode(dataTab);
				}else if(dataTab === 'useTicket') {      //去广告用券状态
					body.find('.timeExpired').hide();

					// if(_default.rmAdvsCount > 0 || _default.verInfo == 3){
					// 新需求，付费版的所有用户如果有劵都弹出去广告页面注释代码
					// 先判断是否有劵，再判断用户版本
					if(_default.rmAdvsCount === 0) {
						body.find('.hasNotTicket').show();
						switch(_default.verInfo) {
							case 1: // 免费版
								body.find('.hasNotTicket').hide();
								body.find('.noTicket').show();  //免费版默认打开用券
								body.find('.payInfo .direction').hide();
								break;
							case 2: // 白银版
								body.find('.moneySpan').text('￥1600');
								break;
							case 3: // 铂金版
								body.find('.moneySpan').text('￥1000');
								break;
							case 4: // 钻石版
								body.find('.moneySpan').text('￥750');
								break;
						}
					}else if(_default.rmAdvsCount > 0) {
						if(_default.verInfo === 4 || _default.verInfo === 3 || _default.verInfo === 2 || _default.verInfo === 1) {
							body.find('.hasTicket').show(); //付费用户打开去广告页
							body.find('.hasTicket .amount').text('剩余' + _default.rmAdvsCount + '张');
							body.find('.payInfo .prize .ticket').show();
							body.find('.payInfo .direction').show();
							body.find('.payInfo .direction').text('去除此活动广告');
						}
					}
				}else if(dataTab === 'verBJ') {          //升级铂金版tab
					_default.unitPrize = 1198;
					body.find('.pay').show();
					body.find('.payInfo .prize .bojin').show();
					body.find('.timeExpired').show();
					body.find('.timeExpired .times').addClass('bojin').removeClass('baiyin');
					body.find('.timeExpired .times').removeClass('bjcheck').removeClass('bycheck');
					body.find('.timeExpired .times').eq(1).addClass('bjcheck').removeClass('bycheck');
					body.find('.payInfo .direction').show();
					body.find('.payInfo .direction').text('赠送30张互动去广告券');
					changePrize(3, 'verBJ');
					showCouponList(dataTab);
				}else if(dataTab === 'verBY') {          //升级白银版tab
					_default.unitPrize = 798;
					body.find('.pay').show();
					body.find('.payInfo .prize .baiyin').show();
					body.find('.payInfo .direction').show();
					body.find('.payInfo .direction').text('');
					body.find('.timeExpired .times').addClass('baiyin').removeClass('bojin');
					body.find('.timeExpired .times').removeClass('bjcheck').removeClass('bycheck');
					body.find('.timeExpired .times').eq(1).addClass('bycheck').removeClass('bjcheck');
					changePrize(3, 'verBY');
					showCouponList(dataTab);
				}
			};

			//显示互动现金券列表
			showCouponList = function (dataTab) {
				//需求更改，暂时不用显示优惠券
				/*var dropDownList = [];
            getCoupons(dataTab, function(dataList){
                if(dataList.length > 0){
                    dropDownList = [['不使用优惠', 0]];
                }
                $.each(dataList, function(index, data){
                    var couponsName = data.price + '元互动现金券';
                    dropDownList.push([couponsName, data.id]);
                });
                if(dropDownList.length > 0){
                    payContainer.find('.payBar .coupon').show();
                    HdPortal.createDropDownBox(dropDownList, payContainer.find('.couponList'), function(value){
                        if(value){
                            _default.couponId = value;
                        }
                        getQrCode(dataTab);
                    });
                }
            });*/
			};

			//获取优惠券信息
			getCoupons = function (dataTab, callback) {
				var type = 0;
				if(dataTab === 'payMoney' || dataTab === 'useTicket') {
					type = 3;
				}else if(dataTab === 'verBJ') {
					type = 1;
				}else if(dataTab === 'verBY') {
					type = 2;
				}
				$.ajax({
					url: '/ajax/hdpay_h.jsp?cmd=getCoupons&type=' + type,
					type: 'post',
					success: function (result) {
						result = $.parseJSON(result);
						if(result.success) {
							callback && callback(result.dataList);
						}
					}
				});
			};

			//检查订单状态
			checkOrderStatus = function (callback) {
				var currentVer = payContainer.find('.header .check').attr('data-tab');
				if(_default.orderId <= 0 || (currentVer != 'verBJ' && currentVer != 'verBY' && currentVer != 'payMoney')) {
					return;
				}
				var payMent = 1;                        //默认微信支付
				if($('#quickAlipay').is(':checked')) {
					payMent = 2;                        //支付宝支付
				}
				$.ajax({
					url: '/ajax/hdpay_h.jsp?cmd=checkOrderStatus&orderId=' + _default.orderId,
					type: 'post',
					dataType: 'json',
					success: function (result) {
						if(result.success) {
							if(callback) {
								callback();
							}else if(_default.callback) {
								_default.callback();
							}else{
								var msg = '';
								if(currentVer == 'verBJ') {
									if(payMent == 1) {
										HdPortal.logDog(1000184, 1);
									}else if(payMent == 2) {
										HdPortal.logDbg(1000184, 3);
									}
									msg = '成功升级到铂金版';
								}else if(currentVer == 'verBY') {
									if(payMent == 1) {
										HdPortal.logDog(1000184, 2);
									}else if(payMent == 2) {
										HdPortal.logDbg(1000184, 4);
									}
									msg = '成功升级到白银版';
								}else if(currentVer == 'payMoney') {
									if(payMent == 1) {
										HdPortal.logDog(1000185, 2);
									}else if(payMent == 2) {
										HdPortal.logDbg(1000185, 3);
									}
									msg = '成功为HD' + _default.gameId + '去除广告';
								}
								HdPortal.hdShowMsg('right', msg);
								setTimeout(function () {
									window.location.reload();
								}, 800);
							}
							clearInterval(polling);
							closePoup();
						}
					}
				});
			};

			//使用去广告券去除游戏广告
			useCouponRmAdv = function () {
				if(_default.gameId <= 0) {
					HdPortal.hdShowMsg('error', '游戏编号参数错误，请重新尝试');
					return;
				}
				$.ajax({
					url: '/ajax/hdpay_h.jsp?cmd=useRemoveAdvs&gameId=' + _default.gameId,
					type: 'post',
					dataType: 'json',
					success: function (result) {
						result = $.parseJSON(result);
						if(result.success) {
							_default.callback && _default.callback();
						}else{
							HdPortal.hdShowMsg('error', result.msg);
						}
					}
				});
			};

			//获取支付二维码
			getQrCode = function (dataTab) {
				var qrCode = payContainer.find('.pay .payInfo .qrCode img');
				var qrCodeUrl = qrCode.attr('src');
				var payMent = 1;                        //默认微信支付
				if($('#quickAlipay').is(':checked')) {
					payMent = 2;
				}

				var url = '';
				if(dataTab === 'payMoney') {
					url = '/ajax/hdpay_h.jsp?cmd=getRemoveAdvQrCode&payMent=' + payMent + '&gameId=' + _default.gameId;
				}else if(dataTab === 'verBJ') {
					var amount = parseInt(payContainer.find('.timeExpired .bjcheck').attr('data'));
					if(isNaN(amount)) {
						return;
					}
					url = '/ajax/hdpay_h.jsp?cmd=getVerPayQrCode&payMent=' + payMent + '&amount=' + amount + '&upVer=2&couponId=' + _default.couponId;
				}else if(dataTab === 'verBY') {
					var amount = parseInt(payContainer.find('.timeExpired .bycheck').attr('data'));
					if(isNaN(amount)) {
						return;
					}
					url = '/ajax/hdpay_h.jsp?cmd=getVerPayQrCode&payMent=' + payMent + '&amount=' + amount + '&upVer=1&couponId=' + _default.couponId;
				}

				$.ajax({
					url: url,
					type: 'post',
					dataType: 'json',
					success: function (result) {
						if(result.success) {
							qrCode.attr('src', '');
							_default.orderId = result.orderId;
							var qrurl = 'http://' + HdPortal.HdPortalHost + '/wxpay_qrcode.jsp?URL=' + result.data;
							qrCode.attr('src', qrurl);
						}
					}
				});
			};

			checkBgMaskFromEditPop = function (isHidden) { //隐藏
				var bg = $('.bg-mask').eq(0);
				var editPop = $('.editPoupBox');
				if(bg.length == 0 || editPop.length == 0) {
					return;
				}
				if(isHidden) {
					if(!editPop.is(':hidden') && bg.is(':hidden')){
						bg.show();
					}
					if(editPop.css('z-index') <= 1000){
						editPop.css('z-index', 1000);
					}
				}else{
					if(!editPop.is(':hidden') && !bg.is(':hidden')){
						bg.hide();
					}
				}
			};
            
			//关闭弹窗
			closePoup = function () {
				payContainer.hide();
				//隐藏bg-mask-quick-pay之前，先判断.bg-mask是否存在，再判断bg-mask和editpoup是否同时显示时
				checkBgMaskFromEditPop(true);
				top.$('.bg-mask-quick-pay').hide();
				clearInterval(polling);
			};
			return payContainer;
		}
	})();

	/*
    author:hth

    说明：互动平台上传文件接口，对 $.fn.uploadify 进行封装，重置互动平台常用默认值，增加进度条配置

    示例1   HdPortal.hdUploadify(uploadBtn, {
                progress : {            //true或者对象值为开启进度条，true代表使用默认进度条配置，默认为false
                    warp: picture_progress,
                    fadeOutTime: 1000,
                    onCancel: function(argument) {
                        hdFai.ing("文件取消成功",true);
                    }
                },                  
                uploadType: 'image',    //上传类型，目前只支持 'image' 和 'excel',会设置对应缺省值
                fileTypeExts: "*.jpg;*.jpeg;*.png;*.bmp;*.gif",     
                fileSizeLimit: 3 * 1024 * 1024,
                ...                     //更多设置项查看 $.fn.uploadify
                onUploadSuccess: function (file, text) {
                    ...
                }
            });
    */
	HdPortal.hdUploadify = function (uploadBtn, opts) {
		if(!uploadBtn || uploadBtn.length == 0)return;
		opts || (opts = {});

		//$.fn.uploadify的参数
		var defaults = {          
			auto: true,                     //是否开启自动上传
			fileSizeLimit: 10 * 1024 * 1024,    //允许上传的文件大小，单位KB
			breakPoints: true,              //是否开启断点续传
			//获取文件大小url
			getFileSizeUrl: HdPortal.versionURL + '/ajax/advanceUpload.jsp?cmd=_getUploadSize'
		};

		//只在hdUploadify中使用的参数
		var settings = {
			uploadType: '',         //上传类型
			uploadImg: null,        //上传图片类型图片覆盖目标
			progress: false,        //是否显示进度条
		};

		$.each(settings, function(key) {
			if(key in opts){
				settings[key] = opts[key];
				delete opts[key];
			}
		});

		if(settings.uploadType == 'image'){
			defaults.fileTypeExts = '*.jpg;*.png;*.gif;*.jpeg';
			defaults.uploader = HdPortal.versionURL + '/ajax/advanceUpload.jsp?cmd=_upload';
		}else if(settings.uploadType == 'excel'){
			defaults.fileTypeExts = '*.xlsx;*.xls';
		}

		$.extend(defaults, opts);

		if(!opts.onUploadError){
			opts.onUploadError = function(file, text) {
				console.log(text);
				hdFai.ing('网络繁忙，文件:' + file.name + '上传失败，请稍后重试');
			};
		}

		var progressCtrl = null;
		if(settings.progress){
			settings.progress = $.extend({
				warp: null,                 //进度条放置节点，默认是上传按钮的父节点
				onCancel: null,             //点击进度条取消按钮的回调
				fadeOutTime: 3000,          //上传完成进度条消失时间
			}, settings.progress);
			if(!settings.progress.warp){
				settings.progress.warp = uploadBtn.parent();
			}
			defaults.progressBox = settings.progress.warp;
			progressCtrl = HdPortal.getUploadProgress(settings.progress.fadeOutTime);
		}

		$.each({
			onUploadSuccess: function(file, text){
				var data = $.parseJSON(text);
				if(data.success){
					progressCtrl && progressCtrl.update('progress', 100);
					if(settings.uploadType == 'image' && settings.uploadImg){
						settings.uploadImg.attr('src', data.path);
					}
				}
			},
			onUploadStart: function(file){
				progressCtrl && progressCtrl.update('show');
			},
			onUploadError: function(file, text){
				progressCtrl && progressCtrl.update('remove');
			},
			onUploadComplete: function(file){
				progressCtrl && progressCtrl.update('complete');
			},
			onProgress: function(options){
				if(progressCtrl){
					if(options.status == 'start'){
						progressCtrl.create(options.id, settings.progress.warp, function(argument) {
							window.event.cancelBubble = true;
							upload.cancel();
							settings.progress.onCancel && settings.progress.onCancel(upload);
						});
					}else if(options.status == 'ing'){
						progressCtrl.update('ing', options.percent);
					}else if(options.status == 'end'){
						progressCtrl.update('remove');
					}
				}
			}
		}, function(key, fn) {
			defaults[key] = function() {
				fn.apply(this, arguments);
				opts[key] && opts[key].apply(this, arguments);
			};
		});

		var upload = $.fn.uploadify.call(uploadBtn, defaults);
		return upload;
	};

	/*
    author:hth
    
    说明：上传进度条控制器
    */
	HdPortal.getUploadProgress = function(fadeOutTime){
		fadeOutTime = fadeOutTime || 3000; //进度条消失时间
		var ctrl = {
			elem: null,
			percent: 0,
			create: function(id, progressBox, onCancel){
				if(ctrl.elem) ctrl.elem.remove();
				progressBox.append('<div id="progressWrap_' + id + '" class="bodyProgressWrap uploadtime">' +
                    '<div class="mission uploadInner"><div id="progress' + id + '" class="progress uploadprogres"></div></div>' +
                    '<div id="progressNum' + id + '" class="progressNum uploadpercent">0%</div>' +
                    '<a class="progressCancel cancelUpload" href="javascript:void(0);"></a>' +
                '</div>');
				ctrl.elem = progressBox.find('.uploadtime');
                
				//取消上传监听事件
				ctrl.elem.find('.cancelUpload').on('click', function(){
					onCancel && onCancel();
					ctrl.update('remove');
				});
				this.percent = 0;
				return this;
			},
			update: function(cmd, data){
				if(!ctrl.elem)return;
				if(cmd == 'show'){
					ctrl.elem.show();
				}else if(cmd == 'ing'){
					if(data > 99.5){
						ctrl.elem.find('.cancelUpload').off('click');
					}
					ctrl.update('progress', data);
				}else if(cmd == 'progress'){
					ctrl.percent = Math.round(data);
					ctrl.elem.find('.progress').css('width', ctrl.percent + '%');
					ctrl.elem.find('.uploadpercent').html(ctrl.percent + '%');
				}else if(cmd == 'remove'){
					ctrl.elem.remove();
					ctrl.elem = null;
				}else if(cmd == 'complete'){
					ctrl.elem.add(ctrl.elem.find('.progress,.uploadpercent')).attr('id', '');
					ctrl.elem.fadeOut(fadeOutTime, function(){
						ctrl.update('remove');
					});
				}
			}
		};
		return ctrl;
	};

	//获取指定的date
	HdPortal.getDate = function(date, day){
		if(!date)return;
		var _date = new Date();
		_date.setTime(date.getTime());
		_date.setHours(0, 0, 0, 0);
		var timeMillns = _date.getTime() + day * 24 * 60 * 60 * 1000;
		_date.setTime(timeMillns);
		return _date;
	};

	//parser
	HdPortal.parse = (function(){
		function time(fmt, date){
			if( typeof date !== 'object' ){
				var date_1 = new Date();
				date_1.setTime(date);
				date = date_1;
			}
			var o = {   
				'M+': date.getMonth() + 1,                 //月份   
				'd+': date.getDate(),                    //日   
				'h+': date.getHours(),                   //小时   
				'm+': date.getMinutes(),                 //分   
				's+': date.getSeconds(),                 //秒   
				'q+': Math.floor((date.getMonth() + 3) / 3), //季度   
				'S': date.getMilliseconds()             //毫秒   
			};   
			if(/(y+)/.test(fmt)){
				fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
			}      
			for(var k in o){
				if(new RegExp('(' + k + ')').test(fmt)){
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
				}
			}      
			return fmt;   
		}
		return {
			time: time
		};
	})();

	HdPortal.copyText = function (trigger, options) {
		if(typeof ClipboardJS == 'undefined'){
			console.warn('not ClipboardJS');
			return;
		}
		if(options && options.target && $.type(options.target) != 'function'){
			var targetElem = $(options.target)[0];
			options.target = function(){
				return targetElem;
			};
		}
		if(options && options.text && $.type(options.text) != 'function'){
			var text = options.text;
			options.text = function(){
				return text;
			};
		}
		if($.type(trigger) == 'string'){
			trigger = $(trigger);
		}
		var clipboard = new ClipboardJS(trigger, options).on('success', function(data) {
			if(options && options.success && options.success(data) === false)return;
			HdPortal.hdShowMsg('right', '复制成功');
		});
		if(options && options.error){
			clipboard.on('error', options.error);
		}
		return clipboard;
	};

	//比较版本权限
	HdPortal.compareHdVer = function(crrVer, neepVer){
		return crrVer >= neepVer;
	};

	// 获取轮播配置项保存在setting里面的名称
	HdPortal.getSwiperConfigOldEditName = function (style, name) {
		switch(style) {
			/**
             * 兼容旧数据的配置项
             * 首页的统一改成 homeBanner
             */
			case 67: // 全民砍价
			case 77: // 全民砍价支付版
				if(name == 'banner') {
					return 'homeBanner';
				}
				break;
			case 71: // 拼团抽豪礼
				if(name == 'banner1') {
					return 'homeBanner';
				}else if(name == 'banner2') {
					return 'detailBanner';
				}
				break;
			default:
				return name;
		}

		return name;
	};

	/**
     * ajax错误处理，对带有errorHandle参数的ajax做统一错误处理
     * @param {Boolean} options.errorHandle 是否使用默认错误处理
     * @param {Function} options.reject 服务器返回 rt != 0 或 success = false 时的回调函数，与success不冲突
     * 例子：
     * $.ajax({
     *   ...,
     *   errorHandle: true, // 统一处理错误
     *   reject: function (response) { // 服务器返回 rt != 0 或 success = false 时的回调函数，与success不冲突
     *     console.log(response);
     *   }
     * });
     */
	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
		var resolve, reject;
		if(originalOptions.errorHandle) {
			resolve = originalOptions.resolve;
			reject = originalOptions.reject;
			jqXHR.then(function (response) {
				response = $.parseJSON(response);
				if(response.rt || !response.success) {
					if(!response.msg || response.msg === '系统错误') { // 针对ajax返回"系统错误"修改
						response.msg = '系统繁忙，请稍后重试';
					}
					HdPortal.hdShowMsg('error', response.msg);

					reject && reject(response);
					reject = void 0;
				}else{
					resolve && resolve(response);
					resolve = void 0;
				}
			}, function (request, err, catchException) {
				var message = '系统繁忙，请稍后重试';
				if(err === 'timeout') {
					message = '请求超时';
				}else if(err === 'parsererror') {
					message = '返回格式解析错误';
				}else if(!navigator.onLine) {
					message = '网络无法连接，请检查网络';
				}

				HdPortal.hdShowMsg('error', message);
			});
		}
	});

	//ajax过滤器
	(function(){
		// 如果ajax设置abortOnRetry参数 不重复发送url相同的请求
		var pendingRequests = {};
		$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
			if( !jqXHR.isStop && options.hd_stopOnRetry ) {
				var key = $.type(options.hd_stopOnRetry) == 'string' ? ('k_' + options.hd_stopOnRetry) : options.url;
				if( pendingRequests[key] ) {
					jqXHR.stop();
				}else{
					pendingRequests[key] = jqXHR;
					jqXHR.always(function(){
						delete pendingRequests[key];
					});
				}
			}
		});
	})();

	(function() {
		HdPortal.Img = {
			MODE_SCALE_FILL: 1, // 根据区域能够填满的最大值等比例缩放。图片100x50，区域50x50，结果50x25。
			MODE_SCALE_WIDTH: 2, // 根据区域宽度等比例缩放，结果高度将不受区域高度限制，即可能撑大高度。图片100x50，区域50x10，结果50x25。
			MODE_SCALE_HEIGHT: 3, // 根据区域高度等比例缩放，结果宽度将不受区域宽度限制，即可能撑大宽度。图片100x50，区域50x50，结果100x50。
			MODE_SCALE_DEFLATE_WIDTH: 4, // 根据区域宽度等比例缩小，不放大，结果高度将不受区域高度限制。图片100x50，区域50x10，结果50x25；图片100x50，区域200x100，结果100x50。
			MODE_SCALE_DEFLATE_HEIGHT: 5, // 根据区域高度等比例缩小，不放大，结果宽度将不受区域宽度限制。图片100x50，区域50x50，结果100x50；图片100x50，区域200x100，结果100x50。
			MODE_SCALE_DEFLATE_FILL: 6, // 根据区域能够填满的最大值等比例缩小，不放大。图片100x50，区域50x50，结果50x25。
			MODE_SCALE_DEFLATE_MAX: 7 // 根据区域等比例缩小，不放大，结果的宽度和高度不能同时超过区域限制。图片200x100，区域100x100，结果200x100；图片100x200，区域100x100，结果100x200。
		};
		HdPortal.Img.isNull = function(obj) {
			return (typeof obj == 'undefined') || (obj == null);
		};
		// 使用此函数时，不要在img标签中先设置大小，会使得调整img大小时失败；先隐藏图片，避免出现图片从原始图片变为目标图片的过程
		//  <img src="xx.jpg" style="display:none;" onload="HdPortal.Img.optimize(this, {width:100, height:50, mode:HdPortal.Img.MODE_SCALE_FILL});"/>
		HdPortal.Img.optimize = function(img, option, noRound) {
			// ie下对于display:none的img不会加载
			// 这里要用临时图片，是因为当动态改变图片src时，由于图片的大小已经被设置，因此再次获取会失败
			var imgTmp = new Image();
			// 这里还不能先置空，否则将会引起对''文件的一次访问
			//  imgTmp.src = '';
			imgTmp.src = img.src;
			var imgWidth = imgTmp.width;
			var imgHeight = imgTmp.height;
			if(HdPortal.Img.isNull(imgWidth) || imgWidth == 0 || HdPortal.Img.isNull(imgHeight) || imgHeight == 0) {
				// chrome似乎对临时图片的加载会有延迟，立即取大小会失败
				imgWidth = img.width;
				imgHeight = img.height;
			}
			//  alert(imgTmp.width + ":" + imgTmp.height + "\n" + img.width + ":" + img.height);
			var size = HdPortal.Img.calcSize(imgWidth, imgHeight, option.width, option.height, option.mode, noRound);
			img.width = size.width;
			img.height = size.height;
			if(option.display == 1) {
				img.style.display = 'inline';
			}else if(option.display == 2) {
				img.style.display = 'none';
			}else{
				img.style.display = 'block';
			}
			return { width: img.width, height: img.height };
		};

		HdPortal.Img.calcSize = function(width, height, maxWidth, maxHeight, mode, noRound) {
			if(isNaN(maxWidth)) {
				maxWidth = parseFloat(maxWidth) * g_rem;
			}
			if(isNaN(maxHeight)) {
				maxHeight = parseFloat(maxHeight) * g_rem;
			}
			var size = { width: width, height: height };
			if(mode == HdPortal.Img.MODE_SCALE_FILL) {
				var rateWidth = width / maxWidth;
				var rateHeight = height / maxHeight;

				if(rateWidth > rateHeight) {
					size.width = maxWidth;
					size.height = height / rateWidth;
				}else{
					size.width = width / rateHeight;
					size.height = maxHeight;
				}
			}else if(mode == HdPortal.Img.MODE_SCALE_WIDTH) {
				var rateWidth = width / maxWidth;
				size.width = maxWidth;
				size.height = height / rateWidth;
			}else if(mode == HdPortal.Img.MODE_SCALE_HEIGHT) {
				var rateHeight = height / maxHeight;
				size.width = width / rateHeight;
				size.height = maxHeight;
			}else if(mode == HdPortal.Img.MODE_SCALE_DEFLATE_WIDTH) {
				var rateWidth = width / maxWidth;
				if(rateWidth > 1) {
					size.width = maxWidth;
					size.height = height / rateWidth;
				}
			}else if(mode == HdPortal.Img.MODE_SCALE_DEFLATE_HEIGHT) {
				var rateHeight = height / maxHeight;
				if(rateHeight > 1) {
					size.width = width / rateHeight;
					size.height = maxHeight;
				}
			}else if(mode == HdPortal.Img.MODE_SCALE_DEFLATE_FILL) {
				var rateWidth = width / maxWidth;
				var rateHeight = height / maxHeight;

				if(rateWidth > rateHeight) {
					if(rateWidth > 1) {
						size.width = maxWidth;
						size.height = height / rateWidth;
					}
				}else{
					if(rateHeight > 1) {
						size.width = width / rateHeight;
						size.height = maxHeight;
					}
				}
			}else if(mode == HdPortal.Img.MODE_SCALE_DEFLATE_MAX) {
				if(width > maxWidth && height > maxHeight) {
					var rateWidth = width / maxWidth;
					var rateHeight = height / maxHeight;

					if(rateWidth < rateHeight) {
						size.width = maxWidth;
						size.height = height / rateWidth;
					}else{
						size.width = width / rateHeight;
						size.height = maxHeight;
					}
				}
			}
			if(!noRound) {
				size.width = Math.floor(size.width);
				size.height = Math.floor(size.height);
			}
			if(size.width == 0) {
				size.width = 1;
			}
			if(size.height == 0) {
				size.height = 1;
			}
			return size;
		};
	})();

	HdPortal.getTextEditBar = function getTextEditBar() {
		var textEditBar = $('.hd-textEditBar');
		if(textEditBar.length) {
			return textEditBar;
		}

		// 缓存要修改的目标
		var _target = null;
		textEditBar = $(
			'<div class="hd-textEditBar is-hide">' +
                '<div class="hd-textEditBar__itemWrap is-fontSize" hover-tips="文字大小">' +
                    '<div class="hd-textEditBar__item is-dropdown">' +
                        '<span class="hd-textEditBar__box is-text">14</span>' +
                    '</div>' +
                    '<div class="hd-textEditBar__dropdown is-font-size-dropdown">' +
                        '<div class="hd-textEditBar__fontSize__mask"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="hd-textEditBar__itemWrap is-colorPicker" hover-tips="文字颜色">' +
                    '<div class="hd-textEditBar__item is-dropdown">' +
                        '<span class="hd-textEditBar__box is-colorBlock"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="hd-textEditBar__itemWrap is-textAlign" hover-tips="对齐方式">' +
                    '<div class="hd-textEditBar__item is-dropdown">' +
                        '<span class="hd-textEditBar__box"><img src="' + HdPortal.resRoot + '/version2/image/poupUpBox/poster/icon5.png"></span>' +
                    '</div>' +
                    '<div class="hd-textEditBar__dropdown is-text-align-dropdown">' +
                        '<p class="hd-textEditBar__dropdownItem" data-align="left"><img src="' + HdPortal.resRoot + '/version2/image/poupUpBox/poster/icon5.png"></p>' +
                        '<p class="hd-textEditBar__dropdownItem" data-align="center"><img src="' + HdPortal.resRoot + '/version2/image/poupUpBox/poster/icon6.png"></p>' +
                        '<p class="hd-textEditBar__dropdownItem" data-align="right"><img src="' + HdPortal.resRoot + '/version2/image/poupUpBox/poster/icon7.png"></p>' +
                    '</div>' +
                '</div>' +
                '<div class="hd-textEditBar__itemWrap is-delete" hover-tips="删除">' +
                    '<div class="hd-textEditBar__item">' +
                        '<span class="hd-textEditBar__box"><img src="' + HdPortal.resRoot + '/version2/image/poupUpBox/poster/icon8.png"></span>' +
                    '</div>' +
                '</div>' +
            '</div>'
		);
		function unbindTarget() {
			textEditBar.addClass('is-hide');

			if(_target) {
				_target = null;
				textEditBar.data('_target', _target);
			}
		}
		function changeFontSize($target) {
			var size = $target.text();
			$target.parents('.hd-textEditBar__itemWrap').find('.hd-textEditBar__box.is-text').text(size);
			if(_target && _target.length) {
				_target.trigger('changeText', { fontSize: size + 'px' });
			}
		}
		function changeTextAlign($target) {
			$target.parents('.hd-textEditBar__itemWrap').find('.hd-textEditBar__box img').attr('src', $target.find('img').attr('src'));
			if(_target && _target.length) {
				_target.trigger('changeText', { textAlign: $target.attr('data-align') });
			}
		}
		function changePosition() {
			if(!_target || !_target.length)return;

			var position = _target.offset();
			textEditBar.css({
				left: position.left - 2,
				top: (position.top - textEditBar.outerHeight(true) - 4)
			});
		}
		function deleteTarget() {
			_target.trigger('removeEditTarget');
			unbindTarget();
		}
		function setTextEditBarItemValue(initValue) {
			if(initValue.fontSize) {
				textEditBar.find('.hd-textEditBar__box.is-text').text(parseInt(initValue.fontSize));
			}
			if(initValue.textAlign) {
				textEditBar.find('.hd-textEditBar__itemWrap.is-textAlign .hd-textEditBar__box img').attr('src', textEditBar.find('.hd-textEditBar__itemWrap.is-textAlign [data-align=' + initValue.textAlign + '] img').attr('src'));
			}
			if(initValue.color) {
				textEditBar.find('.hd-textEditBar__box.is-colorBlock').css('background-color', initValue.color);
			}
		}
		function initFontSizeDropdown(textEditBar) {
			var html = '';
			var minFontSize = 12;
			var maxFontSize = 25;

			for(var i = minFontSize; i < maxFontSize; i++) {
				html += '<p class="hd-textEditBar__dropdownItem">' + i + '</p>';
			}

			textEditBar.find('.hd-textEditBar__dropdown.is-font-size-dropdown .hd-textEditBar__fontSize__mask').html(html);
		}

		var colorBlock = textEditBar.find('.hd-textEditBar__box.is-colorBlock');
		colorBlock.faiColorPicker({
			theme: 'dark',
			top: 18,
			left: -11,
			onchange: function (hex, rgb) {
				if(_target && _target.length) {
					_target.trigger('changeText', { color: hex });
				}
			}
		});

		// 初始化文字内容
		initFontSizeDropdown(textEditBar);

		// 显示下拉框
		textEditBar.find('.hd-textEditBar__itemWrap').on('click', function (e) {
			var $this = $(this);
			var dropdown = $this.find('.hd-textEditBar__dropdown');

			// 隐藏其他项
			dropdown.toggle();
			textEditBar.find('.hd-textEditBar__dropdown').each(function () {
				if(this !== dropdown[0]) {
					$(this).hide();
				}
			});

			if($this.hasClass('is-delete')) {
				deleteTarget();
			}else if($this.hasClass('is-colorPicker')) {
				e.stopPropagation();
				colorBlock.click();
			}
		});
		textEditBar.find('.hd-textEditBar__itemWrap .hd-textEditBar__box.is-colorBlock').on('click', function (e) {
			e.stopPropagation();
			textEditBar.find('.hd-textEditBar__dropdown').hide();
		});

		// 点击子项后 隐藏下拉框
		textEditBar.find('.hd-textEditBar__itemWrap').on('click', '.hd-textEditBar__dropdown .hd-textEditBar__dropdownItem', function (e) {
			e.stopPropagation();
			e.preventDefault();
			var $this = $(this);
			var dropdown = $this.parents('.hd-textEditBar__dropdown').hide();

			if(dropdown.hasClass('is-font-size-dropdown')) {
				changeFontSize($this);
			}else if(dropdown.hasClass('is-text-align-dropdown')) {
				changeTextAlign($this);
			}
		});

		textEditBar.on('bindEditTarget', function (event, target) {
			if(_target && _target[0] === target)return;

			// 注销掉之前的，重新绑定当前的
			unbindTarget();
			_target = $(target);
			textEditBar.data('_target', _target);
			textEditBar.removeClass('is-hide');
			changePosition();
			setTextEditBarItemValue({
				color: _target.css('color'),
				fontSize: _target.css('fontSize'),
				textAlign: _target.css('textAlign')
			});
		});

		// 取消绑定元素
		textEditBar.on('unbindEditTarget', unbindTarget);

		// 当目标位置发生变化时，修改编辑条的位置
		textEditBar.on('changePosition', changePosition);

		// 点击其他地方隐藏下拉框
		$('body')
			.off('click.textEditBar')
			.on('click.textEditBar', function (e) {
				var target = $(e.target);
				if(target.parents('.hd-textEditBar').length) {
					return;
				}
				textEditBar.find('.hd-textEditBar__dropdown').hide();
			})
			.append(textEditBar);

		// TODO: 如果 textEditBar 是显示的话，才会修正位置
		$(window).on('resize.textEditBar', $.throttle(changePosition, 100));

		return textEditBar;
	};
	HdPortal.poupUpQuene = (function(){
		//构建执行队列
		var queue = function(array){
			var that = this;
			that.queneList = $.Deferred().resolve();
			$.each(array, function(index, data){
				that.queneList = that.queneList.then(function(){
					return data(that.queneOption[data.prototype.name]);
				});
			});
			this.hasInit = true;
			return this.queneList;
		};
		//初始化弹窗对应函数的映射
		var quenefn = function(excluseList){
			this.excluseList = excluseList;
			this.queneArray = [];
			this.queneOption = {};
		};
		//开始执行队列
		quenefn.prototype.startQuene = function(){
			queue.call(this, this.queneArray).then();
		};
		//将任务添加到队列
		quenefn.prototype.addQuene = function(option){
			var name = option.poupName;
			var poupPromise = this.excluseList[name];
			poupPromise.prototype.name = name;
			var queneOption = this.queneOption;
			queneOption[name] = $.extend(true, {}, option);
			this.queneArray.push(poupPromise);
			//如果已经初始化，需要将当前promise队列添加到后面
			if( this.hasInit ){
				this.queneList = this.queneList.then(function(){
					poupPromise(queneOption[name]);
				});
			}
		};
		return quenefn;
	})();
	//弹窗初始化逻辑
	HdPortal.poupQueneLine = function(){
		//获取弹窗数据，并进行初始化
		return $.Deferred(function(def){
			$.ajax({
				url: HdPortal.versionURL + '/ajax/asyPoupRequset.jsp?cmd=getAutoPoupInfo',
				type: 'post',
				data: {
					fromPageId: hdFai.getUrlParam(document.URL, 'fromPageId'),
					openSourceId: hdFai.getUrlParam(document.URL, 'openSourceId'),
					_fromMail: hdFai.getUrlParam(document.URL, '_fromMail'),
					passDay: hdFai.getUrlParam(document.URL, 'passDay'),
					hd_pageFrom: typeof Index === 'undefined' ? 'editActive' : 'index',
					_storeId: HdPortal.storeId,
					_areaId: HdPortal.areaId
				},
				error: function (data) {
					HdPortal.hdShowMsg('error', '服务繁忙，请稍后重试。', false);
				},
				success: function (data) {
					var result = $.parseJSON(data);
					if(result.success){
						def.resolve(result);
					}else{
						HdPortal.hdShowMsg('error', '获取弹窗数据失败，请稍候重试。', false);
					}
				}
			});
		});
	};
	//获取新建游戏的链接
	/*
		from创建游戏页面
		modid:游戏的modelId
		style:游戏的style
		tplId:游戏的tplId
		isFromPreview:是否是预览态，必填
	*/
	HdPortal.getCreateGameUrl = function(options){
		var src = 'editActive.jsp';
		if( typeof options.from !== 'undefined' ){
			src = HdPortal.setUrlArg(src, ['from', options.from]);
		}
		var modid = options.modid;
		if( modid ){
			src = HdPortal.setUrlArg(src, ['modId', modid]);
		}else{
			if( typeof options.style !== 'undefined' ){
				src = HdPortal.setUrlArg(src, ['style', options.style]);
			}
			if( typeof options.tplId !== 'undefined' ){
				src = HdPortal.setUrlArg(src, ['tplId', options.tplId]);
			}
		}
		src = HdPortal.setUrlArg(src, ['newCreateGame', 'c'], ['isFromPreview', options.isFromPreview]);
		return src;
	};
})(HdPortal);