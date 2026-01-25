package de.rwth_aachen.phyphox;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;

import java.io.Serializable;
import java.util.Vector;
import java.util.concurrent.locks.Lock;

/**
 * Simplified SensorInput class that ONLY handles magnetometer.
 * All other sensor types have been removed.
 */
public class MagnetometerInput implements SensorEventListener, Serializable {

    public int type; // Sensor type (always TYPE_MAGNETIC_FIELD or TYPE_MAGNETIC_FIELD_UNCALIBRATED)
    public boolean calibrated = true;
    public long period; // Sensor acquisition period in nanoseconds (inverse rate), 0 = as fast as
                        // possible
    public int stride;
    int strideCount;
    public SensorRateStrategy rateStrategy;
    private boolean lastOneTooFast = false;
    private final ExperimentTimeReference experimentTimeReference;
    public double fixDeviceTimeOffset = 0.0;

    // Target MicroTesla value received from remote interface (negative = unset)
    public double targetMT = -1.0;

    public boolean ignoreUnavailable = false;

    public DataBuffer dataX; // Data-buffer for X component (µT)
    public DataBuffer dataY; // Data-buffer for Y component (µT)
    public DataBuffer dataZ; // Data-buffer for Z component (µT)
    public DataBuffer dataT; // Data-buffer for timestamp
    public DataBuffer dataAbs; // Data-buffer for absolute value √(X²+Y²+Z²) (µT)
    public DataBuffer dataAccuracy; // Data-buffer for accuracy
    transient private SensorManager sensorManager;
    transient private Sensor sensor;

    private long lastReading;
    private double avgX, avgY, avgZ, avgAccuracy;
    private double genX, genY, genZ, genAccuracy;
    private boolean average = false;
    private int aquisitions;

    private Lock dataLock;

    public enum SensorRateStrategy {
        auto, request, generate, limit
    }

    public static class SensorException extends Exception {
        public SensorException(String message) {
            super(message);
        }
    }

    private MagnetometerInput(boolean ignoreUnavailable, double rate, SensorRateStrategy rateStrategy, int stride,
            boolean average, Vector<DataOutput> buffers, Lock lock, ExperimentTimeReference experimentTimeReference)
            throws SensorException {
        this.dataLock = lock;
        this.experimentTimeReference = experimentTimeReference;

        if (rate <= 0)
            this.period = 0;
        else
            this.period = (long) ((1 / rate) * 1e9);
        this.stride = stride;
        this.rateStrategy = rateStrategy;
        this.average = average;
        this.ignoreUnavailable = ignoreUnavailable;

        if (buffers == null)
            return;

        buffers.setSize(6);
        if (buffers.get(0) != null)
            this.dataX = buffers.get(0).buffer;
        if (buffers.get(1) != null)
            this.dataY = buffers.get(1).buffer;
        if (buffers.get(2) != null)
            this.dataZ = buffers.get(2).buffer;
        if (buffers.get(3) != null)
            this.dataT = buffers.get(3).buffer;
        if (buffers.get(4) != null)
            this.dataAbs = buffers.get(4).buffer;
        if (buffers.get(5) != null)
            this.dataAccuracy = buffers.get(5).buffer;
    }

    public MagnetometerInput(boolean ignoreUnavailable, double rate, SensorRateStrategy rateStrategy, int stride,
            boolean average, Vector<DataOutput> buffers, Lock lock, ExperimentTimeReference experimentTimeReference)
            throws SensorException {
        this(ignoreUnavailable, rate, rateStrategy, stride, average, buffers, lock, experimentTimeReference);
        this.type = Sensor.TYPE_MAGNETIC_FIELD;
    }

    private Sensor findSensor() {
        Sensor sensor = null;
        if (type >= 0)
            sensor = sensorManager.getDefaultSensor(type);
        return sensor;
    }

    public void attachSensorManager(SensorManager sensorManager) {
        this.sensorManager = sensorManager;
        sensor = findSensor();
    }

    public boolean isAvailable() {
        return (sensor != null);
    }

    public static String getUnit() {
        return "µT"; // Microteslas
    }

