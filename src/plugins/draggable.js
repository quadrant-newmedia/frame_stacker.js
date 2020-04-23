/*
Make an iframe draggable within the parent window.

We listen (on the window) to any mousedown/touchstart interactions on elements with the frame-stacker-drag-target attribute. You can set this on the body element if you want to be able to drag the iframe from any part of it.

Iframe is bounded to stay within the viewport of parent window.

We use transform to move the iframe, so it doesn't matter how it is initially positioned (absolute, inside a flex container, etc.)

You can set the transform on the iframe to animate it in/out, but otherwise this must be the only plugin manipulating the iframe's transform.


TODO
--------------------------------------------------------
add "move commands" to the window, so users can implement keyboard friendly movement buttons
(maybe we should listen to arrow key input on [frame-stacker-drag-target]? might not want to do that if target is body, though)
make clamp optional
add "clamp margin" option - can be positive or negative - decreases or increases clamp area
*/
import addDelegatedEventListener from '../addDelegatedEventListener.js';
const drag_selector = '[frame-stacker-drag-target]';
function get_position(event) {
    return (event.touches ? {
        x: event.touches[0].screenX,
        y: event.touches[0].screenY,
    } : {
        x: event.screenX,
        y: event.screenY,
    });
}
function clamp(value, min, max) {
    if (value < min) return min
    if (value > max) return max
    return value
}
function get_translation(element) {
    const t = element.style.transform;
    const m = t.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/)
    if (!m) return {x: 0, y: 0}
    return {x: parseFloat(m[1]), y: parseFloat(m[2])}
}
function set_translation(element, x, y) {
    element.style.transform = `translate(${x}px, ${y}px)`;
}
export default {
    on_load: function(iframe) {
        const iw = iframe.contentWindow;

        let is_dragging = false;
        let initial_event_position = null;
        let initial_translation = null;
        let max_move_x = null;
        let min_move_x = null;
        let max_move_y = null;
        let min_move_y = null;
        function on_move_start(event) {
            if (event.isDefault)

            event.preventDefault();

            is_dragging = true;
            initial_event_position = get_position(event);
            initial_translation = get_translation(iframe);

            const rect = iframe.getBoundingClientRect();
            min_move_x = -rect.left;
            max_move_x = iframe.ownerDocument.documentElement.clientWidth - rect.right;
            min_move_y = -rect.top;
            max_move_y = iframe.ownerDocument.documentElement.clientHeight - rect.bottom;
        }
        function on_move(event) {
            if (!is_dragging) return
            event.preventDefault();
            const p = get_position(event);
            const move_x = clamp(p.x-initial_event_position.x, min_move_x, max_move_x);
            const move_y = clamp(p.y-initial_event_position.y, min_move_y, max_move_y);
            set_translation(
                iframe, 
                initial_translation.x + move_x,
                initial_translation.y + move_y
            );
        }
        function on_move_end() {
            is_dragging = false;
        }

        addDelegatedEventListener(iw, drag_selector, 'mousedown', on_move_start);
        addDelegatedEventListener(iw, drag_selector, 'touchstart', on_move_start);
        iw.addEventListener('mousemove', on_move);
        iw.addEventListener('touchmove', on_move);
        iw.addEventListener('mouseup', on_move_end);
        iw.addEventListener('touchend', on_move_end);
        iw.addEventListener('touchcancel', on_move_end);
    }
};