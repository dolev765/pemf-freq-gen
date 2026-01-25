# Phyphox Magnetometer-Only App

This is a stripped-down version of phyphox-android that ONLY includes magnetometer functionality.

## What Was Removed

- All other sensors (accelerometer, gyroscope, pressure, light, proximity, temperature, humidity, gravity, etc.)
- Camera functionality
- Bluetooth support
- GPS functionality
- Audio input/output
- Network/MQTT features
- Complex experiment system
- All non-magnetometer UI

## What Was Kept

- Core magnetometer sensor reading
- DataBuffer for storing readings
- ExperimentTimeReference for timestamps
- Basic UI to display magnetometer data (X, Y, Z, Absolute value in µT)

## Files Structure

```
src/
  - MagnetometerInput.java (simplified SensorInput with only magnetometer)
  - DataBuffer.java
  - ExperimentTimeReference.java
  - MainActivity.java (simplified activity)
  - App.java (application class)
```

## Usage

The app will:
1. Request magnetometer permissions
2. Start reading magnetometer data
3. Display X, Y, Z, and absolute magnetic field values in microteslas (µT)
4. Show timestamps

## Original Source

Based on: https://github.com/phyphox/phyphox-android
License: GPL-3.0
