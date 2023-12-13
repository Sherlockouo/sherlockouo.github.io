title: JVM的serversocket如何实现 【转载】
date: '2022-01-15 22:23:51'
updated: '2022-01-15 22:23:51'
copyright: false
swiper_index: 5
tags: [网络, java, 源码, socket]
categories: [编程]
permalink: /articles/2022/01/15/1642256631048.html
cover: https://b3logfile.com/bing/20180924.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---


> 原作者：超人汪小建
> 链接：https://juejin.cn/post/6844903583708610574


## 概况

JDK 为我们提供了 ServerSocket 类作为服务端套接字的实现，通过它可以让主机监听某个端口而接收其他端的请求，处理完后还可以对请求端做出响应。它的内部真正实现是通过 SocketImpl 类来实现的，它提供了工厂模式，所以如果自己想要其他的实现也可以通过工厂模式来改变的。

## 继承结构

```
--java.lang.Object
  --java.net.ServerSocket
复制代码
```

## 相关类图

前面说到 ServerSocket 类真正的实现是通过 SocketImpl 类，于是可以看到它使用了 SocketImpl 类，但由于 windows 和 unix-like 系统有差异，而 windows 不同的版本也需要做不同的处理，所以两类系统的类不尽相同。

下图是 windows 的类图关系， SocketImpl 类实现了 SocketOptions 接口，接着还派生出了一系列的子类，其中 AbstractPlainSocketImpl 是原始套接字的实现的一些抽象，而 PlainSocketImpl 类是一个代理类，由它代理 TwoStacksPlainSocketImpl 和 DualStackPlainSocketImpl 两种不同实现。存在两种实现的原因是一个用于处理 Windows Vista 以下的版本，另一个用于处理 Windows Vista 及以上的版本。

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/3/28/16269fd143331827~tplv-t2oaga2asx-watermark.awebp)

比起 windows 的实现，unix-like 的实现则不会这么繁琐，它不存在版本的问题，所以它直接由 PlainSocketImpl 类实现，此外，可以看到两类操作系统都还存在一个 SocksSocketImpl 类，它其实主要是实现了防火墙安全会话转换协议，包括 SOCKS V4 和 V5 。

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/3/28/16269fd1434990f3~tplv-t2oaga2asx-watermark.awebp)

根据上面可以看到其实对于不同系统就是需要做差异处理，基本都是大同小异，下面涉及到套接字实现均以 Windows Vista 及以上的版本为例进行分析。

## 类定义

```
public class ServerSocket implements java.io.Closeable
复制代码
```

ServerSocket 类的声明很简单，实现了 Closeable 接口，该接口只有一个`close`方法。

## 主要属性

```
private boolean created = false;
private boolean bound = false;
private boolean closed = false;
private Object closeLock = new Object();
private SocketImpl impl;
private boolean oldImpl = false;
复制代码
```

* created 表示是否已经创建了 SocketImpl 对象，ServerSocket 需要依赖该对象实现套接字操作。
* bound 是否已绑定地址和端口。
* closed 是否已经关闭套接字。
* closeLock 关闭套接字时用的锁。
* impl 真正的套接字实现对象。
* oldImpl 是不是使用旧的实现。

## 主要方法

### 构造函数

有五类构造函数，可以什么参数都不传，也可以传入 SocketImpl、端口、backlog和地址等。主要看一下最后一个构造函数，setImpl 方法用于设置实现对象，然后检查端口大小是否正确，检查 backlog 小于0就让它等于50，最后进行端口和地址绑定操作。

```
ServerSocket(SocketImpl impl) {
        this.impl = impl;
        impl.setServerSocket(this);
    }
  
public ServerSocket() throws IOException {
        setImpl();
    }
  
public ServerSocket(int port) throws IOException {
        this(port, 50, null);
    }
  
public ServerSocket(int port, int backlog) throws IOException {
        this(port, backlog, null);
    }
  
public ServerSocket(int port, int backlog, InetAddress bindAddr) throws IOException {
        setImpl();
        if (port < 0 || port > 0xFFFF)
            throw new IllegalArgumentException(
                       "Port value out of range: " + port);
        if (backlog < 1)
          backlog = 50;
        try {
            bind(new InetSocketAddress(bindAddr, port), backlog);
        } catch(SecurityException e) {
            close();
            throw e;
        } catch(IOException e) {
            close();
            throw e;
        }
    }  
复制代码
```

