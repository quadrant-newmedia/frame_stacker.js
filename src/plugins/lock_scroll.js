let scroll_locking_layers_count = 0;
let scrollTop = null;
let scrollLeft = null;
function fix_scroll() {
    document.documentElement.scrollTop = scrollTop;
    document.documentElement.scrollLeft = scrollLeft;
}
export default {
    on_created: iframe => {
        scrollTop = document.documentElement.scrollTop;
        scrollLeft = document.documentElement.scrollLeft;
        addEventListener('scroll', fix_scroll);
        scroll_locking_layers_count++;
    },
    on_resolve: iframe => {
        scroll_locking_layers_count--;
        if (scroll_locking_layers_count==0) {
            removeEventListener('scroll', fix_scroll);
        }
    }
}