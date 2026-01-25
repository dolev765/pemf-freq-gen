# Stripping Progress - phyphox-android to Magnetometer-Only

## ✅ COMPLETED

### SensorInput.java - STRIPPED
- ✅ Removed all sensor types from `SensorName` enum (kept only `magnetic_field`)
- ✅ Removed all sensor cases from `resolveSensorName()` (kept only magnetometer)
- ✅ Removed all sensor descriptions from `getDescriptionRes()` (kept only magnetometer)
- ✅ Removed all sensor units from `getUnit()` (kept only µT for magnetometer)
- ✅ Removed vendor sensor finding code for temperature, humidity, pressure

## ⚠️ STILL NEEDS TO BE DONE

### 1. Experiment.java
- Remove imports for Bluetooth, Camera, GPS, Audio
- Remove code that initializes other sensors
- Remove code that handles camera/bluetooth/GPS/audio inputs
- Keep only magnetometer sensor handling

### 2. Delete Entire Directories
```bash
# Run these commands in phyphox-android directory:
rm -rf app/src/main/java/de/rwth_aachen/phyphox/camera/
rm -rf app/src/main/java/de/rwth_aachen/phyphox/Bluetooth/
rm -rf app/src/main/java/de/rwth_aachen/phyphox/NetworkConnection/
```

### 3. Delete Individual Files
```bash
rm app/src/main/java/de/rwth_aachen/phyphox/GpsInput.java
rm app/src/main/java/de/rwth_aachen/phyphox/GpsGeoid.java
rm app/src/main/java/de/rwth_aachen/phyphox/AudioOutput.java
rm app/src/main/java/de/rwth_aachen/phyphox/RemoteServer.java
```

### 4. AndroidManifest.xml
- Remove CAMERA permission
- Remove RECORD_AUDIO permission
- Remove all BLUETOOTH permissions
- Remove location permissions
- Keep HIGH_SAMPLING_RATE_SENSORS

### 5. SimpleExperimentCreator.java
- Remove all sensor checkboxes except magnetometer
- Update SensorType enum to only MAGNETOMETER

### 6. Resources (strings.xml)
- Remove string resources for all non-magnetometer sensors
- Keep only sensorMagneticField

## Files Created

1. `src/MagnetometerInput.java` - Standalone magnetometer class
2. `src/SensorInput_MagnetometerOnly.java` - Complete stripped version
3. `src/DataBuffer.java` - Copied (unchanged, needed)
4. `src/ExperimentTimeReference.java` - Copied (unchanged, needed)

## Next Steps

1. Continue stripping Experiment.java
2. Delete unnecessary directories and files
3. Update AndroidManifest.xml
4. Update SimpleExperimentCreator.java
5. Clean up resources
6. Test build
