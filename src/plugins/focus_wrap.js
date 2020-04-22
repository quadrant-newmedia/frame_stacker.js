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
export default {
    on_load: function(iframe) {
        iframe.contentWindow.addEventListener('keydown', focus_wrap);
    },
}