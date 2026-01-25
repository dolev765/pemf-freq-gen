package de.rwth_aachen.phyphox;

import java.io.IOException;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class SimpleRemoteServer {
    private final int port;
    private final MagnetometerInput magnetometerInput;
    private ServerSocket serverSocket;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private boolean running = false;

    public SimpleRemoteServer(int port, MagnetometerInput magnetometerInput) {
        this.port = port;
        this.magnetometerInput = magnetometerInput;
    }

    public void start() {
        if (running)
            return;
        running = true;
        executor.execute(() -> {
            try {
                serverSocket = new ServerSocket(port);
                while (running) {
                    try {
                        Socket client = serverSocket.accept();
                        handleClient(client);
                    } catch (IOException e) {
                        if (running)
                            e.printStackTrace();
                    }
                }
            } catch (IOException e) {
                if (running)
                    e.printStackTrace();
            }
        });
    }

    public void stop() {
        running = false;
        try {
            if (serverSocket != null)
                serverSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void handleClient(Socket client) {
        new Thread(() -> {
            try {
                Scanner in = new Scanner(client.getInputStream());
                if (!in.hasNextLine()) {
                    client.close();
                    return;
                }
                String line = in.nextLine();
                if (line.contains("GET /get?magnetometer") || line.startsWith("OPTIONS")) {
                    String response = "";
                    if (line.contains("GET")) {
                        // Check for target parameter...
                        if (magnetometerInput != null && line.contains("&target=")) {
                            try {
                                String[] parts = line.split("&target=");
                                if (parts.length > 1) {
                                    String valStr = parts[1].split(" ")[0];
                                    double val = Double.parseDouble(valStr);
                                    magnetometerInput.targetMT = val;
                                }
                            } catch (Exception e) {}
                        }
                        response = getJsonResponse();
                    }

                    OutputStream out = client.getOutputStream();
                    out.write("HTTP/1.1 200 OK\r\n".getBytes());
                    out.write("Content-Type: application/json\r\n".getBytes());
                    out.write("Access-Control-Allow-Origin: *\r\n".getBytes());
                    out.write("Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n".getBytes());
                    out.write("Access-Control-Allow-Headers: Content-Type\r\n".getBytes());
                    out.write("Access-Control-Allow-Private-Network: true\r\n".getBytes()); // Critical for Chrome
                    if (response.length() > 0) {
                        out.write(("Content-Length: " + response.length() + "\r\n").getBytes());
                        out.write("\r\n".getBytes());
                        out.write(response.getBytes());
                    } else {
                        out.write("Content-Length: 0\r\n\r\n".getBytes());
                    }
                    out.flush();
                } else {
                    OutputStream out = client.getOutputStream();
                    out.write("HTTP/1.1 404 Not Found\r\n\r\n".getBytes());
                    out.flush();
                }
                client.close();
            } catch (IOException e) {
                e.printStackTrace();
                try {
                    client.close();
                } catch (IOException ignored) {
                }
            }
        }).start();
    }

    private String getJsonResponse() {
        double x = 0, y = 0, z = 0, abs = 0, t = 0;
        if (magnetometerInput.dataX != null)
            x = magnetometerInput.dataX.value;
        if (magnetometerInput.dataY != null)
            y = magnetometerInput.dataY.value;
        if (magnetometerInput.dataZ != null)
            z = magnetometerInput.dataZ.value;
        if (magnetometerInput.dataAbs != null)
            abs = magnetometerInput.dataAbs.value;
        if (magnetometerInput.dataT != null)
            t = magnetometerInput.dataT.value;

        // Use locale-independent formatting to avoid comma as decimal separator
        return String.format(java.util.Locale.US,
                "{\"buffer\":{\"magnetometer\":{\"value\":[[%f],[%f],[%f],[%f]],\"timestamp\":[%f]}}}",
                x, y, z, abs, t);
    }
}
