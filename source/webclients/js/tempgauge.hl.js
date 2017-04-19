/**
 * A jQuery plugin boilerplate.
 * Author: Jonathan Nicol @f6design
 */
;(function($) {
  // Change this to your plugin name.
  var pluginName = 'tempgauge';

  /**
   * Plugin object constructor.
   * Implements the Revealing Module Pattern.
   */
  function Plugin(element, options) {
    // References to DOM and jQuery versions of element.
    var el = element;
    var $el = $(element);

    // Extend default options with those supplied by user.
    var options = $.extend({}, $.fn[pluginName].defaults, options);
		var padding = 10,
		ctx = null,
		canvas = null;

    createTempGauge(el);

		function createTempGauge(gauge){

			canvas = document.createElement("canvas");

			ctx = canvas.getContext("2d");
			var currentTempText = $(gauge).text(),
				currentTemp = parseFloat(currentTempText) || options.defaultTemp;

			canvas.width = options.width;
			canvas.height = options.width * 2 + options.labelSize;

			$(gauge).append(canvas);

			redraw(currentTemp, currentTempText);
		}

		function redraw(currentTemp, currentTempText) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
			var length = options.maxTemp - options.minTemp;
			var percentage = calculatePercentage(currentTemp, options.minTemp, length);

			fillTempGauge(ctx, 0, 0, options.width,  options.width * 2, percentage);
			strokeTempGauge(ctx, 0, 0,  options.width,  options.width * 2,  options.borderWidth);
			if(options.showLabel){
				drawLabel(ctx, canvas.width/2, canvas.height - options.labelSize/3 , currentTempText);
			}

		}

		var setNewTemp = function(temp) {
			tempText = "" + temp + String.fromCharCode(parseInt("00B0", 16)) + "C";
			redraw(temp, tempText);
		}


		function calculatePercentage(temp, mintemp, length){
			var percentage = (temp - mintemp)/ length;
			percentage = percentage > 1 ? 1 : percentage;
			percentage = percentage < 0 ? 0 : percentage;
			return percentage;

		}

		function strokeTempGauge(ctx, x, y, width, height, borderWidth){

			y += padding/2;
			height -= padding;

			var wholeCircle = Math.PI * 2;
			var smallRadius = width / 3 / 2;
			var xSmall = x + width / 2;
			var ySmall = y + smallRadius;

			var bigRadius = height / 6;
			var xBig = x + width / 2;
			var yBig = y + height / 6 * 5 ;

			var offSet = Math.sqrt((Math.pow(bigRadius,2) - Math.pow(smallRadius/2,2)),2);

			ctx.beginPath();
			ctx.lineWidth = borderWidth;
			ctx.strokeStyle = options.borderColor;
			ctx.arc(xSmall, ySmall, smallRadius, wholeCircle / -2, 0, false);
			ctx.moveTo(xSmall - smallRadius , ySmall);
			ctx.lineTo(xSmall - smallRadius , yBig - offSet + borderWidth);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(xSmall + smallRadius , ySmall);
			ctx.lineTo(xSmall + smallRadius , yBig - offSet + borderWidth);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(xBig, yBig, bigRadius, wholeCircle/-6, wholeCircle * -2/6, false);
			ctx.stroke();
		}

		function fillTempGauge(ctx, x, y, width, height, percent){

			var wholeCircle = Math.PI * 2;

			y += padding/2;
			height -= padding;

			var bigRadius = height / 6 - options.borderWidth;
			var xBig = x + width / 2;
			var yBig = y + height / 6 * 5 ;

			var smallRadius = width / 3 / 2 - options.borderWidth;
			var xSmall = x + width / 2;
			var ySmall = y + smallRadius + options.borderWidth;

			var offSet = Math.sqrt((Math.pow(bigRadius,2) - Math.pow(smallRadius/2,2)),2);

			var twoThirdsLength = height / 6 * 5 - offSet - width / 3 / 2;

			var gauge = twoThirdsLength * percent;

			var yBox = yBig - offSet - gauge;
			var xBox = xBig - width / 6 + options.borderWidth;

			ctx.fillStyle = options.fillColor;

			if(percent == 1){
				ctx.arc(xSmall, ySmall, smallRadius, wholeCircle / -2, 0, false);
				ctx.closePath();
				ctx.fill();
			}

			ctx.fillRect(xBox, yBox - 1, width/3 - options.borderWidth*2, gauge + padding);

			ctx.beginPath();
			ctx.arc(xBig, yBig, bigRadius, wholeCircle / -6, wholeCircle * -2/6, false);
			ctx.closePath();
			ctx.fill();
		}

		function drawLabel(ctx, x, y, text){
			ctx.font = "bold " + options.labelSize + "px Arial ";
			ctx.textAlign = "center";
			ctx.fillStyle = options.borderColor;
			ctx.fillText(text, x , y );
		}

    /**
     * Initialize plugin.
     */
    function init() {
      // Add any initialization logic here...

      hook('onInit');
    }

    /**
     * Example Public Method
     */
    function updatetemp(temp) {
      var updateTemp = parseFloat(temp);
      if( updateTemp ){

        setNewTemp(updateTemp);
      }
    }

    /**
     * Get/set a plugin option.
     * Get usage: $('#el').demoplugin('option', 'key');
     * Set usage: $('#el').demoplugin('option', 'key', value);
     */
    function option (key, val) {
      if (val) {
        options[key] = val;
      } else {
        return options[key];
      }
    }

    /**
     * Destroy plugin.
     * Usage: $('#el').demoplugin('destroy');
     */
    function destroy() {
      // Iterate over each matching element.
      $el.each(function() {
        var el = this;
        var $el = $(this);

        // Add code to restore the element to its original state...

        hook('onDestroy');
        // Remove Plugin instance from the element.
        $el.removeData('plugin_' + pluginName);
      });
    }

    /**
     * Callback hooks.
     * Usage: In the defaults object specify a callback function:
     * hookName: function() {}
     * Then somewhere in the plugin trigger the callback:
     * hook('hookName');
     */
    function hook(hookName) {
      if (options[hookName] !== undefined) {
        // Call the user defined function.
        // Scope is set to the jQuery element we are operating on.
        options[hookName].call(el);
      }
    }

    // Initialize the plugin instance.
    init();

    // Expose methods of Plugin we wish to be public.
    return {
      option: option,
      destroy: destroy,
      updatetemp: updatetemp
    };
  }

  /**
   * Plugin definition.
   */
  $.fn[pluginName] = function(options) {
    // If the first parameter is a string, treat this as a call to
    // a public method.
    if (typeof arguments[0] === 'string') {
      var methodName = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var returnVal;
      this.each(function() {
        // Check that the element has a plugin instance, and that
        // the requested public method exists.
        if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
          // Call the method of the Plugin instance, and Pass it
          // the supplied arguments.
          returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
        } else {
          throw new Error('Method ' +  methodName + ' does not exist on jQuery.' + pluginName);
        }
      });
      if (returnVal !== undefined){
        // If the method returned a value, return the value.
        return returnVal;
      } else {
        // Otherwise, returning 'this' preserves chainability.
        return this;
      }
    // If the first parameter is an object (options), or was omitted,
    // instantiate a new instance of the plugin.
    } else if (typeof options === "object" || !options) {
      return this.each(function() {
        // Only allow the plugin to be instantiated once.
        if (!$.data(this, 'plugin_' + pluginName)) {
          // Pass options to Plugin constructor, and store Plugin
          // instance in the elements jQuery data object.
          $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
        }
      });
    }
  };

  // Default plugin options.
  // Options can be overwritten when initializing plugin, by
  // passing an object literal, or after initialization:
  // $('#el').demoplugin('option', 'key', value);
  $.fn[pluginName].defaults = {
    onInit: function() {},
    onDestroy: function() {}
  };

})(jQuery);
