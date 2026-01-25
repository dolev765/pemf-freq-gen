# Extracted Magnetometer Module Files

The following files have been extracted from phyphox-android for magnetometer functionality:

## Core Files

1. **SensorInput.java** - Contains the magnetometer sensor handling
   - Lines 75: `case magnetic_field: return Sensor.TYPE_MAGNETIC_FIELD;`
   - Lines 227-230: Magnetometer description resources
   - Lines 264-267: Magnetometer unit (µT)
   - Lines 282-287: Magnetometer sensor type selection (calibrated vs uncalibrated)
   - Lines 407-422: Magnetometer accuracy handling

2. **DataBuffer.java** - Data storage for sensor readings
   - Used to store X, Y, Z, and absolute magnetic field values
   - Handles timestamps

3. **ExperimentTimeReference.java** - Time reference management
   - Tracks experiment start time
   - Converts sensor timestamps to experiment time

## Key Magnetometer Features

- **Calibrated magnetometer**: `Sensor.TYPE_MAGNETIC_FIELD` - Returns calibrated readings in microteslas (µT)
- **Uncalibrated magnetometer**: `Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED` - Returns raw readings
- **Accuracy levels**: 
  - -1.0: Unreliable/No contact
  - 1.0: Low accuracy
  - 2.0: Medium accuracy
  - 3.0: High accuracy
- **Units**: Microteslas (µT)
- **Data**: X, Y, Z components and absolute value (√(X²+Y²+Z²))

## Usage

The magnetometer is accessed through the `SensorInput` class:
- Create a `SensorInput` with `SensorName.magnetic_field`
- Attach a `SensorManager`
- Start reading with `start()`
- Data is written to `DataBuffer` objects (dataX, dataY, dataZ, dataAbs, dataT)

## Source

Extracted from: https://github.com/phyphox/phyphox-android
License: GPL-3.0
