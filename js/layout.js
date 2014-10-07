if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function num(x) {
	return parseInt(x);
}

FlowContainer = function(container) {
	this.container = container;
	self = this;
	this.boxes().each(function(index, box) {
		self.layout(index, box);
	});
};

FlowContainer.prototype = {
	/**
	 * Preparing the box for the layout
	 */
	prepareBox: function(box) {
		var b = $(box);
		b.addClass('layout');
		return b;
	},

	getLast: function(index, box) {
		if(index == 0) { // If it is the first one, make it at the left top
			this.place(box, 0, 0);
			return null;
		}

		return this.box(index - 1); // Get the last layout box
	},
	canPlaceRight: function(last, box) {
		var lb = $(last).get(0);
		return lb.x + this.boxWidth(last) + this.boxWidth(box) <= this.width();
	},
	/**
	 * The layout function will calculate every box's position relative to the
	 * inner top left point of the container's content pane. So the padding of
	 * the container won't count
	 */
	layout: function(index, box) {
		var b = this.prepareBox(box);
		b.get(0).index = index;
		var last = this.getLast(index, box);
		if(!last) // If this is the first one
			return;
		var x = 0;
		var y = 0;
		if(this.canPlaceRight(last, box)) {
			// We can layout this at the right of the last
			x = last.get(0).x + this.boxWidth(last); // Place the box at the right of the last box
			y = last.get(0).y; // This box will be at the same y position of the last box
		}
		else {
			// We must place it next row

			var block_box = [];
			var top = last.get(0).y + this.boxHeight(last); // The box's y location can't be higher than this top

			for(var i = 0; i < index - 1; i++) { // Iterating all the boxes before last
				var tb = $(this.box(i)); // Getting the box
				if(tb.get(0).y + this.boxHeight(tb)> top) { // If some box's bottom is more deeper than the last bottom, this box is block box
					block_box.push(tb);
				}
			}

			if(block_box.length) { // If we do have block box
				// Find the rightmost block box
				var right = null;
				var rx = 0;
				$(block_box).each(function(i, block) {
					if(block.get(0).x >= rx) {
						right = block;
						rx = block.get(0).x;
					}
				});

				// The box must beside the rightmost block box
				x = right.get(0).x + this.boxWidth(right);
				y = this.calY(index, x, this.boxWidth(box));
			}
			else { // There is no box that block this box, we can make it the left most
				x = 0;
				y = this.calY(index, x, this.boxWidth(box));
			}
		}

		this.place(box, x, y);
	},

	/**
	 * Calculate the Y position of the box using the flow layout algorithm
	 */
	calY: function(index, x, w) {
		var y = 0;
		for(var i = 0; i < index; i++) {
			var b = $(this.box(i));
			if(b.get(0).x + this.boxWidth(b) <= x) { // If this box is at the left position of this box, ignore it
				continue;
			}
			if(b.get(0).y + this.boxHeight(b) > y) { // If this is deeper than the last y
				y = b.get(0).y + this.boxHeight(b);
			}
		}
		return y;
	},

	boxesAtX: function(index, x) {
		var boxes = [];
		if(this.xpos) {
			for(var posx in this.xpos) {
				if(posx > x)
					break;

				var bs = this.xpos[posx];
				var self = this;
				for(var i = 0; i < bs.length; i++) {
					var b = bs[i];
					if(posx + self.boxWidth(b) > x) {
						boxes.push(b);
					}
				}
			}
		}
		return boxes;
	},

	/**
	 * Place the box to the location
	 */
	place: function(box, x, y) {
		var b = $(box);
		var bb = b.get(0);

		// Updating the x positions of this container
		if(!this.xpos) {
			// The xpos property is used to store every box that has locate at this x position
			this.xpos = {};
		}

		if(this.xpos[x]) {
			this.xpos[x].push(b);
		}
		else {
			this.xpos[x] = [b];
		}

		// Setting the location information to the box itself
		bb.x = x;
		bb.y = y;

		if(!this.box_positions) {
			this.box_positions = {};
		}
		this.box_positions[x + ':' + y] = bb;

		// Translate the absolute location of the box
		var r = this.translate(x, y);

		// Position the box
		b.css('left', r[0]);
		b.css('top', r[1]);
	},

	translate: function(x, y) {
		return [
			num(this.container.css('padding-left')) +
			num(this.container.css('margin-left')) +
			x,
			num(this.container.css('padding-top')) +
			num(this.container.css('margin-top')) +
			y,
		];
	},

	/**
	 * Get the width of the container's content pane
	 */
	width: function() {
		return this.container.width();
	},

	boxes: function() {
		return this.container.children('.box');
	},

	testHit: function(x, y, bx, by, w, h, bw, bh) {
		if(bx == x && by == y)
			return true;

		if(bx > x) {
			if(bx - x < w) {
				if(by > y) {
					if(by - y < h)
						return true;
				}
				else {
					if(y - by < bh)
						return true;
				}
			}
		}
		else {
			if(x - bx < bw) {
				if(by > y) {
					if(by - y < h)
						return true;
				}
				else {
					if(y - by < bh)
						return true;

				}
			}
		}

		return false;
	},

	hit: function(x, y, index, box) {
		if(x + this.boxWidth(box) > this.width()) { // Test boundary hit first
			return true;
		}

		if(this.box_positions[x + ':' + y]) { // If we already have a box here
			return true;
		}
		var w = this.boxWidth(box);
		var h = this.boxHeight(box);
		for(var px in this.xpos) {
			if(px > x + w)
				break;
			var boxes = this.xpos[px];
			for(var i = 0; i < boxes.length; i++) {
				var b = $(boxes[i]);
				var bx = b.get(0).x;
				var by = b.get(0).y;
				var bw = this.boxWidth(b);
				var bh = this.boxHeight(b);
				if(this.testHit(x, y, bx, by, w, h, bw, bh))
					return true;
			}
		}
		return false;
	},

	/**
	 * Getting the box of the index
	 */
	box: function(index) {
		return this.boxes().eq(index);
	},

	/**
	 * Getting the width of the box
	 */
	boxWidth: function(box) {
		var b = $(box);
		if(b.get(0).width)
			return b.get(0).width;
		ret = num(b.width()) + 
			num(b.css('padding-left')) + num(b.css('padding-right')) + 
			num(b.css('margin-left')) + num(b.css('margin-right'))
		b.get(0).width = ret;
		return ret;
	},

	/**
	 * Getting the height of the box
	 */
	boxHeight: function(box) {
		var b = $(box);
		if(b.get(0).height)
			return b.get(0).height;
		ret = num(b.height()) + 
			num(b.css('padding-top')) + num(b.css('padding-bottom')) + 
			num(b.css('margin-left')) + num(b.css('margin-bottom'))
		b.get(0).height = ret;
		return ret;
	},

	/**
	 * The total count of the boxes
	 */
	boxCount: function() {
		return this.boxes().length;
	}
};

