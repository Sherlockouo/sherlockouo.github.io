---
title: jdkのkeep-alive实现 源码解析
sticky: false
swiper_index: 4
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-01-22 12:04:57
updated:
tags: [Java,网络,源码]
categories: 编程
keywords: java 实现 http keep-alive
description: jdk 实现 http keep-alive
cover: /img/old/Young%20Star%20Jet%20MHO%202147.jpg
top_img: 
---

## 准备工作

如果你想看到源码注释 和 变量名称 而不是 var1，var2这种， 建议下载 源码进行查阅
而且 jdk自带的src.zip 是没有包含sun的代码的。所以需要重新下载

1. 先下载源码

    ```git
    git clone https://github.com/openjdk-mirror/jdk.git
    cd jdk
    ```

2. 切换到jdk8分支

    ```git
    git checkout jdk8u/jdk8u/master
    ```

3. 复制sun文件夹到你jdk解压出的src目录

## 可以先写个demo 试试

> 感谢 http://zxin.site/ 头像提供的测试支持
> ![](/img/old/20220122165945.png)

```java
package net;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class KeepAlive {
    public static void main(String[] args) throws IOException {
        test("Close",true);
        test("Close",true);
        test("keep-alive",false);
        test("keep-alive",false);
        test("keep-alive",false);
    }

    private static void test(String type,boolean flags) throws IOException {
        String imgurl = "http://zxin.site/images/pdx.jpg";
        URL url = new URL(imgurl);

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestProperty("Charset", "UTF-8");
        connection.setRequestProperty("Proxy-Connection", type);
        // HttpURLConnection 默认开启了keep-alive，所以需要显示设置为false，才能使用短连接
        connection.setRequestProperty("Connection",type);
        connection.setRequestProperty("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");
        connection.setRequestProperty("Referer","http://zxin.site/");
        connection.setRequestMethod("GET");
        connection.connect();

        BufferedInputStream bufferedInputStream = new BufferedInputStream(connection.getInputStream());

        File file = new File("./xxx.jpeg");
        OutputStream out = new FileOutputStream(file);
        int size;
        byte[] buf = new byte[1024];
        while ((size = bufferedInputStream.read(buf)) != -1) {
            out.write(buf, 0, size);
        }
        
    }
}



```

从jdk 源码可以看出，httpclient实现时 默认开启了keep-alive
![httpclient](/img/old/20220122143720.png)

从 wireshark 抓包数据可以看出 一共三个TCP请求 前两个未使用 keepalive，后三个开启后只使用了一次TCP连接
![keep-alive](/img/old/20220122143832.png)

验证完成后 我们来看看 jdk是如何实现 keep-alive的

大概流程是：

1. 发送请求，当请求响应的时候，如果服务端不支持keep-alive，则结束
2. 如果支持，则将请求 和 请求的地址 放到缓存中
3. 缓存会开启一个KeepAliveTimer线程，用来储存 和 回收 httpclient连接

## 源码实现

{% note info %}
keep-alive实现 由于代码过长，只截取了关键部分
{% endnote %}

### 当客户端从服务端获取返回的字节流时

```java
connection.getInputStream()
```

接着调用:arrow_down:

```java
// HttpURLConnection
public class HttpURLConnection extends java.net.HttpURLConnection 
{
    ...
    @Override
    public synchronized InputStream getInputStream() throws IOException {
        ...
            return getInputStream0();
        ...
    }
    ...
}
```

接着调用:arrow_down:

```java
// HttpURLConnection
private synchronized InputStream getInputStream0() throws IOException {
    ...
    if (keep != null && keep.toLowerCase(Locale.US).equals("keep-alive")) {
                    /* some servers, notably Apache1.1, send something like:
                     * "Keep-Alive: timeout=15, max=1" which we should respect.
                     */
                    HeaderParser p = new HeaderParser(
                            responses.findValue("Keep-Alive"));
                    if (p != null) {
                        /* default should be larger in case of proxy */
                        keepAliveConnections = p.findInt("max", usingProxy?50:5);
                        keepAliveTimeout = p.findInt("timeout", usingProxy?60:5);
                    }
    ...
}

```

是否需要保持长连接，是客户端申请，服务端决定，所以是以服务端返回的头信息为准。

### 客户端完成请求时

当客户端完成请求时，content-length为0 HttpClient会执行http.finished()方法

```java
// HttpURLConnection
private synchronized InputStream getInputStream0() throws IOException {
    ...
     try {
                    cl = Long.parseLong(responses.findValue("content-length"));
                } catch (Exception exc) { };

                if (method.equals("HEAD") || cl == 0 ||
                    respCode == HTTP_NOT_MODIFIED ||
                    respCode == HTTP_NO_CONTENT) {

                    if (pi != null) {
                        pi.finishTracking();
                        pi = null;
                    }
                    http.finished();
                    http = null;
                    inputStream = new EmptyInputStream();
                    connected = false;
                }
    ...
}

```

