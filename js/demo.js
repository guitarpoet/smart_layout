function random(max) {
	return Math.floor(Math.random() * max);
}

function r(min, max) {
	while(true) {
		var ret = random(max);
		if(ret > min)
			return ret;
	}
}

function e(tag, classes) {
	if(classes == null)
		classes = [];
	if(typeof classes == 'string')
		classes = [classes];
	var element = $(document.createElement(tag));
	$(classes).each(function(index, cls){
		element.addClass(cls);
	});
	return element;
}

function make_boxes(total, mutant, mutant_min, mutant_max, container, copy) {
	var mc = 0;
	for(var i = 0; i < total; i++) {
		var box = e('div', 'box');
		box.text(i);
		var rand = random(3);

		if(rand && mc < mutant) { // We need to mutant this box
			if(rand == 1) {
				box.css('width', r(mutant_min, mutant_max));
			}
			else {
				box.css('height', r(mutant_min, mutant_max));
			}
			mc++;
		}
		container.append(box);
		copy.append(box.clone());
	}
}

