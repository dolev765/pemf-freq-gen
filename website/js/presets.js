// Default Presets (saved in code)
var DefaultPresets = [
	{
		id: 'default-brain',
		name: 'Brain/Wit',
		deviceType: 'mobile',
		freq: 40,
		websiteVolume: 47,
		ampVolume: 50,
		pcVolume: 50,
		androidClicks: 0,
		microteslas: 55,
		isDefault: true
	},
	{
		id: 'default-soccer',
		name: 'Soccer Nerves',
		deviceType: 'mobile',
		freq: 1000,
		websiteVolume: 67,
		ampVolume: 50,
		pcVolume: 50,
		androidClicks: 0,
		microteslas: 110,
		isDefault: true
	},
	{
		id: 'default-safe-height',
		name: 'Safe Height',
		deviceType: 'mobile',
		freq: 28,
		websiteVolume: 95,
		ampVolume: 50,
		pcVolume: 50,
		androidClicks: 0,
		microteslas: 6726,
		isDefault: true
	},
	{
		id: 'default-max-height',
		name: 'Max Height',
		deviceType: 'mobile',
		freq: 28,
		websiteVolume: 100,
		ampVolume: 50,
		pcVolume: 50,
		androidClicks: 0,
		microteslas: 7185,
		isDefault: true
	},
	{
		id: 'default-architect',
		name: 'The Architect (Strategy)',
		deviceType: 'mobile',
		freq: 40,
		websiteVolume: 47,
		microteslas: 55,
		placement: '<b>Left:</b> 5cm up/2.5cm in from eye. <b>Right:</b> 7.5cm up/5cm back from ear.',
		description: 'Target: Logic + Vision. <b>Study Opt: 55 µT</b> (Cognitive Binding Window)',
		isDefault: true
	},
	{
		id: 'default-save-button',
		name: 'The Save Button (Fear Deletion)',
		deviceType: 'mobile',
		freq: 10,
		websiteVolume: 52,
		microteslas: 65,
		placement: '<b>Both:</b> 3cm directly above ear canal.',
		description: 'Target: Amygdala. <b>Study Opt: 65 µT</b> (Depth Penetration for Fear Mute)',
		isDefault: true
	},
	{
		id: 'default-god-orator-aggression',
		name: 'The God-Orator (Confidence)',
		deviceType: 'mobile',
		freq: 25,
		websiteVolume: 67,
		microteslas: 110,
		placement: '<b>Left:</b> Temple 2.5cm fwd/1cm down. <b>Right:</b> 5cm up/2.5cm in from eye.',
		description: 'Target: Speech + Confidence. <b>Study Opt: 110 µT</b> (Motor/Action Priming)',
		isDefault: true
	},
	{
		id: 'default-god-orator-speed',
		name: 'The God-Orator (Speed)',
		deviceType: 'mobile',
		freq: 40,
		websiteVolume: 67,
		microteslas: 110,
		placement: '<b>Left:</b> Temple 2.5cm fwd/1cm down. <b>Right:</b> 5cm up/2.5cm in from eye.',
		description: 'Target: Speech + Confidence. <b>Study Opt: 110 µT</b> (High-Speed Binding)',
		isDefault: true
	},
	{
		id: 'default-pivot',
		name: 'The Pivot (Creativity)',
		deviceType: 'mobile',
		freq: 40,
		websiteVolume: 47,
		microteslas: 55,
		placement: '<b>Left:</b> Temple (same). <b>Right:</b> 2.5cm up/5cm back from ear.',
		description: 'Target: Speech + Creativity. <b>Study Opt: 55 µT</b> (Plasticity Window)',
		isDefault: true
	}
];