### setImpl方法

设置套接字实现对象，这里提供了工厂模式可以方便的对接其他的实现，而默认是没有工厂对象的，所以模式的实现为 SocksSocketImpl 对象。

```
private void setImpl() {
        if (factory != null) {
            impl = factory.createSocketImpl();
            checkOldImpl();
        } else {
            impl = new SocksSocketImpl();
        }
        if (impl != null)
            impl.setServerSocket(this);
    }
复制代码
```

### createImpl方法

该方法用于创建套接字实现对象，如果实现对象为空则先调用`setImpl`方法设置一下，接着调用套接字实现对象的`create`方法创建套接字。

```
void createImpl() throws SocketException {
        if (impl == null)
            setImpl();
        try {
            impl.create(true);
            created = true;
        } catch (IOException e) {
            throw new SocketException(e.getMessage());
        }
    }
复制代码
```

`create`方法干了些啥？它的实现逻辑在 AbstractPlainSocketImpl 类中，这里会传入一个 boolean 类型的 stream 变量，这里其实用来标识是 udp 还是 tcp 协议，stream 即是流，tcp是基于连接的，自然存在流的抽象。而 udp 是非连接的非流的。

两类连接是通过 boolean 类型来标识的，true 为 tcp，false 为 udp，再通过 socketCreate 方法传入到本地实现中，在此之前两者都会创建 FileDescriptor 对象作为套接字的引用，FileDescriptor 为文件描述符，可以用来描述文件、套接字和资源等。另外，udp 协议时还会通过 `ResourceManager.beforeUdpCreate()`来统计虚拟机 udp 套接字数量，超过指定最大值则会抛出异常，默认值为25。最后将套接字的 created 标识设为 true，对应 Java 中抽象的客户端套接字 Socket 对象和服务端套接字 ServerSocket 对象。

```
protected synchronized void create(boolean stream) throws IOException {
        this.stream = stream;
        if (!stream) {
            ResourceManager.beforeUdpCreate();
            fd = new FileDescriptor();
            try {
                socketCreate(false);
            } catch (IOException ioe) {
                ResourceManager.afterUdpClose();
                fd = null;
                throw ioe;
            }
        } else {
            fd = new FileDescriptor();
            socketCreate(true);
        }
        if (socket != null)
            socket.setCreated();
        if (serverSocket != null)
            serverSocket.setCreated();
    }
  
复制代码
```

往下看上面调用的`socketCreate`方法的逻辑，判断文件描述符不能为空，再调用本地`socket0`方法，最后将得到的句柄关联到文件描述符对象上。

```
void socketCreate(boolean stream) throws IOException {
        if (fd == null)
            throw new SocketException("Socket closed");

        int newfd = socket0(stream, false /*v6 Only*/);

        fdAccess.set(fd, newfd);
    }
  
static native int socket0(boolean stream, boolean v6Only) throws IOException;
复制代码
```

接着看本地方法`socket0`的实现，逻辑为：

1. 通过调用`NET_Socket`函数创建套接字句柄，其中通过 Winsock 库的`socket`函数创建句柄，并且通过`SetHandleInformation`函数设置句柄的继承标志。这里可以看到根据 stream 标识对应的类别为`SOCK_STREAM`和`SOCK_DGRAM`。如果句柄是无效的则抛出 create 异常。
2. 然后通过`setsockopt`函数设置套接字的选项值，如果发生错误则抛出 create 异常。
3. 最后再次通过`SetHandleInformation`设置句柄的继承标志，返回句柄。

