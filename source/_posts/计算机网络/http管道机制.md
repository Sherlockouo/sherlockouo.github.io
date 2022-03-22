---
title: http管道机制
sticky: false
swiper_index: 0
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-01-22 16:50:57
updated:
tags: [管道,网络,http,对比]
categories: 编程
keywords: 管道
description: http管道机制
cover: https://gitee.com/coder-wdf/picgo/raw/master/img/1642643817542034913.jpg
top_img:
---

## 管道化解决了什么问题？

http1.0 只能采用”停-等协议“来进行通信，即发送请求，等待回应，再发送请求，等待回应...而且每次只能发送一个请求。
可以想象 当时网络的效率可谓是非常低。
主要表现在一下几个方面：

1. 每次连接都会新创建一个TCP连接
2. 每次只能发送一个http请求
3. 请求方法只有 GET POST HEAD

![diff](https://gitee.com/coder-wdf/picgo/raw/master/img/pipeline.jpg)

所以不久后 就提出了 HTTP1.1 协议
HTTP1.1 主要新增了:

1. 持久连接
    解决了每次连接都需要重新建立TCP连接的问题，减少了建立和关闭TCP连接所带来的延迟消耗，提高了效率
2. 管道化持久连接
    持久连接 仍然只能一次发送一个请求，所以提出了管道化机制。管道化，多个请求可以向流水一样 从发送端 流向 接收端，一次可以发送多个请求。解决了HTTP1.0 一次只能发送一个请求的的问题，提高了网络的性能。


HTTP/1.1 中，多个 HTTP 请求不用排队发送，可以批量发送，这就解决了 HTTP 队头阻塞问题。但批量发送的 HTTP 请求，必须按照发送的顺序返回响应. 但并未解决顺序响应的问题


## 参考文献

1. [HTTP详解长短连接，管道化，队头阻塞及它们之间的关系](https://blog.csdn.net/fesfsefgs/article/details/108294050)
2. [HTTP持续连接和管道化连接](https://segmentfault.com/a/1190000040172561)
3. [HTTP1.1 的管线化和 H2 的多路复用的区别](https://mrgaogang.github.io/javascript/base/HTTP1.X%E7%9A%84%E7%AE%A1%E7%BA%BF%E5%8C%96h2%E7%9A%84%E5%A4%9A%E8%B7%AF%E5%A4%8D%E7%94%A8%E4%BB%A5%E5%8F%8ATCP%E5%AF%B9%E5%A4%B4%E9%98%BB%E5%A1%9E.html)