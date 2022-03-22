title: ubuntu 安装mysql
date: '2022-01-08 14:44:25'
updated: '2022-01-08 14:44:39'
tags: [MYSQL, linux, 数据库]
categories: 编程
permalink: /articles/2022/01/08/1641624265499.html
cover: https://b3logfile.com/bing/20200605.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---

# 一、相关工具

* navicat15-premium-cs.AppImage：Navicat 15 Premium 官方简体中文试用版；
* navicat-patcher：补丁；
* navicat-keygen ：注册机；
* appimagetool-x86_64.AppImage：Linux 独立运行软件打包工具；

下载链接：[https://pan.baidu.com/s/1ez9Kot9vGCNKgin0N7eEpA](https://pan.baidu.com/s/1ez9Kot9vGCNKgin0N7eEpA) 密码: `s4i9`；

# 二、系统环境配置

1、安装 capstone：

```bash
sudo apt-get install libcapstone-dev
```

2、安装 keystone：

```bash
sudo apt-get install cmake
git clone https://github.com/keystone-engine/keystone.git
cd keystone
mkdir build
cd build
../make-share.sh
sudo make install
sudo ldconfig
```

3、安装 rapidjson：

```bash
sudo apt-get install rapidjson-dev
```

# 三、操作步骤

1、赋予执行权限：

```bash
chmod +x appimagetool-x86_64.AppImage
chmod +x navicat-patcher
chmod +x navicat-keygen
```

2、解压官方软件：

```bash
mkdir navicat15
mount -o loop navicat15-premium-cs.AppImage navicat15
cp -r navicat15 navicat15-patched
```

3、运行补丁：

```bash
./navicat-patcher navicat15-patched
```

4、打包成可独立运行的软件：

```bash
./appimagetool-x86_64.AppImage navicat15-patched navicat15-premium-cs-pathed.AppImage
```

5、运行打补丁后的软件包：

```bash
chmod +x navicat15-premium-cs-pathed.AppImage
./navicat15-premium-cs-pathed.AppImage
```

6、运行注册机，选择对应的项：

```bash
navicat-keygen --text ./RegPrivateKey.pem 
```

7、断网后填入生成的注册码，超时后选择手动激活，输入请求码，两次回车生成激活码，填入后即可激活成功。
