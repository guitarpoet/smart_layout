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

SmartContainer = function(container) {
	this.container = container;
	self = this;
	this.boxes().each(function(index, box) {
		self.layout(index, box);
	});
};

FlowContainer = function(container) {
	this.container = container;
	self = this;
	this.boxes().each(function(index, box) {
		self.layout(index, box);
	});
};

FlowContainer.prototype = {
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
		return last.data('x') + this.boxWidth(last) + this.boxWidth(box) <= this.width();
	},
	/**
	 * The layout function will calculate every box's position relative to the
	 * inner top left point of the container's content pane. So the padding of
	 * the container won't count
	 */
	layout: function(index, box) {
		var b = this.prepareBox(box);
		var last = this.getLast(index, box);
		if(!last) // If this is the first one
			return;
		var x = 0;
		var y = 0;
		if(this.canPlaceRight(last, box)) {
			// We can layout this at the right of the last
			x = last.data('x') + this.boxWidth(last); // Place the box at the right of the last box
			y = last.data('y'); // This box will be at the same y position of the last box
		}
		else {
			// We must place it next row

			var block_box = [];
			var top = last.data('y') + this.boxHeight(last); // The box's y location can't be higher than this top

			for(var i = 0; i < index - 1; i++) { // Iterating all the boxes before last
				var tb = $(this.box(i)); // Getting the box
				if(tb.data('y') + this.boxHeight(tb)> top) { // If some box's bottom is more deeper than the last bottom, this box is block box
					block_box.push(tb);
				}
			}

			if(block_box.length) { // If we do have block box
				// Find the rightmost block box
				var right = null;
				var rx = 0;
				$(block_box).each(function(i, block) {
					if(block.data('x') >= rx) {
						right = block;
						rx = block.data('x');
					}
				});

				// The box must beside the rightmost block box
				x = right.data('x') + this.boxWidth(right);
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
			if(b.data('x') + this.boxWidth(b) <= x) { // If this box is at the left position of this box, ignore it
				continue;
			}
			if(b.data('y') + this.boxHeight(b) > y) { // If this is deeper than the last y
				y = b.data('y') + this.boxHeight(b);
				console.info('Y is {0}'.format(y));
			}
		}
		return y;
	},

	/**
	 * Place the box to the location
	 */
	place: function(box, x, y) {
		var b = $(box);

		b.data('x', x);
		b.data('y', y);

		var r = this.translate(x, y);
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
		return num(b.width()) + 
			num(b.css('padding-left')) + num(b.css('padding-right')) + 
			num(b.css('margin-left')) + num(b.css('margin-right'))
			
	},

	/**
	 * Getting the height of the box
	 */
	boxHeight: function(box) {
		var b = $(box);
		return num(b.height()) + 
			num(b.css('padding-top')) + num(b.css('padding-bottom')) + 
			num(b.css('margin-left')) + num(b.css('margin-bottom'))
			
	},

	/**
	 * The total count of the boxes
	 */
	boxCount: function() {
		return this.boxes().length;
	}
};

$.extend(SmartContainer.prototype, FlowContainer.prototype); // Let SmartContainer extends FlowContainer

SmartContainer.prototype.layout = function(index, box) { // Replacing the layout algorithm
	var b = this.prepareBox(box);
	var last = this.getLast(index, box);
	if(!last) // If this is the first one, we have already place it
		return;

	var x = 0;
	var y = 0;
	if(this.canPlaceRight(last, box)) {
		// We can layout this at the right of the last
		x = last.data('x') + this.boxWidth(last); // Place the box at the right of the last box
		y = this.calY(index, x, this.boxWdith(box));
		//y = last.data('y'); // This box will be at the same y position of the last box
	}
	else {
		x = 0;
		y = this.calY(index, x, this.boxWidth(box));
	}
	this.place(box, x, y);
}

SmartContainer.prototype.calY = function(index, x, w) {
	var y = 0;
	for(var i = 0; i < index; i++) {
		var b = $(this.box(i));
		if(x + w <= b.data('x')) { // If this box is at the right position of this box, ignore it
			continue;
		}
		if(b.data('y') + this.boxHeight(b) > y) { // If this is deeper than the last y
			y = b.data('y') + this.boxHeight(b);
			console.info('Y is {0}'.format(y));
		}
	}
	return y;
}
