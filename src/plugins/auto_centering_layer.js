/*
Creates an iframe inside of a flexbox wrapper item.

Keeps the iframe centered horizontally.
Vertical centering is more complex -> when the iframe is small, we push it closer to the top of the window. I think this looks better/more balanced than having it dead-center. It makes sense, when you compare to alert(), whose pop-up is bascially at the top of the page all the time.

Does not set the size of the iframe in any way. 
For most use cases, you can combine with auto_sizing. ALternatively, you can set explicit width/height in the on_created callback.
*/
import with_default_plugin from './with_default_plugin.js';

function make_spacer(grow) {
    const s = document.createElement('div');
    s.style.flexGrow = grow;
    return s;
}
export default with_default_plugin(function({
    wapper_padding='10px',
    bottom_grow=5,
}={}) {
    return {
        create: function(container) {
            const s = container.style;
            s.display = 'flex';
            s.flexDirection = 'column';
            s.alignItems = 'center';
            s.padding = wapper_padding;
            s.boxSizing = 'border-box';
            container.appendChild(make_spacer(1));
            const iframe = document.createElement('iframe');
            iframe.style.maxWidth = '100%';
            iframe.style.opacity = 0;
            container.appendChild(iframe);
            container.appendChild(make_spacer(bottom_grow));
            return iframe
        },
        on_load: function(iframe, first_load) {
            if (first_load) iframe.style.opacity = '1';
        },
        remove: function(iframe) {
            iframe.parentElement.removeChild(iframe);
        },
    };
});
