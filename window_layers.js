/*
	window_layers.js

	Manages a stack of "window layers" (positioned iframes).

	We block user interactions on all but the top layer.

	TODO - actually block click events? We currently rely on backdrop layer stopping actual mouse clicks, but what about something like Vimium? 

	Creates a global "window_layers" object, which will be available in all child windows. Child windows can pop themselves, push more windows, etc.

	Child windows can also include this script, and it will have no impact. In those windows, "window_layers" will still refer to the object in the root window. This means you can create pages that can function either as a root window or a child window.

	This script does not contain many options for positioning/styling the windows. Instead, window_layers.push() takes an "on_create" callback, which can be used to position the iframe to your liking. The intention is to create other wrapper/helper scripts for creating different types of "layers".

	Inter-layer communication:
	The only means of inter-layer communication we provide are the "on_load" and "on_first_load" callback arguments to window_layers.push(). You can use these to setup communication between your layers. This approach is very powerful, because the "on_load" callback is called every time opened layer loads (ie. reloads, navigates to new page, etc.).
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
	var layers = [];

	function get_default(options, key, _default) {
		return typeof options[key] == 'undefined' ? _default : options[key];
	}

	function handle_iframe_focus_change() {
		/*
			Reminder - focus must leave a layer if it pushes another layer, so we cannot naively prevent blur on every layer we push. It really does require global focus management.
		*/
		setTimeout(function() {
			// iterate over layers in reverse
			for (var i = window_layers.length-1; i >= 0; i--) {
				var layer = window_layers[i];
				if (layer.iframe == document.activeElement) return
				if (layer._trap_focus) {
					layer.iframe.focus();
					return
				}
				_pop_no_focus_change();
			}
		}, 0);
	}

	function create_full_iframe(wl) {
		wl.iframe.classList.add('WindowLayersFullPageLayer');
		wl.iframe.style.border = 'none';
	}
	function show_layer(wl) {
		wl.wrapper.style.opacity = '';
	}

	function push(url, options) {
		var options = options || {};
		/*
			If trap_focus is set, user will not be able to tab out of iframe.
			Clicks outside iframe will be ignored.
		
			If trap_focus is false, tabbing or clicking outside of iframe will cause iframe to be closed.

			TODO - ensure clicking outside the iframe works, even when focus doesn't move (try in safari, which doesn't always move focus). We should refactor handle_iframe_focus_change() to call a new on_element_interaction(element, possible_event) function, which gets called for focus change, clicks, etc.
		*/
		var trap_focus = get_default(options, 'trap_focus', true);
		/*
			This option should be used to style/layout the generated iframe/wrapper.

			Called after the wrapper element is added to the DOM, but before the iframe src has been set.

			At this point, the wrapper has FULL_LAYER_STYLE and opacity 0.
			The iframe has no styles or classes.

			You can:
				- set styles/classes on on the iframe/wrapper
				- move the wrapper to another location in the DOM
				- replace the "wrapper" property on the window layer object with something else entirely
		*/
		var on_create = options.on_create || create_full_iframe
		/*
			Called every time the iframe loads a page.
		*/
		var on_load = options.on_load || show_layer
		/*
			Called immediately BEFORE the layer will be removed.
			Iframe window has not unloaded, so you can read values from it, if desired.
		*/
		var on_pop = options.on_pop || function() {}

		var wrapper = document.createElement('div');
		wrapper.classList.add('WindowLayersFullPageLayer');
		/*
			We always hide the wrapper.
			It's the user's responsibility to show it in on_load()
		*/
		wrapper.style.opacity = 0;
		/*
			We append directly to body. This should work for most pages.
			If you need it somewhere else in the DOM, move it in on_create.
		*/
		document.body.appendChild(wrapper);
		var iframe = document.createElement('iframe');
		wrapper.appendChild(iframe);

		var window_layer = {
			wrapper: wrapper,
			iframe: iframe,
			window: null,
			_trap_focus: trap_focus,
			_on_pop: on_pop,
		};
		on_create(window_layer);

		iframe.addEventListener('load', function() {
			// This is only has an effect on first load, but no problem calling it every time:
			window_layer.window = iframe.contentWindow;

			// TODO - some of the following will fail for cross-origin iframes. 
			// Test, come up with a solution

			// make "window_layers" available in child window
			window_layer.window.window_layers = window.window_layers;

			window_layer.window.addEventListener('blur', handle_iframe_focus_change);
			on_load(window_layer);
		});
		iframe.src = url;
		iframe.focus();
		layers.push(window_layer);
	}
	function _pop_no_focus_change() {
		var window_layer = layers.pop();
		if (!window_layer) return;
		window_layer._on_pop(window_layer);
		window_layer.wrapper.parentElement.removeChild(window_layer.wrapper);
	}
	function pop() {
		_pop_no_focus_change();
		if (window_layers.length) {
			window_layers[window_layers.length-1].iframe.focus();
		}
	}

	return {
		push: push,
		pop: pop,
		// This can useful for pages that can either act as a root window or child window. Use it when deciding how to configure your UI.
		is_root_window: function() {
			return window == root_window;
		},
		create_helpers: {
			create_full_iframe: create_full_iframe,
		},
		load_helpers: {
			show_layer: show_layer,
			exit_on_escape: function(wl) {
				// Add a listener inside the iframe that pops the layer whenever the user hits the escape the key
				wl.window.addEventListener('keydown', function(e) {
					if (e.key != 'Escape') return

					// If the user is interacting with some inner element 
					// (ie. typing in an input), don't pop
					var doc = wl.window.document;
					if (doc.activeElement && doc.activeElement != doc.body) return

					window_layers.pop();
				});
			}
		},
	};
})();