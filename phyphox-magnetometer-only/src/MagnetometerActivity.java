package de.rwth_aachen.phyphox;

import android.app.Activity;
import android.hardware.SensorManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.text.format.Formatter;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.Vector;
import java.util.concurrent.locks.ReentrantLock;
import java.util.Timer;
import java.util.TimerTask;

public class MagnetometerActivity extends Activity {
    private MagnetometerInput magnetometerInput;
    private SimpleRemoteServer remoteServer;
    private TextView mtDisplay;
    private TextView statusDisplay;
    private Timer timer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // UI Layout
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        layout.setPadding(40, 40, 40, 40);
        layout.setBackgroundColor(0xFFF0F3F4); // Light grey/blue background

        TextView title = new TextView(this);
        title.setText("Phyphox Magnetometer Link");
        title.setTextSize(24);
        title.setGravity(Gravity.CENTER);
        title.setTextColor(0xFF1A5276);
        title.setPadding(0, 0, 0, 40);

        mtDisplay = new TextView(this);
        mtDisplay.setText("0.0 µT");
        mtDisplay.setTextSize(64);
        mtDisplay.setGravity(Gravity.CENTER);
        mtDisplay.setTextColor(0xFF2980B9);
        mtDisplay.setTypeface(null, android.graphics.Typeface.BOLD);

        statusDisplay = new TextView(this);
        statusDisplay.setText("Starting...");
        statusDisplay.setTextSize(14);
        statusDisplay.setGravity(Gravity.CENTER);
        statusDisplay.setTextColor(0xFF5D6D7E);
        statusDisplay.setPadding(0, 40, 0, 0);

        layout.addView(title);
        layout.addView(mtDisplay);
        layout.addView(statusDisplay);

        setContentView(layout);

        try {
            ExperimentTimeReference timeRef = new ExperimentTimeReference();
            timeRef.start();

            // Setup buffers (X, Y, Z, T, Abs, Accuracy)
            Vector<DataOutput> buffers = new Vector<>();
            for (int i = 0; i < 6; i++) {
                DataBuffer db = new DataBuffer("buffer_" + i, 0, timeRef);
                buffers.add(new DataOutput(db, true));
            }

            magnetometerInput = new MagnetometerInput(
                    false, 50.0, MagnetometerInput.SensorRateStrategy.auto,
                    1, false, buffers, new ReentrantLock(), timeRef);

            magnetometerInput.attachSensorManager((SensorManager) getSystemService(SENSOR_SERVICE));
            magnetometerInput.start();

            int port = 8080;
            remoteServer = new SimpleRemoteServer(port, magnetometerInput);
            remoteServer.start();

            // Get IP Address
            WifiManager wifiManager = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            int ipAddress = wifiInfo.getIpAddress();
            String ip = Formatter.formatIpAddress(ipAddress);

            // Extract connection code (last part of IP)
            String code = "???";
            if (ip != null && ip.contains(".")) {
                code = ip.substring(ip.lastIndexOf('.') + 1);
                // Pad to 3 digits if needed (optional, but looks better)
                while (code.length() < 3)
                    code = "0" + code;
            }

            statusDisplay.setText("Connection Code:\n" + code);
            statusDisplay.setTextSize(48); // Make it big
            statusDisplay.setTextColor(0xFF1A5276);
            statusDisplay.setTypeface(null, android.graphics.Typeface.BOLD);

            TextView footer = new TextView(this);
            footer.setText("Phyphox Magnetometer Link active\nIP: " + ip + ":" + port);
            footer.setTextSize(12);
            footer.setGravity(Gravity.CENTER);
            footer.setTextColor(0xFF7F8C8D);
            footer.setPadding(0, 40, 0, 0);
            ((LinearLayout) mtDisplay.getParent()).addView(footer);

            TextView targetDisplay = new TextView(this);
            targetDisplay.setText("Target: --");
            targetDisplay.setTextSize(18);
            targetDisplay.setGravity(Gravity.CENTER);
            targetDisplay.setTextColor(0xFFE67E22); // Orange color
            targetDisplay.setPadding(0, 10, 0, 0);
            ((LinearLayout) mtDisplay.getParent()).addView(targetDisplay, 2); // Insert below mtDisplay

            // Update UI periodically
            timer = new Timer();
            timer.scheduleAtFixedRate(new TimerTask() {
                @Override
                public void run() {
                    runOnUiThread(() -> {
                        if (magnetometerInput.dataAbs != null) {
                            double val = magnetometerInput.dataAbs.value;
                            if (!Double.isNaN(val)) {
                                mtDisplay.setText(String.format("%.1f µT", val));
                            }
                        }
                        // Update target display
                        if (magnetometerInput.targetMT >= 0) {
                            targetDisplay.setText(String.format("Target: %.1f µT", magnetometerInput.targetMT));
                        } else {
                            targetDisplay.setText("Target: --");
                        }
                    });
                }
            }, 0, 200);

        } catch (Exception e) {
            e.printStackTrace();
            statusDisplay.setText("Error: " + e.getMessage());
        }
    }

    @Override
    protected void stop() {
        super.onStop();
        // Keep it running in background if needed, but for simple app we might want to
        // stop if killed
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (magnetometerInput != null)
            magnetometerInput.stop();
        if (remoteServer != null)
            remoteServer.stop();
        if (timer != null)
            timer.cancel();
    }
}
