export const simple_full_iframe = {
	create: function(container) {
		var iframe = document.createElement('iframe');
		iframe.style = `
			opacity: 0;
			display: block;
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border: none;
		`;
		container.appendChild(iframe);
		return iframe;
	},
	on_first_load: function(iframe) {
		iframe.style.opacity = '1';
	},
	lock_scroll: true,
	remove: function(iframe, container) {
		container.removeChild(iframe);
	},
};
export const exit_on_escape = {
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
export const shadow_border = {
	on_created: function(iframe) {
		iframe.style.border = 'none';
		iframe.style.borderRadius = '5px';
		iframe.style.boxShadow = '0 0 10px 5px #888';
	},
};