export default {
	// Add a listener inside the iframe that pops the layer whenever the user hits the escape the key
	on_load: function(iframe) {
		iframe.contentWindow.addEventListener('keydown', function(e) {
			if (e.key != 'Escape') return

			// If the user is interacting with some inner element 
			// (ie. typing in an input), don't resolve
			var doc = iframe.contentDocument;
			if (doc.activeElement && doc.activeElement != doc.body) return

			frame_stacker.resolve();
		});
	},
};