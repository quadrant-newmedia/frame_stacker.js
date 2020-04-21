export default {
	on_created: function(iframe) {
		iframe.setAttribute('role', 'dialog');
		// TODO - test with screen reader in Safari, ensure content is accessible
		// See https://bugs.webkit.org/show_bug.cgi?id=174667
		// and https://developer.paciellogroup.com/blog/2018/06/the-current-state-of-modal-dialog-accessibility/
		// which suggest there is a serious issue in safari
		iframe.setAttribute('aria-modal', 'true');
	},
	on_load: function(iframe) {
		iframe.setAttribute('aria-label', iframe.contentDocument.title);
	},
	on_covered: function(iframe) {
		iframe.setAttribute('aria-hidden', 'true');
	},
	on_resumed: function(iframe) {
		iframe.removeAttribute('aria-hidden');
	},
}