    public void start() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            if (calibrated)
                this.type = Sensor.TYPE_MAGNETIC_FIELD;
            else
                this.type = Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED;
        }

        sensor = findSensor();

        if (sensor == null)
            return;

        this.lastReading = 0;
        this.avgX = 0.;
        this.avgY = 0.;
        this.avgZ = 0.;
        this.avgAccuracy = 0.;
        this.aquisitions = 0;
        this.strideCount = 0;
        lastOneTooFast = false;

        if (rateStrategy == SensorRateStrategy.request || rateStrategy == SensorRateStrategy.auto)
            this.sensorManager.registerListener(this, sensor, (int) (period / 1000));
        else
            this.sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_FASTEST);
    }

    public void stop() {
        if (sensor == null)
            return;
        this.sensorManager.unregisterListener(this);
    }

    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    private void appendToBuffers(long timestamp, double x, double y, double z, double accuracy) {
        strideCount++;
        if (strideCount < stride) {
            return;
        } else {
            strideCount = 0;
        }
        dataLock.lock();
        try {
            if (dataX != null)
                dataX.append(x);
            if (dataY != null)
                dataY.append(y);
            if (dataZ != null)
                dataZ.append(z);
            if (dataT != null) {
                double t;
                if (timestamp == 0) {
                    t = experimentTimeReference.getExperimentTime();
                } else {
                    t = experimentTimeReference.getExperimentTimeFromEvent(timestamp);
                    if (fixDeviceTimeOffset == 0.0) {
                        double now = experimentTimeReference.getExperimentTime();
                        if ((t < -300 || (t > now + 0.1)) && fixDeviceTimeOffset == 0.0) {
                            Log.w("MagnetometerInput", "Unrealistic time offset detected at " + now
                                    + ". Applying adjustment of " + -t + "s.");
                            fixDeviceTimeOffset = now - t;
                        }
                    }
                    t += fixDeviceTimeOffset;
                    if (t < 0.0) {
                        Log.w("MagnetometerInput", "Adjusted timestamp from t = " + t + "s to t = 0s.");
                        t = 0.0;
                    }
                }
                dataT.append(t);
            }
            if (dataAbs != null)
                dataAbs.append(Math.sqrt(avgX * avgX + avgY * avgY + avgZ * avgZ) / aquisitions);
            if (dataAccuracy != null)
                dataAccuracy.append(accuracy);
        } finally {
            dataLock.unlock();
        }
    }

    private void resetAveraging(long t) {
        avgX = 0.;
        avgY = 0.;
        avgZ = 0.;
        avgAccuracy = 0.;
        lastReading = t;
        aquisitions = 0;
    }

    public void updateGeneratedRate() {
        long now;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            now = SystemClock.elapsedRealtimeNanos();
        } else {
            now = SystemClock.elapsedRealtime() * 1000000L;
        }
        if (rateStrategy == SensorRateStrategy.generate && lastReading > 0) {
            while (lastReading + 2 * period <= now) {
                appendToBuffers(lastReading + period, genX, genY, genZ, genAccuracy);
                lastReading += period;
            }
        }
    }

    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == sensor.getType()) {
            Double accuracy = Double.NaN;
            if (type == Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED) {
                accuracy = 0.0;
            } else if (type == Sensor.TYPE_MAGNETIC_FIELD) {
                switch (event.accuracy) {
                    case SensorManager.SENSOR_STATUS_NO_CONTACT:
                    case SensorManager.SENSOR_STATUS_UNRELIABLE:
                        accuracy = -1.0;
                        break;
                    case SensorManager.SENSOR_STATUS_ACCURACY_LOW:
                        accuracy = 1.0;
                        break;
                    case SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM:
                        accuracy = 2.0;
                        break;
                    case SensorManager.SENSOR_STATUS_ACCURACY_HIGH:
                        accuracy = 3.0;
                        break;
                }
            }

            if (rateStrategy == SensorRateStrategy.generate) {
                if (lastReading == 0) {
                    genX = event.values[0];
                    genY = event.values.length > 1 ? event.values[1] : event.values[0];
                    genZ = event.values.length > 2 ? event.values[2] : event.values[0];
                    genAccuracy = accuracy;
                } else if (lastReading + period <= event.timestamp) {
                    while (lastReading + 2 * period <= event.timestamp) {
                        appendToBuffers(lastReading + period, genX, genY, genZ, genAccuracy);
                        lastReading += period;
                    }
                    if (aquisitions > 0) {
                        genX = avgX / aquisitions;
                        genY = avgY / aquisitions;
                        genZ = avgZ / aquisitions;
                        genAccuracy = avgAccuracy;
                    }
                    appendToBuffers(lastReading + period, genX, genY, genZ, genAccuracy);
                    resetAveraging(lastReading + period);
                }
            }

            if (rateStrategy != SensorRateStrategy.request) {
                if (average) {
                    avgX += event.values[0];
                    if (event.values.length > 1) {
                        avgY += event.values[1];
                        if (event.values.length > 2)
                            avgZ += event.values[2];
                    }
                    avgAccuracy = Math.min(accuracy, avgAccuracy);
                    aquisitions++;
                } else {
                    avgX = event.values[0];
                    if (event.values.length > 1) {
                        avgY = event.values[1];
                        if (event.values.length > 2)
                            avgZ = event.values[2];
                    }
                    avgAccuracy = accuracy;
                    aquisitions = 1;
                }
                if (lastReading == 0)
                    lastReading = event.timestamp;
            }

            switch (rateStrategy) {
                case auto:
                    if (event.timestamp - lastReading < period * 0.9) {
                        if (lastOneTooFast)
                            rateStrategy = SensorRateStrategy.generate;
                        lastOneTooFast = true;
                    } else {
                        lastOneTooFast = false;
                    }
                    appendToBuffers(event.timestamp, event.values[0],
                            event.values.length > 1 ? event.values[1] : event.values[0],
                            event.values.length > 2 ? event.values[2] : event.values[0], accuracy);
                    resetAveraging(event.timestamp);
                    break;
                case request:
                    appendToBuffers(event.timestamp, event.values[0],
                            event.values.length > 1 ? event.values[1] : event.values[0],
                            event.values.length > 2 ? event.values[2] : event.values[0], accuracy);
                    break;
                case generate:
                    break;
                case limit:
                    if (lastReading + period <= event.timestamp) {
                        appendToBuffers(event.timestamp, avgX / aquisitions, avgY / aquisitions, avgZ / aquisitions,
                                avgAccuracy);
                        resetAveraging(event.timestamp);
                    }
                    break;
            }
        }
    }
}
