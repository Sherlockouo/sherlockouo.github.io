---
title: 故事要从输入URL开始讲起
date: '2021-10-31 15:47:21'
updated: '2021-10-31 20:27:11'
tags: [计算机网络, 面试]
categories: 计算机网络
permalink: /articles/2021/10/31/1635666441418.html
cover: https://b3logfile.com/bing/20180707.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---

## 这一切都发生在，你输入网址地址后

1. 首先浏览器进行DNS解析，进行域名解析，以获得目标的ip地址
   ![5373D1999D784CAB9F721A0B53401E5C.jpeg](https://b3logfile.com/file/2021/10/5373D199-9D78-4CAB-9F72-1A0B53401E5C-0a2c8ceb.jpeg)
   
   1. 怎么获取ip地址呢？
      
      1. 首先浏览器查看本地dns cache中有没有该域名的 ip缓存
      2. 然后进到本地 hosts文件查看有无域名缓存
      3. 如果仍然没有，那就DNS服务器发送域名解析请求，以得到域名的ip地址
         
         1. 请求时通过UDP的协议发送
         2. 方式有两种
            1. 递归
            2. 迭代
         3. 最终返回目标的ip，如果没有就返回dns解析失败
         
         DNS 是一个类似于树形的结构 访问特定的域名 就需要从根节点到不同的叶子。
         
         | .      | com/cn/net...  | bilibili/qq/baidu |
| -------- | ---------------- | ------------------- |
| 根域名 | 顶级域名服务器 | 权威域名服务器    |
         
         
      4. [思否：DNS报文结构](https://segmentfault.com/a/1190000009369381)
   2. 进行TCP连接
      ![F06E291F85F54549BF01DDE0683971E9.jpeg](https://b3logfile.com/file/2021/10/F06E291F-85F5-4549-BF01-DDE0683971E9-238d8d58.jpeg)
      
      1. syn
      2. syn/ack
      3. ack
      4. ssl 握手[bilibili video](https://b23.tv/AT2ain) [cloud flare-TLS](https://www.cloudflare.com/zh-cn/learning/ssl/what-happens-in-a-tls-handshake/)
         1. 客户端发送hello 包括TLS版本，支持的加密算法，支持的数据压缩算法![96A57FF09827471D8EFB0C9A8525FE4C.jpeg](https://b3logfile.com/file/2021/10/96A57FF0-9827-471D-8EFB-0C9A8525FE4C-29b91ead.jpeg)
         2. 然后服务端helloback，包含使用的加密算法，sessionID，服务器数字证书，服务器公钥![79FBE7FBC51140A1AAEE49A0586C5B5D.jpeg](https://b3logfile.com/file/2021/10/79FBE7FB-C511-40A1-AAEE-49A0586C5B5D-6745058b.jpeg)
         3. 客户端验证服务端发送的数字证书![525B81ED222E4CDFB432D99C083A0466.jpeg](https://b3logfile.com/file/2021/10/525B81ED-222E-4CDF-B432-D99C083A0466-5f945eef.jpeg)
         4. 验证通过后客户端发送用服务器公钥加密的客户端的key![097486ED9D4F42428C6A66144A85E124.jpeg](https://b3logfile.com/file/2021/10/097486ED-9D4F-4242-8C6A-66144A85E124-6cad852d.jpeg)
         5. 客户端发送ssl握手结束![783D2F8016F34FAAA9002E5D15EDB05B.jpeg](https://b3logfile.com/file/2021/10/783D2F80-16F3-4FAA-A900-2E5D15EDB05B-5e11b975.jpeg)
         6. 服务端发送ssl握手结束![8E395A5A1FAD4BBFA06A9FD330354AD9.jpeg](https://b3logfile.com/file/2021/10/8E395A5A-1FAD-4BBF-A06A-9FD330354AD9-9fbb58fe.jpeg)
   3. 建立连接后 发送https请求
      
      1. 这里就是TCP大展身手的时候，什么可靠保证，拥塞避免，慢开始，快速重传...
      2. 【to-be continued】
      3. 
   4. 这之中进行的各种路由算法
      
      1. RIP
      2. OSPF
      3. BGP
   5. 如何找到服务器的对应端口
      
      1. socket
   6. 返回数据
      
      1. 常见的各种网络请求
   7. 4次挥手
      ![531EA598601A4686B4477C8342CE138D.jpeg](https://b3logfile.com/file/2021/10/531EA598-601A-4686-B447-7C8342CE138D-e5eb2a14.jpeg)

