---
title: 解决 jenkins 无法克隆私有仓库问题
sticky: false
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2024-01-08 21:39:00
updated: 2024-01-08 21:39:00
tags: [学习,Issue,编程,jenkins]
categories: 编程
keywords: jenkins
description:
cover: /img/funny-stuff/jenkins.png
top_img: /img/funny-stuff/jenkins.png
---

## 最近在捣鼓 CICD 
{% note success flat %}
安装好 jenkins 后出现了一个问题，无法访问  github 的私有仓库。查了很多博客都没解决问题，但也没有放弃，最终在 StackOverflow 上找到一篇能够解决问题的文章。
{% endnote %}
### 方法一

1. **进入 http://host:port/manage/configureSecurity/**
2. **滑动到页面底部，修改为下图所示即可**
![how-to-solve](/img/issues/solve-jenkins-with-private-repo.png)

### 方法二
**使用 [jenkins plugin](https://plugins.jenkins.io/git-client/#plugin-content-ssh-host-key-verification) 中提供的方法进行修改**

## Reference
1. [StackOverflow](https://stackoverflow.com/questions/15174194/jenkins-host-key-verification-failed)
2. [Jenkins Plugin](https://plugins.jenkins.io/git-client/#plugin-content-ssh-host-key-verification)