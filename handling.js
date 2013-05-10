//34567890123456789012345678901234567890123456789012345678901234567890123456789
/* global Raphael */
var data = {
	"pos": {
		"post_upvoted": 3800,
		"answer_accepted": 855,
		"post_undownvoted": 12,
		"asker_accepts_answer": 28,
		"bounty_earned": 100,
		"suggested_edit_approval_received": 16,
		"association_bonus": 100
	},
	"neg": {
		"post_downvoted": 42,
		"post_unupvoted": 115,
		"user_deleted": 5,
		"answer_unaccepted": 75,
		"post_upvoted": 0
	}
};

var formatter = {
	format : function (data) {
		var ppos = this.params(data.pos),
			npos = this.params(data.neg);

		this.addPie(ppos);
		this.addPie(npos);

		document.body.appendChild(document.createElement('br'));
		this.addTable(ppos);
		this.addTable(npos);
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
			params.values,
			{ legend : params.legend, legendothers : 'Other (%%.%%)' }
		);

		pie.hover(on, off);
		function on () {
			this.label[0].attr({r : 7});
			this.label[1].attr({'font-weight' : 800});

			this.sector.stop();
			this.sector.scale(1.1, 1.1, this.cx, this.cy);

			var pos = this.sector.middle;
			this.flag =
				ctx.popup(pos.x, pos.y, this.sector.value.value)
					.insertBefore(this.cover);
		}
		function off () {
			this.label[0].attr({r : 4});
			this.label[1].attr({'font-weight' : 400});

			this.sector.animate({
				transform : 's1 1 ' + this.cx + ' ' + this.cy
			}, 500, 'easeIn');

			this.flag.animate(
				{opacity : 0},
				300,
				function () { this.remove(); });
		}
	},

	addTable : function (params) {
		var cont = document.createElement('span'),
			table = document.createElement('table'),
			tbody = document.createElement('tbody'), //yes, this matters
			tr, elKey, elValue,
			len = params.values.length;

		for (var i = 0; i < len; i += 1) {
			tr = document.createElement('tr');
			elKey = document.createElement('td');
			elValue = document.createElement('td');

			elKey.textContent = params.keys[i];
			elValue.textContent = params.values[i].value;

			tr.appendChild(elKey);
			tr.appendChild(elValue);
			tbody.appendChild(tr);
		}

		cont.className = 'table-container';
		table.className = 'table-view';
		table.border = 1;
		table.appendChild(tbody);
		cont.appendChild(table);
		document.body.appendChild(cont);
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

formatter.format(data);