SmartContainer = function(container) {
	this.container = container;
	self = this;
	this.boxes().each(function(index, box) {
		self.layout(index, box);
	});
};


$.extend(SmartContainer.prototype, FlowContainer.prototype); // Let SmartContainer extends FlowContainer

SmartContainer.prototype.layout = function(index, box) { // Replacing the layout algorithm
	if(index == 0) { // If this is the first one, place at the left top
		this.place(box, 0, 0);
		return;
	}

	var b = this.prepareBox(box);
	b.get(0).index = index; // Saving the index in the box itself

	var x = 0;
	var y = this.calY(index, 0, box); // Always begin with x = 0
	var tx = 0;
	
	for(var i = 0; i < index; i++) { // Testing every box
		var tb = $(this.box(i));
		tx = tb.get(0).x + this.boxWidth(tb); // Let box at the right side of this box
		var my = this.calY(index, tx ,box);
		if(my != -1) {
			if(y == -1 || // Y is not set
				my < y || // Y at this postion is better
				(my == y && tx < x)) { // The Y position is the same, but x is better
				y = my;
				x = tx;
			}
		}
	}

	this.place(box, x, y);
}

SmartContainer.prototype.calY = function(index, x, box) {
	var y = -1;
	if(!this.hit(x, 0, index, box)) // Always gave y = 0 a try
		return 0;

	var boxes = this.boxesAtX(index, x); // Get all the boxes at this x position
	boxes = jQuery.unique(boxes.concat(this.boxesAtX(index, x + this.boxWidth(box))));
	for(var j = 0; j < boxes.length; j++) {
		var ttb = $(boxes[j]);
		var ty = ttb.get(0).y + this.boxHeight(ttb); // Try to put this box under the box
		if(!this.hit(x, ty, index, box)) { // We found the position
			if(y == -1 || ty < y) {
				y = ty;
			}
		}
	}
	return y;
}
