title: Android 跳过开机引导
date: '2021-10-01 19:40:55'
updated: '2021-10-01 19:40:55'
tags: [刷机, android]
categories: 折腾
permalink: /articles/2021/10/01/1633088454724.html
cover: https://b3logfile.com/bing/20190410.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---

1. Reboot device into recovery
2. Connect device with adb
   *Note*

   * *You may restart adb as root in case of permission deny*
   * *remeber to mount system partition*
3. Add a line at the end of /system/build.prop:

   ```text
   ro.setupwizard.mode=DISABLED
   ```
   an example to archive this:

   ```sh
   adb pull /system/build.prop .
   echo 'ro.setupwizard.mode=DISABLED' >> build.prop
   adb push build.prop /system
   ```
4. adb disconnect, reboot to system
