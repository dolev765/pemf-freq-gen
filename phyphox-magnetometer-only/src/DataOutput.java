package de.rwth_aachen.phyphox;

import java.io.Serializable;
import java.util.Iterator;

public class DataOutput implements Serializable {
    public DataBuffer buffer = null;
    boolean append;

    public DataOutput(DataBuffer buffer, boolean append) {
        this.append = append;
        this.buffer = buffer;
    }

    public double getValue() {
        return buffer.value;
    }

    public int getFilledSize() {
        return buffer.getFilledSize();
    }

    public Iterator getIterator() {
        return buffer.getIterator();
    }

    public Double[] getArray() {
        return buffer.getArray();
    }

    public short[] getShortArray() {
        return buffer.getShortArray();
    }

    public void append(double value) {
        buffer.append(value);
    }

    public void append(Double value[], Integer count) {
        buffer.append(value, count);
    }

    public boolean isStatic() {
        return buffer.isStatic;
    }

    public void clear(boolean reset) {
        buffer.clear(reset);
    }

    public int size() {
        return buffer.size;
    }

    public void markSet() {
        buffer.markSet();
    }
}
