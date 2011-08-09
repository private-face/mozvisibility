;(function() {
	MozVisibility = {
		_MAX_TRIES: 10,
		_TIMEOUT_TRESHOLD: 900,

		_getEvent: function() {
			if (!this._event) {
				this._event = document.createEvent('HTMLEvents');
				this._event.initEvent('mozvisibilitychange', true, true);
				this._event.eventName = 'mozvisibilitychange';
			}
			return this._event;
		},

		_setVisibilityState: function(state) {
		    document.mozVisibilityState = state;
			document.mozHidden = (state !== 'visible');
		    document.dispatchEvent(this._getEvent());
		},

		canBeEmulated: function() {
			var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
				ua = navigator.userAgent.toLowerCase();

			var match = ua.indexOf('compatible') < 0 && rmozilla.exec(ua) || [];

			return (match[2] && parseInt(match[2]) >= 5 && 
					!document.visibilityState && !document.MozVisibilityState);
		},
		
		emulate: function() {
			if (!this.canBeEmulated()) {
				return false;
			}
			
			var isVisible = false;
			var self = this;
			var timer = null;
			
			window.addEventListener("blur", function() {
				var date = new Date;
				var tries = 0;

				if (!isVisible) {
				    return;
				}
				
				function invisibilityCheck() {
					var newdate = new Date;
					var delta = newdate - date;

					date = newdate;
					tries++;

					if (delta > self._TIMEOUT_TRESHOLD) {
						isVisible = false;
						self._setVisibilityState('hidden');
					} else if (tries < self._MAX_TRIES) {
						timer = setTimeout(invisibilityCheck, 0);
					}
				}
				
				invisibilityCheck();
			}, false);

			window.addEventListener("focus", function() {
				clearTimeout(timer);
				if (!isVisible) {
					isVisible = true;
					self._setVisibilityState('visible');
				}
			}, false);

			return true;
		}
	}

	MozVisibility.emulate();
})();
