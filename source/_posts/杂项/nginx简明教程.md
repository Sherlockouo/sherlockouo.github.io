---
title: nginx简明教程
sticky: false
swiper_index: 0
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-02-02 21:40:18
updated:
tags: [nginx,系统]
categories: 编程
keywords: nginx linux
description: nginx
cover: 
top_img:
---

## nginx 安装
首先,要用安装nginx

```bash
yum install nginx
```

设置开机启动
```bash
$ sudo systemctl enable nginx
```

启动服务
```bash
$ sudo systemctl start nginx
```

停止服务
```bash
$ sudo systemctl restart nginx
```

重新加载，因为一般重新配置之后，不希望重启服务，这时可以使用重新加载。
```bash
$ sudo systemctl reload nginx
```
```bash
$ sudo firewall-cmd --zone=public --permanent --add-service=http
success
$ sudo firewall-cmd --reload

$ sudo firewall-cmd --list-service
```

## 反向代理
Nginx 是一个很方便的反向代理，配置反向代理可以参考 Module ngx_http_proxy_module 。本文不做累述。

需要指出的是 CentOS 7 的 SELinux，使用反向代理需要打开网络访问权限。
```bash
$ sudo setsebool -P httpd_can_network_connect on 
```

打开网络权限之后，反向代理可以使用了。

## Nginx

## 参考文献
1. [nginx官方文档](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)
2. []()
