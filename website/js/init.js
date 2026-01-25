// Initialize presets when DOM is ready
function initializePresets() {
	console.log('Initializing presets...');

	var createBtn = document.getElementById('create-preset-button');
	var saveBtn = document.getElementById('preset-save-button');
	var cancelBtn = document.getElementById('preset-cancel-button');
	var dialog = document.getElementById('preset-dialog');

	if (!createBtn) {
		console.log('Create button not found');
		return;
	}

	console.log('Buttons found, setting up handlers...');

	// Create global handler functions
	window.handleCreatePreset = function (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		console.log('Create preset clicked');
		try {
			if (typeof PresetsManager !== 'undefined' && PresetsManager.showCreateDialog) {
				PresetsManager.showCreateDialog();
			} else {
				console.error('PresetsManager not available');
				alert('Presets system not loaded. Please refresh the page.');
			}
		} catch (err) {
			console.error('Error in create button:', err);
			alert('Error: ' + err.message);
		}
		return false;
	};

	window.handleSavePreset = function (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		console.log('Save preset clicked');
		try {
			if (typeof PresetsManager !== 'undefined' && PresetsManager.savePresetFromDialog) {
				PresetsManager.savePresetFromDialog();
			} else {
				alert('Presets system not loaded.');
			}
		} catch (err) {
			console.error('Error in save button:', err);
			alert('Error saving: ' + err.message);
		}
		return false;
	};

	window.handleCancelPreset = function (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		console.log('Cancel clicked');
		try {
			if (typeof PresetsManager !== 'undefined' && PresetsManager.hideCreateDialog) {
				PresetsManager.hideCreateDialog();
			}
		} catch (err) {
			console.error('Error in cancel button:', err);
		}
		return false;
	};

	window.handleExportPresets = function (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		console.log('Export clicked');
		try {
			if (typeof PresetsManager !== 'undefined' && PresetsManager.exportPresetsAsCode) {
				PresetsManager.exportPresetsAsCode();
			} else {
				alert('Presets system not loaded.');
			}
		} catch (err) {
			console.error('Error in export button:', err);
			alert('Error: ' + err.message);
		}
		return false;
	};

	window.handleImportPresets = function (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		console.log('Import clicked');
		try {
			if (typeof PresetsManager !== 'undefined' && PresetsManager.importPresetsFromCode) {
				var code = prompt('Paste the preset code here (from user-presets.js or DefaultPresets array):');
				if (code && code.trim()) {
					PresetsManager.importPresetsFromCode(code);
				}
			} else {
				alert('Presets system not loaded.');
			}
		} catch (err) {
			console.error('Error in import button:', err);
			alert('Error: ' + err.message);
		}
		return false;
	};

	// Set up button handlers directly (backup)
	if (createBtn) {
		createBtn.onclick = window.handleCreatePreset;
	}

	if (saveBtn) {
		saveBtn.onclick = window.handleSavePreset;
	}

	if (cancelBtn) {
		cancelBtn.onclick = window.handleCancelPreset;
	}

	// Close dialog on outside click
	if (dialog) {
		dialog.onclick = function (e) {
			if (e.target === dialog) {
				PresetsManager.hideCreateDialog();
			}
		};

		// Keyboard support for dialog
		var nameInput = document.getElementById('preset-name-input');
		if (nameInput) {
			nameInput.addEventListener('keydown', function (e) {
				if (e.key === 'Enter') {
					e.preventDefault();
					PresetsManager.savePresetFromDialog();
				} else if (e.key === 'Escape') {
					PresetsManager.hideCreateDialog();
				}
			});
		}
	}

	// Render presets on load
	setTimeout(function () {
		PresetsManager.renderPresets();
		if (typeof PhyphoxManager !== 'undefined') {
			PhyphoxManager.init();
		}
	}, 100);

	// Device selector - save preference
	var deviceSelect = document.getElementById('current-device-select');
	var customDeviceInput = document.getElementById('custom-device-name');

	if (deviceSelect && customDeviceInput) {
		// Load saved device preference
		var savedDevice = localStorage.getItem('selectedDevice');
		var savedCustomDevice = localStorage.getItem('customDeviceName');

		if (savedDevice) {
			deviceSelect.value = savedDevice;
			if (savedDevice === 'other') {
				customDeviceInput.style.display = 'inline-block';
				if (savedCustomDevice) {
					customDeviceInput.value = savedCustomDevice;
				}
			}
		}

		deviceSelect.onchange = function () {
			var deviceValue = this.value;
			localStorage.setItem('selectedDevice', deviceValue);

			// Show/hide custom device input
			if (deviceValue === 'other') {
				customDeviceInput.style.display = 'inline-block';
				setTimeout(function () {
					customDeviceInput.focus();
				}, 10);
			} else {
				customDeviceInput.style.display = 'none';
				customDeviceInput.value = '';
				localStorage.removeItem('customDeviceName');
			}
		};

		// Save custom device name
		customDeviceInput.onchange = function () {
			if (deviceSelect.value === 'other') {
				localStorage.setItem('customDeviceName', this.value);
			}
		};

		customDeviceInput.onblur = function () {
			if (deviceSelect.value === 'other') {
				localStorage.setItem('customDeviceName', this.value);
			}
		};
	} else {
		console.log('Device selector elements not found, will retry...');
	}

	// Export presets button
	var exportBtn = document.getElementById('export-presets-button');
	if (exportBtn) {
		exportBtn.onclick = window.handleExportPresets;
	}

	// Import presets button
	var importBtn = document.getElementById('import-presets-button');
	if (importBtn) {
		importBtn.onclick = window.handleImportPresets;
	}

	console.log('Presets buttons initialized successfully');
}

