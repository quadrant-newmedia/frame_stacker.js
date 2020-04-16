/*
	Given a function which creates a plugin, invoke that function with no arguments.
	Copy all properties from the resulting plugin to the function, so that the function can be used directly as a plugin.

	plugin_maker_function must have default values for all arguments.
*/
export default function(plugin_maker_function) {
	const default_plugin = plugin_maker_function();
	for (let k in default_plugin) plugin_maker_function[k] = default_plugin[k];
	return plugin_maker_function;
}