```
JNIEXPORT jint JNICALL Java_java_net_DualStackPlainSocketImpl_socket0
  (JNIEnv *env, jclass clazz, jboolean stream, jboolean v6Only /*unused*/) {
    int fd, rv, opt=0;

    fd = NET_Socket(AF_INET6, (stream ? SOCK_STREAM : SOCK_DGRAM), 0);
    if (fd == INVALID_SOCKET) {
        NET_ThrowNew(env, WSAGetLastError(), "create");
        return -1;
    }

    rv = setsockopt(fd, IPPROTO_IPV6, IPV6_V6ONLY, (char *) &opt, sizeof(opt));
    if (rv == SOCKET_ERROR) {
        NET_ThrowNew(env, WSAGetLastError(), "create");
    }

    SetHandleInformation((HANDLE)(UINT_PTR)fd, HANDLE_FLAG_INHERIT, FALSE);

    return fd;
}

int NET_Socket (int domain, int type, int protocol) {
    SOCKET sock;
    sock = socket (domain, type, protocol);
    if (sock != INVALID_SOCKET) {
        SetHandleInformation((HANDLE)(uintptr_t)sock, HANDLE_FLAG_INHERIT, FALSE);
    }
    return (int)sock;
}
复制代码
```

### bind方法

该方法用于将套接字绑定到指定的地址和端口上，如果 SocketAddress 为空，即代表地址和端口都不指定，此时系统会将套接字绑定到所有有效的本地地址，且动态生成一个端口。逻辑如下：

1. 判断是否已关闭，关闭则抛`SocketException("Socket is closed")`。
2. 判断是否已绑定，绑定则抛`SocketException("Already bound")`。
3. 判断地址是否为空，为空则创建一个 InetSocketAddress，默认是所有有效的本地地址，对应的为`0.0.0.0`，而端口默认为0，由操作系统动态生成。
4. 判断对象是否为 InetSocketAddress 类型，不是则抛`IllegalArgumentException("Unsupported address type")`。
5. 判断地址是否已经有值了，没有则抛`SocketException("Unresolved address")`。
6. backlog 如果小于1则设为50。
7. 通过安全管理器检查端口。
8. 通过套接字实现对象调用`bind`和`listen`方法。
9. bound 标识设为 true。

```
public void bind(SocketAddress endpoint) throws IOException {
        bind(endpoint, 50);
    }
  
public void bind(SocketAddress endpoint, int backlog) throws IOException {
        if (isClosed())
            throw new SocketException("Socket is closed");
        if (!oldImpl && isBound())
            throw new SocketException("Already bound");
        if (endpoint == null)
            endpoint = new InetSocketAddress(0);
        if (!(endpoint instanceof InetSocketAddress))
            throw new IllegalArgumentException("Unsupported address type");
        InetSocketAddress epoint = (InetSocketAddress) endpoint;
        if (epoint.isUnresolved())
            throw new SocketException("Unresolved address");
        if (backlog < 1)
          backlog = 50;
        try {
            SecurityManager security = System.getSecurityManager();
            if (security != null)
                security.checkListen(epoint.getPort());
            getImpl().bind(epoint.getAddress(), epoint.getPort());
            getImpl().listen(backlog);
            bound = true;
        } catch(SecurityException e) {
            bound = false;
            throw e;
        } catch(IOException e) {
            bound = false;
            throw e;
        }
    }
复制代码
```

套接字实现对象的`bind`方法会间接调用`socketBind`方法，逻辑如下：

1. 获取本地文件描述符 nativefd。
2. 判断地址是否为空。
3. 调用`bind0`本地方法。
4. 如果端口为0还会调用`localPort0`本地方法获取本地端口赋值给套接字实现对象的 localport 属性上，目的是获取操作系统动态生成的端口。

