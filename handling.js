//34567890123456789012345678901234567890123456789012345678901234567890123456789
/* global Raphael */
var data = {
	pos : {
		answer_accepted : 855,
		asker_accepts_answer : 28,
		association_bonus : 100,
		bounty_earned : 100,
		post_undownvoted : 12,
		post_upvoted : 3790,
		suggested_edit_approval_received : 16
	},
	neg : {
		answer_unaccepted : 75,
		post_downvoted : 42,
		post_unupvoted : 115,
		user_deleted : 5
	}
};

var formatter = {
	format : function (data) {
		var ppos = this.params(data.pos),
			npos = this.params(data.neg);

		this.addPie(ppos);
		this.addPie(npos);

		this.addBar(ppos);
		this.addBar(npos);
	},

	addBar : function (params) {
		var ctx = this.addContainer(),
			bar = ctx.barchart(140, 240, 300, 240, params.values);

		//bar.label(params.legend);
	},

	addPie : function (params) {
		var ctx = this.addContainer();

		var pie = ctx.piechart(
			240, 240, 100,
			params.values, { legend : params.legend }
		);

		pie.hover(on, off);
		function on () {
			this.label[0].attr({r : 7});
			this.label[1].attr({'font-weight' : 800});

			var pos = this.sector.middle;
			this.flag =
				ctx.popup(pos.x, pos.y, this.sector.value.value)
					.insertBefore(this.cover);
		}
		function off () {
			this.label[0].attr({r : 4});
			this.label[1].attr({'font-weight' : 400});

			this.flag.animate(
				{opacity : 0},
				300,
				function () { this.remove(); });
		}
	},

	addContainer : function () {
		var container = document.createElement('span'),
			raph = Raphael(container, 640, 480);

		document.body.appendChild(container);
		return raph;
	},

	params : function (data) {
		var keys, legend, values;

		keys = Object.keys(data);

		values = keys.map(function (k) {
			return data[k];
		});

		legend = keys.map(function (k, i) {
			return k + ': ' + values[i] + ' (%%.%%)';
		});

		return { keys : keys, values : values, legend : legend };
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

			ctx[type] += n;
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

formatter.format(data);
