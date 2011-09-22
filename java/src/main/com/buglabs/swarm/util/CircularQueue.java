package com.buglabs.swarm.util;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReferenceArray;

public class CircularQueue<T> {
	private int qMaxSize;// max queue size
	private AtomicInteger fp; // front pointer
	private AtomicInteger rp; // rear pointer
	private AtomicInteger qs; // size of queue
	private AtomicReferenceArray<T> queue; // actual queue

	public CircularQueue(int size) {
		qMaxSize = size;
		fp = new AtomicInteger();
		rp = new AtomicInteger();
		qs = new AtomicInteger();
		queue = new AtomicReferenceArray<T>(qMaxSize);
	}

	public T remove() {
		qs.decrementAndGet();
		fp.set((fp.get() + 1) % qMaxSize);
		return queue.get(fp.intValue());
	}

	public void add(T item) {
		qs.incrementAndGet();
		rp.set((rp.get() + 1) % qMaxSize);
		queue.set(rp.intValue(), item);
	}

	public boolean isEmpty() {
		return qs.intValue() == 0;
	}
}
