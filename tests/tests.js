'use_strict';

// 	// TODO - test exit_on_escape
// 	// TODO - test trap_focus = false
// 	// TODO - test on_pop can read data from child

(async function() {
	var fs = frame_stacker;

	var run_tests = {
		on_load: function(iframe) {
			iframe.contentWindow.run_tests();
		}
	};

	var x = await fs.push(
		'./test_child_can_access_frame_stacker_and_is_not_root.html',
		fs.full_layer, 
		run_tests,
	);
	x = await fs.push(
		'./test_child_is_full_size.html',
		fs.full_layer, run_tests,
	);
	x = await fs.push(
		'./nest_test_1.html',
		fs.full_layer, run_tests,
	);


})();




