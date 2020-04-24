// from "dedent" on npm
function dedent(strings) {
  var raw = void 0;
  if (typeof strings === "string") {
    // dedent can be used as a plain function
    raw = [strings];
  } else {
    raw = strings.raw;
  }

  // first, perform interpolation
  var result = "";
  for (var i = 0; i < raw.length; i++) {
    result += raw[i].
    // join lines when there is a suppressed newline
    replace(/\\\n[ \t]*/g, "").

    // handle escaped backticks
    replace(/\\`/g, "`");

    if (i < (arguments.length <= 1 ? 0 : arguments.length - 1)) {
      result += arguments.length <= i + 1 ? undefined : arguments[i + 1];
    }
  }

  // now strip indentation
  var lines = result.split("\n");
  var mindent = null;
  lines.forEach(function (l) {
    var m = l.match(/^(\s+)\S+/);
    if (m) {
      var indent = m[1].length;
      if (!mindent) {
        // this is the first indented line
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    result = lines.map(function (l) {
      return l[0] === " " ? l.slice(mindent) : l;
    }).join("\n");
  }

  // dedent eats leading and trailing whitespace too
  result = result.trim();

  // handle escaped newlines at the end to ensure they don't get stripped too
  return result.replace(/\\n/g, "\n");
}

// short alias, make available in inline event handlers
window.fs = window.parent.frame_stacker;

[].slice.call(document.querySelectorAll('[demo-button]')).forEach(function(e) {
	var c = document.createElement('code');
	c.classList.add('demo-button-code');
	c.innerText = dedent(e.getAttribute('onclick'));
	e.parentElement.insertBefore(c, e);
  if (!e.innerText.trim()) {
    e.innerText = 'Try It'
  }
});

window.tests =  {
  big_layer: fs.combine_plugins(fs.auto_centering_layer, fs.shadow_border, {
    on_created: function(iframe) {
      iframe.style.width = '80%';
      iframe.style.height = '80%';
    }
  }),
  medium_layer: fs.combine_plugins(fs.auto_centering_layer, fs.shadow_border, {
    on_created: function(iframe) {
      iframe.style.width = '60%';
      iframe.style.height = '60%';
    }
  }),
  small_layer: fs.combine_plugins(fs.auto_centering_layer, fs.shadow_border, {
    on_created: function(iframe) {
      iframe.style.width = '40%';
      iframe.style.height = '40%';
    }
  }),
  iframe_with_padding: {
    on_created: function(iframe) {
      iframe.style.backgroundColor = 'red';
      iframe.style.padding = '10px';
    }
  }
}