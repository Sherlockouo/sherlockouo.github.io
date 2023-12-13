title: leetcode——部门工资前三高的员工的信息
date: '2021-07-24 22:26:43'
updated: '2021-07-24 22:26:43'
tags: [database]
categories: 数据库
permalink: /articles/2021/07/24/1627136803146.html
cover: https://b3logfile.com/bing/20190928.jpg?imageView2/1/w/960/h/540/interlace/1/q/100
---

简单表组装...:doge:

[原题链接](https://leetcode-cn.com/problems/department-top-three-salaries/)

![image.png](https://b3logfile.com/file/2021/07/image-afb47fbd.png)

- 使用rank + right join wa
- 使用dense_rank + right join wa
- 使用dense_rank + join AC(!Ohhhhhhhhhhh!)


```mysql
SELECT RES.DName as Department,RES.Emm as Employee,RES.Salary
from (
SELECT emp.Name as Emm,
emp.Salary,
DENSE_RANK() OVER(PARTITION BY emp.DepartmentId
ORDER BY Salary DESC) as ranking,dep.Name as DName
from Employee as emp JOIN Department as dep ON emp.DepartmentId = dep.Id
)
as RES where RES.ranking <=3
```



最终AC QAQ![image.png](https://b3logfile.com/file/2021/07/image-1957361c.png)
