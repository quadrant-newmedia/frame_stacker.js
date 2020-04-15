import * as layer_manager from './layer_manager.js';
import * as standard_plugins from './plugins.js';

// Plugin combining
/////////////////////////////////////////////////////////////////
function execute_all(plugins, function_name) {
	var functions = plugins.map(
		function(plugin) {return plugin[function_name]}
	).filter(Boolean);
	return function() {
		for (var i = 0; i < functions.length; i++) {
			functions[i].apply(null, arguments);
		}
	}
}
function get_first_defined(plugins, property) {
	for (var i = 0; i < plugins.length; i++) {
		if (property in plugins[i]) {
			return plugins[i][property];
		}
	}
}
function combine_plugins(plugins) {
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
		on_created: execute_all(plugins, 'on_created'),
		on_first_load: execute_all(plugins, 'on_first_load'),
		on_load: execute_all(plugins, 'on_load'),
		on_covered: execute_all(plugins, 'on_covered'),
		on_resumed: execute_all(plugins, 'on_resumed'),
		on_resolve: execute_all(plugins, 'on_resolve'),
		remove: get_first_defined(plugins, 'remove'),
	}
}
function validate(plugin) {
	if (!plugin.create) {
		throw new Error('When calling window_layers.push() with custom plugins, at least one of those plugins must implement create()');
	}
	if (!plugin.remove) {
		throw new Error('When calling window_layers.push() with custom plugins, at least one of those plugins must implement remove()');
	}
}

const root_window = window;
window.window_layers = {
	push: function(url, ...plugins) {
		if (plugins.length == 0) {
			plugins = [standard_plugins.simple_full_iframe];
		}
		// TODO - add fixed set of plugins which are always used
		var plugin = combine_plugins(plugins);
		validate(plugin);
		return layer_manager.push(url, plugin);
	},
	resolve: function(value) {
		return layer_manager.resolve(value);
	},
	is_root_window: function() {
		return window == root_window;
	},
	simple_full_iframe: standard_plugins.simple_full_iframe,
	exit_on_escape: standard_plugins.exit_on_escape,

};