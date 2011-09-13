package com.buglabs.swarm.util;

public class CircularQueue<T> {
	private int qMaxSize;// max queue size
	private int fp = 0; // front pointer
	private int rp = 0; // rear pointer
	private int qs = 0; // size of queue
	private T[] queue; // actual queue

	public CircularQueue(int size) {
		qMaxSize = size;
		fp = 0;
		rp = 0;
		qs = 0;
		queue = (T[]) new Object[qMaxSize];
	}

	public T remove() {
		qs--;
		fp = (fp + 1) % qMaxSize;
		return queue[fp];
	}

	public void add(T item) {
		qs++;
		rp = (rp + 1) % qMaxSize;
		queue[rp] = item;
	}

	public boolean isEmpty() {
		return qs == 0;
	}
}
