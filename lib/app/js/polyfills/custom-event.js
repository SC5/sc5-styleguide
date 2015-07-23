(function(global, factory) {
  global.CustomEvent = factory();
}(window, function() {

  /**
   * Create a new CustomEvent, native falling back to polyfill.
   *
   * @param  {String} type   The name the custom event type
   * @param  {Object} params Initialization object; see native API
   */

  var CustomEvent = window.CustomEvent || function(type, params) {
    var e;

    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };

    try {
      e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
    }
    catch (error) {
      // If we don’t even have initCustomEvent, use a regular event instead.
      e = document.createEvent('Event');
      e.initEvent(type, params.bubbles, params.cancelable);
      e.detail = params.detail;
    }

    return e;
  };

  /**
   * Exports
   */

  return CustomEvent;

}));
