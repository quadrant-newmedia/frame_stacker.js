/*
    Given an array of plugins, create a single plugin.
*/
export default (...plugins) => ({
    /*
        At least one plugin must define this.

        Takes a container element as its sole parameter.
        The container will be positioned such that it covers the entire viewport.
        Must create an iframe element, add it as a descendant of the container,
        and return the iframe.

        The iframe need not be a direct child of the container - 
        you can add wrapper elements as necessary.

        You can also add other child elements to the container, for layout 
        purposes, but these elements should not be interactive in any way.
    */
    create: get_first_defined(plugins, 'create'),

    /*
        At least one plugin must define this. 
        Usually this will be the same plugin that implements create().

        Will be given the iframe and container element as parameters.
        At minimum, this function must remove the iframe from the DOM.
        You MAY animate the iframe out - you don't have to remove it synchronously.

        As soon as the iframe has been removed from the DOM, your entire
        container element be will be destroyed.
    */
    remove: get_first_defined(plugins, 'remove'),

    /*
        Callbacks - pretty self explanatory.
        Each is called with iframe as the sole argument, except where we 
        indicate otherwise below.
    */

    on_created: execute_all(plugins, 'on_created'),
    /*
        on_load(iframe, first_load)
        first_load will be true on the iframe's first load, false after that
    */
    on_load: execute_all(plugins, 'on_load'),

    /*
        Called if this is the top layer and the user clicks outside this layer's iframe.
        You may want to resolve().
        Or maybe you want to "bounce" or flash, to get user's attention.
    */
    on_external_click: execute_all(plugins, 'on_external_click'),

    on_covered: execute_all(plugins, 'on_covered'),
    on_resumed: execute_all(plugins, 'on_resumed'),
    /*
        on_resolve(value, iframe)
        value is whatever value was passed to frame_stacker.resolve()
        (may be undefined)
    */
    on_resolve: execute_all(plugins, 'on_resolve'),
});

function execute_all(plugins, function_name) {
    var functions = plugins.map(
        function(plugin) {return plugin[function_name]}
    ).filter(Boolean);
    return function() {
        for (var i = 0; i < functions.length; i++) {
            try {
                functions[i].apply(null, arguments);
            } catch(e) {
                console.error(e);
            }
        }
    }
}
function get_first_defined(plugins, property) {
    for (var i = 0; i < plugins.length; i++) {
        if (property in plugins[i] && typeof plugins[i][property] !== 'undefined') {
            return plugins[i][property];
        }
    }
}