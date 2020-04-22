/*
This plugin implements 4 different features:
- parent window's focus is restored after last frame is resolved
- a frame's focus is restored after a child frame is resolved
- if focus somehow shifts to any window other than top-most, it is moved back to the top frame
- pressing tab while a frame is open will wrap between the focusable elements in that frame

It might have been clearer to implement all of these in separate plugins. We still might do that. We might run into issues with order of operations, however.
*/

function compare_tab_order(a, b) {
    if (a.element.tabIndex < b.element.tabIndex) {
        return -1;
    }
    if (a.element.tabIndex > b.element.tabIndex) {
        return 1;
    }
    return a.dom_order - b.dom_order;
}
function get_focusable_elements(body) {
    // return array of all keyboard-focusable elements, in standard focus order
    const all_elements = body.querySelectorAll('*');
    const focusable_elements = [];
    const length = all_elements.length;
    for (let i = 0; i < length; i++) {
        if (all_elements[i].tabIndex >= 0) focusable_elements.push(all_elements[i]);
    }

    const items = focusable_elements.map((e, i) => ({element: e, dom_order: i}));
    items.sort(compare_tab_order);
    return items.map(x => x.element);
}
function focus_wrap(keydown_event) {
    // Note - keydown_event may have occurred in any window, not necessarily the one executing this code
    if (keydown_event.defaultPrevented) return
    if (keydown_event.key != 'Tab') return
    if (keydown_event.altKey || keydown_event.ctrlKey || keydown_event.metaKey) return

    const doc = keydown_event.view.document;
    const elements = get_focusable_elements(doc.body);
    const last = elements[elements.length-1];
    const first = elements[0];
    const current = doc.activeElement;

    // Notice - we only handle the case where focus should wrap - otherwise we let the default action occur
    if (current == last && !keydown_event.shiftKey) {
        first.focus();
        keydown_event.preventDefault();
    }
    else if (current == first && keydown_event.shiftKey)  {
        last.focus();
        keydown_event.preventDefault();
    }
}


let valid_active_element = null;
let top_frame = null;
// handle focusin inside iframes -> if iframe is not on top, send focus back to top
function handle_focusin(iframe, event) {
    if (!top_frame) return
    if (iframe === top_frame) {
        valid_active_element = iframe.contentDocument.activeElement;
        return
    }
    event.preventDefault();
    event.stopPropagation();
    valid_active_element.focus();
}
// If parent window receives focus while frame is open, send focus back to top frame
addEventListener('focusin', function(event) {
    if (top_frame && valid_active_element) {
        valid_active_element.focus();
    }
}, true);

export default {
    on_load: function(iframe) {
        // If this frame receives focus while covered by another, send focus
        // back to that frame
        iframe.contentWindow.addEventListener('focusin', handle_focusin.bind(null, iframe), true);

        // focus first element with [autofocus]
        // (but only if the iframe is still the top layer)
        if (iframe == top_frame) {
            const doc = iframe.contentDocument;
            // Note - if no autofocus, be sure to focus body
            // This is important so that handle_focusin runs, and sets valid_active_element
            const autofocus_target = doc.querySelector('[autofocus]') || doc.body;
            autofocus_target.focus();
        }

        // Tab key - wrap focus within the iframe
        iframe.contentWindow.addEventListener('keydown', focus_wrap);
    },

    on_created: function(iframe) {
        iframe._frame_stacker_focus_management_previous_parent_active_element = document.activeElement;
        top_frame = iframe;
        iframe.focus();
    },
    on_resolve: function(value, iframe) {
        /*
            Note - if there was another frame underneath this one, this will
            immediately be reset in that frames on_resumed()
            It's important to set this back to null just in case we are the 
            last frame.
        */
        top_frame = null;
        iframe._frame_stacker_focus_management_previous_parent_active_element.focus();
    },

    on_covered: function(iframe) {
        iframe._frame_stacker_focus_management_previous_active_element = iframe.contentDocument.activeElement;
    },
    on_resumed: function(iframe) {
        top_frame = iframe;
        iframe._frame_stacker_focus_management_previous_active_element.focus();
    },
}