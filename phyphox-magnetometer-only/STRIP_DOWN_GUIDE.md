# Guide to Strip phyphox-android to Magnetometer-Only

## Step 1: Remove Non-Magnetometer Sensor Code from SensorInput.java

### In `resolveSensorName()` method (lines 68-85):
**KEEP ONLY:**
```java
case magnetic_field: return Sensor.TYPE_MAGNETIC_FIELD;
```

**REMOVE:**
- accelerometer
- linear_acceleration
- gravity
- gyroscope
- pressure
- light
- proximity
- temperature
- humidity
- attitude
- custom

### In `SensorName` enum (line 55):
**CHANGE FROM:**
```java
accelerometer, linear_acceleration, gravity, gyroscope, magnetic_field, pressure, light, proximity, temperature, humidity, attitude, custom
```

**TO:**
```java
magnetic_field
```

### In `getDescriptionRes()` method (lines 217-248):
**KEEP ONLY:**
```java
case Sensor.TYPE_MAGNETIC_FIELD:
case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
    return R.string.sensorMagneticField;
```

**REMOVE:** All other sensor cases

### In `getUnit()` method (lines 254-278):
**KEEP ONLY:**
```java
case Sensor.TYPE_MAGNETIC_FIELD:
case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
    return "µT";
```

**REMOVE:** All other sensor units

### In `findSensor()` method (lines 154-204):
**REMOVE:**
- Lines 168-191: Vendor sensor finding for temperature, humidity, pressure

**KEEP:** Basic sensor finding (lines 156-164)

## Step 2: Delete Entire Directories

Delete these directories completely:
- `app/src/main/java/de/rwth_aachen/phyphox/camera/` - Camera functionality
- `app/src/main/java/de/rwth_aachen/phyphox/Bluetooth/` - Bluetooth support
- `app/src/main/java/de/rwth_aachen/phyphox/NetworkConnection/` - Network/MQTT

## Step 3: Delete Individual Files

Delete these files:
- `GpsInput.java` - GPS functionality
- `GpsGeoid.java` - GPS geoid data
- `AudioOutput.java` - Audio output
- `RemoteServer.java` - Remote server
- `Analysis.java` - Complex analysis (if not needed)

## Step 4: Simplify ExperimentList

In `SimpleExperimentCreator.java`:
- Remove all sensor checkboxes except magnetometer
- Keep only `MAGNETOMETER` in `SensorType` enum

## Step 5: Update AndroidManifest.xml

Remove permissions for:
- CAMERA
- RECORD_AUDIO
- BLUETOOTH (all variants)
- ACCESS_COARSE_LOCATION
- ACCESS_FINE_LOCATION
- INTERNET (if not needed)
- ACCESS_WIFI_STATE (if not needed)

Keep only:
- HIGH_SAMPLING_RATE_SENSORS (for magnetometer)

## Step 6: Remove Resources

In `res/values/strings.xml`:
- Remove string resources for all non-magnetometer sensors
- Keep only `sensorMagneticField`

## Step 7: Update Experiment.java

Remove code that:
- Checks for other sensor types
- Handles camera, bluetooth, GPS, audio inputs
- Processes non-magnetometer data

Keep only:
- Magnetometer sensor initialization
- Magnetometer data reading
- Basic UI for displaying magnetometer data

## Result

After stripping, the app will:
1. Only request magnetometer permissions
2. Only read magnetometer sensor
3. Display X, Y, Z, and absolute magnetic field (µT)
4. Show timestamps
5. No other features