```java
// HttpClient
    /* return it to the cache as still usable, if:
     * 1) It's keeping alive, AND
     * 2) It still has some connections left, AND
     * 3) It hasn't had a error (PrintStream.checkError())
     * 4) It hasn't timed out
     *
     * If this client is not keepingAlive, it should have been
     * removed from the cache in the parseHeaders() method.
    */
public void finished() {
        // 一般没有reuse
        if (reuse) /* will be reused */
            return;
        keepAliveConnections--;
        poster = null;
        // 会放到缓存中
        if (keepAliveConnections > 0 && isKeepingAlive() &&
               !(serverOutput.checkError())) {
            /* This connection is keepingAlive && still valid.
             * Return it to the cache.
             */
            // 把长连接缓存起来
            putInKeepAliveCache();
        } else {
            closeServer();
        }
    }
```

## 加入 长连接 缓存中

```java
// httpClient
/* where we cache currently open, persistent connections */
protected static KeepAliveCache kac = new KeepAliveCache();

protected synchronized void putInKeepAliveCache() {
    if (inCache) {
        assert false : "Duplicate put to keep alive cache";
        return;
    }
    inCache = true;
    // 将请求的url 和 httpclient放入缓存
    kac.put(url, null, this);
}

/**
 * A class that implements a cache of idle Http connections for keep-alive
 *
 * @author Stephen R. Pietrowicz (NCSA)
 * @author Dave Brown
 */
public class KeepAliveCache
    extends HashMap<KeepAliveKey, ClientVector>
    implements Runnable {
        ...
     /* 休眠分配的超时，然后检查超时连接。谨慎起见（让连接闲置一段相对较短的时间）。
     */
    @Override
    public void run() {
        do {
            try {
                Thread.sleep(LIFETIME);
            } catch (InterruptedException e) {}
            synchronized (this) {
                /* 删除所有未使用的 HttpClients。从堆栈的底部开始（最近最少使用的第一个）。
                提醒：最好不要删除所有当前未使用的连接。一个可能在一秒钟前添加的仍然完全有
                效的，我们不必要地取消它。但目前尚不清楚如何干净地做到这一点，而且做得正确
                可能比它的价值更麻烦。
                 */

                long currentTime = System.currentTimeMillis();

                ArrayList<KeepAliveKey> keysToRemove
                    = new ArrayList<KeepAliveKey>();

                for (KeepAliveKey key : keySet()) {
                    ClientVector v = get(key);
                    synchronized (v) {
                        int i;

                        for (i = 0; i < v.size(); i++) {
                            KeepAliveEntry e = v.elementAt(i);
                            if ((currentTime - e.idleStartTime) > v.nap) {
                                HttpClient h = e.hc;
                                h.closeServer();
                            } else {
                                break;
                            }
                        }
                        v.subList(0, i).clear();

                        if (v.size() == 0) {
                            keysToRemove.add(key);
                        }
                    }
                }

                for (KeepAliveKey key : keysToRemove) {
                    removeVector(key);
                }
            }
        } while (size() > 0);

        return;
    }
            /**
     * Register this URL and HttpClient (that supports keep-alive) with the cache
     * @param url  The URL contains info about the host and port
     * @param http The HttpClient to be cached
     */
    public synchronized void put(final URL url, Object obj, HttpClient http) {
        // 会有个计时器线程 用来存储keep-alive相关http连接信息
        //  且会创建再系统线程组中
        boolean startThread = (keepAliveTimer == null);
        if (!startThread) {
            if (!keepAliveTimer.isAlive()) {
                startThread = true;
            }
        }
        ...
        // key 由协议，ip，端口，obj组成
        KeepAliveKey key = new KeepAliveKey(url, obj);
        // 看缓存中有没有相同的 可重用连接
        ClientVector v = super.get(key);

        if (v == null) {
            int keepAliveTimeout = http.getKeepAliveTimeout();
            // 为空则新建一个栈
            v = new ClientVector(keepAliveTimeout > 0?
                                 keepAliveTimeout*1000 : LIFETIME);
            v.put(http);
            super.put(key, v);
        } else {
            // 有 则 直接将连接入栈
            v.put(http);
        }
    } 
        ...
}

class ClientVector extends java.util.Stack<KeepAliveEntry> {
    ...
    // sleep time in milliseconds, before cache clear
    int nap;
    ...
}

class KeepAliveKey {
    private String      protocol = null;
    private String      host = null;
    private int         port = 0;
    private Object      obj = null; // additional key, such as socketfactory
}

class KeepAliveEntry {
    HttpClient hc;
    long idleStartTime;

    KeepAliveEntry(HttpClient hc, long idleStartTime) {
        this.hc = hc;
        this.idleStartTime = idleStartTime;
    }
}
```

keepalive 缓存结构
![cache结构](/img/old/v2-1aca135285796b9e894181d6475cebf4_720w.jpg)

## "断开"连接

```java
connection.disconnect();
```

如果时保持长连接的，实际只是关闭了一些流，socket并没有关闭。调用disconnect会自动丢弃socket连接，不会重复使用

