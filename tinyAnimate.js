/**
 * TinyAnimate
 *  version 0.3.0
 *
 * Source:  https://github.com/branneman/TinyAnimate
 * Author:  Bran van der Meer <branmovic@gmail.com> (http://bran.name/)
 * License: MIT
 *
 * Functions:
 *  TinyAnimate.animate(from, to, duration, update, easing, done)
 *  TinyAnimate.animateCSS(element, property, unit, from, to, duration, easing, done)
 *  TinyAnimate.cancel(animation)
 *
 * Parameters:
 *  from      int                Property value to animate from
 *  to        int                Property value to animate to
 *  duration  int                Duration in milliseconds
 *  easing    string | function  Optional: A string when the easing function is available in __easings
 *  update    function           Function to implement updating the DOM, get's called with a value between `from` and `to`
 *  done      function           Optional: To be executed when the animation has completed.
 *
 * Returns:
 *  animation object             Animation object that can be canceled.
 */

tween = function (from, to, duration, easing, update, done) {
  // Early bail out if called incorrectly
  if (
    typeof from !== "number" ||
    typeof to !== "number" ||
    typeof duration !== "number"
  )
    return;

  // Determine easing
  if (typeof easing === "string" && __easings[easing]) {
    easing = __easings[easing];
  }
  if (typeof easing !== "function") {
    easing = __easings.linear;
  }

  // Create mock done() function if necessary
  if (typeof done !== "function") {
    done = function () {};
  }

  // Pick implementation (requestAnimationFrame | setTimeout)
  let rAF =
    window.requestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  // Animation loop
  let canceled = false;
  let change = to - from;
  function loop(timestamp) {
    if (canceled) {
      return;
    }
    let time = (timestamp || +new Date()) - start;
    if (time >= 0) {
      update(easing(time, from, change, duration));
    }
    if (time >= 0 && time >= duration) {
      update(to);
      done();
    } else {
      rAF(loop);
    }
  }
  update(from);

  // Start animation loop
  let start =
    window.performance && window.performance.now
      ? window.performance.now()
      : +new Date();

  rAF(loop);

  return {
    cancel: function () {
      canceled = true;
    },
  };
};

/**
 * TinyAnimate.cancel()
 *  Method for canceling animations
 */
cancelTween = function (animation) {
  if (!animation) {
    return;
  }
  animation.cancel();
};

/**
 * TinyAnimate.__easings
 *  Adapted from jQuery Easing
 */
__easings = {};
__easings.linear = function (t, b, c, d) {
  return (c * t) / d + b;
};
__easings.easeInQuad = function (t, b, c, d) {
  return c * (t /= d) * t + b;
};
__easings.easeOutQuad = function (t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
};
__easings.easeInOutQuad = function (t, b, c, d) {
  if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
  return (-c / 2) * (--t * (t - 2) - 1) + b;
};
__easings.easeInCubic = function (t, b, c, d) {
  return c * (t /= d) * t * t + b;
};
__easings.easeOutCubic = function (t, b, c, d) {
  return c * ((t = t / d - 1) * t * t + 1) + b;
};
__easings.easeInOutCubic = function (t, b, c, d) {
  if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
  return (c / 2) * ((t -= 2) * t * t + 2) + b;
};
__easings.easeInQuart = function (t, b, c, d) {
  return c * (t /= d) * t * t * t + b;
};
__easings.easeOutQuart = function (t, b, c, d) {
  return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};
__easings.easeInOutQuart = function (t, b, c, d) {
  if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b;
  return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
};
__easings.easeInQuint = function (t, b, c, d) {
  return c * (t /= d) * t * t * t * t + b;
};
__easings.easeOutQuint = function (t, b, c, d) {
  return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
};
__easings.easeInOutQuint = function (t, b, c, d) {
  if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
  return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
};
__easings.easeInSine = function (t, b, c, d) {
  return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
};
__easings.easeOutSine = function (t, b, c, d) {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};
__easings.easeInOutSine = function (t, b, c, d) {
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
};
__easings.easeInExpo = function (t, b, c, d) {
  return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
};
__easings.easeOutExpo = function (t, b, c, d) {
  return t == d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
};
__easings.easeInOutExpo = function (t, b, c, d) {
  if (t == 0) return b;
  if (t == d) return b + c;
  if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
  return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
};
__easings.easeInCirc = function (t, b, c, d) {
  return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
};
__easings.easeOutCirc = function (t, b, c, d) {
  return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
};
__easings.easeInOutCirc = function (t, b, c, d) {
  if ((t /= d / 2) < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
  return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
};
__easings.easeInElastic = function (t, b, c, d) {
  let p = 0;
  let a = c;
  let s = 0;
  if (t == 0) return b;
  if ((t /= d) == 1) return b + c;
  if (!p) p = d * 0.3;
  if (a < Math.abs(c)) {
    a = c;
    s = p / 4;
  } else s = (p / (2 * Math.PI)) * Math.asin(c / a);
  return (
    -(
      a *
      Math.pow(2, 10 * (t -= 1)) *
      Math.sin(((t * d - s) * (2 * Math.PI)) / p)
    ) + b
  );
};
__easings.easeOutElastic = function (t, b, c, d) {
  let p = 0;
  let a = c;
  let s = 0;
  if (t == 0) return b;
  if ((t /= d) == 1) return b + c;
  if (!p) p = d * 0.3;
  if (a < Math.abs(c)) {
    a = c;
    s = p / 4;
  } else s = (p / (2 * Math.PI)) * Math.asin(c / a);
  return (
    a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
    c +
    b
  );
};
__easings.easeInOutElastic = function (t, b, c, d) {
  let p = 0;
  let a = c;
  let s = 0;
  if (t == 0) return b;
  if ((t /= d / 2) == 2) return b + c;
  if (!p) p = d * (0.3 * 1.5);
  if (a < Math.abs(c)) {
    a = c;
    s = p / 4;
  } else s = (p / (2 * Math.PI)) * Math.asin(c / a);
  if (t < 1)
    return (
      -0.5 *
        (a *
          Math.pow(2, 10 * (t -= 1)) *
          Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
      b
    );
  return (
    a *
      Math.pow(2, -10 * (t -= 1)) *
      Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
      0.5 +
    c +
    b
  );
};
__easings.easeInBack = function (t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c * (t /= d) * t * ((s + 1) * t - s) + b;
};
__easings.easeOutBack = function (t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};
__easings.easeInOutBack = function (t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  if ((t /= d / 2) < 1)
    return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
  return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
};
__easings.easeInBounce = function (t, b, c, d) {
  return c - __easings.easeOutBounce(d - t, 0, c, d) + b;
};
__easings.easeOutBounce = function (t, b, c, d) {
  if ((t /= d) < 1 / 2.75) {
    return c * (7.5625 * t * t) + b;
  } else if (t < 2 / 2.75) {
    return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
  } else if (t < 2.5 / 2.75) {
    return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
  } else {
    return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
  }
};
__easings.easeInOutBounce = function (t, b, c, d) {
  if (t < d / 2) return __easings.easeInBounce(t * 2, 0, c, d) * 0.5 + b;
  return __easings.easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
};
