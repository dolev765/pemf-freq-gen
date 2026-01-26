// Stereo Frequency Support - allows different frequencies for left and right channels
(function() {
	// Initialize stereo frequency mode
	window.stereoFreqMode = false;
	window.freqLeft = 440;
	window.freqRight = 440;
	
	// Patch Tone class to support separate left/right frequencies
	function patchToneClass() {
		if (!window.tones || !window.tones.current) return;
		
		var originalInitOscillator = window.tones.current.initOscillator;
		var originalSetFreq = window.tones.current.setFreq;
		var originalStop = window.tones.current.stop;
		
		// Store separate oscillators
		window.tones.current.leftOscillator = null;
		window.tones.current.rightOscillator = null;
		
		// Override initOscillator to create separate oscillators for stereo mode
		window.tones.current.initOscillator = function() {
			if (window.stereoFreqMode && this.channels === 2) {
				// Create separate oscillators for left and right
				if (this.leftOscillator) {
					try { this.leftOscillator.stop(); } catch(e) {}
				}
				if (this.rightOscillator) {
					try { this.rightOscillator.stop(); } catch(e) {}
				}
				
				this.leftOscillator = tones.context.createOscillator();
				this.rightOscillator = tones.context.createOscillator();
				
				this.leftOscillator.connect(this.leftGainNode);
				this.rightOscillator.connect(this.rightGainNode);
				
				this.leftOscillator.frequency.value = window.freqLeft || 440;
				this.rightOscillator.frequency.value = window.freqRight || 440;
				
				this.leftOscillator.type = this.type;
				this.rightOscillator.type = this.type;
				
				// Store reference to both for stop
				this.oscillator = this.leftOscillator; // Keep for compatibility
			} else {
				// Use original single oscillator
				if (originalInitOscillator) {
					originalInitOscillator.call(this);
				}
			}
		};
		
		// Override setFreq to handle left/right separately
		window.tones.current.setFreq = function(freq, channel) {
			if (window.stereoFreqMode && this.channels === 2) {
				if (channel === 'left' || channel === 'L') {
					window.freqLeft = freq;
					if (this.leftOscillator && this.playing) {
						this.leftOscillator.frequency.setTargetAtTime(freq, tones.context.currentTime, 0.03);
					}
					updateLeftFreqDisplay();
				} else if (channel === 'right' || channel === 'R') {
					window.freqRight = freq;
					if (this.rightOscillator && this.playing) {
						this.rightOscillator.frequency.setTargetAtTime(freq, tones.context.currentTime, 0.03);
					}
					updateRightFreqDisplay();
				} else {
					// Set both to same frequency (when stereo mode is off or no channel specified)
					window.freqLeft = freq;
					window.freqRight = freq;
					if (this.leftOscillator && this.playing) {
						this.leftOscillator.frequency.setTargetAtTime(freq, tones.context.currentTime, 0.03);
					}
					if (this.rightOscillator && this.playing) {
						this.rightOscillator.frequency.setTargetAtTime(freq, tones.context.currentTime, 0.03);
					}
					updateLeftFreqDisplay();
					updateRightFreqDisplay();
				}
				this.freq = freq; // Keep for compatibility
			} else {
				// Use original single frequency, but also update left/right for display
				window.freqLeft = freq;
				window.freqRight = freq;
				updateLeftFreqDisplay();
				updateRightFreqDisplay();
				if (originalSetFreq) {
					originalSetFreq.call(this, freq);
				}
			}
		};
		
		// Override play to start both oscillators in stereo mode
		var originalPlay = window.tones.current.play;
		window.tones.current.play = function(startTime) {
			if (window.stereoFreqMode && this.channels === 2 && this.leftOscillator && this.rightOscillator) {
				if (this.playing) return false;
				var t = startTime || tones.context.currentTime;
				this.leftOscillator.start(t);
				this.rightOscillator.start(t);
				this.playing = true;
				
				// Handle fade in
				if (BrowserDetect.Firefox) {
					this.fadeGainNode.gain.setTargetAtTime(1, t, 0.05);
				} else {
					this.fadeGainNode.gain.cancelScheduledValues(t);
					this.fadeGainNode.gain.setValueAtTime(this.fadeGainNode.gain.value, t);
					this.fadeGainNode.gain.linearRampToValueAtTime(1, t + 0.25 * (1 - this.fadeGainNode.gain.value));
				}
			} else {
				// Use original play
				if (originalPlay) {
					return originalPlay.call(this, startTime);
				}
			}
		};
		
		// Override stop to stop both oscillators
		window.tones.current.stop = function(stopTime) {
			if (window.stereoFreqMode && this.channels === 2) {
				if (!this.playing) return false;
				var t = stopTime || tones.context.currentTime;
				
				// Handle fade out
				if (BrowserDetect.Firefox) {
					this.fadeGainNode.gain.setTargetAtTime(0, t, 0.05);
					var delay = 1000 * (t - tones.context.currentTime + 8 * 0.05);
				} else {
					this.fadeGainNode.gain.cancelScheduledValues(t);
					this.fadeGainNode.gain.setValueAtTime(this.fadeGainNode.gain.value, t);
					var fadeTime = 0.25 * this.fadeGainNode.gain.value;
					this.fadeGainNode.gain.linearRampToValueAtTime(0, t + fadeTime);
					var delay = 1000 * (t - tones.context.currentTime + fadeTime + 0.5);
				}
				
				// Stop both oscillators
				var self = this;
				this.oscillatorStopTimeoutID = setTimeout(function() {
					try {
						if (self.leftOscillator) self.leftOscillator.stop();
						if (self.rightOscillator) self.rightOscillator.stop();
					} catch(e) {}
					self.oscillatorStopTimeoutID = null;
					self.playing = false;
				}, delay);
			} else {
				// Use original stop
				if (originalStop) {
					return originalStop.call(this, stopTime);
				}
			}
		};
	}
	
	// Function to set stereo frequency mode
	window.setStereoFreqMode = function(enabled) {
		window.stereoFreqMode = enabled;
		var checkbox = document.getElementById('stereo-freq-checkbox');
		if (checkbox) checkbox.checked = enabled;
		
		// If stereo mode is disabled, sync both frequencies to main slider
		if (!enabled && window.sliderFreq) {
			window.freqLeft = window.sliderFreq;
			window.freqRight = window.sliderFreq;
			updateLeftFreqDisplay();
			updateRightFreqDisplay();
		}
		
		// If currently playing, need to restart with new mode
		if (window.tones && window.tones.playing) {
			window.tones.stop();
			setTimeout(function() {
				window.tones.play();
			}, 100);
		}
		
		// Update UI visibility
		var leftFreqGroup = document.getElementById('left-freq-group');
		var rightFreqGroup = document.getElementById('right-freq-group');
		if (leftFreqGroup) leftFreqGroup.style.display = enabled ? 'inline-block' : 'none';
		if (rightFreqGroup) rightFreqGroup.style.display = enabled ? 'inline-block' : 'none';
	};
	
	// Function to set left frequency
	window.setFreqLeft = function(freq) {
		if (freq < 1 || freq > 20154) return false;
		window.freqLeft = freq;
		if (window.tones && window.tones.current) {
			window.tones.current.setFreq(freq, 'left');
		}
		updateLeftFreqDisplay();
	};
	
	// Function to set right frequency
	window.setFreqRight = function(freq) {
		if (freq < 1 || freq > 20154) return false;
		window.freqRight = freq;
		if (window.tones && window.tones.current) {
			window.tones.current.setFreq(freq, 'right');
		}
		updateRightFreqDisplay();
	};
	
	// Update display functions
	function updateLeftFreqDisplay() {
		var display = document.getElementById('left-freq-readout');
		if (display) {
			// Use formatHertz if available, otherwise simple format
			if (typeof formatHertz === 'function') {
				display.innerHTML = formatHertz(window.freqLeft);
			} else {
				display.textContent = window.freqLeft.toFixed(1) + ' Hz';
			}
		}
		var input = document.getElementById('left-freq-input');
		if (input) input.value = window.freqLeft;
	}
	
	function updateRightFreqDisplay() {
		var display = document.getElementById('right-freq-readout');
		if (display) {
			// Use formatHertz if available, otherwise simple format
			if (typeof formatHertz === 'function') {
				display.innerHTML = formatHertz(window.freqRight);
			} else {
				display.textContent = window.freqRight.toFixed(1) + ' Hz';
			}
		}
		var input = document.getElementById('right-freq-input');
		if (input) input.value = window.freqRight;
	}
	
	// Initialize UI event handlers
	function initializeUI() {
		// Stereo frequency checkbox
		var checkbox = document.getElementById('stereo-freq-checkbox');
		if (checkbox) {
			checkbox.addEventListener('change', function() {
				window.setStereoFreqMode(this.checked);
			});
		}
		
		// Left frequency input
		var leftInput = document.getElementById('left-freq-input');
		if (leftInput) {
			leftInput.addEventListener('input', function() {
				var freq = parseFloat(this.value);
				if (!isNaN(freq)) {
					window.setFreqLeft(freq);
				}
			});
			leftInput.addEventListener('change', function() {
				var freq = parseFloat(this.value);
				if (!isNaN(freq) && freq >= 1 && freq <= 20154) {
					window.setFreqLeft(freq);
					this.value = window.freqLeft;
				} else {
					this.value = window.freqLeft;
				}
			});
		}
		
		// Right frequency input
		var rightInput = document.getElementById('right-freq-input');
		if (rightInput) {
			rightInput.addEventListener('input', function() {
				var freq = parseFloat(this.value);
				if (!isNaN(freq)) {
					window.setFreqRight(freq);
				}
			});
			rightInput.addEventListener('change', function() {
				var freq = parseFloat(this.value);
				if (!isNaN(freq) && freq >= 1 && freq <= 20154) {
					window.setFreqRight(freq);
					this.value = window.freqRight;
				} else {
					this.value = window.freqRight;
				}
			});
		}
	}
	
	// Initialize after tones are ready
	function initializeStereoFreq() {
		if (window.tones && window.tones.current) {
			patchToneClass();
			// Sync frequencies
			window.freqLeft = window.sliderFreq || 440;
			window.freqRight = window.sliderFreq || 440;
			updateLeftFreqDisplay();
			updateRightFreqDisplay();
			
			// Update input values
			var leftInput = document.getElementById('left-freq-input');
			var rightInput = document.getElementById('right-freq-input');
			if (leftInput) leftInput.value = window.freqLeft;
			if (rightInput) rightInput.value = window.freqRight;
		} else {
			setTimeout(initializeStereoFreq, 100);
		}
	}
	
	// Wait for page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			initializeUI();
			setTimeout(initializeStereoFreq, 500);
		});
	} else {
		initializeUI();
		setTimeout(initializeStereoFreq, 500);
	}
	
	// Also hook into window.init if available
	var originalWindowInit = window.init;
	if (typeof originalWindowInit === 'function') {
		window.init = function() {
			originalWindowInit.apply(this, arguments);
			setTimeout(initializeStereoFreq, 200);
		};
	}
	
	// Patch window.setFreq to sync with stereo frequencies when stereo mode is off
	var originalSetFreq = window.setFreq;
	if (typeof originalSetFreq === 'function') {
		window.setFreq = function(freq) {
			// Update left/right frequencies if stereo mode is off
			if (!window.stereoFreqMode) {
				window.freqLeft = freq;
				window.freqRight = freq;
				updateLeftFreqDisplay();
				updateRightFreqDisplay();
			}
			// Call original function
			return originalSetFreq.call(this, freq);
		};
	}
})();
