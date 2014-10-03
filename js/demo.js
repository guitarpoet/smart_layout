function num(x) {
	return parseInt(x);
}

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
		if(random(2) && mc < mutant) { // We need to mutant this box
			box.css('height', r(mutant_min, mutant_max));
			mc++;
		}
		container.append(box);
		copy.append(box.clone());
	}
}

