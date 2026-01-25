# Changes Needed to Strip phyphox-android to Magnetometer-Only

## File: SensorInput.java

### Change 1: SensorName enum (line 54-56)
**FROM:**
```java
public enum SensorName {
    accelerometer, linear_acceleration, gravity, gyroscope, magnetic_field, pressure, light, proximity, temperature, humidity, attitude, custom
}
```

**TO:**
```java
public enum SensorName {
    magnetic_field
}
```

### Change 2: resolveSensorName() method (lines 68-85)
**FROM:** All sensor cases
**TO:** Only keep:
```java
case magnetic_field: return Sensor.TYPE_MAGNETIC_FIELD;
```

### Change 3: findSensor() method (lines 154-204)
**REMOVE:** Lines 168-191 (vendor sensor finding for temperature, humidity, pressure)
**KEEP:** Lines 156-164 (basic sensor finding)

### Change 4: getDescriptionRes() method (lines 217-248)
**REMOVE:** All cases except:
```java
case Sensor.TYPE_MAGNETIC_FIELD:
case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
    return R.string.sensorMagneticField;
```

### Change 5: getUnit() method (lines 254-278)
**REMOVE:** All cases except:
```java
case Sensor.TYPE_MAGNETIC_FIELD:
case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
    return "µT";
```

## Files to DELETE

1. **Entire directories:**
   - `app/src/main/java/de/rwth_aachen/phyphox/camera/`
   - `app/src/main/java/de/rwth_aachen/phyphox/Bluetooth/`
   - `app/src/main/java/de/rwth_aachen/phyphox/NetworkConnection/`

2. **Individual files:**
   - `GpsInput.java`
   - `GpsGeoid.java`
   - `AudioOutput.java`
   - `RemoteServer.java`

## File: Experiment.java

### Remove code that handles:
- Camera inputs (lines checking for camera)
- Bluetooth inputs
- GPS inputs
- Audio inputs
- Other sensor types (lines 988-991, 1191)

**KEEP ONLY:**
- Magnetometer sensor initialization
- Magnetometer data reading (lines 282-287, 407-422)

## File: SimpleExperimentCreator.java

### Change SensorType enum (lines 34-47)
**FROM:** All sensor types
**TO:** Only:
```java
enum SensorType {
    MAGNETOMETER
}
```

### Remove all sensor checkboxes except magnetometer

## File: AndroidManifest.xml

### Remove permissions:
- `android.permission.CAMERA`
- `android.permission.RECORD_AUDIO`
- `android.permission.BLUETOOTH*` (all variants)
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.INTERNET` (if not needed)
- `android.permission.ACCESS_WIFI_STATE` (if not needed)

### Keep:
- `android.permission.HIGH_SAMPLING_RATE_SENSORS`

## File: strings.xml

### Remove string resources for:
- sensorAccelerometer
- sensorGyroscope
- sensorPressure
- sensorLight
- sensorProximity
- sensorTemperature
- sensorHumidity
- sensorGravity
- sensorLinearAcceleration
- sensorAttitude

### Keep:
- sensorMagneticField

## Result

After these changes, the app will:
- Only read magnetometer data
- Display X, Y, Z, and absolute magnetic field (µT)
- Show timestamps
- No other sensors or features
