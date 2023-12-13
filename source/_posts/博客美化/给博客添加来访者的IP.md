---
title: 给博客添加来访者的IP
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
tags: [博客美化,butterfly]
categories: 编程
keywords: 博客美化
description: 给博客添加来访者IP
cover: https://gitee.com/coder-wdf/picgo/raw/master/img/20220302105051.png
top_img: 
---

先看效果

![效果](https://gitee.com/coder-wdf/picgo/raw/master/img/20220302105051.png)

现在有很多获得IP的API

我用的是[搜狐的](https://pv.sohu.com/cityjson)

```URL
https://pv.sohu.com/cityjson
```

由于我的前端技术很菜所以，我直接把代码放在了配置文件中 放公告的地方
<code>..._config.butterfly.yml</code>

```js
    card_announcement:
        enable: true
        content: <div id="ip"></div><div id="cname"></div> Respect doesn't come natrually! <script type="text/javascript" src="https://pv.sohu.com/cityjson?ie=utf-8"></script><script> var parent1 = document.getElementById('ip'); var child1 = document.createElement("span");child1.textContent = "您的ip是 "+returnCitySN.cip;parent1.append(child1);var parent = document.getElementById('cname');var child = document.createElement("span");child.textContent ="您的地址是 "+returnCitySN.cname;parent.append(child);</script>    
```

如果给了你一些启发，还可以赞助我哟~~
