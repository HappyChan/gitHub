(function(){
	var routes = [
		{
			path: '/foo',
			component: {}
		},{
			path: '/bar',
			component: {
				template: '<div>bar</div>'
			}
		}
	];
	var router = new VueRouter({
		routes
	});
	var vm = new Vue({
		data: {
			
		},
		methods: {
			
		}
	}).$mount('#myApp');
})()