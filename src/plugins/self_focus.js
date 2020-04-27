/*
This plugin is for setting/restoring the focus WITHIN the top-most iframe
*/
const data_key = '_frame_stacker_self_focus';
let focusout_update_active_element_timeout = null;
function refocus(iframe) {
    /*
        This timeout is necessary, at least in Chrome on Mac
        At the time the iframe blurs, focus hasn't finished transferring to the other element, and if we refocus() synchronously, we will first focus, but then focus will immediately move back to the original target
    */
    setTimeout(function() {
        iframe.focus();
        (iframe[data_key].active_element || iframe).focus();
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
        body.addEventListener('focusout', function() {
            /* Things that might have triggered this:
                1. The user moved focus to another element in this iframe
                2. The user clicked the body inside this iframe, nothing is focused anymore
                3. The user clicked outside this iframe

            Our focusin listener will immediately handle case 1 for us.
            In case 2, we want to update active_element, in case 3 we do not.
            Cases 2 and 3 are currently indistinguishable. In either case, the iframe has not yet lost focus in the parent window. So we set a timeout to update the active_element. In case 3, we'll cancel the timeout in an iframe blur listener before the timeout executes.
            */
            focusout_update_active_element_timeout = setTimeout(function() {
                iframe[data_key].active_element = iframe.contentDocument.activeElement;
            }, 0);
        });

        iframe.contentWindow.addEventListener('blur', function() {
            clearTimeout(focusout_update_active_element_timeout);
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