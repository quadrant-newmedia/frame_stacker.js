/*
	window_layers.js

	TODO - update docs for new plugin based architecture

	Manages a stack of "window iframes" (positioned iframes).

	We block user interactions on all but the top layer.

	TODO - actually block click events? We currently rely on backdrop layer stopping actual mouse clicks, but what about something like Vimium? 

	Creates a global "window_layers" object, which will be available in all child windows. Child windows can pop themselves, push more windows, etc.

	Child windows can also include this script, and it will have no impact. In those windows, "window_layers" will still refer to the object in the root window. This means you can create pages that can function either as a root window or a child window.

	This script does not contain many options for positioning/styling the windows. Instead, window_layers.push() takes an "on_create" callback, which can be used to position the iframe to your liking. The intention is to create other wrapper/helper scripts for creating different types of "iframes".

	Inter-layer communication:
	The only means of inter-layer communication we provide are the "on_load" and "on_first_load" callback arguments to window_layers.push(). You can use these to setup communication between your iframes. This approach is very powerful, because the "on_load" callback is called every time opened layer loads (ie. reloads, navigates to new page, etc.).
	TODO - either add on_first_load, or remove reference to it above

	We intend to impose no requirements on child windows (no required scripts or styles, no required protocols to implement). The idea is that any page should be useable as a "widget" via window_layers. The on_load callback should allow you to setup communication with the child window, no matter what it's existing API is. 

	Cross Domain:
	We intend to allow cross-domain child windows, though some features won't work (ie. exit_on_escape). You'll have to :
	- ensure the child window's headers allow cross-origin iframes
	- use the post-message api to setup communication in on_load
	TODO - cross origin testing
*/
'use strict';
window.window_layers = window.window_layers || (function(root_window) {
	var iframes = [];

	// Plugin combining/executing
	/////////////////////////////////////////////////////////////////
	function execute_function(plugins, function_name) {
		var functions = plugins.map(
			function(plugin) {return plugin[function_name]}
		).filter(Boolean);

		return function() {
			for (var i = 0; i < functions.length; i++) {
				functions[i].apply(null, arguments);
			}
		}
	}
	function combine_plugins(plugins) {
		/*
			Given an array of plugins, create a single plugin with all methods implemented.
		*/
		return {
			setup: execute_function(plugins, 'setup'),
			on_first_load: execute_function(plugins, 'on_first_load'),
			on_load: execute_function(plugins, 'on_load'),
			on_parent_interaction: execute_function(plugins, 'on_parent_interaction'),
			on_resolve: execute_function(plugins, 'on_resolve'),
			remove: execute_function(plugins, 'remove'),
		}
	}

	// Handling interactions in parent layers
	/////////////////////////////////////////////////////////////////
	document.addEventListener('click', function(event) {
		if (!iframes.length) return
		handle_parent_interaction(document, event);
	}, true);
	function on_iframe_click(event) {
		if (document.activeElement == iframes[iframes.length-1]) return
		handle_parent_interaction(event.target.ownerDocument, event);
	}
	function on_iframe_blur(event) {
		var active_document = document;
		if (
			document.activeElement && 
			document.activeElement == iframes[iframes.length-1]
		) {
			// The proper iframe still has focus
			return
		}
		var ae = document.activeElement;	
		handle_parent_interaction(
			(ae && ae.contentDocument) || document,
			event
		);
	}
	function handle_parent_interaction(active_document, event) {
		var is_prevented = false;
		function prevent() {
			is_prevented = true;
			event.preventDefault();
			event.stopPropagation();
			setTimeout(function() {
				iframes.length && iframes[iframes.length-1].focus();
			}, 0);
		}

		var i = iframes.length-1;
		// Intentionally iterate over iframes
		for (
			var i = iframes.length - 1; 
			i >= 0 && !is_prevented && iframes[i].contentDocument != active_document; 
			i--
		) {
			iframes[i]._window_layers_plugin.on_parent_interaction(iframes[i], prevent);
		}
	}

	// Some useful plugins
	/////////////////////////////////////////////////////////////////
	var simple_full_iframe = {
		setup: function(iframe) {
			iframe.style.opacity = '0';
			iframe.style.border = 'none';
			iframe.classList.add('WindowLayersFullPageLayer');
			document.body.appendChild(iframe);
		},
		on_first_load: function(iframe) {
			iframe.style.opacity = '1';
		},
		remove: function(iframe) {
			document.body.removeChild(iframe);
		},
	};
	var swallow_parent_interactions = {
		on_parent_interaction: function(iframe, prevent) {
			prevent();
		},
	};
	var exit_on_parent_interactions = {
		on_parent_interaction: function(iframe, prevent) {
			resolve();
		},
	};
	var exit_on_escape = {
		// Add a listener inside the iframe that pops the layer whenever the user hits the escape the key
		on_load: function(iframe) {
			iframe.contentWindow.addEventListener('keydown', function(e) {
				if (e.key != 'Escape') return

				// If the user is interacting with some inner element 
				// (ie. typing in an input), don't resolve
				var doc = iframe.contentDocument;
				if (doc.activeElement && doc.activeElement != doc.body) return

				window_layers.resolve();
			});
		},
	};

	function push(url, plugin1, plugin2, etc) {
		var plugin = combine_plugins(
			Array.prototype.slice.call(arguments, 1)
		);

		var iframe = document.createElement('iframe');
		iframes.push(iframe);
		plugin.setup(iframe);
		iframe._window_layers_plugin = plugin;

		// only use promises if supported
		var promise;
		try {
			promise = new Promise(
				function(resolve, reject) {
					iframe._resolve_window_layer_promise = resolve;
				}
			);
		}
		catch(e) {}

		var first_load = true;
		iframe.addEventListener('load', function() {
			// Make this window's "window_layers" available inside the iframe
			iframe.contentWindow.window_layers = window.window_layers;

			// These are required for implementing "on_parent_interaction"
			iframe.contentDocument.addEventListener('click', function(e) {
				on_iframe_click(e);
			}, true);
			iframe.contentWindow.addEventListener('blur', on_iframe_blur);

			if (first_load) {
				plugin.on_first_load(iframe);
				first_load = false;
			}
			plugin.on_load(iframe);
		});

		iframe.src = url;
		iframe.focus();

		// reminder - will be undefined if Promise is not defined
		// If you want to use Promises in IE, you need to add a Polyfill (just for the constructor)
		return promise;
	}
	function _resolve_no_focus_change(value) {
		var iframe = iframes.pop();
		if (!iframe) return;

		if (iframe._resolve_window_layer_promise) {
			iframe._resolve_window_layer_promise(value);
		}
		iframe._window_layers_plugin.on_resolve(value, iframe);
		iframe._window_layers_plugin.remove(iframe);
	}
	function resolve(value) {
		_resolve_no_focus_change(value);
		if (iframes.length) {
			iframes[iframes.length-1].focus();
		}
	}

	return {
		push: push,
		resolve: resolve,
		// This can useful for pages that can either act as a root window or child window. Use it when deciding how to configure your UI.
		is_root_window: function() {
			return window == root_window;
		},
		combine_plugins: combine_plugins,

		simple_full_iframe: simple_full_iframe,
		swallow_parent_interactions: swallow_parent_interactions,
		exit_on_parent_interactions: exit_on_parent_interactions,
		exit_on_escape: exit_on_escape,
	};
})();