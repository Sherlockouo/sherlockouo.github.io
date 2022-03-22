---
title: acwing第33场周赛
date: '2022-01-09 22:23:15'
updated: '2022-01-09 22:23:15'
tags: [算法, 比赛]
categories: 算法
copyright: true
permalink: /articles/2022/01/09/1641738195298.html
cover: https://b3logfile.com/bing/20190430.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---


<center>第33场</center>
<center>战况：2/3</center>

---

# <center>第一题 easy</center>

原题链接：[判断数字](https://www.acwing.com/problem/content/4209/)

给定一个整数 **n**n，请你统计其各位数字中 **4**4 和 **7**7 的出现次数。

如果 **4**4 的出现次数加上 **7**7 的出现次数恰好等于 **4**4 或 **7**7，则输出 `YES`，否则输出 `NO`。

例如，当 **n****=****40047**n=40047 时，**4**4 出现了 **2**2 次，**7**7 出现了 **1**1 次，**2****+****1****=****3**2+1=3，既不是 **4**4 也不是 **7**7，因此，输出 `NO`；当 **n****=****7747774**n=7747774 时，**4**4 出现了 **2**2 次，**7**7 出现了 **5**5 次，**2****+****5****=****7**2+5=7，因此，输出 `YES`。

#### 输入格式

一个整数 **n**n。

#### 输出格式

一行，`YES` 或者 `NO`。

#### 数据范围

所有测试点满足 **1****≤****n****≤****10****18**1≤n≤1018。

#### 输入样例1：

```
40047
```

#### 输出样例1：

```
NO
```

#### 输入样例2：

```
7747774
```

#### 输出样例2：

```
YES
```

**思路：模拟即可**

```
#include <iostream>
#include <algorithm>

using namespace std;

int main(){
  string s;
  cin>>s;
  int cnt = 0;
  for(auto x:s){
   if(x=='4'||x=='7') cnt++;
  }
  
  if(cnt==4||cnt==7) puts("YES");
  else puts("NO");
  return 0; 
}
```

# <center>第二题 easy</center>

原题链接：[最长合法括号自序列](https://www.acwing.com/problem/content/4210/)

一个合法的括号序列满足以下条件：

1. 序列`()`被认为是合法的。
2. 如果序列`X`与`Y`是合法的，则`XY`也被认为是合法的。
3. 如果序列`X`是合法的，则`(X)`也是合法的。

例如，`()`，`()()`，`(())`这些都是合法的。

现在，给定一个由 `(` 和 `)` 组成的字符串。

请你求出其中的最长合法括号**子序列** 的长度。

注意，子序列不一定连续。

#### 输入格式

共一行，一个由 `(` 和 `)` 组成的字符串。

#### 输出格式

一个整数，表示最长合法括号**子序列** 的长度。

#### 数据范围

前五个测试点满足， **1****≤**输入字符串的长度**≤****10**1≤输入字符串的长度≤10。
所有测试点满足，**1****≤**输入字符串的长度**≤****10****6**1≤输入字符串的长度≤106。

#### 输入样例1：

```
(()))(
```

#### 输出样例1：

```
4
```

#### 输入样例2：

```
()()(()(((
```

#### 输出样例2：

```
6
```

**思路：贪心.即所有合法的序列一定是最长的,转换以下就是，满足合法括号的序列一共有多少个**

```
#include <iostream>
#include <algorithm>
#include <stack>

using namespace std;

int main(){
  string s;
  cin>>s;
  int ans = 0;
  stack<int> stk;
  for(int i=0;i<s.size();i++){
    if(s[i]=='('){
      stk.push(s[i]);
    }else{
      if(stk.size()){
        stk.pop();
        ans++;
      }
    }
    
  }
  
  cout <<ans*2 <<endl;
  return 0;
}
```



# <center>第三题 medium</center>

原题链接：[电话号码](https://www.acwing.com/problem/content/4211/)

一个电话销售员正在整理他的电话簿。

电话簿中记录了他的全部客户的电话号码。

一个客户可能有不止一个电话号码。

不同客户可能拥有完全相同的电话号码。

电话簿中一共包含 **n**n 条记录。

每条记录都是首先包含一个字符串，表示客户的姓名，然后包含一个整数，表示本条记录包含的电话号码数量，最后是本条记录所包含的电话号码。

不同客户的姓名两两不同，所以如果两条记录包含的客户姓名相同，那么我们认为这都是记录的同一人的电话信息。

同一记录中可能包含相同的电话号码，不同记录中也可能包含相同的电话号码。

在进行整理时，应遵守如下原则：

1. 如果一个客户拥有多条记录，则需要将这些记录进行合并，每人只保留一条记录，去记录他的全部**有效号码** 。
2. 如果一个客户记录的多个电话号码完全相同，则只保留一个作为**有效号码** ，其余的全部视为**无效号码** 。
3. 如果一个客户记录的两个不同电话号码 **a**a 和 **b**b 满足 **a**a 是 **b**b 的后缀，则号码 **a**a 视为**无效号码** 。

请输出整理后的电话记录。

#### 输入格式

第一行包含整数 **n**n，表示记录数量。

接下来 **n**n 行，每行描述一条记录，首先包含一个长度不超过 **10**10 的由小写字母构成的非空字符串，表示客户姓名，然后包含一个不超过 **10**10 的正整数，表示本条记录包含的号码数量，最后包含本条记录的所有号码，每个号码都是长度不超过 **10**10 的由数字构成的非空字符串，可能包含前导 **0**0。

#### 输出格式

首先输出一个整数 **m**m，表示完成整理后的记录数量。

接下来 **m**m 行，每行输出一条记录信息，格式要求与输入一致。

同一行的数据之间用单个空格隔开。

记录的先后顺序随意，一条记录中的号码顺序随意。

#### 数据范围

前三个测试点满足 **1****≤****n****≤****4**1≤n≤4。
所有测试点满足 **1****≤****n****≤****20**1≤n≤20。

#### 输入样例1：

```
2
i 1 00123
m 1 00123
```

#### 输出样例1：

```
2
m 1 00123 
i 1 00123
```

#### 输入样例2：

```
3
l 2 612 12
p 1 12
k 1 612
```

#### 输出样例2：

```
3
k 1 612 
p 1 12 
l 1 612
```

#### 输入样例3：

```
4
i 3 123 123 456
i 2 456 456
i 8 789 3 23 6 56 9 89 2
d 2 23 789
```

#### 输出样例3：

```
2
d 2 23 789 
i 4 789 123 2 456
```

**思路：trie 和 哈希表。**
- 注意不要犯低级错误，例如语法错误之类的。考试的时候我调试了好久，最终考试结束之后调试完成。

```
#include <iostream>
#include <algorithm>
#include <vector>
#include <cstring>
#include <unordered_map>
#include <map>

using namespace std;

const int N = 100;


struct trie{
  int nxt[1000][10],cnt;
  bool exist[1000];
  
  void insert(string s){
    int l = s.size();
    int p = 0;
    for(int i=0;i<l;i++){
      int c = s[i]-'0';
      if(!nxt[p][c]) nxt[p][c] = ++cnt;
      p=nxt[p][c];
      // false on the path
      exist[p]=0;
    }
    for(int i=0;i<10;i++)
      if(nxt[p][i]) {
        exist[p]=0;
        return;
      }
    exist[p]=1;
  }
  
  bool find(string s){
    int l = s.size();
    int p = 0;
    for(int i=0;i<l;i++){
      int c = s[i]-'0';
      if(!nxt[p][c]) return 0;
      p = nxt[p][c];
    }
    return exist[p];
  }
  
}tree[N];




int main(){
  
  int n;
  cin>>n;
  unordered_map<string,vector<string>> mp;
  unordered_map<string,int> mm;
  while(n--){
    string name;
    int cnt;
    cin>>name>>cnt;
    if(!mm.count(name))
      mm[name]=n;
    vector<string> strs;
    
    if(mp.count(name)){
      strs = mp[name];
    }
    
    for(int i=0;i<cnt;i++){
      string phone;
      cin>>phone;
      reverse(phone.begin(),phone.end());
      auto t = mm.find(name);
      tree[t->second].insert(phone);
        strs.push_back(phone);
    }
    mp[name]=strs;
  }
  
  cout<<mp.size()<<endl;
  for(auto x:mp){
    
    vector<string> numbers;
    numbers.clear();
    cout<<x.first<<" ";
    auto phones = x.second;
    string nm = x.first;
    auto t = mm.find(nm);
    int no = t->second;
    sort(phones.begin(),phones.end());
    phones.erase(unique(phones.begin(),phones.end()),phones.end());
    for(auto p:phones){
        string tmp = p;
      if(tree[no].find(p)){
        numbers.push_back(p);
      }
    }
    cout<<numbers.size()<<" ";
    for(auto p:numbers){
      reverse(p.begin(),p.end());
      cout<<p<<" ";
    }
    puts("");
  }
  
  return 0;
}
```