// Presets Management
var PresetsManager = {
	storageKey: 'toneGeneratorPresets',
	defaultPresetsKey: 'toneGeneratorDefaultPresets',

	getDefaultPresets: function () { return DefaultPresets; },
	getUserPresets: function () {
		var stored = localStorage.getItem(this.storageKey);
		return stored ? JSON.parse(stored) : [];
	},
	getAllPresets: function () {
		return this.getDefaultPresets().concat(this.getUserPresets());
	},
	getPresets: function () { return this.getAllPresets(); },

	addPreset: function (preset) {
		var userPresets = this.getUserPresets();
		preset.id = Date.now().toString();
		preset.isDefault = false;
		userPresets.push(preset);
		this.saveUserPresets(userPresets);
		this.renderPresets();
	},

	saveUserPresets: function (presets) {
		localStorage.setItem(this.storageKey, JSON.stringify(presets));
	},

	deletePreset: function (id) {
		var userPresets = this.getUserPresets();
		userPresets = userPresets.filter(function (p) { return p.id !== id; });
		this.saveUserPresets(userPresets);
		this.renderPresets();
	},

	loadPreset: function (preset) {
		if (preset.freq) window.setFreq(preset.freq);
		if (preset.websiteVolume !== undefined) window.setVolume(preset.websiteVolume / 100);
	},

	exportPresetsAsCode: function () {
		var userPresets = this.getUserPresets();
		if (userPresets.length === 0) { alert('No user presets.'); return; }
		var code = '// User Presets\nvar UserPresets = ' + JSON.stringify(userPresets, null, 2) + ';\n';
		var blob = new Blob([code], { type: 'text/javascript' });
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'user-presets.js';
		a.click();
	},

	importPresetsFromCode: function (code) {
		try {
			var presets = [];
			var match = code.match(/\[[\s\S]*\]/);
			if (match) {
				presets = JSON.parse(match[0]);
				var existing = this.getUserPresets();
				var existingIds = existing.map(function (p) { return p.id; });
				presets.forEach(function (p) {
					if (!existingIds.includes(p.id)) {
						p.isDefault = false;
						existing.push(p);
					}
				});
				this.saveUserPresets(existing);
				this.renderPresets();
				alert('Imported ' + presets.length + ' preset(s).');
			}
		} catch (e) {
			alert('Error importing presets: ' + e.message);
		}
	},

	renderPresets: function () {
		var defaults = this.getDefaultPresets();
		var userPresets = this.getUserPresets();
		var list = document.getElementById('presets-list');
		if (!list) return;
		list.innerHTML = '';

		if (defaults.length === 0 && userPresets.length === 0) {
			list.innerHTML = '<p style="color: #8e420b; font-style: italic;">No presets saved yet.</p>';
			return;
		}

		if (defaults.length > 0) {
			var header = document.createElement('div');
			header.style.cssText = 'font-weight: 600; color: #7a3400; margin-top: 10px; margin-bottom: 5px; font-size: 14px;';
			header.textContent = 'Default Presets';
			list.appendChild(header);
			defaults.forEach(p => this.renderPresetItem(p, list, true));
		}

		if (userPresets.length > 0) {
			var header = document.createElement('div');
			header.style.cssText = 'font-weight: 600; color: #7a3400; margin-top: 15px; margin-bottom: 5px; font-size: 14px;';
			header.textContent = 'Your Presets';
			list.appendChild(header);
			userPresets.forEach(p => this.renderPresetItem(p, list, false));
		}
	},

	renderPresetItem: function (preset, list, isDefault) {
		var presetDiv = document.createElement('div');
		presetDiv.className = 'preset-item';
		if (isDefault) presetDiv.style.borderLeft = '3px solid #874e23';

		var name = document.createElement('div');
		name.className = 'preset-name';
		name.textContent = preset.name || 'Unnamed';

		var details = document.createElement('div');
		details.className = 'preset-details';
		var detailsText = [];
		if (preset.freq) detailsText.push(preset.freq.toFixed(2) + ' Hz');
		if (preset.websiteVolume !== undefined) detailsText.push('Vol: ' + preset.websiteVolume + '%');
		if (preset.microteslas) detailsText.push(preset.microteslas + ' μT');

		var detailsHtml = detailsText.join(' | ');
		if (preset.description) {
			detailsHtml += '<br><span style="font-size:11px; opacity:0.8; font-style:italic;">' + preset.description + '</span>';
		}
		if (preset.placement) {
			detailsHtml += '<br><span style="font-size:11px; color:#a04000; display:block; margin-top:3px;">' + preset.placement + '</span>';
		}
		details.innerHTML = detailsHtml;

		var buttons = document.createElement('div');
		buttons.className = 'preset-buttons';

		var loadBtn = document.createElement('button');
		loadBtn.className = 'small-button';
		loadBtn.textContent = 'Load';
		loadBtn.onclick = () => this.loadPreset(preset);
		buttons.appendChild(loadBtn);

		if (!isDefault) {
			var delBtn = document.createElement('button');
			delBtn.className = 'small-button';
			delBtn.textContent = 'Delete';
			delBtn.onclick = () => {
				if (confirm('Delete preset?')) this.deletePreset(preset.id);
			};
			buttons.appendChild(delBtn);
		}

		presetDiv.appendChild(name);
		presetDiv.appendChild(details);
		presetDiv.appendChild(buttons);
		list.appendChild(presetDiv);
	},

	showCreateDialog: function () {
		var dialog = document.getElementById('preset-dialog');
		if (dialog) {
			dialog.style.display = 'flex';
			var input = document.getElementById('preset-name-input');
			if (input) {
				input.value = '';
				input.focus();
			}
		}
	},

	hideCreateDialog: function () {
		var dialog = document.getElementById('preset-dialog');
		if (dialog) dialog.style.display = 'none';
	},

	savePresetFromDialog: function () {
		var input = document.getElementById('preset-name-input');
		if (!input || !input.value.trim()) return;
		this.addPreset({
			name: input.value.trim(),
			freq: window.sliderFreq || 440,
			websiteVolume: Math.round((window.volume || 0.5) * 100)
		});
		this.hideCreateDialog();
	}
};
