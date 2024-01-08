---
title: CMU-15445-Buffer-Pool-Summary-lab1
sticky: false
swiper_index: 1
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-01-31 13:32:22
updated:
tags: [CMU,数据库,BufferPool]
categories: 编程
keywords: 手写数据库
description:
cover: /img/old/%E9%9B%86%E5%8E%9F%E7%BE%8E%E8%B5%9B%E5%8D%9A%E6%9C%8B%E5%85%8B%E9%A3%8E%E6%A0%BC%E5%A5%87%E5%B9%BB%E5%B0%91%E5%A5%B3.jpg
top_img:
---



# 数据库缓冲池
> 从磁盘读取表 和 数据的时候,数据库管理器分配的用于高速缓存这些表或索引数据的主存储区域.每个数据库都必须有一个缓冲池 [ref](https://www.ibm.com/docs/zh/db2/10.5?topic=databases-buffer-pools).

## 缓冲池的使用方法
首次访问表中的数据行时,数据库管理器会将包含该数据的页放入缓冲池中.这些页将一直保留在缓冲池中,直到关闭数据库或者其他页需要使用某一页所占用的空间为止.

缓冲池中的页 可能正在使用, 也可能没有被使用,他们可能是脏页,也可能时干净页:
-  正在使用的页就是当前正在读取或更新的页.为了保持数据一致性,数据库管理器只允许一次只有一个代理程序更新缓冲池中的给定页.如果正在更新某页,那么它正在和另一个代理程序互斥访问.如果正在读取该页,那么多个代理程序可以同时读取该页.
-  脏页包含已更改但尚未写入磁盘的数据
-  将一个已更改的页写入磁盘后,他就是一个干净的页,并且仍然可能保留在缓冲池中.

## 缓冲池管理
> 缓冲池为数据库页提供工作内存和高速缓存

由于大多数数据处理发生在缓冲池内,因此配置缓冲池是最为重要的调整环节.

当应用程序访问表行时，数据库管理器将在缓冲池中查找包含该行的页。如果在缓冲池中找不到该页，那么数据库管理器将从磁盘中读取该页并将其放入缓冲池。然后，可以使用该数据来处理查询。

提高数据库性能的做法:
- 为了提高数据库的并发性 可以为一个数据库使用多个缓冲池.
- 预测应用程序可能会访问的页,预先从磁盘加载到缓冲池
- 通过 主动页清除 来将脏页清楚掉

当缓冲池满了 或者 上层触发了淘汰策略,使用LRU 或者 Clock 淘汰策略来 淘汰页面.

### 常用淘汰策略
1. LRU
   最先淘汰 最久没有被使用过的
2. LRU-K
   为最近K次引用热门数据库页的时间,利用这些信息来估计每页引用的到达时间.
3. Clock
    与LRU比较相似,执行的是Clock替换策略,Victim最后一个,Unpin添加到开头.

## 需要实现的函数
![func](/img/old/bp_func.png)

**先介绍一下一些属性**:
1. page_table_： 表示 page页 和  frame 页的映射
2. pages_：表示每个frameid对应的数据
3. replacer_：淘汰策略，这有两个实现，一个是clock 一个是lru
4. free_list_：存放free的page
5. latch_：相当于lock，是一个互斥锁

**再介绍一下函数**
- FlushPgImp(page_id_t page_id)
  > 将一个页面刷新到磁盘
  
  首先从page表中找到这个page

  ```c++
  /** Page table for keeping track of buffer pool pages. */
  std::unordered_map<page_id_t, frame_id_t> page_table_;

   
    如果存在，得到frame帧
    1. 判断帧是否有脏数据
    2. 如果有，则调用WraitePage将其写入磁盘
    3. 写入后将dirty标志置为false
  
  ```
 
- FlushAllPgsImp()
  > 将所有的page都刷如磁盘 将page表中的所有页都写入磁盘

  这个实现就很简单了 遍历pagetable 然后调用上面的FlushPgImp即可
  ~~暂时不知道这个是再什么时候调用。~~

- NewPgImp(page_id_t *page_id)
  > 新创建一个page，创建对应 page->frame的映射
  
  ```C++
   
   这是一个需要同步的操作 需要锁一下 
   to-do 比较各个加锁方式可效率。
   lock_guard，scoped_lock，latch_.lock
   1. 首先我们需要做的就是 找到一个空的frame 分配给pageid
      1.1 先从空闲列表中查找，找到则返回
      1.2 再重replacer中找，找到则返回
      1.3 如果都没有就返回null， 表示没有空的frame
   2. 找到空的frame后
      2.1 修改该frame的属性，pin_count_ 和 page_id_
      2.2 回收一个pageid，通过调用AllocatePage得到 pageid
      2.3 修改pageid -> frameid 的映射
   3. 将pages存的frame的数据清空，得到以全新的page
   4. 返回新的page
  
  ```
- FetchPgImp(page_id_t page_id)
  > 通过一个pageid 读取一个page的数据
  ```C++
  
  先从pagetable找 
    如果得到frameid
    将对应的frame数据修改
      1. 将他的frameid 用replacer pin掉
      2. pin_count_++
      3. isDirty置为true
    如果找不到
      返回一个空闲的frame，如果没有空闲page则返回nullptr
      1. 将他的frameid 用replacer pin掉
      2. pin_count_++
      3. isDirty置为false，因为是空闲页 没有数据
      4. 将数据库文件中的数据读取到新的frame页中
  最终返回frame页
  
  ```
  

- DeletePgImp(page_id_t page_id)
  > 删除磁盘上的页
  ```C++
    调用DeallcatePage 删除页
    检查page能否被移除
    1. 看pagetable中是否有对应frame
    2. 看对应frame的pincount是否为0 
    3. 如果不为0则表示还有线程再用该frame 不能被移除
    4. 否则frame可以被移除
      4.1 将该frame的所有属性置为默认值
      4.2 将frame的data域置为空
      4.3 最后将该frame 放到空闲列表中
  ```
- UnpinPgImp(page_id_t page_id, bool is_dirty)
  > 一个线程完成对该页的操作
  /*
    如果该frame没有被任何线程引用，
      则将其置为is_dirty 
      减小他的引用计数，如果引用计数减少为0了，就可以将该frame放入淘汰缓存中了，并且将该页写入磁盘
  */
- AllocatePage()
- ValidatePageId(const page_id_t page_id)
---
以下是实现的工具类
- FlushPg(page_id_t page_id)
  > 将一个页 写入磁盘
- FindFreePage()
  > 先找 freelist 再找 replacer 看能否找到一个空闲page
- FindPage(frame_id_t page_id)
  > 在pagetable中找pageid 对应的 frameid


## 遇到的一些坑
- 不加锁的地方一定不要加锁 避免出现一些 奇怪的现象 或者 死锁
- 第一次遇到cend 用end除了问题 所以查了下资料，了解到cend返回的是迭代器常量 不能被修改，而end返回的是可以被修改的迭代器
  

{% gallery %}
![](/img/old/%E7%A9%BF%E7%99%BD%E8%89%B2%E8%A1%AC%E8%A1%AB%E7%9A%84%E5%8F%AF%E7%88%B1%E5%A5%B3%E5%AD%A9%E5%BA%8A%E4%B8%8A%E7%9C%8B%E4%B9%A6%E7%BE%8E%E8%85%BF%E4%BA%8C%E6%AC%A1%E5%85%83.jpg)
![](/img/old/%E5%8F%AF%E7%88%B1%E5%A5%B3%E5%AD%A9%E5%AD%90%E8%93%9D%E8%89%B2%E7%9C%BC%E7%9D%9B%E7%8C%AB%E8%80%B3%E5%85%BD%E8%80%B3%E7%8C%AB%E5%B0%BE%E5%B7%B4%E6%AF%9B%E7%BB%92%E7%8E%A9%E5%85%B7.jpg)
{% endgallery %}


参考资料:
1. [IBM-DB2](https://www.ibm.com/docs/zh/db2/10.5?topic=databases-buffer-pools)
2. [CMU-15445-Slides](https://15445.courses.cs.cmu.edu/fall2021/slides/)
3. [周小伦的博客](https://www.cnblogs.com/JayL-zxl/category/1919605.html)
4. [LRU-K](http://www.cs.cmu.edu/~christos/courses/721-resources/p297-o_neil.pdf)
5. [cend() vs end()](https://stackoverflow.com/questions/50071833/what-is-the-differences-between-begin-end-and-cbegin-cend/50071881)