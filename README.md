# PEMF Frequency Generator

An online tone generator with advanced preset management and micro tesla calculations for PEMF (Pulsed Electromagnetic Field) therapy.

## Features

- **Tone Generation**: Generate pure tones from 1 Hz to 20,154 Hz
- **Volume Control**: Adjustable website volume slider (1-100%)
- **Presets System**: Save and load custom presets with:
  - Frequency (Hz)
  - Website volume (%)
  - Amp volume (%)
  - PC volume (%)
  - Android volume clicks
  - Micro teslas used
- **Auto Calculator**: Calculate perfect website slider percentage based on target micro teslas and device type
- **Quick Routines**: Pre-configured settings for common use cases:
  - Brain/Wit (40 Hz, 47%)
  - Soccer Nerves (1000 Hz, 67%)
  - Safe Height (28 Hz, 95%)
  - Max Height (28 Hz, 100%)
- **Export/Import**: Export user presets as code for version control

## Usage

1. Open `index.html` in a web browser
2. Adjust frequency and volume as needed
3. Use the Auto Calculator to find the perfect settings for your target micro teslas
4. Create and save presets for quick access
5. Export presets to add them to the codebase

## Device Calibration

The calculator uses the following calibration data:
- **Mobile (Android 100% volume)**: 7,185 μT max
- **PC (63% system volume)**: 7,080 μT max

## Files

- `index.html` - Main application file
- `frequency-generator.mini.js` - Core tone generation logic
- `tone-generator.mini.css` - Styling
- `icons.png` - UI icons

## License

See LICENSE file for details.
