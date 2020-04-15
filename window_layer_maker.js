/*
	layer_manager.js

	This module is responsible for managing the push/pop of iframe layers, and calling layer callbacks at appropriate times.

	The only optional layer "feature" that this module implements is "exit_on_external_click". This feature requires knowledge of the global state (ie. "was the click above me?" and "did all layers above me close?"), so it can't easily be implemented by individual layer callbacks.
*/

/*
	Note - the container is created and appended to the document body when we first push a layer.

	It is NOT removed when we pop layers. Removing of an iframe may be asynchronous, and we don't want to have to wait for one to be removed before we can remove the container.

	We do, however, ensure that the container is the last child of the body element every time a new layer is pushed.
*/
let container = null;
function get_container() {
	if (!container) {
		container = document.createElement('window-layers-container');
	}
	// append it to body, or MOVE it to the end if it's already somewhere in the body
	document.body.append(container);
	return container;
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

		if (iframe._window_layers.)
		resolve();
	}
}
document.addEventListener('click', on_iframe_click.bind(null, null), true);

export function push(url, {
	create,
	on_first_load,
	on_load,
	on_covered,
	on_resume,
	exit_on_external_click,
	on_resolve,
	remove
}) {
	const active_iframes = get_unresolved_iframes();
	const current_top = active_iframes[active_iframes.length-1];
	if (current_top) {
		current_top._window_layers.on_covered(current_top);
	}

	const iframe = create(get_container());
	iframe._window_layers = {
		on_covered: on_covered,
		on_resume: on_resume,
		exit_on_external_click: exit_on_external_click,
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
		// Make this window's "window_layers" available inside the iframe
		iframe.contentWindow.window_layers = window.window_layers;

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

	if (iframe._window_layers.resolve) {
		iframe._window_layers.resolve(value);
	}
	iframe._window_layers.on_resolve(value);
	iframe._window_layers.remove(iframe, get_container());

	const next_top = iframes.pop();
	if (!next_top) return
	next_top._window_layers.on_resume(next_top);
}