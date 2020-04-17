import * as layer_manager from './layer_manager.js';

import auto_sizing from './plugins/auto_sizing.js';
import auto_centering from './plugins/auto_centering.js';
import draggable from './plugins/draggable.js';
import edge_snapping_layer from './plugins/edge_snapping_layer.js';
import edge_snapping_buttons from './plugins/edge_snapping_buttons.js';
import exit_on_escape from './plugins/exit_on_escape.js';
import focus_management from './plugins/focus_management.js';
import full_layer from './plugins/full_layer.js';
import shadow_border from './plugins/shadow_border.js';

// Plugin combining
/////////////////////////////////////////////////////////////////
function execute_all(plugins, function_name) {
	var functions = plugins.map(
		function(plugin) {return plugin[function_name]}
	).filter(Boolean);
	return function() {
		for (var i = 0; i < functions.length; i++) {
			try {
				functions[i].apply(null, arguments);
			} catch(e) {
				console.error(e);
			}
		}
	}
}
function get_first_defined(plugins, property) {
	for (var i = 0; i < plugins.length; i++) {
		if (property in plugins[i] && typeof plugins[i][property] !== 'undefined') {
			return plugins[i][property];
		}
	}
}
function combine_plugins(...plugins) {
	/*
		Given an array of plugins, create a single plugin with all methods implemented.
	*/
	return {
		/*
			At least one plugin must define this.
			Must accept container element and return an iframe element.
			The iframe must be inserted into the container, possibly with wrapper elements.
		*/
		create: get_first_defined(plugins, 'create'),
		remove: get_first_defined(plugins, 'remove'),

		exit_on_external_click: get_first_defined(plugins, 'exit_on_external_click'),
		lock_scroll: get_first_defined(plugins, 'lock_scroll'),

		on_created: execute_all(plugins, 'on_created'),
		on_load: execute_all(plugins, 'on_load'),
		on_covered: execute_all(plugins, 'on_covered'),
		on_resumed: execute_all(plugins, 'on_resumed'),
		on_resolve: execute_all(plugins, 'on_resolve'),
	}
}
function validate(plugin) {
	if (!plugin.create || !plugin.remove) {
		throw new Error('You must pass at least one plugin that implements create() and one plugin that implements remove() to frame_stacker.push(). We generally recommend starting with frame_stacker.full_layer or frame_stacker.auto_layer.');
	}
}

window.frame_stacker = {
	push: function(url, ...plugins) {
		// prepend a fixed set of plugins, which are always used
		plugins = [focus_management].concat(plugins);

		const plugin = combine_plugins(...plugins);
		validate(plugin);
		return layer_manager.push(url, plugin);
	},
	resolve: function(value) {
		return layer_manager.resolve(value);
	},

	// End users may want to call this to combine a commonly used set of plugins 
	combine_plugins: combine_plugins,

	// Most of the time, you'll use one of these as your "base" plugin
	full_layer: full_layer,
	auto_layer: combine_plugins(
		// TODO: rename auto_centering to auto_centering_layer -> _layer means create/remove are implemented
		auto_centering, 
		auto_sizing, 
		shadow_border
	),
	edge_snapping_layer: edge_snapping_layer,

	// other "feature" plugins you may want to use:
	// TODO - 
	auto_centering: auto_centering,
	auto_sizing: auto_sizing,
	easy_exit: combine_plugins(
		exit_on_escape, 
		{exit_on_external_click: true},
	),
	edge_snapping_buttons: edge_snapping_buttons,
	exit_on_escape: exit_on_escape,
	shadow_border: shadow_border,

	// WORKS IN PROGRESS:
	draggable: draggable,
};