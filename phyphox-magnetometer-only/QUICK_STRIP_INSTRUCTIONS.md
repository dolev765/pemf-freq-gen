# Quick Instructions to Strip phyphox-android

## Manual Steps (Recommended)

Since this is a complex Android project, here are the exact changes needed:

## 1. Edit SensorInput.java

### Location: `app/src/main/java/de/rwth_aachen/phyphox/SensorInput.java`

**Change Line 55:**
```java
// FROM:
accelerometer, linear_acceleration, gravity, gyroscope, magnetic_field, pressure, light, proximity, temperature, humidity, attitude, custom

// TO:
magnetic_field
```

**Change Lines 70-83 (resolveSensorName method):**
```java
// FROM: All the cases
// TO: Only this:
switch (type) {
    case magnetic_field: return Sensor.TYPE_MAGNETIC_FIELD;
    default: return -2;
}
```

**Change Lines 217-248 (getDescriptionRes method):**
```java
// FROM: All sensor cases
// TO: Only this:
switch (type) {
    case Sensor.TYPE_MAGNETIC_FIELD:
    case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
        return R.string.sensorMagneticField;
}
if (type >= Sensor.TYPE_DEVICE_PRIVATE_BASE) {
    return R.string.sensorVendor;
}
return R.string.unknown;
```

**Change Lines 254-278 (getUnit method):**
```java
// FROM: All sensor cases
// TO: Only this:
switch (type) {
    case Sensor.TYPE_MAGNETIC_FIELD:
    case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
        return "µT";
}
return "";
```

**Delete Lines 168-191** (vendor sensor finding for temperature, humidity, pressure)

## 2. Delete These Directories

```bash
rm -rf app/src/main/java/de/rwth_aachen/phyphox/camera/
rm -rf app/src/main/java/de/rwth_aachen/phyphox/Bluetooth/
rm -rf app/src/main/java/de/rwth_aachen/phyphox/NetworkConnection/
```

## 3. Delete These Files

```bash
rm app/src/main/java/de/rwth_aachen/phyphox/GpsInput.java
rm app/src/main/java/de/rwth_aachen/phyphox/GpsGeoid.java
rm app/src/main/java/de/rwth_aachen/phyphox/AudioOutput.java
rm app/src/main/java/de/rwth_aachen/phyphox/RemoteServer.java
```

## 4. Edit AndroidManifest.xml

Remove these permission lines:
- `<uses-permission android:name="android.permission.CAMERA" />`
- `<uses-permission android:name="android.permission.RECORD_AUDIO" />`
- All BLUETOOTH permissions
- Location permissions
- Internet/WiFi permissions (if not needed)

## 5. Edit Experiment.java

Remove code that:
- Initializes other sensors (keep only magnetometer)
- Handles camera/bluetooth/GPS/audio

## 6. Edit SimpleExperimentCreator.java

Remove all sensor checkboxes except magnetometer.

## Result

After these changes, rebuild the app. It will only have magnetometer functionality.
