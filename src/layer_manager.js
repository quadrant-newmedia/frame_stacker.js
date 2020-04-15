/*
	layer_manager.js

	This module is responsible for managing the push/pop of iframe layers, and calling layer callbacks at appropriate times.

	We try to implement as few "features" here as possible, leaving those to plugins. Certain features (locks_scroll, exit_on_external_click) require knowlegde about all layers, however, so we have to manage them here.
*/
function get_container() {
	var c = document.querySelector('window-layers-container');
	if (!c) {
		c = document.createElement('window-layers-container');
		document.body.append(c);
	}
	// TODO - if not at end of body, and no attribute 'window-layers-container-fixed', then move to end of body
	// This is necessary so that layering order is independent of "widget open order"
	return c;
}
function get_iframes() {
	/*
		Note - we intentionally use DOM as source of truth here.
		An iframe "exists" until it is removed from DOM.
		When we call remove(iframe), it may not be removed synchronously, and we still need to treat it as a layer (ie. if the user clicks on it while it's animating out, we shouldn't start popping other layers underneath it).
	*/
	return document.querySelectorAll('window-layers-container iframe');
}
function get_unresolved_iframes() {
	return Array.prototype.slice.call(
		get_iframes()
	).filter(function(iframe) {
		return !iframe._window_layers.resolved;
	});
}

let scroll_locking_layers_count = 0;
let scrollTop = null;
let scrollLeft = null;
function fix_scroll() {
	document.documentElement.scrollTop = scrollTop;
	document.documentElement.scrollLeft = scrollLeft;
}

function on_iframe_click(clicked_iframe, event) {
	// if there are any layers above this iframe, cancel the event
	// pop the top-most contiguous iframes above the iframe which set exit_on_external_click

	const iframes = get_iframes();
	// Intentionally iterate over iframes in reverse
	// Stop as soon as we find the iframe that was clicked 
	// (do NOT execute loop body for that iframe)
	for (
		let i = iframes.length - 1; 
		i >= 0 && iframes[i] != clicked_iframe; 
		i--
	) {
		const iframe = iframes[i];

		// At this point, we know there was at least one iframe above the iframe that was clicked. Swallow the click event.
		// Notice - if there are mutliple layers open, we might end up calling these multiple times - but that's okay
		event.preventDefault();
		event.stopPropagation();

		// This iframe has already been resolved, and in the process of being removed from the DOM
		if (iframe._window_layers.resolved) continue

		if (iframe._window_layers.exit_on_external_click) {
			resolve();
		}
		else {
			// This layer doesn't exit_on_external_click, so don't pop any more layers
			break;
		}
	}
}
document.addEventListener('click', on_iframe_click.bind(null, null), true);

export function push(url, {
	create,
	on_created,
	on_first_load,
	on_load,
	on_covered,
	on_resumed,
	exit_on_external_click,
	lock_scroll,
	on_resolve,
	remove
}) {
	const active_iframes = get_unresolved_iframes();
	const current_top = active_iframes[active_iframes.length-1];
	if (current_top) {
		current_top._window_layers.on_covered(current_top);
	}

	if (lock_scroll) {
		scroll_locking_layers_count += 1
		scrollTop = document.documentElement.scrollTop;
		scrollLeft = document.documentElement.scrollLeft;
		addEventListener('scroll', fix_scroll);
	}

	const iframe = create(get_container());
	on_created(iframe);
	iframe._window_layers = {
		on_covered: on_covered,
		on_resumed: on_resumed,
		exit_on_external_click: exit_on_external_click,
		lock_scroll: lock_scroll,
		on_resolve: on_resolve,
		remove: remove,
		resolved: false,
	}
	let promise;
	try {
		promise = new Promise(
			function(resolve, reject) {
				iframe._window_layers.resolve = resolve;
			}
		)
	}
	catch(e) {}

	let first_load = true;
	iframe.addEventListener('load', function() {
		const w = iframe.contentWindow;
		/*
			Make window_layers available inside the iframe, even if it didn't include the script

			Patch the object so that push() and resolve() act on the "root window".

			Intentionally do NOT overwrite the entire object. If the child page includes a different version of window_layers with different plugins available, it should still be able to use those.
		*/
		w.window_layers = w.window_layers || window.window_layers;
		w.window_layers.push = window.window_layers.push;
		w.window_layers.resolve = window.window_layers.resolve;

		// These are required for implementing "exit_on_external_click"
		iframe.contentDocument.addEventListener('click', on_iframe_click.bind(null, iframe), true);

		if (first_load) {
			on_first_load(iframe);
			first_load = false;
		}
		on_load(iframe);
	});

	iframe.src = url;
	iframe.focus();

	return promise;
}
export function resolve(value) {
	/*
		reminder - calling remove(iframe) may not remove it from the DOM immediately. We need to look at only those that have not already been removed.
	*/
	const iframes = get_unresolved_iframes();

	const iframe = iframes.pop();
	if (!iframe) return;
	iframe._window_layers.resolved = true;

	if (iframe._window_layers.lock_scroll) {
		scroll_locking_layers_count--;
		if (scroll_locking_layers_count == 0) {
			removeEventListener('scroll', fix_scroll);
		}
	}

	if (iframe._window_layers.resolve) {
		iframe._window_layers.resolve(value);
	}
	iframe._window_layers.on_resolve(value, iframe);
	iframe._window_layers.remove(iframe, get_container());

	const next_top = iframes.pop();
	if (!next_top) return
	next_top._window_layers.on_resumed(next_top);
}