// Initialize when DOM is ready - wait for tone generator to load first
(function () {
	function tryInit() {
		// Check if required elements exist
		var createBtn = document.getElementById('create-preset-button');
		if (!createBtn) {
			console.log('Buttons not found, retrying...');
			setTimeout(tryInit, 100);
			return;
		}

		// Check if PresetsManager is defined
		if (typeof PresetsManager === 'undefined') {
			console.log('PresetsManager not defined yet, retrying...');
			setTimeout(tryInit, 100);
			return;
		}

		console.log('Initializing presets system...');
		// All ready, initialize
		initializePresets();
	}

	// Try multiple initialization points
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			console.log('DOMContentLoaded fired');
			setTimeout(tryInit, 300);
		});
	} else {
		console.log('DOM already loaded');
		setTimeout(tryInit, 300);
	}

	// Backup with window.onload
	window.addEventListener('load', function () {
		console.log('Window load fired');
		setTimeout(tryInit, 200);
	});

	// Also try immediately if script is at end of body
	setTimeout(tryInit, 500);
})();

// Fix frequency readout initialization - ensure sliderFreq is set and readout is updated
(function() {
	// Initialize sliderFreq to default value immediately
	if (typeof window.sliderFreq === 'undefined' || window.sliderFreq === null) {
		window.sliderFreq = 440;
	}
	
	function ensureFrequencyReadout() {
		// Check if tone generator is initialized
		if (typeof window.slider_jq !== 'undefined' && typeof window.freqReadout !== 'undefined') {
			// Get current slider value and set sliderFreq if not already set
			if (typeof window.sliderFreq === 'undefined' || window.sliderFreq === null) {
				try {
					var sliderValue = window.slider_jq.slider('value');
					if (typeof sliderPosToFreq === 'function') {
						window.sliderFreq = sliderPosToFreq(sliderValue);
					} else {
						window.sliderFreq = 440; // fallback
					}
				} catch(e) {
					window.sliderFreq = 440; // fallback if slider not ready
				}
			}
			// Update the readout
			if (window.freqReadout && typeof window.freqReadout.update === 'function') {
				try {
					window.freqReadout.update();
				} catch(e) {
					console.log('Frequency readout update failed:', e);
				}
			}
		}
	}
	
	// Hook into the original init function to ensure sliderFreq is set immediately
	var originalInit = window.init;
	if (typeof originalInit === 'function') {
		window.init = function() {
			originalInit.apply(this, arguments);
			// Set sliderFreq immediately after init completes - this is critical!
			// The slider is initialized with value:440 but sliderFreq is only set in the slide callback
			// So we need to set it manually here
			function setInitialSliderFreq() {
				if (typeof window.slider_jq !== 'undefined') {
					try {
						var sliderValue = window.slider_jq.slider('value');
						if (typeof sliderPosToFreq === 'function') {
							window.sliderFreq = sliderPosToFreq(sliderValue);
						} else {
							// Fallback: calculate from slider value
							// For slider value 440, freq should be 440 Hz
							window.sliderFreq = 440;
						}
						// Update readout if available
						if (window.freqReadout && typeof window.freqReadout.update === 'function') {
							window.freqReadout.update();
						}
						// Also ensure tones.current has the frequency and wave type
						if (window.tones && window.tones.current) {
							if (typeof window.tones.current.setFreq === 'function') {
								window.tones.current.setFreq(window.sliderFreq);
							}
							if (typeof window.waveType !== 'undefined' && window.waveType && typeof window.tones.current.setType === 'function') {
								window.tones.current.setType(window.waveType);
							}
						}
						console.log('sliderFreq initialized to:', window.sliderFreq);
					} catch(e) {
						console.log('Error setting sliderFreq:', e);
						window.sliderFreq = 440;
						// Still try to set frequency on tones.current even if slider failed
						if (window.tones && window.tones.current && typeof window.tones.current.setFreq === 'function') {
							try {
								window.tones.current.setFreq(440);
							} catch(e2) {}
						}
					}
				} else {
					// Fallback: set to default if slider not ready
					window.sliderFreq = 440;
					// Still try to set frequency on tones.current
					if (window.tones && window.tones.current && typeof window.tones.current.setFreq === 'function') {
						try {
							window.tones.current.setFreq(440);
						} catch(e) {}
					}
				}
			}
			
			// Try immediately
			setInitialSliderFreq();
			
			// Also try after a short delay in case slider_jq isn't ready yet
			setTimeout(setInitialSliderFreq, 0);
			setTimeout(setInitialSliderFreq, 50);
			setTimeout(setInitialSliderFreq, 100);
		};
	}
	
	// Also patch onPlayButtonClick to ensure sliderFreq is set before playing
	var originalOnPlayButtonClick = window.onPlayButtonClick;
	if (typeof originalOnPlayButtonClick === 'function') {
		window.onPlayButtonClick = function() {
			// Ensure sliderFreq is set before playing
			if (typeof window.sliderFreq === 'undefined' || window.sliderFreq === null) {
				if (typeof window.slider_jq !== 'undefined') {
					try {
						var sliderValue = window.slider_jq.slider('value');
						if (typeof sliderPosToFreq === 'function') {
							window.sliderFreq = sliderPosToFreq(sliderValue);
						} else {
							window.sliderFreq = 440;
						}
					} catch(e) {
						window.sliderFreq = 440;
					}
				} else {
					window.sliderFreq = 440;
				}
			}
			
			// Ensure tones.current has the correct frequency and wave type before playing
			if (window.tones && window.tones.current) {
				if (typeof window.sliderFreq !== 'undefined' && window.sliderFreq !== null) {
					if (typeof window.tones.current.setFreq === 'function') {
						window.tones.current.setFreq(window.sliderFreq);
					}
				}
				if (typeof window.waveType !== 'undefined' && window.waveType) {
					if (typeof window.tones.current.setType === 'function') {
						window.tones.current.setType(window.waveType);
					}
				}
			}
			
			// Call original function
			originalOnPlayButtonClick.apply(this, arguments);
		};
	}
	
	// Try multiple times to catch initialization
	setTimeout(ensureFrequencyReadout, 100);
	setTimeout(ensureFrequencyReadout, 500);
	setTimeout(ensureFrequencyReadout, 1000);
	setTimeout(ensureFrequencyReadout, 2000);
	
	// Also hook into window load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			setTimeout(ensureFrequencyReadout, 200);
			setTimeout(ensureFrequencyReadout, 500);
			setTimeout(ensureFrequencyReadout, 1000);
		});
	} else {
		setTimeout(ensureFrequencyReadout, 200);
		setTimeout(ensureFrequencyReadout, 500);
		setTimeout(ensureFrequencyReadout, 1000);
	}
	
	window.addEventListener('load', function() {
		setTimeout(ensureFrequencyReadout, 300);
		setTimeout(ensureFrequencyReadout, 800);
		setTimeout(ensureFrequencyReadout, 1500);
	});
	
	// Also try to set sliderFreq directly if slider exists but init hasn't run yet
	function trySetSliderFreqDirectly() {
		if (typeof window.slider_jq !== 'undefined' && (typeof window.sliderFreq === 'undefined' || window.sliderFreq === null)) {
			try {
				var sliderValue = window.slider_jq.slider('value');
				if (typeof sliderPosToFreq === 'function') {
					window.sliderFreq = sliderPosToFreq(sliderValue);
					if (window.freqReadout && typeof window.freqReadout.update === 'function') {
						window.freqReadout.update();
					}
					if (window.tones && window.tones.current && typeof window.tones.current.setFreq === 'function') {
						window.tones.current.setFreq(window.sliderFreq);
					}
				} else {
					window.sliderFreq = 440;
				}
			} catch(e) {
				window.sliderFreq = 440;
			}
		}
	}
	
	// Try direct approach multiple times
	setTimeout(trySetSliderFreqDirectly, 50);
	setTimeout(trySetSliderFreqDirectly, 200);
	setTimeout(trySetSliderFreqDirectly, 500);
	setTimeout(trySetSliderFreqDirectly, 1000);
	
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', trySetSliderFreqDirectly);
	} else {
		trySetSliderFreqDirectly();
	}
	
	window.addEventListener('load', function() {
		setTimeout(trySetSliderFreqDirectly, 100);
		setTimeout(trySetSliderFreqDirectly, 500);
	});
})();
