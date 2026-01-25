# Completed Stripping - phyphox-android to Magnetometer-Only

## ✅ DELETED

### Directories Removed:
- ✅ `camera/` - Entire camera module deleted
- ✅ `Bluetooth/` - Entire Bluetooth module deleted  
- ✅ `NetworkConnection/` - Entire network module deleted

### Files Removed:
- ✅ `GpsInput.java` - GPS functionality deleted
- ✅ `GpsGeoid.java` - GPS geoid data deleted
- ✅ `AudioOutput.java` - Audio output deleted
- ✅ `RemoteServer.java` - Remote server deleted

## ✅ MODIFIED

### SensorInput.java:
- ✅ `SensorName` enum: Only `magnetic_field` remains
- ✅ `resolveSensorName()`: Only magnetometer case remains
- ✅ `getDescriptionRes()`: Only magnetometer descriptions remain
- ✅ `getUnit()`: Only µT unit remains
- ✅ `findSensor()`: Vendor sensor finding removed (temperature, humidity, pressure)

### Experiment.java:
- ✅ Removed Bluetooth imports
- ✅ Removed Camera imports
- ✅ Removed NetworkConnection imports
- ⚠️ Still needs: Remove code that uses these modules (will cause compile errors)

## ⚠️ STILL NEEDS FIXING

### Experiment.java - Remove/Comment Out:
1. All `bluetoothInputs`, `bluetoothOutputs` references
2. All `depthInput` (camera) references
3. All `audioOutput` references
4. All `networkConnections` references
5. All `gpsIn` references
6. All methods that handle these modules

### AndroidManifest.xml:
- Remove CAMERA permission
- Remove RECORD_AUDIO permission
- Remove BLUETOOTH permissions
- Remove location permissions

### Build Errors Expected:
The app will NOT compile until all references to deleted modules are removed from Experiment.java and other files.

## Next Steps

1. Fix Experiment.java to remove all references to deleted modules
2. Update AndroidManifest.xml permissions
3. Fix any remaining import errors
4. Test compilation
