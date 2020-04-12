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
	function get_iframes() {
		return document.querySelectorAll('window-layers-container iframe');
	}
	function get_top_iframe() {
		var iframes = get_iframes();
		// May return undefined
		return iframes[iframes.length-1];
	}
	function get_container() {
		var c = document.querySelector('window-layers-container');
		if (!c) {
			c = document.createElement('window-layers-container');
			document.body.append(c);
		}
		return c;
	}

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
			on_first_load: execute_all(plugins, 'on_first_load'),
			on_load: execute_all(plugins, 'on_load'),
			trap_focus: get_first_defined(plugins, 'trap_focus'),
			on_resolve: execute_all(plugins, 'on_resolve'),
			remove: get_first_defined(plugins, 'remove'),
		}
	}

	// Handling interactions in parent layers
	/////////////////////////////////////////////////////////////////
	document.addEventListener('click', function(event) {
		handle_parent_interaction(document, event);
	}, true);
	function on_iframe_click(event) {
		handle_parent_interaction(event.target.ownerDocument, event);
	}
	function on_iframe_blur(event) {
		var ae = document.activeElement;	
		handle_parent_interaction(
			(ae && ae.contentDocument) || document,
			event
		);
	}
	function handle_parent_interaction(active_document, event) {
		// Handle an event which occurred in active_document
		// active_document may or may not be the top-most document
		var iframes = get_iframes();
		var i = iframes.length-1;
		// Intentionally iterate over iframes in reverse
		for (
			var i = iframes.length - 1; 
			i >= 0 && iframes[i].contentDocument != active_document; 
			i--
		) {
			var iframe = iframes[i];
			// This iframe has already been resolved, and in the process of being removed from the DOM
			if (iframe._window_layers_resolved) continue

			// Notice - we call these multiple times, but that's not an issue
			event.preventDefault();
			event.stopPropagation();

			if (iframe._window_layers_plugin.trap_focus) {
				setTimeout(function() {
					iframe.focus();
				}, 0);
				return
			}
			else {
				// reminder - this may not remove the iframe from the DOM immediately, but we're iterating over a saved array of iframes, so that's okay
				resolve();
			}
		}
	}

	// Some useful plugins
	/////////////////////////////////////////////////////////////////
	var simple_full_iframe = {
		create: function(container) {
			var iframe = document.createElement('iframe');
			container.appendChild(iframe);
			iframe.style.opacity = '0';
			iframe.style.border = 'none';
			iframe.classList.add('WindowLayersFullLayer');
			return iframe;
		},
		on_first_load: function(iframe) {
			iframe.style.opacity = '1';
		},
		trap_focus: true,
		remove: function(iframe, container) {
			container.removeChild(iframe);
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

		var iframe = plugin.create(get_container());
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

			// TODO - verify that this works. Check in multiple browsers
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
		/*
			reminder - calling plugin.remove(iframe) may not remove it from the DOM immediately. We need remove the tompost one that is not already removed.
		*/

		var iframes = get_iframes();
		var iframe;
		for (var i = iframes.length - 1; i >= 0; i--) {
			if (iframes[i]._window_layers_resolved) continue
			iframe = iframes[i];
			break;
		}

		if (!iframe) return;

		if (iframe._resolve_window_layer_promise) {
			iframe._resolve_window_layer_promise(value);
		}
		iframe._window_layers_plugin.remove(iframe, get_container());
		iframe._window_layers_plugin.on_resolve(value);
	}
	function resolve(value) {
		var iframes = get_iframes();
		var next_top = iframes[iframes.length-2];

		// Reminder - may not synchronously remove the iframe
		_resolve_no_focus_change(value);
		if (next_top) {
			next_top.focus();
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
		exit_on_escape: exit_on_escape,
	};
})();