```
void socketBind(InetAddress address, int port) throws IOException {
        int nativefd = checkAndReturnNativeFD();

        if (address == null)
            throw new NullPointerException("inet address argument is null.");

        bind0(nativefd, address, port, exclusiveBind);
        if (port == 0) {
            localport = localPort0(nativefd);
        } else {
            localport = port;
        }

        this.address = address;
    }
static native void bind0(int fd, InetAddress localAddress, int localport, boolean exclBind)
                           
static native int localPort0(int fd) throws IOException;
复制代码
```

`bind0`本地方法逻辑如下，

1. 通过`NET_InetAddressToSockaddr`函数将 Java 层的 InetAddress 对象的属性值填充到 SOCKETADDRESS 联合体中，对应的都是 Winsock 库的结构体，目的即是为了填充好它们。

```
typedef union {
    struct sockaddr     sa;
    struct sockaddr_in  sa4;
    struct sockaddr_in6 sa6;
} SOCKETADDRESS;
复制代码
```

2. `NET_WinBind`函数的逻辑是先根据 exclBind 标识看是否需要独占端口，如果需要则通过 Winsock 库的`setsockopt`函数设置`SO_EXCLUSIVEADDRUSE`选型，在 Java 层中决定独不独占端口可以通过`sun.net.useExclusiveBind`参数来配置，默认情况下是独占的。接着，通过操作系统的`bind`函数完成绑定操作。
3. 如果绑定失败则抛异常。

```
JNIEXPORT void JNICALL Java_java_net_DualStackPlainSocketImpl_bind0
  (JNIEnv *env, jclass clazz, jint fd, jobject iaObj, jint port,
   jboolean exclBind)
{
    SOCKETADDRESS sa;
    int rv, sa_len = 0;

    if (NET_InetAddressToSockaddr(env, iaObj, port, &sa,
                                  &sa_len, JNI_TRUE) != 0) {
      return;
    }

    rv = NET_WinBind(fd, &sa, sa_len, exclBind);

    if (rv == SOCKET_ERROR)
        NET_ThrowNew(env, WSAGetLastError(), "NET_Bind");
}
复制代码
```

`localPort0`本地方法的实现主要是先通过 Winsock 库的`getsockname`函数获取套接字地址，然后通过`ntohs`函数将网络字节转成主机字节并转为 int 型。

```
JNIEXPORT jint JNICALL Java_java_net_DualStackPlainSocketImpl_localPort0
  (JNIEnv *env, jclass clazz, jint fd) {
    SOCKETADDRESS sa;
    int len = sizeof(sa);

    if (getsockname(fd, &sa.sa, &len) == SOCKET_ERROR) {
        if (WSAGetLastError() == WSAENOTSOCK) {
            JNU_ThrowByName(env, JNU_JAVANETPKG "SocketException",
                    "Socket closed");
        } else {
            NET_ThrowNew(env, WSAGetLastError(), "getsockname failed");
        }
        return -1;
    }
    return (int) ntohs((u_short)GET_PORT(&sa));
}
复制代码
```

套接字实现对象的`listen`方法会间接调用`socketListen`方法，逻辑比较简单，获取本地的文件描述符然后调用`listen0`本地方法。可以看到本地方法很简单，仅仅是调用了 Winsock 库的`listen`函数来完成监听操作。

```
void socketListen(int backlog) throws IOException {
        int nativefd = checkAndReturnNativeFD();

        listen0(nativefd, backlog);
    }
  
static native void listen0(int fd, int backlog) throws IOException;

JNIEXPORT void JNICALL Java_java_net_DualStackPlainSocketImpl_listen0
  (JNIEnv *env, jclass clazz, jint fd, jint backlog) {
    if (listen(fd, backlog) == SOCKET_ERROR) {
        NET_ThrowNew(env, WSAGetLastError(), "listen failed");
    }
}
复制代码
```

### accept方法

该方法用于接收套接字连接，套接字开启监听后会阻塞等待套接字连接，一旦有连接可接收了则通过该方法进行接收操作。逻辑为，

1. 判断套接字是否已经关闭。
2. 判断套接字是否已经绑定。
3. 创建 Socket 对象，并调用`implAccept`方法，
4. 返回 Socket 对象。

