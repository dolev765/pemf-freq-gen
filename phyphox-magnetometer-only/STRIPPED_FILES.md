# Files Removed from phyphox-android

This document lists all files and code that were removed to create a magnetometer-only version.

## Completely Removed Modules

1. **Camera Module** - Entire `camera/` directory removed
2. **Bluetooth Module** - Entire `Bluetooth/` directory removed  
3. **GPS Module** - `GpsInput.java`, `GpsGeoid.java` removed
4. **Audio Module** - `AudioOutput.java` removed
5. **Network Module** - Entire `NetworkConnection/` directory removed
6. **Remote Server** - `RemoteServer.java` removed
7. **Analysis Module** - `Analysis.java` removed (if not needed)
8. **Complex Experiment System** - Most of `ExperimentList/` removed

## SensorInput.java Changes

### Removed Sensor Types:
- `accelerometer` → `Sensor.TYPE_ACCELEROMETER`
- `linear_acceleration` → `Sensor.TYPE_LINEAR_ACCELERATION`
- `gravity` → `Sensor.TYPE_GRAVITY`
- `gyroscope` → `Sensor.TYPE_GYROSCOPE`
- `pressure` → `Sensor.TYPE_PRESSURE`
- `light` → `Sensor.TYPE_LIGHT`
- `proximity` → `Sensor.TYPE_PROXIMITY`
- `temperature` → `Sensor.TYPE_AMBIENT_TEMPERATURE`
- `humidity` → `Sensor.TYPE_RELATIVE_HUMIDITY`
- `attitude` → `Sensor.TYPE_ROTATION_VECTOR`
- `custom` → Custom sensor support

### Kept:
- `magnetic_field` → `Sensor.TYPE_MAGNETIC_FIELD`
- `Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED`

## Code Sections Removed

### From SensorInput.java:
- Lines 71-73: Accelerometer, linear acceleration, gravity cases
- Lines 74: Gyroscope case
- Lines 76-81: Pressure, light, proximity, temperature, humidity, attitude cases
- Lines 168-191: Vendor sensor finding for temperature, humidity, pressure
- Lines 219-242: Description resources for all non-magnetometer sensors
- Lines 256-277: Unit definitions for all non-magnetometer sensors

### Kept:
- Lines 75: `case magnetic_field: return Sensor.TYPE_MAGNETIC_FIELD;`
- Lines 227-230: Magnetometer description
- Lines 264-267: Magnetometer unit (µT)
- Lines 282-287: Magnetometer sensor selection
- Lines 407-422: Magnetometer accuracy handling

## Files Kept (Essential)

1. **MagnetometerInput.java** - Simplified sensor input (only magnetometer)
2. **DataBuffer.java** - Data storage (unchanged, used by magnetometer)
3. **ExperimentTimeReference.java** - Time tracking (unchanged, used by magnetometer)
4. **App.java** - Application class (simplified)
5. **MainActivity.java** - Main activity (to be created, simplified)

## Result

The app now:
- Only reads magnetometer data
- Displays X, Y, Z, and absolute magnetic field in microteslas (µT)
- Shows timestamps
- No other sensors or features
