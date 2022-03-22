title: leetcode第275场周赛
date: '2022-01-09 22:47:49'
updated: '2022-01-09 22:47:49'
tags: [算法, 比赛]
categories: 算法
permalink: /articles/2022/01/09/1641739669719.html
cover: https://b3logfile.com/bing/20190430.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---

# <center>第275场周赛<center>

# <center>2/4</center>

# <center>rank:1420</center>

---

# <center>第一题</center>

原题链接：[检查是否每一行每一列都包含全部整数](https://leetcode-cn.com/contest/weekly-contest-275/problems/check-if-every-row-and-column-contains-all-numbers/)

对一个大小为 `n x n` 的矩阵而言，如果其每一行和每一列都包含从 `1` 到 `n` 的 **全部** 整数（含 `1` 和 `n`），则认为该矩阵是一个 **有效** 矩阵。

给你一个大小为 `n x n` 的整数矩阵 `matrix` ，请你判断矩阵是否为一个有效矩阵：如果是，返回 `true` ；否则，返回 `false` 。

**示例 1：**

![](https://assets.leetcode.com/uploads/2021/12/21/example1drawio.png)

<pre><strong>输入：</strong>matrix = [[1,2,3],[3,1,2],[2,3,1]]
<strong>输出：</strong>true
<strong>解释：</strong>在此例中，n = 3 ，每一行和每一列都包含数字 1、2、3 。
因此，返回 true 。
</pre>

**示例 2：**

![](https://assets.leetcode.com/uploads/2021/12/21/example2drawio.png)

<pre><strong>输入：</strong>matrix = [[1,1,1],[1,2,3],[1,2,3]]
<strong>输出：</strong>false
<strong>解释：</strong>在此例中，n = 3 ，但第一行和第一列不包含数字 2 和 3 。
因此，返回 false 。
</pre>

**提示：**

* `n == matrix.length == matrix[i].length`
* `1 <= n <= 100`
* `1 <= matrix[i][j] <= n`

**思路：模拟 + set存 1～n的数**

```
class Solution {
public:
    bool checkValid(vector<vector<int>>& matrix) {
        int n = matrix.size();
        unordered_map<int,int> m;
        for(int i=1;i<=n;i++) m[i]=i;
        
        for(int i=0;i<n;i++){
            set<int> s;
            for(int j=0;j<n;j++){
                if(!m.count(matrix[i][j])) return false;
                s.insert(matrix[i][j]);
            }
            if(s.size()!=n) return false;
        }
        for(int i=0;i<n;i++){
            set<int> s;
            for(int j=0;j<n;j++){
                if(!m.count(matrix[j][i])) return false;
                s.insert(matrix[j][i]);
            }
            if(s.size()!=n) return false;
        }
        return true;
    }
};
```

# <center>第二题</center>

原题链接：[最少交换次数来组合所有的1 二](https://leetcode-cn.com/contest/weekly-contest-275/problems/minimum-swaps-to-group-all-1s-together-ii/)

**交换** 定义为选中一个数组中的两个 **互不相同** 的位置并交换二者的值。

**环形** 数组是一个数组，可以认为 **第一个** 元素和 **最后一个** 元素 **相邻** 。

给你一个 **二进制环形** 数组 `nums` ，返回在 **任意位置** 将数组中的所有 `1` 聚集在一起需要的最少交换次数。

**示例 1：**

<pre><strong>输入：</strong>nums = [0,1,0,1,1,0,0]
<strong>输出：</strong>1
<strong>解释：</strong>这里列出一些能够将所有 1 聚集在一起的方案：
[0,<strong><em>0</em></strong>,<em><strong>1</strong></em>,1,1,0,0] 交换 1 次。
[0,1,<em><strong>1</strong></em>,1,<em><strong>0</strong></em>,0,0] 交换 1 次。
[1,1,0,0,0,0,1] 交换 2 次（利用数组的环形特性）。
无法在交换 0 次的情况下将数组中的所有 1 聚集在一起。
因此，需要的最少交换次数为 1 。
</pre>

**示例 2：**

<pre><strong>输入：</strong>nums = [0,1,1,1,0,0,1,1,0]
<strong>输出：</strong>2
<strong>解释：</strong>这里列出一些能够将所有 1 聚集在一起的方案：
[1,1,1,0,0,0,0,1,1] 交换 2 次（利用数组的环形特性）。
[1,1,1,1,1,0,0,0,0] 交换 2 次。
无法在交换 0 次或 1 次的情况下将数组中的所有 1 聚集在一起。
因此，需要的最少交换次数为 2 。
</pre>

**示例 3：**

<pre><strong>输入：</strong>nums = [1,1,0,0,1]
<strong>输出：</strong>0
<strong>解释：</strong>得益于数组的环形特性，所有的 1 已经聚集在一起。
因此，需要的最少交换次数为 0 。</pre>

**提示：**

* `1 <= nums.length <= 10<sup>5</sup>`
* `nums[i]` 为 `0` 或者 `1`

**思路：前缀和+滑动窗口**


```
class Solution {
public:
    int minSwaps(vector<int>& nums) {
        int n = nums.size();
        vector<int> ones(2*n+1);
        ones[0]=0;
        for(int i=1;i<=n;i++){
            ones[i]=ones[i-1]+nums[i-1];
            // cout<<ones[i]<<endl;
        }
    
        int cnt = ones[n];
        if(cnt==0||cnt==1) return 0;
        if(cnt==n) return 0;
        
        for(int i=1;i<=n;i++){
            nums.push_back(nums[i-1]);
            ones[n+i] = ones[n+i-1] +nums[i-1];
            // cout<<ones[n+i]<<endl;
        }
        
        int ans = 1e5;
        for(int i=0;i<n;i++){
            int t = ones[i+cnt]-ones[i];
            // cout<<(i+cnt-1)<<" "<<i<<endl;
            ans = min(ans,cnt-t);
        }
        
        return ans;
    }
};
```

# <center>第三题</center>

原题链接：[5978. 统计追加字母可以获得的单词](https://leetcode-cn.com/contest/weekly-contest-275/problems/count-words-obtained-after-adding-a-letter/)

给你两个下标从 **0** 开始的字符串数组 `startWords` 和 `targetWords` 。每个字符串都仅由 **小写英文字母** 组成。

对于 `targetWords` 中的每个字符串，检查是否能够从 `startWords` 中选出一个字符串，执行一次 **转换操作** ，得到的结果与当前 `targetWords` 字符串相等。

**转换操作** 如下面两步所述：

1. **追加** 任何 **不存在** 于当前字符串的任一小写字母到当前字符串的末尾。
   * 例如，如果字符串为 `"abc"` ，那么字母 `'d'`、`'e'` 或 `'y'` 都可以加到该字符串末尾，但 `'a'` 就不行。如果追加的是 `'d'` ，那么结果字符串为 `"abcd"` 。
2. **重排** 新字符串中的字母，可以按 **任意** 顺序重新排布字母。
   * 例如，`"abcd"` 可以重排为 `"acbd"`、`"bacd"`、`"cbda"`，以此类推。注意，它也可以重排为 `"abcd"` 自身。

找出 `targetWords` 中有多少字符串能够由 `startWords` 中的 **任一** 字符串执行上述转换操作获得。返回* * `targetWords`* * 中这类 **字符串的数目** 。

**注意：** 你仅能验证 `targetWords` 中的字符串是否可以由 `startWords` 中的某个字符串经执行操作获得。`startWords`  中的字符串在这一过程中 **不** 发生实际变更。

**示例 1：**

<pre><strong>输入：</strong>startWords = [&#34;ant&#34;,&#34;act&#34;,&#34;tack&#34;], targetWords = [&#34;tack&#34;,&#34;act&#34;,&#34;acti&#34;]
<strong>输出：</strong>2
<strong>解释：</strong>
- 为了形成 targetWords[0] = &#34;tack&#34; ，可以选用 startWords[1] = &#34;act&#34; ，追加字母 &#39;k&#39; ，并重排 &#34;actk&#34; 为 &#34;tack&#34; 。
- startWords 中不存在可以用于获得 targetWords[1] = &#34;act&#34; 的字符串。
  注意 &#34;act&#34; 确实存在于 startWords ，但是 <strong>必须</strong> 在重排前给这个字符串追加一个字母。
- 为了形成 targetWords[2] = &#34;acti&#34; ，可以选用 startWords[1] = &#34;act&#34; ，追加字母 &#39;i&#39; ，并重排 &#34;acti&#34; 为 &#34;acti&#34; 自身。
</pre>

**示例 2：**

<pre><strong>输入：</strong>startWords = [&#34;ab&#34;,&#34;a&#34;], targetWords = [&#34;abc&#34;,&#34;abcd&#34;]
<strong>输出：</strong>1
<strong>解释：</strong>
- 为了形成 targetWords[0] = &#34;abc&#34; ，可以选用 startWords[0] = &#34;ab&#34; ，追加字母 &#39;c&#39; ，并重排为 &#34;abc&#34; 。
- startWords 中不存在可以用于获得 targetWords[1] = &#34;abcd&#34; 的字符串。
</pre>

**提示：**

* `1 <= startWords.length, targetWords.length <= 5 * 10<sup>4</sup>`
* `1 <= startWords[i].length, targetWords[j].length <= 26`
* `startWords` 和 `targetWords` 中的每个字符串都仅由小写英文字母组成
* 在 `startWords` 或 `targetWords` 的任一字符串中，每个字母至多出现一次

思路：构造 + 哈希表

- 因为做题时 每注意到提示的最后一个，导致想错了，最终没有做出来

```
class Solution {
public:
    
    int wordCount(vector<string>& startWords, vector<string>& targetWords) {
            
        unordered_map<string,int> maps;
        for(auto s:startWords){
            sort(s.begin(),s.end());
            maps[s]=1;
        }
        int ans =0;
        for(auto x:targetWords){
            sort(x.begin(),x.end());
            for(int i=0;i<x.size();i++){
                string cur = x.substr(0,i);
                if(i!=x.size()-1) cur+=x.substr(i+1);
                if(maps.count(cur)){
                    ans++;
                    break;
                }
            }
        }
        return ans;
    }
};
```

# <center>第四题</center>

原题链接：[5979. 全部开花的最早一天](https://leetcode-cn.com/contest/weekly-contest-275/problems/earliest-possible-day-of-full-bloom/)

你有 `n` 枚花的种子。每枚种子必须先种下，才能开始生长、开花。播种需要时间，种子的生长也是如此。给你两个下标从 **0** 开始的整数数组 `plantTime` 和 `growTime` ，每个数组的长度都是 `n` ：

* `plantTime[i]` 是 **播种** 第 `i` 枚种子所需的 **完整天数** 。每天，你只能为播种某一枚种子而劳作。**无须** 连续几天都在种同一枚种子，但是种子播种必须在你工作的天数达到 `plantTime[i]` 之后才算完成。
* `growTime[i]` 是第 `i` 枚种子完全种下后生长所需的 **完整天数 ** 。在它生长的最后一天 **之后** ，将会开花并且永远 **绽放** 。

从第 `0` 开始，你可以按 **任意** 顺序播种种子。

返回所有种子都开花的 **最早** 一天是第几天。

**示例 1：**

![](https://assets.leetcode.com/uploads/2021/12/21/1.png)

<pre><strong>输入：</strong>plantTime = [1,4,3], growTime = [2,3,1]
<strong>输出：</strong>9
<strong>解释：</strong>灰色的花盆表示播种的日子，彩色的花盆表示生长的日子，花朵表示开花的日子。
一种最优方案是：
第 0 天，播种第 0 枚种子，种子生长 2 整天。并在第 3 天开花。
第 1、2、3、4 天，播种第 1 枚种子。种子生长 3 整天，并在第 8 天开花。
第 5、6、7 天，播种第 2 枚种子。种子生长 1 整天，并在第 9 天开花。
因此，在第 9 天，所有种子都开花。 
</pre>

**示例 2：**

![](https://assets.leetcode.com/uploads/2021/12/21/2.png)

<pre><strong>输入：</strong>plantTime = [1,2,3,2], growTime = [2,1,2,1]
<strong>输出：</strong>9
<strong>解释：</strong>灰色的花盆表示播种的日子，彩色的花盆表示生长的日子，花朵表示开花的日子。 
一种最优方案是：
第 1 天，播种第 0 枚种子，种子生长 2 整天。并在第 4 天开花。
第 0、3 天，播种第 1 枚种子。种子生长 1 整天，并在第 5 天开花。
第 2、4、5 天，播种第 2 枚种子。种子生长 2 整天，并在第 8 天开花。
第 6、7 天，播种第 3 枚种子。种子生长 1 整天，并在第 9 天开花。
因此，在第 9 天，所有种子都开花。 
</pre>

**示例 3：**

<pre><strong>输入：</strong>plantTime = [1], growTime = [1]
<strong>输出：</strong>2
<strong>解释：</strong>第 0 天，播种第 0 枚种子。种子需要生长 1 整天，然后在第 2 天开花。
因此，在第 2 天，所有种子都开花。
</pre>

**提示：**

* `n == plantTime.length == growTime.length`
* `1 <= n <= 10<sup>5</sup>`
* `1 <= plantTime[i], growTime[i] <= 10<sup>4</sup>`

思路：看穿了就是 贪心，因为种植时间是不会变的，会影响的就只是生长时间。有点像排队打水的最短时间。
~~看穿了好作，每看穿那就G了，比如我。~~

引用大佬的证明:arrow_heading_down:：
很显然，不论以任何顺序种下，播种花的总时间总为 sum\{plantTime\}sum{plantTime}

因此短板取决于生长花费的时间，让长的慢的尽早开始生长

尽量让生长慢的先种，生长快的后种即可

简单证明

对于两植物 a,ba,b 设其播种和生长时间分别为 pa,pb,ga,gbpa,pb,ga,gb

先种a，总时间有 max(pa+ga, pa+pb+gb) = pa + max(ga,pb+gb)max(pa+ga,pa+pb+gb)=pa+max(ga,pb+gb)
先种b，总时间有 max(pa+pb+ga, pb+gb) = pb + max(gb,pa+ga)max(pa+pb+ga,pb+gb)=pb+max(gb,pa+ga)

ga > gb时，先种 aa 时有： pa + max(ga,pb+gb)pa+max(ga,pb+gb)，先种 bb 时有： pb + ga + papb+ga+pa

把 maxmax 两种情况展开，pa + ga < pa + ga + pbpa+ga<pa+ga+pb 且 pa + pb + gb < pa + pb + gapa+pb+gb<pa+pb+ga 因此先种 aa

反之同理有，先种 bb 时有： pb + max(gb,pa+ga)pb+max(gb,pa+ga)，先种 aa 时有： pa + pb + gbpa+pb+gb，因此先种 bb

综上所述，先种生长时间长的

```
作者：MuriyaTensei
链接：https://leetcode-cn.com/problems/earliest-possible-day-of-full-bloom/solution/c-zi-ding-yi-pai-xu-by-muriyatensei-2syb/
```




```
class Solution {
public:
    int earliestFullBloom(vector<int>& plantTime, vector<int>& growTime) {
        int n = plantTime.size();
        vector<int> order(n);
        // 按照 growTime 排序
        for(int i=0;i<n;i++){
            order[i]=i;
            sort(order.begin(),order.end(),[&](int i,int j){
                return growTime[i]>growTime[j];
            });
        }
        int ans = 0,day = 0;
        for(int i:order){
            day += plantTime[i];
            ans = max(ans,day+growTime[i]);
        }
        return ans;
    }
};
```

