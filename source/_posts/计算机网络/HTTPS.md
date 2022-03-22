---
title: HTTP协议
sticky: false
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-01-17 09:36:59
updated:
tags: [计算机网络,HTTPS]
categories: 编程
keywords: 
description: 计网
cover: /img/beautifyblog-cover.jpg
top_img:

---

##### Q: 为什么需要证书？

A: 防止“中间人”攻击，确定会话双方的身份

##### Q: 使用 HTTPS还会被抓包吗？

A: 可以被抓包，只不过抓包后看不到明文，无法篡改

##### Q: HTTPS的加密过程是怎么样的？

A: 客户端向服务端索要并验证其**公钥**，用公钥对TLS握手过程中产生的随机数进行加密生成**会话密钥**，双方采用会话密钥进行**加密通信**。

##### Q: HTTPS 握手过程中，客户端如何验证证书的合法性

A: 数字证书包括序列号、用途、颁发者、有效时间、公钥，如果只是简单的将这些信息发送给浏览器，中间人可以很轻易的将公钥改成自己的公钥，解决办法就是使用数字签名。将证书的信息生成摘要，将摘要用CA的私钥进行加密，生成数字签名。服务器将数字证书和数字签名一同发送给浏览器，因为有数字签名，所以数字证书无法被中间人修改（修改后的话会导致摘要变了，数字签名实现了**不可否认**）。浏览器拿到数字证书，根据“**证书链**”去验证其可信度。

##### Q: 介绍下 HTTPS 中间人攻击

A: 在传输过程中截获篡改数据。CA证书可以解决中间人攻击的问题

