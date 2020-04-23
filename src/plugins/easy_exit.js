import {resolve} from '../layer_manager.js';
export default {
	on_load: function(iframe) {
        // exit if user hits Escape
		iframe.contentWindow.addEventListener('keydown', function(e) {
			if (e.key != 'Escape') return
			resolve();
		});
	},
    on_external_click: function(iframe) {
        resolve();
    },
};