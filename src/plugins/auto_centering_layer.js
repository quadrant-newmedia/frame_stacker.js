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
            const w = document.createElement('div');
            container.appendChild(w);
            w.style = `
                position: absolute;
                left: 0;right: 0;top: 0;bottom: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
            `;
            w.style.padding = wapper_padding;
            w.appendChild(make_spacer(1));
            const iframe = document.createElement('iframe');
            iframe.style.maxWidth = '100%';
            w.appendChild(iframe);
            w.appendChild(make_spacer(bottom_grow));
            return iframe
        },
        remove: function(iframe) {
            const w = iframe.parentElement;
            w.parentElement.removeChild(w);
        },
    };
});
