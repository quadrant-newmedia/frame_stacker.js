'use_strict';

// 	// TODO - test exit_on_escape
// 	// TODO - test trap_focus = false
// 	// TODO - test on_pop can read data from child

(async function() {
	var wl = window_layers;

	var run_tests = {
		on_load: function(iframe) {
			iframe.contentWindow.run_tests();
		}
	};

	var x = await wl.push(
		'./test_child_can_access_window_layers_and_is_not_root.html',
		wl.full_layer, 
		run_tests,
	);
	x = await wl.push(
		'./test_child_is_full_size.html',
		wl.full_layer, run_tests,
	);
	x = await wl.push(
		'./nest_test_1.html',
		wl.full_layer, run_tests,
	);


})();




