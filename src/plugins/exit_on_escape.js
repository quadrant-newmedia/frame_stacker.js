// Add a listener inside the iframe that pops the layer whenever the user hits the escape the key
export default {
	on_load: function(iframe) {
		iframe.contentWindow.addEventListener('keydown', function(e) {
			if (e.key != 'Escape') return
			frame_stacker.resolve();
		});
	},
};