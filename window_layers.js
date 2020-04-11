'use strict';
(function() {
	/*
		If this window is opened via window_layers, then this property will be set by our opener at window load time.
	*/
	window._window_layers_root = window._window_layers_root || window;

	var layers = [];
	var FULL_LAYER_STYLE = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';

	function get_default(options, key, _default) {
		return typeof options[key] == 'undefined' ? _default : options[key];
	}

	function handle_iframe_focus_change() {
		/*
			Reminder - focus HAS to leave an iframe if it opens another one, so we cannot naively trap focus on the top most iframe. We cannot do this on a per-layer basis - it really does require global management.
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

	function push(url, options) {
		var options = options || {};
		/*
			If child windows include window_layers.js,
			and if they then call window_layers.push() or window_layers.pop(),
			the default action is to manipulate the window stack of the root window.

			The reason for this is so that a small modal window can open a bigger one over top of itself.

			Pass on_self: true to force the iframe to be added to this window, instead.
		*/
		var on_self = get_default(options, 'trap_focus', false);
		/*
			If trap_focus is set, user will not be able to tab out of iframe.
			Clicks outside iframe will be ignored.
			If trap_focus is false, tabbing or clicking outside of iframe will cause iframe to be closed.
		*/
		var trap_focus = get_default(options, 'trap_focus', true);
		/*
			TODO - document
		*/
		var on_create = options.on_create || function() {}
		/*
			TODO - document
		*/
		var on_load = options.on_load || function() {}


		// TODO - test both methods from a child window
		var root_window = on_self ? window : window._window_layers_root;
		if (root_window != window) {
			// make a copy of options object
			var new_options = {};
			for (var key in options) {
				if (options.hasOwnProperty(key)) {
					new_options[key] = options[key];
				}
			}
			new_options.on_self = true;
			return root_window.window_layers.push(url, new_options);
		}


		var wrapper = document.createElement('div');
		wrapper.style = FULL_LAYER_STYLE;
		document.body.appendChild(wrapper);
		var iframe = document.createElement('iframe');
		iframe.style = FULL_LAYER_STYLE + ';border: none';
		wrapper.appendChild(iframe);
		var window_layer = {
			wrapper: wrapper,
			iframe: iframe,
			window: null,
			_trap_focus: trap_focus,
		};
		on_create(window_layer);

		iframe.addEventListener('load', function() {
			// These only have an effect on the first load:
			window_layer.window = iframe.contentWindow;
			// Properties on window are wiped out between loads, however, so this IS necessary every load:
			window_layer.window._window_layers_root = window;
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
		window_layer.wrapper.parentElement.removeChild(window_layer.wrapper);
	}
	// TODO - pop() should not take from self: it should always pop from the top-most layer with layers of it's own
	// TODO - should we just get rid of the option to push on yourself entirely?
	function pop(from_self) {
		var root_window = from_self ? window : window._window_layers_root;
		if (root_window != window) {
			return root_window.window_layers.pop(true);
		}
		_pop_no_focus_change();
		if (window_layers.length) {
			window_layers[window_layers.length-1].iframe.focus();
		}
	}
	window.window_layers = {
		push: push,
		pop: pop,
		// available on_load functions:
		exit_on_escape: function(wl) {
			wl.window.addEventListener('keydown', function(e) {
				if (e.key != 'Escape') return
				var doc = wl.window.document;
				if (doc.activeElement && doc.activeElement != doc.body) return
				window_layers.pop();
			});
		}
	};
})();