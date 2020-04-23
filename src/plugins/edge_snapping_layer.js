/*
Implements a layer which occupies a fixed portion of the screen area, and which is always locked to one edge of the screen.

Adds a "frame_stacker_edge_snapper" object to the iframe window (with left(), right(), top(), bottom() methods), so that the inner page can snap itself. You have to implement your own UI to call these methods.
*/

import with_default_plugin from './with_default_plugin.js';

function make_snapper(iframe, screen_fraction) {
    // compute these, rather than caching, in case outer window size changes
    function get_width() {
        return screen_fraction * iframe.parentElement.clientWidth + 'px';
    }
    function get_height() {
        return screen_fraction * iframe.parentElement.clientHeight + 'px';
    }

    const s = iframe.style;
    return {
        left: function() {
            s.width = get_width();
            s.left = 0;
            s.right = '';
            s.height = '100%';
            s.top = 0;
            s.bottom = 0;
        },
        right: function() {
            s.width = get_width();
            s.right = 0;
            s.left = '';
            s.height = '100%';
            s.top = 0;
            s.bottom = 0;
        },
        top: function() {
            s.width = '100%';
            s.left = 0;
            s.right = 0;
            s.height = get_height();
            s.top = 0;
            s.bottom = '';
        },
        bottom: function() {
            s.width = '100%';
            s.left = 0;
            s.right = 0;
            s.height = get_height();
            s.top = '';
            s.bottom = 0;
        },
    }
}
export default with_default_plugin(function({
    screen_fraction=0.4,
    initial_side='bottom',
} = {}) {
    return {
        create: function(container) {
            const i = document.createElement('iframe');
            container.appendChild(i);
            i.style = `position: absolute; opacity: 0;`;
            return i;
        },
        on_load: function(iframe, first_load) {
            const snapper = make_snapper(iframe, screen_fraction);
            iframe.contentWindow.frame_stacker_edge_snapper = snapper;
            if (first_load) {
                snapper[initial_side]();
                iframe.style.opacity = 1;
            }
        },
        remove: function(iframe) {
            iframe.parentElement.removeChild(iframe);
        }
    }
});