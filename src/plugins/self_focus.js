/*
This plugin is for setting/restoring the focus WITHIN the top-most iframe
*/
const data_key = '_frame_stacker_self_focus';
function refocus(iframe) {
    /*
        This timeout is necessary, at least in Chrome on Mac
        At the time the iframe blurs, focus hasn't finished transfering to the other element,
        and if we refocus() synchronously, we will first focus, but then focus will immediately move back to the original target
    */
    setTimeout(function() {
        iframe.focus();
        iframe[data_key].active_element.focus();
    }, 0);
}
// TODO - on parent window focus, refocus top iframe (ie. focus leave browser entirely, then comes back by clicking on backdrop)
export default {
    on_created: function(iframe) {
        iframe.focus();
        iframe[data_key] = {}
        iframe[data_key].refocus = refocus.bind(null, iframe);
    },
    on_load: function(iframe, first_load) {
        const body = iframe.contentDocument.body;
        iframe[data_key].active_element = body;
        body.addEventListener('focusin', function() {
            iframe[data_key].active_element = iframe.contentDocument.activeElement;
        });

        iframe.contentWindow.addEventListener('blur', iframe[data_key].refocus);

        if (!iframe[data_key].covered) {
            (body.querySelector('[autofocus]') || body).focus();
        }
    },
    on_covered: function(iframe) {
        iframe.contentWindow.removeEventListener('blur', iframe[data_key].refocus);
        iframe[data_key].covered = true;
    },
    on_resumed: function(iframe) {
        iframe[data_key].covered = false;
        iframe[data_key].refocus();
        iframe.contentWindow.addEventListener('blur', iframe[data_key].refocus);
    },
}