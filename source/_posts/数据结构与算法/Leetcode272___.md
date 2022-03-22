title: Leetcode 272场周赛
date: '2021-12-19 18:51:31'
updated: '2021-12-19 18:54:52'
tags: [算法, 周赛, leetcode]
categories: 算法
permalink: /articles/2021/12/19/1639911090803.html
cover: https://b3logfile.com/bing/20180208.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---


<center>Leetcode 272场周赛</center>
<center>完成度： 3/4</center>

<center>排名：2250(手速过慢，而且没做出最后一题)</center>

## 第一题

[原题链接](https://leetcode-cn.com/problems/find-first-palindromic-string-in-the-array/)

题意： 找到字符串数组中第一个 回文字符串 如果没有就返回空

```
class Solution { 
public: 
string firstPalindrome(vector<string>& words) 
		for(auto s: words){ 
			string str = s ; 
			reverse(s.begin(),s.end()); 
			if(s == str){ return str; } 
		} 
	return ""; 
} };
```

## 第二题

[向字符串添加空格](https://leetcode-cn.com/problems/adding-spaces-to-a-string/)

题意： 在给定 spaces的位置 添加空格
模拟即可

```
class Solution {
public:
    string addSpaces(string s, vector<int>& spaces) {
        string ans = "";
        
        unordered_map<int,int> mp;
        for(auto x: spaces) mp[x]++;
        for(int i=0;i<s.size();i++){
            if(mp.count(i)!=0){
                ans+=" ";
            }
            ans+=s[i];
        }
        return ans;
    }
};
```

## 第三题 股票平滑下跌阶段的数目

[股票平滑下跌阶段的数目](https://leetcode-cn.com/problems/number-of-smooth-descent-periods-of-a-stock/)

题意： 求连续数字串的子串个数

由于 get的地方忘记 转换为LL wa了一发

```
typedef long long LL;
class Solution {
public:

    LL get(int n){
        
        LL res = (LL)n*(n+1)/2;
        return res;
    }
    
    long long getDescentPeriods(vector<int>& prices) {
        
        int n = prices.size();
        LL ans = 0;
        int pre = prices[0];
        int flag = 1;
        for(int i = 0; i < n; i++){
            if(pre-prices[i]==1){
                flag++;
                ans += get(flag) - get(flag-1);
            }else{
                
                ans += get(1);   
                flag = 1;
            }
            
            pre = prices[i];
        }
        
        return ans;
    }
};
```

前三题总的来说都比较简单 难一点的就是第四题。

## 第四题 使数组 K 递增的最少操作次数

[使数组 K 递增的最少操作次数](https://leetcode-cn.com/problems/minimum-operations-to-make-the-array-k-increasing/)

题意： 求最长上升(平滑也行)子序列的长度
最少操作次数就是 总长度 - 总最长上升子序列的长度

考试的时候想到了一点思路，但没有写。

```
输入：arr = [4,1,5,2,6,2], k = 3
输出：2
```

```
k=1: 4, 2
k=2: 1, 6
k=3: 5, 2
```

计算每一组的 最长上升子序列(这部分是不需要修改的 而除了这部分是需要修改的）
所以总长度 减去每组最长上升子序列的和 即为答案。

```
class Solution {
public:
    template<typename T>
    int lis(vector<T> a) {
        vector<T> dp;
        for(auto x : a) {
            auto it = upper_bound(dp.begin(), dp.end(), x); // > : lower, >= : upper
            if(it == dp.end()) dp.push_back(x);
            else *it = x;
        }
        return dp.size();
    }
    int kIncreasing(vector<int>& a, int k) {
        int n = a.size();
        int ans = 0;
        for(int i = 0; i < k; ++i) {
            vector<int> b;
            for(int j = i; j < n; j += k) {
                b.push_back(a[j]);
            }
            ans += lis(b);
        }
        return n - ans;
    }
};
```



