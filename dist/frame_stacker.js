parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"MqnC":[function(require,module,exports) {
"use strict";function e(){var e=document.querySelector("frame-stacker-container");return e||(e=document.createElement("frame-stacker-container"),document.body.append(e)),e}function r(){return document.querySelectorAll("frame-stacker-container iframe")}function t(){return Array.prototype.slice.call(r()).filter(function(e){return!e._frame_stacker.resolved})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.push=s,exports.resolve=_;var o=0,n=null,c=null;function a(){document.documentElement.scrollTop=n,document.documentElement.scrollLeft=c}function l(e,t){for(var o=r(),n=o.length-1;n>=0&&o[n]!=e;n--){var c=o[n];if(t.preventDefault(),t.stopPropagation(),!c._frame_stacker.resolved){if(!c._frame_stacker.exit_on_external_click)break;_()}}}function s(r,s){var _=s.create,m=s.on_created,u=s.on_load,d=s.on_covered,f=s.on_resumed,i=s.exit_on_external_click,v=s.lock_scroll,k=s.on_resolve,p=s.remove,E=t(),x=E[E.length-1];x&&x._frame_stacker.on_covered(x),v&&(o+=1,n=document.documentElement.scrollTop,c=document.documentElement.scrollLeft,addEventListener("scroll",a));var w,y=_(e());m(y),y._frame_stacker={on_covered:d,on_resumed:f,exit_on_external_click:i,lock_scroll:v,on_resolve:k,remove:p,resolved:!1};try{w=new Promise(function(e,r){y._frame_stacker.resolve=e})}catch(h){}var L=!0;return y.addEventListener("load",function(){var e=y.contentWindow;e.frame_stacker=e.frame_stacker||window.frame_stacker,e.frame_stacker.push=window.frame_stacker.push,e.frame_stacker.resolve=window.frame_stacker.resolve,y.contentDocument.addEventListener("click",l.bind(null,y),!0),u(y,L),L=!1}),y.src=r,y.focus(),w}function _(r){var n=t(),c=n.pop();if(c){c._frame_stacker.resolved=!0,c._frame_stacker.lock_scroll&&0==--o&&removeEventListener("scroll",a),c._frame_stacker.resolve&&c._frame_stacker.resolve(r),c._frame_stacker.on_resolve(r,c),c._frame_stacker.remove(c,e());var l=n.pop();l&&l._frame_stacker.on_resumed(l)}}document.addEventListener("click",l.bind(null,null),!0);
},{}],"JlVV":[function(require,module,exports) {
"use strict";function e(e){var r=e();for(var t in r)e[t]=r[t];return e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=e;
},{}],"OVBq":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("./with_default_plugin.js"));function t(e){return e&&e.__esModule?e:{default:e}}function o(e){return"border-box"!=e.boxSizing?0:Math.ceil(parseFloat(e.borderLeftWidth)+parseFloat(e.paddingLeft)+parseFloat(e.paddingRight)+parseFloat(e.borderRightWidth))}function i(e){return"border-box"!=e.boxSizing?0:Math.ceil(parseFloat(e.borderTopHeight)+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderBottomHeight))}function n(e,t,n,r,a,d,l){if(n){var s=Math.ceil(r.documentElement.offsetHeight)+i(d);if(e.style.height=s+"px",l){var u=parseInt(d.height)<s;r.documentElement.style.overflowY=u?"scroll":"hidden"}}if(t){var c=e.contentWindow.innerWidth-r.documentElement.offsetWidth;e.style.width=Math.ceil(c+parseFloat(a.marginLeft)+parseFloat(a.marginRight)+parseFloat(a.width))+o(d)+"px"}}var r=(0,e.default)(function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=t.width,i=void 0===o||o,r=t.height,a=void 0===r||r,d=t.watch,l=void 0===d||d,s=t.adjust_overflowy,u=void 0===s||s;return{on_created:function(t){e=getComputedStyle(t)},on_load:function(t){var o=t.contentDocument;i&&(o.body.style.display="inline-block",t.style.width="100%");var r=i?getComputedStyle(o.body):null,d=n.bind(null,t,i,a,o,r,e,u);(d(),t.contentDocument.addEventListener("frame-stacker-should-resize",d),l)&&new MutationObserver(d).observe(t.contentDocument.documentElement,{attributes:!0,childList:!0,subtree:!0})}}});exports.default=r;
},{"./with_default_plugin.js":"JlVV"}],"RlDO":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("./with_default_plugin.js"));function t(e){return e&&e.__esModule?e:{default:e}}function n(e){var t=document.createElement("div");return t.style.flexGrow=e,t}var r=(0,e.default)(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.wapper_padding,r=void 0===t?"10px":t,d=e.bottom_grow,i=void 0===d?5:d;return{create:function(e){var t=document.createElement("div");e.appendChild(t),t.style="\n                position: absolute;\n                left: 0;right: 0;top: 0;bottom: 0;\n                display: flex;\n                flex-direction: column;\n                align-items: center;\n            ",t.style.padding=r,t.appendChild(n(1));var d=document.createElement("iframe");return d.style.maxWidth="100%",t.appendChild(d),t.appendChild(n(i)),d},remove:function(e){var t=e.parentElement;t.parentElement.removeChild(t)}}});exports.default=r;
},{"./with_default_plugin.js":"JlVV"}],"Aqvg":[function(require,module,exports) {
Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(e){var t=this;do{if(t.matches(e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null});
},{}],"nnBA":[function(require,module,exports) {
"use strict";function e(e,t,s,l,r){e.addEventListener(s,function(e){var s=e.target.closest(t);s&&l.call(s,e)},r)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=e,require("./polyfills/element_closest.js");
},{"./polyfills/element_closest.js":"Aqvg"}],"QOId":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("../addDelegatedEventListener.js"));function t(e){return e&&e.__esModule?e:{default:e}}var n="[frame-stacker-drag-target]";function r(e){return e.touches?{x:e.touches[0].screenX,y:e.touches[0].screenY}:{x:e.screenX,y:e.screenY}}function o(e,t,n){return e<t?t:e>n?n:e}function u(e){var t=e.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/);return t?{x:parseFloat(t[1]),y:parseFloat(t[2])}:{x:0,y:0}}function a(e,t,n){e.style.transform="translate(".concat(t,"px, ").concat(n,"px)")}var c={on_load:function(t){var c=t.contentWindow,l=!1,s=null,d=null,i=null,f=null,v=null,m=null;function p(e){e.isDefault&&e.preventDefault(),l=!0,s=r(e),d=u(t);var n=t.getBoundingClientRect();f=-n.left,i=t.ownerDocument.documentElement.clientWidth-n.right,m=-n.top,v=t.ownerDocument.documentElement.clientHeight-n.bottom}function x(e){if(l){e.preventDefault();var n=r(e),u=o(n.x-s.x,f,i),c=o(n.y-s.y,m,v);a(t,d.x+u,d.y+c)}}function h(){l=!1}(0,e.default)(c,n,"mousedown",p),(0,e.default)(c,n,"touchstart",p),c.addEventListener("mousemove",x),c.addEventListener("touchmove",x),c.addEventListener("mouseup",h),c.addEventListener("touchend",h),c.addEventListener("touchcancel",h)}};exports.default=c;
},{"../addDelegatedEventListener.js":"nnBA"}],"VQQW":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("./with_default_plugin.js"));function e(t){return t&&t.__esModule?t:{default:t}}function n(t,e){function n(){return e*t.parentElement.clientWidth+"px"}function o(){return e*t.parentElement.clientHeight+"px"}var i=t.style;return{left:function(){i.width=n(),i.left=0,i.right="",i.height="100%",i.top=0,i.bottom=0},right:function(){i.width=n(),i.right=0,i.left="",i.height="100%",i.top=0,i.bottom=0},top:function(){i.width="100%",i.left=0,i.right=0,i.height=o(),i.top=0,i.bottom=""},bottom:function(){i.width="100%",i.left=0,i.right=0,i.height=o(),i.top="",i.bottom=0}}}var o=(0,t.default)(function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.screen_fraction,o=void 0===e?.4:e,i=t.initial_side,r=void 0===i?"bottom":i;return{create:function(t){var e=document.createElement("iframe");return t.appendChild(e),e.style="position: absolute; opacity: 0;",e},on_load:function(t,e){var i=n(t,o);t.contentWindow.frame_stacker_edge_snapper=i,e&&(i[r](),t.style.opacity=1)},remove:function(t){t.parentElement.removeChild(t)}}});exports.default=o;
},{"./with_default_plugin.js":"JlVV"}],"Zl8q":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e={on_load:function(e){var t=document.createElement("div"),n=e.contentDocument.body;n.insertBefore(t,n.firstElementChild),t.outerHTML='\n            <div class="EdgeSnapperBar">\n                <button onclick="frame_stacker_edge_snapper.left()">⇦</button>\n                <button onclick="frame_stacker_edge_snapper.top()">⇧</button>\n                <button onclick="frame_stacker_edge_snapper.bottom()">⇩</button>\n                <button onclick="frame_stacker_edge_snapper.right()">⇨</button>\n            </div>\n        '}};exports.default=e;
},{}],"dVsv":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e={on_load:function(e){e.contentWindow.addEventListener("keydown",function(e){"Escape"==e.key&&frame_stacker.resolve()})}};exports.default=e;
},{}],"S2C0":[function(require,module,exports) {
"use strict";function e(e,t){return e.element.tabIndex<t.element.tabIndex?-1:e.element.tabIndex>t.element.tabIndex?1:e.dom_order-t.dom_order}function t(t){for(var n=t.querySelectorAll("*"),o=[],r=n.length,a=0;a<r;a++)n[a].tabIndex>=0&&o.push(n[a]);var c=o.map(function(e,t){return{element:e,dom_order:t}});return c.sort(e),c.map(function(e){return e.element})}function n(e){if(!e.default_prevented&&"Tab"==e.key&&!(e.altKey||e.ctrlKey||e.metaKey)){var n=e.view.document,o=t(n.body),r=o[o.length-1],a=o[0],c=n.activeElement;c!=r||e.shiftKey?c==a&&e.shiftKey&&(r.focus(),e.preventDefault()):(a.focus(),e.preventDefault())}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var o={on_load:function(e){var t=e.contentDocument.querySelector("[autofocus]");t&&t.focus(),e.contentWindow.addEventListener("keydown",n)},on_created:function(e){e._frame_stacker_focus_management_previous_parent_active_element=document.activeElement},on_resolve:function(e,t){t._frame_stacker_focus_management_previous_parent_active_element.focus()},on_covered:function(e){e._frame_stacker_focus_management_previous_active_element=e.contentDocument.activeElement},on_resumed:function(e){e._frame_stacker_focus_management_previous_active_element.focus()}};exports.default=o;
},{}],"u4RR":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t={create:function(t){var e=document.createElement("iframe");return e.style="\n\t\t\topacity: 0;\n\t\t\tdisplay: block;\n\t\t\tposition: absolute;\n\t\t\ttop: 0;\n\t\t\tleft: 0;\n\t\t\twidth: 100%;\n\t\t\theight: 100%;\n\t\t\tborder: none;\n\t\t",t.appendChild(e),e},on_load:function(t,e){e&&(t.style.opacity="1")},lock_scroll:!0,remove:function(t,e){e.removeChild(t)}};exports.default=t;
},{}],"W4a4":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e={on_created:function(e){e.style.border="none",e.style.borderRadius="5px",e.style.boxShadow="0 0 10px 5px #888"}};exports.default=e;
},{}],"EMgY":[function(require,module,exports) {
"use strict";var e=_(require("./layer_manager.js")),r=c(require("./plugins/auto_sizing.js")),t=c(require("./plugins/auto_centering_layer.js")),n=c(require("./plugins/draggable.js")),o=c(require("./plugins/edge_snapping_layer.js")),a=c(require("./plugins/edge_snapping_buttons.js")),u=c(require("./plugins/exit_on_escape.js")),l=c(require("./plugins/focus_management.js")),i=c(require("./plugins/full_layer.js")),s=c(require("./plugins/shadow_border.js"));function c(e){return e&&e.__esModule?e:{default:e}}function f(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return f=function(){return e},e}function _(e){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=f();if(r&&r.has(e))return r.get(e);var t={},n=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var a=n?Object.getOwnPropertyDescriptor(e,o):null;a&&(a.get||a.set)?Object.defineProperty(t,o,a):t[o]=e[o]}return t.default=e,r&&r.set(e,t),t}function p(e){return m(e)||y(e)||g(e)||d()}function d(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function g(e,r){if(e){if("string"==typeof e)return v(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(t):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?v(e,r):void 0}}function y(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function m(e){if(Array.isArray(e))return v(e)}function v(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function b(e,r){var t=e.map(function(e){return e[r]}).filter(Boolean);return function(){for(var e=0;e<t.length;e++)try{t[e].apply(null,arguments)}catch(r){console.error(r)}}}function h(e,r){for(var t=0;t<e.length;t++)if(r in e[t]&&void 0!==e[t][r])return e[t][r]}function j(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];return{create:h(r,"create"),remove:h(r,"remove"),exit_on_external_click:h(r,"exit_on_external_click"),lock_scroll:h(r,"lock_scroll"),on_created:b(r,"on_created"),on_load:b(r,"on_load"),on_covered:b(r,"on_covered"),on_resumed:b(r,"on_resumed"),on_resolve:b(r,"on_resolve")}}function w(e){if(!e.create||!e.remove)throw new Error("You must pass at least one plugin that implements create() and one plugin that implements remove() to frame_stacker.push(). We generally recommend starting with frame_stacker.full_layer or frame_stacker.auto_layer.")}window.frame_stacker={push:function(r){for(var t=arguments.length,n=new Array(t>1?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];n=[l.default].concat(n);var a=j.apply(void 0,p(n));return w(a),e.push(r,a)},resolve:function(r){return e.resolve(r)},combine_plugins:j,full_layer:i.default,auto_layer:j(t.default,r.default,s.default),edge_snapping_layer:o.default,auto_centering_layer:t.default,auto_sizing:r.default,draggable:n.default,easy_exit:j(u.default,{exit_on_external_click:!0}),edge_snapping_buttons:a.default,exit_on_escape:u.default,shadow_border:s.default};
},{"./layer_manager.js":"MqnC","./plugins/auto_sizing.js":"OVBq","./plugins/auto_centering_layer.js":"RlDO","./plugins/draggable.js":"QOId","./plugins/edge_snapping_layer.js":"VQQW","./plugins/edge_snapping_buttons.js":"Zl8q","./plugins/exit_on_escape.js":"dVsv","./plugins/focus_management.js":"S2C0","./plugins/full_layer.js":"u4RR","./plugins/shadow_border.js":"W4a4"}]},{},["EMgY"], null)
//# sourceMappingURL=frame_stacker.js.map