/*
Adds a basic "edge snapping toolbar" to the beginning of the body, for use with edge_snapping_layer
*/
export default {
    on_load: function(iframe) {
        const d = document.createElement('div');
        const b = iframe.contentDocument.body;
        b.insertBefore(d, b.firstElementChild);
        d.outerHTML = `
            <div class="EdgeSnapperBar">
                <button onclick="frame_stacker_edge_snapper.left()">⇦</button>
                <button onclick="frame_stacker_edge_snapper.top()">⇧</button>
                <button onclick="frame_stacker_edge_snapper.bottom()">⇩</button>
                <button onclick="frame_stacker_edge_snapper.right()">⇨</button>
            </div>
        `;
    }
}