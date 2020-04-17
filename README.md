# frame_stacker.js

Work in progress.

Helper library for managing accessible, nestable, iframe-based modal dialogs/overlays.

HTML modal dialogs/windows are difficult to implement properly. You have to consider:
- focus management
- blocking clicks outside of the dialog
- layering/z-index issues

We aim to take care of all of this for you.

## Other features

In addition to the standard features required by any dialog/overlay, we provide several opt-in features:
- document scroll locking
- automatic iframe sizing (which responds to DOM changes within the iframe)
- making dialogs draggable