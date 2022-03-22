---
title: Java线程池简单实现
sticky: false
swiper_index: 0
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-01-19 17:19:28
updated:
tags: [Java,编程,多线程]
categories: 编程
keywords:
description:
cover: https://gitee.com/coder-wdf/picgo/raw/master/img/threadpool.png
top_img:

---

## 概论

先看一下线程池的类图：

![threadpoolexecutor](https://gitee.com/coder-wdf/picgo/raw/master/img/threadpool%E7%B1%BB%E5%9B%BE.png)

## Executer 框架接口

Executor 框架是根据一组执行策略调用，调度，执行 和 控制的异步任务框架，目的是提供一种将“任务提交” 与 “任务如何运行” 分离开来的机制

我们看一下Executor的类图：

![class](https://gitee.com/coder-wdf/picgo/raw/master/img/executor%E6%A1%86%E6%9E%B6.png) 

从图中可以看出，ThreadPoolExecutor是线程池的核心

JUC中有三个Executor接口

- Executor：一个运行新任务的简单接口
- ExecutorService：扩展了Executor接口。添加了一些用来管理执行器生命周期和任务生命周期的方法。
- ScheduleExecutorService：扩展了ExecutorService。支持Future和定期执行任务。

本篇呢就根据Executor 这个 最简单的 接口 来窥探一下线程池的核心原理。

---
{% note info  %}

## ThreadPoolExecutor 分析

{% endnote %}

先看一下他的流程图：

![flow](https://gitee.com/coder-wdf/picgo/raw/master/img/916005-20200318232011542-502556595.png)

核心逻辑概括起来就是：

1. 创建线程：要知道如何创建线程，控制线程数量，线程的存活与销毁
2. 添加任务：任务添加后如何处理，是立即执行还是先保存
3. 执行任务：如何获取任务，任务执行失败后如何处理

先看看Java实现得，构造函数
> 所谓 "知己知彼，百战不殆"

{% note info  %}

## 构造函数

{% endnote %}

```java
public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();// 注意 workQueue, threadFactory, handler 是不可以为null 的，为空会直接抛出错误
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```

1. corePoolSize 核心线程数：表示核心线程池的大小。当提交一个任务时，如果当前核心线程池的线程个数没有达到 corePoolSize，则会创建新的线程来执行所提交的任务，即使当前核心线程池有空闲的线程。如果当前核心线程池的线程个数已经达到了corePoolSize，则不再重新创建线程。如果调用了 prestartCoreThread() 或者 prestartAllCoreThreads()，线程池创建的时候所有的核心线程都会被创建并且启动。若 corePoolSize == 0，则任务执行完之后，没有任何请求进入时，销毁线程池的线程。若 corePoolSize > 0，即使本地任务执行完毕，核心线程也不会被销毁。corePoolSize 其实可以理解为可保留的空闲线程数。

2. maximumPoolSize： 表示线程池能够容纳同时执行的最大线程数。如果当阻塞队列已满时，并且当前线程池线程个数没有超过 maximumPoolSize 的话，就会创建新的线程来执行任务。注意 maximumPoolSize >= 1 必须大于等于 1。maximumPoolSize == corePoolSize ，即是固定大小线程池。实际上最大容量是由 CAPACITY 控制。

3. keepAliveTime： 线程空闲时间。当空闲时间达到 keepAliveTime值时，线程会被销毁，直到只剩下 corePoolSize 个线程为止，避免浪费内存和句柄资源。默认情况，当线程池的线程数 > corePoolSize 时，keepAliveTime 才会起作用。但当 ThreadPoolExecutor 的 allowCoreThreadTimeOut 变量设置为 true 时，核心线程超时后会被回收。

4. unit：时间单位。为 keepAliveTime 指定时间单位。

5. workQueue 缓存队列。当请求的线程数 > corePoolSize 时，线程进入 BlockingQueue 阻塞队列。可以使用 ArrayBlockingQueue, LinkedBlockingQueue, SynchronousQueue, PriorityBlockingQueue。

6. threadFactory 创建线程的工程类。可以通过指定线程工厂为每个创建出来的线程设置更有意义的名字，如果出现并发问题，也方便查找问题原因。

7. handler 执行拒绝策略的对象。当线程池的阻塞队列已满和指定的线程都已经开启，说明当前线程池已经处于饱和状态了，那么就需要采用一种策略来处理这种情况。采用的策略有这几种：
    - AbortPolicy： 直接拒绝所提交的任务，并抛出 RejectedExecutionException 异常；

    - CallerRunsPolicy：只用调用者所在的线程来执行任务；

    - DiscardPolicy：不处理直接丢弃掉任务；

    - DiscardOldestPolicy：丢弃掉阻塞队列中存放时间最久的任务，执行当前任务

{% note info %}

## 属性定义

{% endnote %}

```java
// 用来标记线程池状态（高3位），线程个数（低29位）
// 默认是 RUNNING 状态，线程个数为0
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));

// 线程个数掩码位数，整型最大位数-3，可以适用于不同平台
private static final int COUNT_BITS = Integer.SIZE - 3;

//线程最大个数(低29位)00011111111111111111111111111111
private static final int CAPACITY   = (1 << COUNT_BITS) - 1;

//（高3位）：11100000000000000000000000000000
private static final int RUNNING    = -1 << COUNT_BITS;

//（高3位）：00000000000000000000000000000000
private static final int SHUTDOWN   =  0 << COUNT_BITS;

//（高3位）：00100000000000000000000000000000
private static final int STOP       =  1 << COUNT_BITS;

//（高3位）：01000000000000000000000000000000
private static final int TIDYING    =  2 << COUNT_BITS;

//（高3位）：01100000000000000000000000000000
private static final int TERMINATED =  3 << COUNT_BITS;

// 获取高三位 运行状态
private static int runStateOf(int c)     { return c & ~CAPACITY; }

//获取低29位 线程个数
private static int workerCountOf(int c)  { return c & CAPACITY; }

//计算ctl新值，线程状态 与 线程个数
private static int ctlOf(int rs, int wc) { return rs | wc; }

```

这里需要对一些操作做些解释。

- Integer.SIZE：对于不同平台，其位数不一样，目前常见的是 32 位；

- (1 << COUNT_BITS) - 1：首先是将 1 左移 COUNT_BITS 位，也就是第 COUNT_BITS + 1 位是1，其余都是 0；-1 操作则是将后面前面的 COUNT_BITS 位都变成 1。

- -1 << COUNT_BITS：-1 的原码是 10000000 00000000 00000000 00000001 ，反码是 111111111 11111111 11111111 11111110 ，补码 +1，然后左移 29 位是 11100000 00000000 00000000 00000000；这里转为十进制是负数。

- ~CAPACITY ：取反，最高三位是1；

总结：这里巧妙利用 bit 操作来将线程数量和运行状态联系在一起，减少了变量的存在和内存的占用。其中五种状态的十进制排序：RUNNING < SHUTDOWN < STOP < TIDYING < TERMINATED

{% note info %}

## 线程池状态

{% endnote %}

线程池状态含义：

```java
    // ThreadPoolExecutor 源码
    private static final int COUNT_BITS = Integer.SIZE - 3;
    private static final int CAPACITY   = (1 << COUNT_BITS) - 1;
    // runState is stored in the high-order bits
    private static final int RUNNING    = -1 << COUNT_BITS;
    private static final int SHUTDOWN   =  0 << COUNT_BITS;
    private static final int STOP       =  1 << COUNT_BITS;
    private static final int TIDYING    =  2 << COUNT_BITS;
    private static final int TERMINATED =  3 << COUNT_BITS;
```

- RUNNING： 线程池正常运行。接受新任务且处理阻塞队列中得任务
- SHUTDOWN：拒绝新任务但是处理阻塞队列得任务。
- STOP：拒绝新任务 不处理阻塞队列中得任务，中断正在处理得任务。
- TIDYING：所有任务都已终止，workerCount为0，转换到TIDYING的线程将运行terminate()钩子方法.
- TERMINATED：终止状态，通过调用terminated实现。
  
    ```java
    /* Method invoked when the Executor has terminated.
     Default implementation does nothing. Note: To properly 
     nest multiple overridings, subclasses should generally 
     invoke super.terminated within this method. */
     protected void terminated() { }

    ```

线程池状态转换：
    - RUNNING -> SHUTDOWN： 显示调用shutdown方法，或者 隐式调用finalize方法，他里面调用了shutdown方法.
    - [RUNNING,SHUTDOWN] -> STOP：显示调用shutdownNow方法
    - SHUTDOWN -> TIDYING： 线程池和任务队列都为控得时候
    - STOP -> TIDYING：当线程池为空得时候
    - TIDYING -> TERMINATED: 当terminated hook方法执行完成时

{% note info  %}

## execute 方法分析

{% endnote %}

```java
/*
         * Proceed in 3 steps:
         *
         * 1. If fewer than corePoolSize threads are running, try to
         * start a new thread with the given command as its first
         * task.  The call to addWorker atomically checks runState and
         * workerCount, and so prevents false alarms that would add
         * threads when it shouldn't, by returning false.
         *
         * 2. If a task can be successfully queued, then we still need
         * to double-check whether we should have added a thread
         * (because existing ones died since last checking) or that
         * the pool shut down since entry into this method. So we
         * recheck state and if necessary roll back the enqueuing if
         * stopped, or start a new thread if there are none.
         *
         * 3. If we cannot queue task, then we try to add a new
         * thread.  If it fails, we know we are shut down or saturated
         * and so reject the task.
         */
public void execute(Runnable command) {
    if (command == null)
        throw new NullPointerException();

    // 返回包含线程数及线程池状态（头3位）
    int c = ctl.get();
    
    // 如果工作线程数小于核心线程数，则创建线程任务执行
    if (workerCountOf(c) < corePoolSize) {
        
        if (addWorker(command, true))
            return;
            
        // 如果创建失败，防止外部已经在线程池中加入新任务，重新获取
        c = ctl.get();
    }
    
    // 只有线程池处于 RUNNING 状态，且 入队列成功
    if (isRunning(c) && workQueue.offer(command)) {
        // 后面的操作属于double-check
        int recheck = ctl.get();
        
        // 如果线程池不是 RUNNING 状态，则将刚加入队列的任务移除
        if (! isRunning(recheck) && remove(command))
            reject(command);
            
        // 如果之前的线程已被消费完，新建一个线程
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    // 核心池和队列都满了，尝试创建一个新线程
    else if (!addWorker(command, false))
        // 如果 addWorker 返回是 false，即创建失败，则唤醒拒绝策略
        reject(command);
}
```

这里要注意一下 addWorker(null, false) 也就是创建一个线程，但并没有传入任务，因为任务已经被添加到 workQueue 中了，所以 worker 在执行的时候，会直接从 workQueue 中获取任务。所以，在 workerCountOf(recheck) == 0 时执行 addWorker(null, false) 也是为了保证线程池在 RUNNING 状态下必须要有一个线程来执行任务。

需要注意的是，线程池的设计思想就是使用了核心线程池 corePoolSize，阻塞队列 workQueue 和线程池 maximumPoolSize，这样的缓存策略来处理任务，实际上这样的设计思想在需要框架中都会使用。

需要注意线程和任务之间的区别，任务是保存在 workQueue 中的，线程是从线程池里面取的，由 CAPACITY 控制容量。

{% note info  %}

## addWorker 分析

{% endnote %}

addWorker 方法主要工作是在线程池中创建一个新的线程并执行，firstTask参数用于指定新增的线程执行的第一个任务，core参数为True表示新增线程时判断当前活动线程数是否小于corePoolSize，false表示新增线程前需要判断当前活动线程数是否少于maximumPoolSize。代码如下

```java
class StockPrice {
    int maxTimestamp;
    HashMap<Integer, Integer> timePriceMap;
    TreeMap<Integer, Integer> prices;

    public StockPrice() {
        maxTimestamp = 0;
        timePriceMap = new HashMap<Integer, Integer>();
        prices = new TreeMap<Integer, Integer>();
    }
    
    public void update(int timestamp, int price) {
        maxTimestamp = Math.max(maxTimestamp, timestamp);
        int prevPrice = timePriceMap.getOrDefault(timestamp, 0);
        timePriceMap.put(timestamp, price);
        if (prevPrice > 0) {
            prices.put(prevPrice, prices.get(prevPrice) - 1);
            if (prices.get(prevPrice) == 0) {
                prices.remove(prevPrice);
            }
        }
        prices.put(price, prices.getOrDefault(price, 0) + 1);
    }
    
    public int current() {
        return timePriceMap.get(maxTimestamp);
    }
    
    public int maximum() {
        return prices.lastKey();
    }
    
    public int minimum() {
        return prices.firstKey();
    }
}
```

这里需要注意有以下几点：

在获取锁后重新检查线程池的状态，这是因为其他线程可可能在本方法获取锁前改变了线程池的状态，比如调用了shutdown方法。添加成功则启动任务执行。

 t.start()会调用 Worker 类中的 run 方法，Worker 本身实现了 Runnable 接口。原因在创建线程得时候，将 Worker 实例传入了 t 当中，可参见 Worker 类的构造函数。

wc >= CAPACITY || wc >= (core ? corePoolSize : maximumPoolSize)) 每次调用 addWorker 来添加线程会先判断当前线程数是否超过了CAPACITY，然后再去判断是否超 corePoolSize 或 maximumPoolSize，说明线程数实际上是由 CAPACITY 来控制的。

{% note info %}

## 内部类 Worker分析

{% endnote %}

```java
private final class Worker
        extends AbstractQueuedSynchronizer
        implements Runnable
    {
        /**
         * This class will never be serialized, but we provide a
         * serialVersionUID to suppress a javac warning.
         */
        private static final long serialVersionUID = 6138294804551838833L;

        /** Thread this worker is running in.  Null if factory fails. */
        final Thread thread;
        /** Initial task to run.  Possibly null. */
        Runnable firstTask;
        /** Per-thread task counter */
        volatile long completedTasks;

        /**
         * Creates with given first task and thread from ThreadFactory.
         * @param firstTask the first task (null if none)
         */
        Worker(Runnable firstTask) {
            setState(-1); // inhibit interrupts until runWorker
            this.firstTask = firstTask;　　　　　　　// 注意此处传入的是this
            this.thread = getThreadFactory().newThread(this);
        }

        /** Delegates main run loop to outer runWorker. */ 　　　　　// 这里其实会调用外部的 runWorker 方法来执行自己。
        public void run() {
            runWorker(this);
        }

        // Lock methods
        //
        // The value 0 represents the unlocked state.
        // The value 1 represents the locked state.

        protected boolean isHeldExclusively() {
            return getState() != 0;
        }

        protected boolean tryAcquire(int unused) {　　　　　　　// 如果已经设置过1了，这时候在设置1就会返回false，也就是不可重入
            if (compareAndSetState(0, 1)) {
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }

        protected boolean tryRelease(int unused) {
            setExclusiveOwnerThread(null);
            setState(0);
            return true;
        }

        public void lock()        { acquire(1); }
        public boolean tryLock()  { return tryAcquire(1); }
        public void unlock()      { release(1); }
        public boolean isLocked() { return isHeldExclusively(); }
　　　　　// 提供安全中断线程得方法
        void interruptIfStarted() {
            Thread t;　　　　　　　// 一开始 setstate(-1) 避免了还没开始运行就被中断可能
            if (getState() >= 0 && (t = thread) != null && !t.isInterrupted()) {
                try {
                    t.interrupt();
                } catch (SecurityException ignore) {
                }
            }
        }
    }
```

首先看到的是 Worker 继承了(AbstractQueuedSynchronizer) AQS，并实现了 Runnable 接口，说明 Worker 本身也是线程。然后看其构造函数可以发现，内部有两个属性变量分别是 Runnable 和 Thread 实例，该类其实就是对传进来得属性做了一个封装，并加入了获取锁的逻辑（继承了 AQS ）。具体可参考文章：透过 ReentrantLock 分析 AQS 的实现原理

Worker 继承了 AQS，使用 AQS 来实现独占锁的功能。为什么不使用 ReentrantLock 来实现呢？可以看到 tryAcquire 方法，它是不允许重入的，而 ReentrantLock 是允许重入的：

lock 方法一旦获取了独占锁，表示当前线程正在执行任务中；

如果正在执行任务，则不应该中断线程；

如果该线程现在不是独占锁的状态，也就是空闲的状态，说明它没有在处理任务，这时可以对该线程进行中断；

线程池在执行 shutdown 方法或 tryTerminate 方法时会调用 interruptIdleWorkers 方法来中断空闲的线程，interruptIdleWorkers 方法会使用 tryLock 方法来判断线程池中的线程是否是空闲状态；

之所以设置为不可重入，是因为我们不希望任务在调用像 setCorePoolSize 这样的线程池控制方法时重新获取锁。如果使用 ReentrantLock，它是可重入的，这样如果在任务中调用了如 setCorePoolSize 这类线程池控制的方法，会中断正在运行的线程，因为 size 小了，需要中断一些线程 。

所以，Worker 继承自 AQS，用于判断线程是否空闲以及是否可以被中断。

此外，在构造方法中执行了 setState(-1);，把 state 变量设置为 -1，为什么这么做呢？是因为 AQS 中默认的 state 是 0，如果刚创建了一个 Worker 对象，还没有执行任务时，这时就不应该被中断，看一下 tryAquire 方法： 

```java
protected boolean tryAcquire(int unused) {
    if (compareAndSetState(0, 1)) {
        setExclusiveOwnerThread(Thread.currentThread());
        return true;
    }
    return false;
}
```

{% note info %}

## runWorker 分析

{% endnote %}

runworker的具体逻辑

```java
final void runWorker(Worker w) {
       Thread wt = Thread.currentThread();
       Runnable task = w.firstTask;
       w.firstTask = null;
       w.unlock(); // status 设置为0，允许中断，也可以避免再次加锁失败
       boolean completedAbruptly = true;
       try {
           while (task != null || (task = getTask()) != null) {
               // 要派发task的时候，需要上锁
               w.lock();
               // 如果线程池当前状态至少是stop，则设置中断标志;
               // 如果线程池当前状态是RUNNININ，则重置中断标志，重置后需要重新
               //检查下线程池状态，因为当重置中断标志时候，可能调用了线程池的shutdown方法
               //改变了线程池状态。
               if ((runStateAtLeast(ctl.get(), STOP) ||
                    (Thread.interrupted() &&
                     runStateAtLeast(ctl.get(), STOP))) &&
                   !wt.isInterrupted())
                   wt.interrupt();

               try {
                   //任务执行前干一些事情
                   beforeExecute(wt, task);
                   Throwable thrown = null;
                   try {
                       task.run();//执行任务
                   } catch (RuntimeException x) {
                       thrown = x; throw x;
                   } catch (Error x) {
                       thrown = x; throw x;
                   } catch (Throwable x) {
                       thrown = x; throw new Error(x);
                   } finally {
                       //任务执行完毕后干一些事情
                       afterExecute(task, thrown);
                   }
               } finally {
                   task = null;
                   //统计当前worker完成了多少个任务
                   w.completedTasks++;
                   w.unlock();
               }
           }
           completedAbruptly = false;
       } finally {

           //执行清了工作
           processWorkerExit(w, completedAbruptly);
       }
   }
```

总结一下 runWorker 方法的执行过程：

while 循环不断地通过 getTask() 方法从阻塞队列中取任务；

如果线程池正在停止，那么要保证当前线程是中断状态，否则要保证当前线程不是中断状态；

调用 task.run()执行任务；

如果 task 为 null 则跳出循环，执行 processWorkerExit 方法；

runWorker 方法执行完毕，也代表着 Worker 中的 run 方法执行完毕，销毁线程。

这里的 beforeExecute 方法和 afterExecute 方法在 ThreadPoolExecutor 类中是空的，留给子类来实现。

completedAbruptly 变量来表示在执行任务过程中是否出现了异常，在 processWorkerExit 方法中会对该变量的值进行判断。

{% note info %}

## getTask方法分析

{% endnote %}

getTask是从阻塞队列里获取任务，具体代码逻辑如下：

```java
private Runnable getTask() {
    // timeOut变量的值表示上次从阻塞队列中取任务时是否超时
    boolean timedOut = false; // Did the last poll() time out?
    for (;;) {
        int c = ctl.get();
        int rs = runStateOf(c);
        // Check if queue empty only if necessary.
        /*
         * 如果线程池状态rs >= SHUTDOWN，也就是非RUNNING状态，再进行以下判断：
         * 1. rs >= STOP，线程池是否正在stop；
         * 2. 阻塞队列是否为空。
         * 如果以上条件满足，则将workerCount减1并返回null。
         * 因为如果当前线程池状态的值是SHUTDOWN或以上时，不允许再向阻塞队列中添加任务。
         */
        if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
            decrementWorkerCount();
            return null;
        }
        int wc = workerCountOf(c);
        // Are workers subject to culling?
        // timed变量用于判断是否需要进行超时控制。
        // allowCoreThreadTimeOut默认是false，也就是核心线程不允许进行超时；
        // wc > corePoolSize，表示当前线程池中的线程数量大于核心线程数量；
        // 对于超过核心线程数量的这些线程，需要进行超时控制
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;
        
        /*
         * wc > maximumPoolSize的情况是因为可能在此方法执行阶段同时执行了setMaximumPoolSize方法；
         * timed && timedOut 如果为true，表示当前操作需要进行超时控制，并且上次从阻塞队列中获取任务发生了超时
         * 接下来判断，如果有效线程数量大于1，或者阻塞队列是空的，那么尝试将workerCount减1；
         * 如果减1失败，则返回重试。
         * 如果wc == 1时，也就说明当前线程是线程池中唯一的一个线程了。
         */
        if ((wc > maximumPoolSize || (timed && timedOut))
            && (wc > 1 || workQueue.isEmpty())) {
            if (compareAndDecrementWorkerCount(c))
                return null;
            continue;
        }
        try {
            /*
             * 根据timed来判断，如果为true，则通过阻塞队列的poll方法进行超时控制，如果在keepAliveTime时间内没有获取到任务，则返回null；
             * 否则通过take方法，如果这时队列为空，则take方法会阻塞直到队列不为空。
             * 
             */
            Runnable r = timed ?
                workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
                workQueue.take();
            if (r != null)
                return r;
            // 如果 r == null，说明已经超时，timedOut设置为true
            timedOut = true;
        } catch (InterruptedException retry) {
            // 如果获取任务时当前线程发生了中断，则设置timedOut为false并返回循环重试
            timedOut = false;
        }
    }
}
```

其实到这里后，你会发现在 ThreadPoolExcute 内部有几个重要的检验：

判断当前的运行状态，根据运行状态来做处理，如果当前都停止运行了，那很多操作也就没必要了；

判断当前线程池的数量，然后将该数据和 corePoolSize 以及 maximumPoolSize 进行比较，然后再去决定下一步该做啥；

首先是第一个 if 判断，当运行状态处于非 RUNNING 状态，此外 rs >= STOP（线程池是否正在 stop）或阻塞队列是否为空。则将 workerCount 减 1 并返回 null。为什么要减 1 呢，因为此处其实是去获取一个 task，但是发现处于停止状态了，也就是没必要再去获取运行任务了，那这个线程就没有存在的意义了。后续也会在 processWorkerExit 将该线程移除。

第二个 if 条件目的是控制线程池的有效线程数量。由上文中的分析可以知道，在执行 execute 方法时，如果当前线程池的线程数量超过了 corePoolSize 且小于 maximumPoolSize，并且 workQueue 已满时，则可以增加工作线程，但这时如果超时没有获取到任务，也就是 timedOut 为 true 的情况，说明 workQueue 已经为空了，也就说明了当前线程池中不需要那么多线程来执行任务了，可以把多于 corePoolSize 数量的线程销毁掉，保持线程数量在 corePoolSize 即可。

什么时候会销毁？当然是 runWorker 方法执行完之后，也就是 Worker 中的 run 方法执行完，由 JVM 自动回收。

getTask 方法返回 null 时，在 runWorker 方法中会跳出 while 循环，然后会执行 processWorkerExit 方法。



## 参考文献

1. [jdk 1.8 源码](https://github.com/openjdk/jdk)
2. [ThreadPoolExecutor分析](https://www.cnblogs.com/huansky/p/12467720.html)