title: win+黑苹果 时间不同步？一句代码解决问题！
date: '2021-07-20 10:22:33'
updated: '2021-07-20 10:22:33'
tags: [黑苹果, 系统]
categories: 搞机
permalink: /articles/2021/07/20/1626747753624.html
cover: https://b3logfile.com/bing/20181012.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---

以管理员方式打开power shell 或者 cmd 输入

```bash
Reg add HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation /v RealTimeIsUniversal /t REG_DWORD /d 1

```


回车 重启 即可
