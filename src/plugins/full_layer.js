import combine_plugins from '../combine_plugins.js';

import lock_scroll from './lock_scroll.js';

export default combine_plugins(lock_scroll, {
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
	on_load: function(iframe, first_load) {
		if (first_load) iframe.style.opacity = '1';
	},
	remove: function(iframe, container) {
		container.removeChild(iframe);
	},
});