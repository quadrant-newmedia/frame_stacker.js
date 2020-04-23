/*
	layer_manager.js

	This module is responsible for managing the push/pop of iframe layers, and calling layer callbacks at appropriate times.

	We try to implement as few "features" here as possible, leaving those to plugins. Certain features (locks_scroll, exit_on_external_click) require knowlegde of global state, however, so we have to manage them here.
*/

let parent_active_element = null;
const global_container = document.createElement('div');
global_container.style = `
	position: fixed;
	top: 0; left: 0; height: 100%; width: 100%;
`;
// TODO - support browsers who don't support position: fixed (ie. Opera mini)
// If style.position != 'fixed', changed to absolute, set width/height manually, add scroll listener to set top/left
const click_blocker = document.createElement('div');
click_blocker.style = `position: absolute; top: 0; left: 0; height: 100%; width: 100%;`;
function get_iframe_container() {
	// Note - we can't blindly call document.body.appendChild(global_container)
	// if we do, any currently open iframe layers will reload
	// (moving an iframe in the DOM always causes it to reload)
	if (!global_container.parentElement) {
		document.body.appendChild(global_container);		
	}

	// move the click_blocker to the end of global_container
	global_container.appendChild(click_blocker);

	const c = document.createElement('div');
	c.style = `
		position: absolute; 
		top: 0; left: 0; width: 100%; height: 100%;
		pointer-events: none;
	`;
	global_container.appendChild(c);
	return c;
}
function cleanup_after_iframe_removal(iframe_container) {
	// remove the container element from global_container, assuming plugin didn't already do that (it shouldn't have)
	iframe_container.parentElement && iframe_container.parentElement.removeChild(iframe_container);

	// put the click blocker back underneath the top-most frame
	global_container.removeChild(click_blocker);
	global_container.insertBefore(click_blocker, global_container.lastElementChild);

	/*
		When the last iframe has been removed from the global_container,
		remove the global_container from the DOM.
		This is important, because the global_container intercepts click events.
	*/
	if (global_container.querySelector('iframe')) return
	parent_active_element && parent_active_element.focus();
	global_container.parentElement.removeChild(global_container);
}

function get_iframes() {
	/*
		Note - we intentionally use DOM as source of truth here.
		An iframe "exists" until it is removed from DOM.
		When we call remove(iframe), it may not be removed synchronously, and we still need to treat it as a layer (ie. if the user clicks on it while it's animating out, we shouldn't start popping other layers underneath it).
	*/
	return global_container.querySelectorAll('iframe');
}
function get_unresolved_iframes() {
	return Array.prototype.slice.call(
		get_iframes()
	).filter(function(iframe) {
		return !iframe._frame_stacker.resolved;
	});
}

click_blocker.addEventListener('click', function(event) {
	const top = get_unresolved_iframes().pop();
	if (!top) return
	top._frame_stacker.on_external_click(top);
});

export function push(url, {
	create,
	on_created,
	on_load,
	on_external_click,
	on_covered,
	on_resumed,
	on_resolve,
	remove
}) {
	const active_iframes = get_unresolved_iframes();
	const current_top = active_iframes[active_iframes.length-1];
	if (current_top) {
		current_top._frame_stacker.on_covered(current_top);
	}

	// Note - intentionally include resolved iframes here
	// perhaps a new frame was pushed in the on_resolve handler for another frame, and that frame is still animating out
	// in that case, do NOT update parent_active_element
	if (get_iframes().length == 0) {
		parent_active_element = document.activeElement;
	}

	const container = get_iframe_container();
	const iframe = create(container);
	iframe.style.pointerEvents = 'auto';

	on_created(iframe);
	iframe._frame_stacker = {
		on_covered: on_covered,
		on_resumed: on_resumed,
		on_external_click: on_external_click,
		on_resolve: on_resolve,
		remove: remove,
		resolved: false,
		container: container,
	}
	let promise;
	try {
		promise = new Promise(
			function(resolve, reject) {
				iframe._frame_stacker.resolve = resolve;
			}
		)
	}
	catch(e) {}

	let first_load = true;
	iframe.addEventListener('load', function() {
		on_load(iframe, first_load);
		first_load = false;
	});

	iframe.src = url;

	return promise;
}
export function resolve(value) {
	/*
		reminder - calling remove(iframe) may not remove it from the DOM immediately. We need to look at only those that have not already been removed.
	*/
	const iframes = get_unresolved_iframes();

	const iframe = iframes.pop();
	if (!iframe) return;
	iframe._frame_stacker.resolved = true;

	// Note - the iframe will be unloaded when the user removes it from the DOM via remove()
	const container = iframe._frame_stacker.container;
	iframe.contentWindow.addEventListener('unload', cleanup_after_iframe_removal.bind(null, container));

	if (iframe._frame_stacker.resolve) {
		iframe._frame_stacker.resolve(value);
	}
	iframe._frame_stacker.on_resolve(value, iframe);
	iframe._frame_stacker.remove(iframe, container);

	const next_top = iframes.pop();
	if (!next_top) return
	next_top._frame_stacker.on_resumed(next_top);
}