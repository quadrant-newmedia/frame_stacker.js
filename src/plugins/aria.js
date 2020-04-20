export default {
	on_created: function(iframe) {
		iframe.setAttribute('role', 'dialog');
	},
	on_load: function(iframe) {
		iframe.setAttribute('aria-label', iframe.contentDocument.title);
	}
}