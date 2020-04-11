'use strict';
(function() {

	// TODO - take layout params?
	function layout_centering(wl) {
		/*
			given a window layer, add spacers/styles as necessary
		*/
		var w = wl.wrapper;
		var i = wl.iframe;
		i.classList.add('CenteredWindowLayerIframe');
		i.style = 'box-sizing: content-box;';
		var top = document.createElement('div');
		top.style = 'flex-grow: 1';
		w.insertBefore(top, i);
		var bottom = document.createElement('div');
		bottom.style = 'flex-grow: 4';
		w.style.display = 'flex';
		w.style.flexDirection = 'column';
		w.style.alignItems = 'center';
	}

	// TODO - move to window_layers?
	function hide_wrapper(wl) {
		wl.wrapper.style.opacity = 0;
	}
	function show_wrapper(wl) {
		wl.wrapper.style.opacity = 1;
	}

	window.centered_window_layers = {
		hide_wrapper: hide_wrapper,

		on_load: function(options) {

		},
		/*
			TODO: Change signature to match window_layers.push
			Create new on_create and on_load functions which perform our logic, and then call the passed in options (if given).

			We can also have our own options, but they should just be additional properties on the same options object.

			With this approach, we shouldn't have to export anything other than push()
		*/
		// recommended options
		push: function(url, trap_focus) {
			window_layers.push(url, {
				trap_focus: trap_focus,
				on_create: function(wl) {
					hide_wrapper(wl);
					layout_centering(wl);
					wl.iframe.style.width = '500px';
					wl.iframe.style.height = '300px';
				},
				on_load: function(wl) {
					show_wrapper(wl);
					window_layers.exit_on_escape(wl);
				},
			})
		},
	}
})();