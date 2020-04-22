/*
This plugin implements 3 different features:
- a frame's focus is restored after a child frame is resolved
- if focus somehow shifts to any window other than top-most, it is moved back to the top frame
- pressing tab while a frame is open will wrap between the focusable elements in that frame

These different features are implemented in 2 different plugins, and we combine here into one.
*/
import combine_plugins from '../combine_plugins.js';

import focus_wrap from './focus_wrap.js';
import self_focus from './self_focus.js';

export default combine_plugins(focus_wrap, self_focus);
