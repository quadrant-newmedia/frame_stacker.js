function get_position(event) {
    return (event.touches ? {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
    } : {
        x: event.clientX,
        y: event.clientY,
    });
}
function clamp(value, min, max) {
    if (value < min) return min
    if (value > max) return max
    return value
}
function get_translation(element) {
    const t = element.style.transform;

    const m = t.match(/translate\((-?\d+)px, (-?\d+)px\)/)
    if (m) {
        
    }
}

export default {
    on_load: function(iframe) {
        const iw = iframe.contentWindow;

        let is_dragging = false;
        let initial_event_position = null;
        let max_move_x = null;
        let min_move_x = null;
        let max_move_y = null;
        let max_move_y = null;
        function on_move_start(event) {
            initial_event_position = get_position(event);

            const rect = iframe.getBoundingClientRect();
            min_move_x = rect.left;
            max_move_x = iframe.ownerDocument.documentElement.clientWidth - rect.right;
            min_move_y = rect.top;
            max_move_y = iframe.ownerDocument.documentElement.clientHeight - rect.bottom;


        }
        function on_move(event) {

        }
        function on_move_end(event) {

        }

        iw.addEventListener('mousedown', on_move_start);
        iw.addEventListener('touchstart', on_move_start);
        iw.addEventListener('mousemove', on_move);
        iw.addEventListener('touchmove', on_move);
        iw.addEventListener('mouseup', on_move_end);
        iw.addEventListener('touchend', on_move_end);
        iw.addEventListener('touchcancel', on_move_end);
    }
}