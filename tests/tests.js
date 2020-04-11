'use_strict';
var test_index = -1;
var tests = [
	'./test_child_can_access_window_layers_and_is_not_root.html',
	'./test_child_is_full_size.html',
	'./nest_test_1.html',
	// TODO - test exit_on_escape
	// TODO - test trap_focus = false
	// TODO - test on_pop can read data from child
];
function next_test() {
	test_index++;
	if (test_index >= tests.length) return
	window_layers.push(
		tests[test_index],
		{
			on_load: function(wl) {
				window_layers.load_helpers.show_layer(wl);
				wl.window.run_tests();
			},
			on_pop: function(wl) {next_test()},
		}
	)
}
next_test();