+++
title = 'Langchain'
date = 2025-01-14T16:34:49+08:00
draft = true
tags = []
categories = []
+++

接口文档

```txt
搜索
说明 : 调用此接口 , 传入搜索关键词可以搜索该音乐 / 专辑 / 歌手 / 歌单 / 用户 , 关键词可以多个 , 以空格隔开 , 如 " 周杰伦 搁浅 "( 不需要登录 ), 可通过 /song/url 接口传入歌曲 id 获取具体的播放链接

必选参数 : keywords : 关键词

可选参数 : limit : 返回数量 , 默认为 30 offset : 偏移数量，用于分页 , 如 : 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

type: 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合, 2000:声音(搜索声音返回字段格式会不一样)

接口地址 : /search 或者 /cloudsearch(更全)

调用例子 : /search?keywords=海阔天空 /cloudsearch?keywords=海阔天空
```

response like below

```json
{
  "result": {
    "searchQcReminder": null,
    "songs": [
      {
        "name": "晴天(深情版)",
        "id": 2652820720,
        "pst": 0,
        "t": 0,
        "ar": [
          {
            "id": 96154669,
            "name": "Lucky小爱",
            "tns": [],
            "alias": []
          }
        ],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": "",
        "fee": 8,
        "v": 5,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 255723258,
          "name": "晴天(深情版)",
          "picUrl": "http://p2.music.126.net/-79-XFhWolhMzGESC8ifkg==/109951170218252280.jpg",
          "tns": [],
          "pic_str": "109951170218252280",
          "pic": 109951170218252290
        },
        "dt": 278961,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 11161644,
          "vd": -26091,
          "sr": 44100
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 6697004,
          "vd": -23586,
          "sr": 44100
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 4464684,
          "vd": -22058,
          "sr": 44100
        },
        "sq": {
          "br": 1607018,
          "fid": 0,
          "size": 56037067,
          "vd": -26220,
          "sr": 44100
        },
        "hr": null,
        "a": null,
        "cd": "01",
        "no": 1,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 1,
        "s_id": 0,
        "mark": 17179877376,
        "originCoverType": 2,
        "originSongSimpleData": {
          "songId": 186016,
          "name": "晴天",
          "artists": [
            {
              "id": 6452,
              "name": "周杰伦"
            }
          ],
          "albumMeta": {
            "id": 18905,
            "name": "叶惠美"
          }
        },
        "tagPicList": null,
        "resourceState": true,
        "version": 5,
        "songJumpInfo": null,
        "entertainmentTags": null,
        "single": 0,
        "noCopyrightRcmd": null,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 1416729,
        "mv": 0,
        "publishTime": 1733068800000,
        "privilege": {
          "id": 2652820720,
          "fee": 8,
          "payed": 0,
          "st": 0,
          "pl": 320000,
          "dl": 0,
          "sp": 7,
          "cp": 1,
          "subp": 1,
          "cs": false,
          "maxbr": 999000,
          "fl": 320000,
          "toast": false,
          "flag": 2064644,
          "preSell": false,
          "playMaxbr": 999000,
          "downloadMaxbr": 999000,
          "maxBrLevel": "sky",
          "playMaxBrLevel": "sky",
          "downloadMaxBrLevel": "sky",
          "plLevel": "exhigh",
          "dlLevel": "none",
          "flLevel": "exhigh",
          "rscl": null,
          "freeTrialPrivilege": {
            "resConsumable": false,
            "userConsumable": false,
            "listenType": null,
            "cannotListenReason": null
          },
          "rightSource": 0,
          "chargeInfoList": [
            {
              "rate": 128000,
              "chargeUrl": null,
              "chargeMessage": null,
              "chargeType": 0
            },
            {
              "rate": 192000,
              "chargeUrl": null,
              "chargeMessage": null,
              "chargeType": 0
            },
            {
              "rate": 320000,
              "chargeUrl": null,
              "chargeMessage": null,
              "chargeType": 0
            },
            {
              "rate": 999000,
              "chargeUrl": null,
              "chargeMessage": null,
              "chargeType": 1
            }
          ]
        }
      }
    ],
    "songCount": 300
  },
  "code": 200
}
```

爬取接口

```bash
# Download a song
npx netease-music-downloader download 426832090

# Download an album
npx netease-music-downloader album 34836039

```
