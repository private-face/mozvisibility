;(function() {
	MozVisibility = {
		_NUMBER_OF_ATTEMPTS: 2,
		_CHECK_TIMEOUT: 800,
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
			
			var date = new Date();
			var hits = 0;
			var isVisible = false;
			var self = this;

			function visibilityCheck() {
				var newdate = new Date();
				var delta = newdate - date;

				date = newdate;

				if (delta > self._TIMEOUT_TRESHOLD && isVisible ||
					delta < self._TIMEOUT_TRESHOLD && !isVisible) {

					hits++;

					if (hits >= self._NUMBER_OF_ATTEMPTS || !isVisible) {
						hits = 0;
						isVisible = !isVisible;
						self._setVisibilityState(isVisible ? 'visible' : 'hidden');
					}

					setTimeout(visibilityCheck, isVisible ? self._CHECK_TIMEOUT : 0);
				} else {
					hits = 0;
					setTimeout(visibilityCheck, self._CHECK_TIMEOUT);
				}
			}

			this._setVisibilityState('visible');
			visibilityCheck();
			
			return true;
		}
	}

	MozVisibility.emulate();
})();
