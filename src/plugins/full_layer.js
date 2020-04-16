export default {
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