if( typeof tShu_util === 'undefined' ){
	var tShu_util = {};
}
(function(tShu_util,$){
	/*
	    功能说明：基于JQ的promise实现异步加载js,css文件
		用法说明:
		1、可同时将js，css设置为一个某个数组。然后需要加载时，直接加载。
		//example_1
		//先建立键值的映射，将js和css对应一个key
		tShu_util.Res.setGroup({
			foo: {
				js: "js/fool.src.js",
				css: "css/fool.src.css"
			}
		});
		//加载资源组。此时需等到资源加载完毕，才触发回调
		//type和msg是返回的错误信息
		tShu_util.Res.loadg('foo').then(function(){
			......
		}).reject(function(type,msg){
			
		});
		2、第二种做法不load数组，需要load的时候，同时建立映射
		//example_2
		tShu_util.Res.loadUrl("foo","js/fool.src.js").then(function(){
			
		}).reject(function(type,msg){
			
		});
		3、第三种做法，不load数组，不建立映射。直接load了资源就算
		tShu_util.Res.loadUrl("js/fool.src.js").then(function(){
			
		}).reject(function(type,msg){
			
		});
		4、第四，直接load前面已经设置好的映射。但只能load单个文件
		tShu_util.Res.load('foo').then(function(){
			
		}).reject(function(type,msg){
			
		});
		特别注意：
			此处返回的promise是jQ对象的promise。而不是原生的promise。不能直接用于组件懒加载
	*/
	tShu_util.Res = (function(){
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
				//设置资源组
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
				//检查是否已经加载完毕
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
				//加载资源组
				loadg: function(groupName){
					var group = this.groups[groupName]; 
					if(!group)return getErrDeferred('empty', 'loadg:' + groupName);
					return this.checkLoad('loadg', groupName, function(){
						return Res.load(group);
					});
				},
				//加载资源
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
				//load之前已经建立的某个Id
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
	//加载路由
	tShu_util.loadRouter = function(routerName){
		if( !tShu_util.routManage ){
			tShu_util.routManage = {};
		}
		return new Promise(function(resolve,reject){
			tShu_util.Res.loadg('foo').then(function(routerData){
				resolve(tShu_util.routManage['foo']);
			});
		})
	}
})(tShu_util,jQuery)