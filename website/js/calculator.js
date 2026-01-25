// Auto Calculator for Micro Teslas
var MicroTeslaCalculator = {
	// Calibration data based on measurements
	calibration: {
		mobile: {
			maxVolume: 100, // Android system volume at 100%
			maxMicroteslas: 7185, // Peak at 100% volume
			maxVoltage: 1.0, // Equivalent to PC 63%
			websiteSliderAtMax: 100 // Website slider at 100%
		},
		pc: {
			maxVolume: 63, // PC system volume at 63%
			maxMicroteslas: 7080, // Peak at 63% volume
			maxVoltage: 1.0,
			websiteSliderAtMax: 100
		}
	},

	// Known voltage/microtesla relationships
	voltageToMicroteslas: {
		0.22: 55, // Brain/Wit setting (PC 30%)
		0.44: 110, // Soccer Nerves (approximate)
		1.0: 7080 // Max PC setting
	},

	calculateWebsiteSlider: function (deviceType, targetMicroteslas) {
		var cal = this.calibration[deviceType];
		if (!cal || !targetMicroteslas || targetMicroteslas <= 0) {
			return null;
		}

		// Calculate ratio: target / max
		var ratio = targetMicroteslas / cal.maxMicroteslas;

		// Convert to website slider percentage (0-100)
		var sliderPercent = Math.round(ratio * 100 * 100) / 100; // Round to 2 decimals

		// Clamp between 1 and 100
		sliderPercent = Math.max(1, Math.min(100, sliderPercent));

		return sliderPercent;
	},

	// Quick routines for mobile
	routines: {
		brain: {
			freq: 40,
			websiteSlider: 47,
			microteslas: 55,
			voltage: 0.22,
			description: "Brain/Wit - Perfect 'Whisper' (55 μT)"
		},
		soccer: {
			freq: 1000,
			websiteSlider: 67,
			microteslas: 110,
			voltage: 0.44,
			description: "Soccer Nerves - Nerve Priming"
		},
		'safe-height': {
			freq: 28,
			websiteSlider: 95,
			microteslas: 6726,
			voltage: 0.95,
			description: "Safe Height - Growth Signal (matches PC 63%)"
		},
		'max-height': {
			freq: 28,
			websiteSlider: 100,
			microteslas: 7185,
			voltage: 1.0,
			description: "Max Height - Maximum Power"
		}
	},

	applyRoutine: function (routineName) {
		var routine = this.routines[routineName];
		if (!routine) return;

		// Set frequency
		if (routine.freq && window.setFreq) {
			window.setFreq(routine.freq);
		}

		// Set website volume slider
		if (routine.websiteSlider && window.setVolume) {
			window.setVolume(routine.websiteSlider / 100);
		}

		// Show notification
		var resultDiv = document.getElementById('calculator-result');
		if (resultDiv) {
			resultDiv.innerHTML = '✓ Applied: ' + routine.description + '<br>' +
				'Frequency: ' + routine.freq + ' Hz<br>' +
				'Website Slider: ' + routine.websiteSlider + '%<br>' +
				'Target: ' + routine.microteslas + ' μT';
		}
	}
};
