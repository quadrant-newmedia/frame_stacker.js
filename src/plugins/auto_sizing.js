import with_default_plugin from './with_default_plugin.js';

function get_interior_border_width(computed_style) {
	if (computed_style.boxSizing != 'border-box') return 0
	return Math.ceil(
		parseFloat(computed_style.borderLeftWidth) +
		parseFloat(computed_style.paddingLeft) +
		parseFloat(computed_style.paddingRight) +
		parseFloat(computed_style.borderRightWidth)
	);
}
function get_interior_border_height(computed_style) {
	if (computed_style.boxSizing != 'border-box') return 0
	return Math.ceil(
		parseFloat(computed_style.borderTopHeight) +
		parseFloat(computed_style.paddingTop) +
		parseFloat(computed_style.paddingBottom) +
		parseFloat(computed_style.borderBottomHeight)
	);
}
function fix_size(iframe, width, height, document, body_style, iframe_style) {
	if (height) {
		iframe.style.height = (
			Math.ceil(document.documentElement.offsetHeight) +
			get_interior_border_height(iframe_style)
		) + 'px';
	}
	if (width) {
		iframe.style.width = (
			Math.ceil(
				parseFloat(body_style.marginLeft) +
				parseFloat(body_style.marginRight) +
				parseFloat(body_style.width)
			) + get_interior_border_height(iframe_style)
		) + 'px';
	}
}

export default with_default_plugin(function({
	width=true,
	height=true,
	watch=true,
}={}) {
	let iframe_style;
	return {
		on_created: function(iframe) {
			iframe_style = getComputedStyle(iframe);
		},
		on_load: function(iframe) {
			const doc = iframe.contentDocument;

			if (width) {
				/*
					We compute iframe width based on body width
					Normally, body expands to entire window.
					
					With display: inline-block, body will have width determined by content. It seems to have no negative side effects.

					You are still free to set width/min-width/max-width on the body element.

					Note - if we find negative side effects of this style, we can also experiment with:
						html{display: flex;}
					We could leave this up to the end-user, but I think we should try to provide a default behaviour that covers most cases. End-user can always overwrite in CSS with !important,
					or they can add another plugin that overwrites this style after us.
				*/
				doc.body.style.display = 'inline-block';

				/*
					On every load, "re-maximize" the iframe's width before we compute body width.

					Otherwise, if the iframe was previously narrow, and then we loaded a page with a long run of phrasing content, that content wouldn't cause the body to expand. The content would just wrap, and we'd have a tall, narrow iframe.

					Note that we don't do this "re-maximize" step when we detect DOM mutations - that seems too costly. If you want dynamically added phrasing content to cause the iframe to grow in width, you'll have to set "white-space: nowrap;" on it.
				*/
				iframe.style.width = '100%';
			}
			/*
				getComputedStyle returns a live object - properties are updated if element's style attribute is updated, stylesheets are changed, etc.

				width/margin values are always returned in pixel units, even if set via relative units, viewport units, etc.

				I'm assuming getComputedStyle is somewhat expensive, so don't call unless we're actually setting iframe width
			*/
			const body_style = width ? getComputedStyle(doc.body) : null;
			const bound_fix_size = fix_size.bind(null, iframe, width, height, doc, body_style, iframe_style);

			bound_fix_size();

			/*
				child window can fire this event any time it's size might have changed

				mainly useful if you don't want to use our watch feature
			*/
			iframe.contentDocument.addEventListener('window-layers-should-resize', bound_fix_size);

			/*
				This will catch any DOM mutation on the entire document element.
				This may lead to perfomance issues on pages with rapid DOM mutations (animations, drag and drop, etc.).
				For such pages, you might have to set watch to false.
			*/
			if (watch) {
				const observer = new MutationObserver(bound_fix_size);
				observer.observe(
					iframe.contentDocument.documentElement,
					{attributes: true, childList: true, subtree: true},
				);
			}
		}
	}
});