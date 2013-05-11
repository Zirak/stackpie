var moose = document.moose;
moose.onsubmit = function (e) {
	e.preventDefault();
	moose.load.type = 'text';

	fetch({
		usrid : moose.usrid.value,
		site : moose.site.value
	}, finish);

	function finish (d) {
		moose.load.type = 'hidden';
		data = d;
		formatter.format(data);
	}
};

function fetch (params, cb) {
	var res = { pos : {}, neg : {} };

	if (!params.page) {
		params.page = 1;
	}
	if (!params.site) {
		params.site = 'stackoverflow';
	}

	request(params);

	function request (params) {
		var url = 'https://api.stackexchange.com/2.1/users/' + params.usrid +
			'/reputation-history?page=' + params.page +
			'&site=' + params.site;

		jsonp(url, finish);
	}

	function finish (data) {
		addData(data);

		if (data.has_more) {
			params.page += 1;
			request(params);
		}
		else {
			cb(res);
		}
	}

	function addData (data) {
		data.items.forEach(function (item) {
			var type = item.reputation_history_type,
			n = item.reputation_change,
			ctx;

			ctx = n > 0 ? res.pos : res.neg;
			if (!ctx[type]) {
				ctx[type] = 0;
			}

			ctx[type] += Math.abs(n);
		});
	}
};

function jsonp (url, cb) {
	var script = document.createElement('script'),
	param;

	//generate the function name
	do {
		param = 'cb' + (Date.now() * Math.ceil(Math.random()));
	} while (window[param]);

	//slap it on the global object
	window[param] = function () {
		cb.apply(null, arguments);

		//cleanup on aisle awesome
		delete window[param];
		script.parentNode.removeChild(script);
	};

	if (url.indexOf('?') === -1) {
		url += '?';
	}

	script.src = url + '&callback=' + param;
	document.head.appendChild(script);
}
