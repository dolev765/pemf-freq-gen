// Phyphox Integration
var PhyphoxManager = {
	ip: '',
	prefix: '192.168.1.',
	code: '',
	isConnected: false,
	isAutoAdapt: false,
	fetchInterval: null,
	currentMicroteslas: 0,
	targetMicroteslas: 0,
	adaptationStep: 0.005,

	init: function () {
		var savedPrefix = localStorage.getItem('phyphoxPrefix');
		if (savedPrefix) {
			this.prefix = savedPrefix;
			var prefixInput = document.getElementById('phyphox-prefix');
			if (prefixInput) prefixInput.value = savedPrefix;
		}
		var savedCode = localStorage.getItem('phyphoxCode');
		if (savedCode) {
			this.code = savedCode;
			var codeInput = document.getElementById('phyphox-code');
			if (codeInput) codeInput.value = savedCode;
		}
		var savedTarget = localStorage.getItem('phyphoxTargetMT');
		if (savedTarget) {
			this.targetMicroteslas = parseFloat(savedTarget);
			var targetInput = document.getElementById('target-mt');
			if (targetInput) targetInput.value = savedTarget;
		}
	},

	connect: function () {
		var codeInput = document.getElementById('phyphox-code');
		var prefixInput = document.getElementById('phyphox-prefix');
		if (!codeInput || !prefixInput) return;

		var rawPrefix = prefixInput.value.trim();
		var rawCode = codeInput.value.trim();

		// Intelligent parsing: Check if user typed a full IP in the prefix box
		// Regex for IP pattern: roughly 4 sets of numbers separated by dots
		var fullIpMatch = rawPrefix.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?/);

		if (fullIpMatch && rawPrefix.length > 12) {
			// User typed full IP! Use it directly.
			this.ip = rawPrefix;
			// Ensure port
			if (!this.ip.includes(':')) this.ip += ':8080';

			// Update UI to reflect this is a manual override
			this.code = "MANUAL";
			localStorage.setItem('phyphoxPrefix', rawPrefix);
		} else {
			// Standard Prefix + Code logic
			if (!rawCode) {
				alert('Please enter the connection code shown in the app.');
				return;
			}
			this.code = rawCode;
			this.prefix = rawPrefix;

			// Clean prefix (ensure it ends with dot if it's just a prefix)
			if (!this.prefix.endsWith('.') && this.prefix.split('.').length === 3) {
				this.prefix += '.';
			}

			this.ip = this.prefix + parseInt(this.code, 10) + ':8080';
			localStorage.setItem('phyphoxCode', this.code);
			localStorage.setItem('phyphoxPrefix', this.prefix);
		}

		this.updateStatus('connecting', 'Connecting to ' + this.ip + '...');

		if (this.fetchInterval) clearInterval(this.fetchInterval);
		this.fetchInterval = setInterval(() => this.fetchData(), 200);

		this.isConnected = true;
	},

	disconnect: function () {
		if (this.fetchInterval) {
			clearInterval(this.fetchInterval);
			this.fetchInterval = null;
		}
		this.isConnected = false;
		this.updateStatus('disconnected', 'Disconnected');
		this.currentMicroteslas = 0;
		this.updateDisplay();
	},

	updateStatus: function (status, message) {
		var statusEl = document.getElementById('phyphox-status');
		if (!statusEl) return;
		statusEl.className = 'phyphox-status status-' + status;
		statusEl.textContent = message;

		var connBtn = document.getElementById('phyphox-connect-btn');
		if (connBtn) {
			connBtn.textContent = (status === 'disconnected') ? 'Connect' : 'Disconnect';
			connBtn.onclick = (status === 'disconnected') ? () => this.connect() : () => this.disconnect();
		}
	},

	fetchData: function () {
		var baseUrl = this.ip;
		if (!baseUrl.startsWith('http')) baseUrl = 'http://' + baseUrl;
		if (!baseUrl.endsWith('/')) baseUrl += '/';

		var url = baseUrl + 'get?magnetometer';
		// Append target if set
		if (this.targetMicroteslas > 0) {
			url += '&target=' + this.targetMicroteslas;
		}

		fetch(url)
			.then(response => response.json())
			.then(data => {
				if (data && data.buffer && data.buffer.magnetometer) {
					var buffer = data.buffer.magnetometer;
					if (buffer.value && buffer.value.length >= 3) {
						var x = buffer.value[0][buffer.value[0].length - 1] || 0;
						var y = buffer.value[1][buffer.value[1].length - 1] || 0;
						var z = buffer.value[2][buffer.value[2].length - 1] || 0;
						this.currentMicroteslas = Math.sqrt(x * x + y * y + z * z);
						this.updateStatus('connected', 'Connected');
						this.updateDisplay();
						if (this.isAutoAdapt) {
							this.doAdaptation();
						}
					}
				}
			})
			.catch(err => {
				this.updateStatus('connecting', 'Retrying...');
			});
	},

	updateDisplay: function () {
		var display = document.getElementById('current-mt-display');
		if (display) {
			display.textContent = this.currentMicroteslas.toFixed(1);
		}
	},

	setTarget: function (val) {
		this.targetMicroteslas = parseFloat(val) || 0;
		localStorage.setItem('phyphoxTargetMT', this.targetMicroteslas);
	},

	setAutoAdapt: function (val) {
		this.isAutoAdapt = val;
		var label = document.getElementById('auto-adapt-label');
		var container = document.getElementById('auto-adapt-container');
		var checkbox = document.getElementById('auto-adapt-checkbox');
		if (checkbox) checkbox.checked = this.isAutoAdapt;
		if (this.isAutoAdapt) {
			if (label) label.textContent = 'Auto-Adapt: ON';
			if (container) container.classList.add('auto-adapt-active');
		} else {
			if (label) label.textContent = 'Auto-Adapt: OFF';
			if (container) container.classList.remove('auto-adapt-active');
		}
	},

	toggleAutoAdapt: function () {
		this.setAutoAdapt(!this.isAutoAdapt);
	},

	doAdaptation: function () {
		if (!window.tones || !tones.playing) return;
		var currentVol = window.volume || 0;
		var diff = this.targetMicroteslas - this.currentMicroteslas;
		var deadband = Math.max(2, this.targetMicroteslas * 0.02);
		if (Math.abs(diff) < deadband) return;
		var pGain = 0.00015;
		var adjustment = diff * pGain;
		var minAdj = 0.002;
		if (Math.abs(adjustment) < minAdj) {
			adjustment = (diff > 0) ? minAdj : -minAdj;
		}
		var maxAdj = 0.1;
		if (adjustment > maxAdj) adjustment = maxAdj;
		if (adjustment < -maxAdj) adjustment = -maxAdj;
		var newVol = Math.max(0, Math.min(1, currentVol + adjustment));
		if (Math.abs(newVol - currentVol) > 0.0005) {
			window.setVolume(newVol);
		}
	}
};