```java
/**
    * Disconnect from the server (public API)
    */
public void disconnect() {

    responseCode = -1;
    if (pi != null) {
        pi.finishTracking();
        pi = null;
    }

    if (http != null) {
        /*
            如果我们有一个输入流，这意味着我们收到了来自服务器的响应。该流可能已被读取到 EOF，
            并且取决于流类型可能已经关闭，或者 http 客户端可能会返回到保活缓存。如果 http 客
            户端已经返回到 keep-alive 缓存，它可能会被关闭（空闲超时）或者可能被分配给另一个
            请求。另外，为了避免时间问题，我们关闭输入流，这将关闭底层连接或将客户端返回到缓
            存。如果客户端有可能被返回到缓存中（即：流是保持活动流或分块输入流），那么我们删
            除与服务器的空闲连接。请注意，这种方法可以被认为是一种近似，因为我们可以关闭与请
            求使用的空闲连接不同的空闲连接。此外，我们可能会关闭两个连接——第一个是因为它不是
             EOF（并且不能着急）——第二个是与同一服务器的另一个空闲连接。没关系，因为“断开连
             接”表示应用程序暂时不打算访问此 http 服务器。
            */

        if (inputStream != null) {
            HttpClient hc = http;

            // un-synchronized
            boolean ka = hc.isKeepingAlive();

            try {
                inputStream.close();
            } catch (IOException ioe) { }

            // 长连接可能已经关闭 或者 被放到 keep-alive cache中。
            // 如果被放到缓存中 我们需要关掉它。但它可能会被回收了。
            

            if (ka) {
                hc.closeIdleConnection();
            }


        } else {
            //不能继续重试
            http.setDoNotRetry(true);
            // 将keepalive置为false 将socket连接关闭
            http.closeServer();
        }

        //      poster = null;
        http = null;
        connected = false;
    }
    cachedInputStream = null;
    if (cachedHeaders != null) {
        cachedHeaders.reset();
    }
}
```

## 连接的复用

在创建httpclient的时候，如果开启了缓存，会先从缓存中找

```java
public static HttpClient New(URL url, Proxy p, int to, boolean useCache,
    HttpURLConnection httpuc) throws IOException
{
    if (p == null) {
        p = Proxy.NO_PROXY;
    }
    HttpClient ret = null;
    /* see if one's already around */
    if (useCache) {
        // 在这里向缓存中拿httpclient
        ret = kac.get(url, null);
        /*
         public synchronized HttpClient get(URL url, Object obj) {

            KeepAliveKey key = new KeepAliveKey(url, obj);
            ClientVector v = super.get(key);
            if (v == null) { // nothing in cache yet
                return null;
            }
            // 从栈中拿
            return v.get();
            如果栈中的httpclient过期了 会将它关闭 如果栈为空了 会直接返回null
        }
        */
        if (ret != null && httpuc != null &&
            httpuc.streaming() &&
            httpuc.getRequestMethod() == "POST") {
            if (!ret.available()) {
                ret.inCache = false;
                ret.closeServer();
                ret = null;
            }
        }

        if (ret != null) {
            if ((ret.proxy != null && ret.proxy.equals(p)) ||
                (ret.proxy == null && p == null)) {
                synchronized (ret) {
                    ret.cachedHttpClient = true;
                    assert ret.inCache;
                    ret.inCache = false;
                    if (httpuc != null && ret.needsTunneling())
                        httpuc.setTunnelState(TUNNELING);
                    logFinest("KeepAlive stream retrieved from the cache, " + ret);
                }
            } else {
                // We cannot return this connection to the cache as it's
                // KeepAliveTimeout will get reset. We simply close the connection.
                // This should be fine as it is very rare that a connection
                // to the same host will not use the same proxy.
                synchronized(ret) {
                    ret.inCache = false;
                    ret.closeServer();
                }
                ret = null;
            }
        }
    }
    if (ret == null) {
        // 如果httpclient为空 则新建
        ret = new HttpClient(url, p, to);
    } else {
        SecurityManager security = System.getSecurityManager();
        if (security != null) {
            if (ret.proxy == Proxy.NO_PROXY || ret.proxy == null) {
                security.checkConnect(InetAddress.getByName(url.getHost()).getHostAddress(), url.getPort());
            } else {
                security.checkConnect(url.getHost(), url.getPort());
            }
        }
        ret.url = url;
    }
    return ret;
}
```

## 总结

- 复用tcp的连接标准是protocol+host+port，客户端连接与服务端维持的连接数也不宜过多，HttpURLConnection默认只能存5个不同的连接，再多则直接断开连接（见上面HttpClient#finished方法），保持连接数过多对客户端和服务端都会增加不小的压力。
  
- 同时KeepAliveCache也每隔5秒钟(<code>static final int LIFETIME = 5000;</code>)扫描检测一次，清除过期的httpClient。

## 参考文献

1. [http client 实现 keep-alive 源码探究](https://zhuanlan.zhihu.com/p/95152188)
2. [java - JVisualVM 线程调查器中的 Keep-Alive-Timer 是什么意思？](https://stackoverflow.com/questions/39324302/what-does-keep-alive-timer-mean-in-jvisualvm-threads-investigator)
3. [【openjdk】jdk1.8](https://github.com/openjdk/jdk/tree/jdk8-b120)