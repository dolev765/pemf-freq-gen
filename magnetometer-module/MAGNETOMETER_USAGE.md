# Magnetometer Module Usage Guide

## Overview

This module extracts the magnetometer functionality from phyphox-android. The magnetometer reads magnetic field strength in microteslas (µT).

## Key Components

### SensorInput.java
Main class for reading magnetometer data. Key magnetometer-specific code:

- **Sensor Type**: `Sensor.TYPE_MAGNETIC_FIELD` (calibrated) or `Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED` (raw)
- **Unit**: Microteslas (µT)
- **Data**: X, Y, Z components and absolute value

### DataBuffer.java
Stores sensor readings with timestamps.

### ExperimentTimeReference.java
Manages time references for accurate timestamp tracking.

## Magnetometer-Specific Code Locations

### In SensorInput.java:

1. **Line 75**: Sensor type mapping
   ```java
   case magnetic_field: return Sensor.TYPE_MAGNETIC_FIELD;
   ```

2. **Lines 227-230**: Description resources
   ```java
   case Sensor.TYPE_MAGNETIC_FIELD:
   case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
       return R.string.sensorMagneticField;
   ```

3. **Lines 264-267**: Unit definition
   ```java
   case Sensor.TYPE_MAGNETIC_FIELD:
   case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
       return "µT";
   ```

4. **Lines 282-287**: Sensor selection (calibrated vs uncalibrated)
   ```java
   if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2 && 
       (type == Sensor.TYPE_MAGNETIC_FIELD || type == Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED)) {
       if (calibrated)
           this.type = Sensor.TYPE_MAGNETIC_FIELD;
       else
           this.type = Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED;
   }
   ```

5. **Lines 407-422**: Accuracy handling
   ```java
   if (type == Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED) {
       accuracy = 0.0;
   } else if (type == Sensor.TYPE_MAGNETIC_FIELD) {
       switch (event.accuracy) {
           case SensorManager.SENSOR_STATUS_NO_CONTACT:
           case SensorManager.SENSOR_STATUS_UNRELIABLE:
               accuracy = -1.0;
           case SensorManager.SENSOR_STATUS_ACCURACY_LOW:
               accuracy = 1.0;
           case SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM:
               accuracy = 2.0;
           case SensorManager.SENSOR_STATUS_ACCURACY_HIGH:
               accuracy = 3.0;
       }
   }
   ```

## Usage Example

```java
// Create sensor input for magnetometer
SensorInput magnetometer = new SensorInput(
    SensorInput.SensorName.magnetic_field,
    null, // nameFilter
    null, // typeFilter
    false, // ignoreUnavailable
    50.0, // rate (Hz)
    SensorInput.SensorRateStrategy.auto,
    1, // stride
    false, // average
    buffers, // Vector<DataOutput> with dataX, dataY, dataZ, dataAbs, dataT
    lock, // Lock for thread safety
    timeRef // ExperimentTimeReference
);

// Attach sensor manager
magnetometer.attachSensorManager(sensorManager);

// Start reading
magnetometer.start();

// Data will be written to:
// - dataX: X component (µT)
// - dataY: Y component (µT)
// - dataZ: Z component (µT)
// - dataAbs: Absolute value √(X²+Y²+Z²) (µT)
// - dataT: Timestamp (seconds)
```

## Notes

- The magnetometer returns values in **microteslas (µT)**
- Calibrated magnetometer provides hardware-calibrated readings
- Uncalibrated magnetometer provides raw sensor values
- Accuracy levels indicate sensor reliability (higher is better)
- Absolute value is calculated as: √(X² + Y² + Z²)

## License

GPL-3.0 (from phyphox-android)
