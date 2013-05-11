//34567890123456789012345678901234567890123456789012345678901234567890123456789
/* global Raphael */
var zirak = {
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
	}
};
var amaan = {
	"pos": {
		"post_upvoted": 4070,
		"answer_accepted": 1530,
		"post_undownvoted": 24,
		"bounty_earned": 50,
		"suggested_edit_approval_received": 64,
		"asker_accepts_answer": 16,
		"association_bonus": 100
	},
	"neg": {
		"user_deleted": 20,
		"post_downvoted": 46,
		"post_unupvoted": 195,
		"asker_accepts_answer": 0,
		"answer_accepted": 0,
		"asker_unaccept_answer": 4,
		"answer_unaccepted": 270,
		"post_upvoted": 0
	}
};
var rlemon = {
	"pos": {
		"post_upvoted": 6110,
		"answer_accepted": 1980,
		"user_deleted": 2,
		"post_undownvoted": 42,
		"bounty_earned": 500,
		"asker_accepts_answer": 130,
		"suggested_edit_approval_received": 20,
		"association_bonus": 100
	},
	"neg": {
		"user_deleted": 50,
		"post_unupvoted": 265,
		"post_downvoted": 116,
		"answer_unaccepted": 315,
		"bounty_given": 50,
		"vote_fraud_reversal": 60,
		"asker_unaccept_answer": 12,
		"asker_accepts_answer": 0,
		"answer_accepted": 0
	}
};

var formatter = {
	parent : document.getElementById('parent'),
	container : null,

	format : function (data, add) {
		if (!add) {
			emptyElem(this.parent);
		}
		this.container = document.createElement('div');
		this.parent.appendChild(this.container);

		this.addStuff(this.params(data.pos), this.params(data.neg))
	},

	addStuff : function (pos, neg) {
		this.addPie(pos);
		this.addPie(neg);

		this.container.appendChild(document.createElement('br'));

		this.addTable(pos);
		this.addTable(neg);
	},

	addBar : function (params) {
		var ctx = this.addContainer(),
			bar = ctx.barchart(140, 240, 300, 240, params.values);

		//bar.label(params.legend);
	},

	addPie : function (params) {
		var ctx = this.addContainer();

		var pie = ctx.piechart(
			320, 150, 100,
			params.values.slice(),
			{ legend : params.legend,
			  legendothers : 'Other (%%.%%)',
			  legendpos : 'south' }
		);

		pie.hover(on, off);
		function on () {
			this.label[0].animate({r : 7}, 300);
			this.label[1].attr({'font-weight' : 800});

			this.sector.stop();
			this.sector.scale(1.1, 1.1, this.cx, this.cy);

			var pos = this.sector.middle;
			this.flag =
				ctx.popup(pos.x, pos.y, this.sector.value.value)
					.insertBefore(this.cover);
		}
		function off () {
			this.label[0].animate({r : 5}, 300);
			this.label[1].attr({'font-weight' : 400});

			this.sector.animate({
				transform : 's1 1 ' + this.cx + ' ' + this.cy
			}, 500, 'easeIn');

			this.flag.animate(
				{opacity : 0}, 300,
				function () { this.remove(); });
		}
	},

	addTable : function (params) {
		//params.values.sort(function (a, b) { return b - a; });
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
			elValue.textContent = params.values[i];

			tr.appendChild(elKey);
			tr.appendChild(elValue);
			tbody.appendChild(tr);
		}

		cont.className = 'table-container';
		table.className = 'table-view';
		table.border = 1;
		table.appendChild(tbody);
		cont.appendChild(table);
		this.container.appendChild(cont);
	},

	addContainer : function () {
		var container = document.createElement('span'),
			raph = Raphael(container, 640, 480);

		this.container.appendChild(container);
		return raph;
	},

	params : function (data) {
		var keys, legend, values;

		keys = Object.keys(data).sort(function (k0, k1) {
			return data[k1] - data[k0];
		});

		values = keys.map(function (k) {
			return data[k];
		});

		legend = keys.map(function (k, i) {
			return k + ': ' + values[i] + ' (%%.%%)';
		});

		return { keys : keys, values : values, legend : legend };
	}
};

function emptyElem (elem) {
	var child;
	while (child = elem.firstChild) {
		elem.removeChild(child);
	}
}


formatter.format(data);