```
public Socket accept() throws IOException {
        if (isClosed())
            throw new SocketException("Socket is closed");
        if (!isBound())
            throw new SocketException("Socket is not bound yet");
        Socket s = new Socket((SocketImpl) null);
        implAccept(s);
        return s;
    }

复制代码
```

`implAccept`方法逻辑为，

1. 传入的 Socket 对象里面的套接字实现如果为空，则通过`setImpl`方法设置套接字实现，如果非空就执行`reset`操作。
2. 调用套接字实现对象的`accept`方法完成接收操作，做这一步是因为我们的 Socket 对象里面的 SocketImpl 对象还差操作系统底层的套接字对应的文件描述符。
3. 调用安全管理器检查权限。
4. 得到完整的 SocketImpl 对象，赋值给 Socket 对象，并且调用`postAccept`方法将 Socket 对象设置为已创建、已连接、已绑定。

```
protected final void implAccept(Socket s) throws IOException {
        SocketImpl si = null;
        try {
            if (s.impl == null)
              s.setImpl();
            else {
                s.impl.reset();
            }
            si = s.impl;
            s.impl = null;
            si.address = new InetAddress();
            si.fd = new FileDescriptor();
            getImpl().accept(si);

            SecurityManager security = System.getSecurityManager();
            if (security != null) {
                security.checkAccept(si.getInetAddress().getHostAddress(),
                                     si.getPort());
            }
        } catch (IOException e) {
            if (si != null)
                si.reset();
            s.impl = si;
            throw e;
        } catch (SecurityException e) {
            if (si != null)
                si.reset();
            s.impl = si;
            throw e;
        }
        s.impl = si;
        s.postAccept();
    }
复制代码
```

套接字实现对象的`accept`方法主要调用如下的`socketAccept`方法，逻辑为，

1. 获取操作系统的文件描述符。
2. SocketImpl 对象为空则抛出`NullPointerException("socket is null")`。
3. 如果 timeout 小于等于0则直接调用本地`accept0`方法，一直阻塞。
4. 反之，如果 timeout 大于0，即设置了超时，那么会先调用`configureBlocking`本地方法，该方法用于将指定套接字设置为非阻塞模式。接着调用`waitForNewConnection`本地方法，如果在超时时间内能获取到新的套接字，则调用`accept0`方法获取新套接字的句柄，获取成功后再次调用`configureBlocking`本地方法将新套接字设置为阻塞模式。最后，如果非阻塞模式失败了，则将原来的套接字设置会紫塞模式，这里使用了 finally，所以能保证就算发生异常也能被执行。
5. 最后将获取到的新文件描述符赋给 SocketImpl 对象，同时也将远程端口、远程地址、本地端口等都赋给它相关变量。

```
void socketAccept(SocketImpl s) throws IOException {
        int nativefd = checkAndReturnNativeFD();
        if (s == null)
            throw new NullPointerException("socket is null");
        int newfd = -1;
        InetSocketAddress[] isaa = new InetSocketAddress[1];
        if (timeout <= 0) {
            newfd = accept0(nativefd, isaa);
        } else {
            configureBlocking(nativefd, false);
            try {
                waitForNewConnection(nativefd, timeout);
                newfd = accept0(nativefd, isaa);
                if (newfd != -1) {
                    configureBlocking(newfd, true);
                }
            } finally {
                configureBlocking(nativefd, true);
            }
        }
        fdAccess.set(s.fd, newfd);
        InetSocketAddress isa = isaa[0];
        s.port = isa.getPort();
        s.address = isa.getAddress();
        s.localport = localport;
    }
复制代码
```

`configureBlocking`本地方法逻辑很简单，如下，核心就是通过调用 Winsock 库的`ioctlsocket`函数来设置套接字为阻塞还是非阻塞，根据 blocking 标识。

