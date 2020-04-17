'use strict';
(function() {

	// TODO - take layout params?
	function layout_centering(fs) {
		/*
			given a window layer, add spacers/styles as necessary
		*/
		var w = fs.wrapper;
		var i = fs.iframe;
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

	// TODO - move to frame_stacker?
	function hide_wrapper(fs) {
		fs.wrapper.style.opacity = 0;
	}
	function show_wrapper(fs) {
		fs.wrapper.style.opacity = 1;
	}

	window.centered_frame_stacker = {
		hide_wrapper: hide_wrapper,

		on_load: function(options) {

		},
		/*
			TODO: Change signature to match frame_stacker.push
			Create new on_create and on_load functions which perform our logic, and then call the passed in options (if given).

			We can also have our own options, but they should just be additional properties on the same options object.

			With this approach, we shouldn't have to export anything other than push()
		*/
		// recommended options
		push: function(url, trap_focus) {
			frame_stacker.push(url, {
				trap_focus: trap_focus,
				on_create: function(fs) {
					hide_wrapper(fs);
					layout_centering(fs);
					fs.iframe.style.width = '500px';
					fs.iframe.style.height = '300px';
				},
				on_load: function(fs) {
					show_wrapper(fs);
					frame_stacker.exit_on_escape(fs);
				},
			})
		},
	}
})();