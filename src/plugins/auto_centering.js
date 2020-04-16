function make_spacer(grow) {
    const s = document.createElement('div');
    s.style.flexGrow = grow;
    return s;
}
export default function({
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
}
