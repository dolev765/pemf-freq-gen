#!/usr/bin/env python3
"""
Script to strip phyphox-android to magnetometer-only functionality.
This removes all non-magnetometer sensor code and unnecessary modules.
"""

import os
import re
import shutil
from pathlib import Path

# Path to phyphox-android source
SOURCE_DIR = "../phyphox-android"
TARGET_DIR = "stripped-phyphox"

def strip_sensor_input(file_path):
    """Strip SensorInput.java to only magnetometer"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Change SensorName enum to only magnetic_field
    content = re.sub(
        r'public enum SensorName \{[^}]+\}',
        'public enum SensorName {\n        magnetic_field\n    }',
        content,
        flags=re.DOTALL
    )
    
    # Strip resolveSensorName to only magnetic_field case
    content = re.sub(
        r'case accelerometer: return Sensor\.TYPE_ACCELEROMETER;.*?case custom: return -1;',
        'case magnetic_field: return Sensor.TYPE_MAGNETIC_FIELD;\n            default: return -2;',
        content,
        flags=re.DOTALL
    )
    
    # Strip getDescriptionRes to only magnetometer
    old_pattern = r'case Sensor\.TYPE_ACCELEROMETER:.*?return R\.string\.sensorAccelerometer;.*?case Sensor\.TYPE_MAGNETIC_FIELD:.*?return R\.string\.sensorMagneticField;.*?case Sensor\.TYPE_MAGNETIC_FIELD_UNCALIBRATED:.*?return R\.string\.sensorMagneticField;.*?case Sensor\.TYPE_PRESSURE:'
    new_pattern = '''case Sensor.TYPE_MAGNETIC_FIELD:
                return R.string.sensorMagneticField;
            case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
                return R.string.sensorMagneticField;'''
    
    # Strip getUnit to only magnetometer
    content = re.sub(
        r'case Sensor\.TYPE_LINEAR_ACCELERATION:.*?return "m/s²";.*?case Sensor\.TYPE_MAGNETIC_FIELD:.*?return "µT";.*?case Sensor\.TYPE_MAGNETIC_FIELD_UNCALIBRATED:.*?return "µT";.*?case Sensor\.TYPE_PRESSURE:',
        '''case Sensor.TYPE_MAGNETIC_FIELD:
                return "µT";
            case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
                return "µT";''',
        content,
        flags=re.DOTALL
    )
    
    # Remove vendor sensor finding code (temperature, humidity, pressure)
    content = re.sub(
        r'if \(type == Sensor\.TYPE_AMBIENT_TEMPERATURE\) \{.*?\} else if \(type == Sensor\.TYPE_RELATIVE_HUMIDITY\) \{.*?\} else if \(type == Sensor\.TYPE_PRESSURE\) \{.*?\} else if',
        'if',
        content,
        flags=re.DOTALL
    )
    
    return content

def main():
    print("Stripping phyphox-android to magnetometer-only...")
    print("This will create a copy with only magnetometer functionality.")
    print("\nNOTE: This is a complex task. Manual review and testing required.")
    print("See CHANGES_TO_MAKE.md for detailed instructions.")

if __name__ == "__main__":
    main()
