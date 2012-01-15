/*
 * mozVisibility.js library v0.6
 * Page Visibility API emulation for Firefox 5+
 * 
 * Copyright (c) 2012 Vladimir Zhuravlev
 * 
 * Released under MIT License
 * 
 * Date: Sun Jan 15 20:26:37 GST 2012
 **/
;(function() {
	MozVisibility = {
		_MAX_TRIES: 10,
		_date: new Date,
		_tries: 0,
		_timer: null,
		
		_isVisible: undefined,
		
		_proxy: function(fn, context) {
			context = context || window;
			
			return function() {
				fn.apply(context, arguments);
			};
		},

		_getEvent: function() {
			if (!this._event) {
				this._event = document.createEvent('HTMLEvents');
				this._event.initEvent('mozvisibilitychange', true, true);
				this._event.eventName = 'mozvisibilitychange';
			}
			return this._event;
		},

		_setVisibilityState: function(state) {
			this._isVisible = (state === 'visible');
			document.mozVisibilityState = state;
			document.mozHidden = !this._isVisible;
			document.dispatchEvent(this._getEvent());
		},

		_visibilityCheck: function() {
			this._date = new Date;
			this._tries = 0;
			this._timer = setTimeout(this._invisibilityCheckTimeout, 0);
		},

		_invisibilityCheckTimeoutTemplate: function() {
			var newdate = new Date;
			var delta = newdate - this._date;

			this._date = newdate;
			this._tries++;

			if (delta > 1000) {
				this._setVisibilityState('hidden');
			} else if (this._tries < this._MAX_TRIES) {
				this._timer = setTimeout(this._invisibilityCheckTimeout, 0);
			}
		},
		
		_onFocus: function() {
			clearTimeout(this._timer);
			if (!this._isVisible) {
				this._setVisibilityState('visible');
			}
		},
		
		_onBlur: function() {
			if (!this._isVisible) {
			    return;
			}
			
			this._visibilityCheck();
		},
		
		canBeEmulated: function() {
			var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
				ua = navigator.userAgent.toLowerCase();

			var match = ua.indexOf('compatible') < 0 && rmozilla.exec(ua) || [];

			return (window.top === window &&				// not in IFRAME
					match[2] && parseInt(match[2]) >= 5 && 	// Firefox 5.0+
					!document.visibilityState && !document.MozVisibilityState); // visibility API is not already supported
		},
		
		emulate: function() {
			if (!this.canBeEmulated()) {
				return false;
			}
			
			this._invisibilityCheckTimeout = this._proxy(this._invisibilityCheckTimeoutTemplate, this);
			
			window.addEventListener("focus", this._proxy(this._onFocus, this), false);
			window.addEventListener("blur", this._proxy(this._onBlur, this), false);

			this._visibilityCheck();
			return true;
		}
	};

	MozVisibility.emulate();
})();