```
JNIEXPORT void JNICALL Java_java_net_DualStackPlainSocketImpl_configureBlocking
  (JNIEnv *env, jclass clazz, jint fd, jboolean blocking) {
    u_long arg;
    int result;

    if (blocking == JNI_TRUE) {
        arg = SET_BLOCKING;    // 0
    } else {
        arg = SET_NONBLOCKING;   // 1
    }

    result = ioctlsocket(fd, FIONBIO, &arg);
    if (result == SOCKET_ERROR) {
        NET_ThrowNew(env, WSAGetLastError(), "configureBlocking");
    }
}
复制代码
```

`waitForNewConnection`本地方法逻辑如下，核心是通过 Winsock 库的`select`函数来实现超时的功能，它会等待 timeout 时间看指定的文件描述符是否有活动，超时了的话则会返回0，此时向 Java 层抛出 SocketTimeoutException 异常。而如果返回了-1则表示套接字已经关闭了，抛出 SocketException 异常。如果返回-2则抛出 InterruptedIOException。

```
JNIEXPORT void JNICALL Java_java_net_DualStackPlainSocketImpl_waitForNewConnection
  (JNIEnv *env, jclass clazz, jint fd, jint timeout) {
    int rv;

    rv = NET_Timeout(fd, timeout);
    if (rv == 0) {
        JNU_ThrowByName(env, JNU_JAVANETPKG "SocketTimeoutException",
                        "Accept timed out");
    } else if (rv == -1) {
        JNU_ThrowByName(env, JNU_JAVANETPKG "SocketException", "socket closed");
    } else if (rv == -2) {
        JNU_ThrowByName(env, JNU_JAVAIOPKG "InterruptedIOException",
                        "operation interrupted");
    }
}

JNIEXPORT int JNICALL
NET_Timeout(int fd, long timeout) {
    int ret;
    fd_set tbl;
    struct timeval t;
    t.tv_sec = timeout / 1000;
    t.tv_usec = (timeout % 1000) * 1000;
    FD_ZERO(&tbl);
    FD_SET(fd, &tbl);
    ret = select (fd + 1, &tbl, 0, 0, &t);
    return ret;
}
复制代码
```

`accept0`本地方法实现逻辑为，

1. 通过C语言的`memset`函数将 SOCKETADDRESS 联合体对应的结构体内的值设置为0。
2. 通过 Winsock 库的`accept`函数获取套接字地址。
3. 判断接收的套接字描述符是否无效，分别可能抛 InterruptedIOException 或 SocketException 异常。
4. 通过`SetHandleInformation`函数设置句柄的继承标志。
5. `NET_SockaddrToInetAddress`函数用于将得到的套接字转换成 Java 层的 InetAddress 对象。
6. 将生成的 InetAddress 对象用于生成 Java 层的 InetSocketAddress 对象。
7. 赋值给 Java 层的 InetSocketAddress 数组对象。
8. 返回新接收的套接字的文件描述符。

```
JNIEXPORT jint JNICALL Java_java_net_DualStackPlainSocketImpl_accept0
  (JNIEnv *env, jclass clazz, jint fd, jobjectArray isaa) {
    int newfd, port=0;
    jobject isa;
    jobject ia;
    SOCKETADDRESS sa;
    int len = sizeof(sa);

    memset((char *)&sa, 0, len);
    newfd = accept(fd, &sa.sa, &len);

    if (newfd == INVALID_SOCKET) {
        if (WSAGetLastError() == -2) {
            JNU_ThrowByName(env, JNU_JAVAIOPKG "InterruptedIOException",
                            "operation interrupted");
        } else {
            JNU_ThrowByName(env, JNU_JAVANETPKG "SocketException",
                            "socket closed");
        }
        return -1;
    }

    SetHandleInformation((HANDLE)(UINT_PTR)newfd, HANDLE_FLAG_INHERIT, 0);

    ia = NET_SockaddrToInetAddress(env, &sa, &port);
    isa = (*env)->NewObject(env, isa_class, isa_ctorID, ia, port);
    (*env)->SetObjectArrayElement(env, isaa, 0, isa);

    return newfd;
}
```
