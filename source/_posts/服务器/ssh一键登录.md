---
title: linux服务器一健登录
sticky: false
swiper_index: 0
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-03-02 10:47:50
updated:
tags: [linux,服务器]
categories: 编程
keywords: linux服务器一健登录
description: ssh一键登录
cover: /img/old/20220302105051.png
top_img: 
---

## 第一步 生成密钥 <code>已经生成过密钥的可以跳过</code>

```bash
# 生成密钥 默认会放到 ~/.ssh/id_rsa.pub  id_rsa
# 如果改变了生成位置 下面对应也要改
ssh-keygen 
```

## 第二步 将密钥发送到服务器 并导入到服务器的授权文件中

```bash
# 上传到服务器 本地 到 服务器
scp ~/.ssh/id_rsa.pug root@xxx.xxx.xxx.xx:~/.ssh/
# 导入授权文件
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```
## 第三部 配置完成
```bash
ssh root@ip
# 啥也不输就能直接登录 nice!
```

## 附加步骤 强烈推荐 极度舒适
每次输入ip是不是很麻烦,所以有一个更便捷的方法,给服务器取别名

```bash
Host name
user root
hostname ip
port 22
IdentityFile ~/.ssh/id_rsa # 私钥地址
```

## 参考文献
1. [ssh配置免密登录](https://segmentfault.com/a/1190000021000360)