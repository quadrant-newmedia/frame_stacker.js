export const run_tests = {
    on_load: function(iframe) {
        iframe.contentWindow.run_tests && iframe.contentWindow.run_tests();
    }
};
export function log_test(condition, test_description) {
    if (!condition) {
        console.error('Test failed: ', test_description);
    }
    else {
        console.log('✓', test_description);
    }
}

// make available to simple in-line event listeners
window.test_utils = {
    run_tests,
    log_test,
};