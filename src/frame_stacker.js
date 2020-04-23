import * as layer_manager from './layer_manager.js';
import combine_plugins from './combine_plugins.js';

import aria from './plugins/aria.js';
import auto_sizing from './plugins/auto_sizing.js';
import auto_centering_layer from './plugins/auto_centering_layer.js';
import draggable from './plugins/draggable.js';
import edge_snapping_layer from './plugins/edge_snapping_layer.js';
import edge_snapping_buttons from './plugins/edge_snapping_buttons.js';
import exit_on_escape from './plugins/exit_on_escape.js';
import focus_management from './plugins/focus_management.js';
import full_layer from './plugins/full_layer.js';
import lock_scroll from './plugins/lock_scroll.js';
import shadow_border from './plugins/shadow_border.js';

window.frame_stacker = {
	/*
		Given a url and one or more configuration objects ("plugins"),
		create an iframe and add it to the page.
	*/
	push: function(url, ...plugins) {
		// prepend a fixed set of plugins, which are always used
		plugins = [aria, focus_management].concat(plugins);

		const plugin = combine_plugins(...plugins);
		validate(plugin);

		/*
			Note - IF window.Promise is defined, we return a promise.
			This promise will be resolved when you call frame_stacker.resolve().

			If you want to use this feature, and you want to support IE,
			then you'll need to load a Promise polyfill.

			This method of communication can be convenient, it doesn't give
			you anything you can't already do with the on_resolve() callback.
		*/
		return layer_manager.push(url, plugin);
	},
	/* 
		Note - value is optional. Not used by frame_stacker at all.
		The value will be passed to the on_resove() callback,
		(and will be the value the promise resolves with).
	*/
	resolve: function(value) {
		return layer_manager.resolve(value);
	},

	// End users may want to call this to combine a commonly used set of plugins 
	combine_plugins: combine_plugins,

	// Most of the time, you'll use one of these as your "base" plugin
	// Any plugin we define ending in _layer implements create() and remove()
	full_layer: full_layer,
	auto_layer: combine_plugins(
		auto_centering_layer, 
		auto_sizing, 
		shadow_border
	),
	edge_snapping_layer: edge_snapping_layer,

	// other plugins you may want to use:
	auto_centering_layer: auto_centering_layer,
	auto_sizing: auto_sizing,
	draggable: draggable,
	easy_exit: combine_plugins(
		exit_on_escape, 
		{exit_on_external_click: true},
	),
	edge_snapping_buttons: edge_snapping_buttons,
	exit_on_escape: exit_on_escape,
	lock_scroll: lock_scroll,
	shadow_border: shadow_border,
};

function validate(plugin) {
	if (!plugin.create || !plugin.remove) {
		throw new Error('You must pass at least one plugin that implements create() and one plugin that implements remove() to frame_stacker.push(). We generally recommend starting with frame_stacker.full_layer or frame_stacker.auto_layer.');
	}
}