---
title: 数据库SQL练习
sticky: false
swiper_index: 0
comments: true
toc: true
toc_number: true
mathjax: false
highlight_shrink: false
aside: true
copyright: true
date: 2022-02-02 21:40:18
updated:
tags: [数据库,SQL,CMU-15445]
categories: 编程
keywords: SQL
description: 数据库练习
cover: 
top_img:
---

# SQL 练习

> 资料 来自 CMU-15445 <code>见参考资料2</code>

这是这门课的第一个作业，目的是让了解SQL的进阶语法 和 完全体的DBMS 是什么模样。

## 材料准备

1. 首先需要安装[sqlite](https://www.sqlite.org/index.html)
    如果不熟悉SQLite 可以先学习一下 [官方教程](https://sqlite.org/cli.html#getting_started)
2. 然后需要下载网站提供的 databasedumpfile
    ```bash
    wget https://15445.courses.cs.cmu.edu/fall2021/files/northwind-cmudb2021.db.gz
    ```
    使用MD5来验证以下文件，是否正确
    ```bash
    md5sum northwind-cmudb2021.db.gz
    f4fd955688d0dd9b5f4799d891f3f646  northwind-cmudb2021.db.gz
    ```
    确认下载无误就可以解压，然后用sqlite打开
3. 打开数据库可以看到
    ```bash
    sqlite3 northwind-cmudb2021.db
    SQLite version 3.31.1
    Enter ".help" for usage hints.
    sqlite> .tables
    Category              EmployeeTerritory     Region              
    Customer              Order                 Shipper             
    CustomerCustomerDemo  OrderDetail           Supplier            
    CustomerDemographic   Product               Territory           
    Employee              ProductDetails_V 
    ```
    ![数据库的组织结构](https://15445.courses.cs.cmu.edu/fall2021/files/schema2021.png)

## 实验作业
Now, it's time to start constructing the SQL queries and put them into the placeholder files.

### Q1 [0 POINTS] (SQL例子):
The purpose of this query is to make sure that the formatting of your output matches exactly the formatting of our auto-grading script.
Details: List all Category Names ordered alphabetically.
Answer: Here's the correct SQL query and expected output:

```bash
    sqlite> SELECT CategoryName FROM Category ORDER BY CategoryName;
    Beverages
    Condiments
    Confections
    Dairy Products
    Grains/Cereals
    Meat/Poultry
    Produce
    Seafood
```

You should put this SQL query into the appropriate file (q1_sample.sql) in the submission directory (placeholder).


### Q2[5Points] (Q2 String 函数)
> 获取Order中所有唯一且包含‘-’的ShipNames，并且需要处理掉连字符，保留连字符前面的名字

Details: In addition, get all the characters preceding the (first) hyphen. Return ship names alphabetically. Your first row should look like 

<code>Bottom-Dollar Markets|Bottom</code>

```sql
select distinct ShipName, subStr(ShipName,0,instr(ShipName,'-')) as PreHyphen from 'Order' where shipname like '%-%' order by ShipName asc;
-- result is below:
-- Bottom-Dollar Markets|Bottom
-- Chop-suey Chinese|Chop
-- GROSELLA-Restaurante|GROSELLA
-- HILARION-Abastos|HILARION
-- Hungry Owl All-Night Grocers|Hungry Owl All
-- LILA-Supermercado|LILA
-- LINO-Delicateses|LINO
-- QUICK-Stop|QUICK
-- Save-a-lot Markets|Save
```

### Q3 [5 POINTS] (Q3_NORTHAMERICAN):
> 将所有订单分类，分为北美和其他地方，要求id大于等于15445，升序，取前20个

Indicate if an order's ShipCountry is in North America. For our purposes, this is 'USA', 'Mexico', 'Canada'
Details: You should print the Order Id, ShipCountry, and another column that is either 'NorthAmerica' or 'OtherPlace' depending on the Ship Country.
Order by the primary key (Id) ascending and return 20 rows starting from Order Id 15445 Your output should look like 

<code>15445|France|OtherPlace or 15454|Canada|NorthAmerica</code>

```SQL
SELECT Id, ShipCountry, 
       CASE 
              WHEN ShipCountry IN ('USA', 'Mexico','Canada')
              THEN 'NorthAmerica'
              ELSE 'OtherPlace'
       END
FROM 'Order'
WHERE Id >= 15445
ORDER BY Id ASC
LIMIT 20;

-- Answer: 
-- 15445|France|OtherPlace
-- 15446|Italy|OtherPlace
-- 15447|Portugal|OtherPlace
-- 15448|Argentina|OtherPlace
-- 15449|Portugal|OtherPlace
-- 15450|Venezuela|OtherPlace
-- 15451|Brazil|OtherPlace
-- 15452|France|OtherPlace
-- 15453|France|OtherPlace
-- 15454|Canada|NorthAmerica
-- 15455|USA|NorthAmerica
-- 15456|France|OtherPlace
-- 15457|Mexico|NorthAmerica
-- 15458|USA|NorthAmerica
-- 15459|Germany|OtherPlace
-- 15460|Argentina|OtherPlace
-- 15461|Austria|OtherPlace
-- 15462|Austria|OtherPlace
-- 15463|Finland|OtherPlace
-- 15464|Brazil|OtherPlace
```

### Q4 [10 POINTS] (Q4_DELAYPERCENT):
> 找出每个运输公司的延迟率.需要用到取整函数

For each Shipper, find the percentage of orders which are late.
Details: An order is considered late if ShippedDate > RequiredDate. Print the following format, order by descending precentage, rounded to the nearest hundredths, like 

<code>United Package|23.44</code>

```SQL
select distinct Shipper.CompanyName,DelayRate 
from 'Order',
(select D.ShipVia,D.late,C.cnt,round((D.late * 1.0/C.cnt)*100,2) as DelayRate 
from
(select ShipVia,count(Id) as late
from 'Order' 
where ShippedDate > RequiredDate 
group by ShipVia) 
as D, (select ShipVia,count(Id) as cnt from 'Order' group by ShipVia) as C
where D.ShipVia = C.ShipVia 
)as Res
 ,Shipper
where Shipper.Id = 'Order'.ShipVia and Res.ShipVia = 'Order'.ShipVia
order by DelayRate desc;
-- result is 
-- Federal Shipping|23.61
-- Speedy Express|23.46
-- United Package|23.44
```
### Q5 [10 POINTS] (Q5_AGGREGATES):
> 使用聚合函数，统计种类数目，平均单价，最贵，最便宜，总的订单数目

Compute some statistics about categories of products
Details: Get the number of products, average unit price (rounded to 2 decimal places), minimum unit price, maximum unit price, and total units on order for categories containing greater than 10 products.
Order by Category Id. Your output should look like

<code>Beverages|12|37.98|4.5|263.5|60</code>

```SQL
select CategoryName,
count(*) as CategoryCount,
round(avg(UnitPrice),2),
min(UnitPrice) AS MinUnitPrice,
max(UnitPrice) AS MaxUnitPrice,
sum(UnitsOnOrder) AS TotalUnitsOnOrder
from Product
INNER JOIN Category on Product.CategoryId = Category.Id
group by CategoryId
HAVING CategoryCount > 10
Order BY CategoryId;

-- result
-- Beverages|12|37.98|4.5|263.5|60
-- Condiments|12|23.06|10|43.9|170
-- Confections|13|25.16|9.2|81|180
-- Seafood|12|20.68|6|62.5|120
```

### Q6 [10 POINTS] (Q6_DISCONTINUED):
> 对于8个停产的数据库中的产品，找到第一个购买这个产品的用户，输出他的公司名称 和 联系人名称。

For each of the 8 discontinued products in the database, which customer made the first ever order for the product? Output the customer's CompanyName and ContactName
Details: Print the following format, order by ProductName alphabetically: 

<code>Alice Mutton|Consolidated Holdings|Elizabeth Brow</code>

```SQL
select ProductName,CompanyName,ContactName from
(select ProductName,min(OrderDate),CompanyName,ContactName from
(select Id,ProductName 
from  Product 
where Discontinued = 1
)as P
join OrderDetail as OD on OD.ProductId = P.Id 
join 'Order' as O on O.Id = OD.OrderId 
join Customer as C on C.Id = O.CustomerId
group by ProductName
) as T
Order by ProductName asc;

-- Result
-- Alice Mutton|Consolidated Holdings|Elizabeth Brown
-- Chef Anton's Gumbo Mix|Piccolo und mehr|Georg Pipps
-- Guaran�� Fant��stica|Piccolo und mehr|Georg Pipps
-- Mishi Kobe Niku|Old World Delicatessen|Rene Phillips
-- Perth Pasties|Piccolo und mehr|Georg Pipps
-- R?ssle Sauerkraut|Piccolo und mehr|Georg Pipps
-- Singaporean Hokkien Fried Mee|Vins et alcools Chevalier|Paul Henriot
-- Th��ringer Rostbratwurst|Piccolo und mehr|Georg Pipps
```

### Q7 [15 POINTS] (Q7_ORDER_LAGS):
> 找到前10个由BLONP购买的订单，以及每个订单之间的时间差，使用lag来获取前一row的日期

For the first 10 orders by CutomerId BLONP: get the Order's Id, OrderDate, previous OrderDate, and difference between the previous and current. Return results ordered by OrderDate (ascending)
Details: The "previous" OrderDate for the first order should default to itself (lag time = 0). Use the julianday() function for date arithmetic (example).
Use lag(expr, offset, default) for grabbing previous dates.
Please round the lag time to the nearest hundredth, formatted like 

<code>17361|2012-09-19 12:13:21|2012-09-18 22:37:15|0.57</code>

Note: For more details on window functions, see [here](https://www.sqlite.org/windowfunctions.html).

```SQL
select Id, 
       OrderDate,
       PrevOrderDate,
       round(julianday(OrderDate) - julianday(PrevOrderDate),2) 
from (
select Id,
       OrderDate,
       LAG(OrderDate,1,OrderDate) 
       OVER (order by OrderDate asc) as PrevOrderDate
from 'Order'
where CustomerId = 'BLONP'
Order by OrderDate asc
LIMIT 10
)
-- result
-- 16766|2012-07-22 23:11:15|2012-07-22 23:11:15|0.0
-- 10265|2012-07-25|2012-07-22 23:11:15|2.03
-- 12594|2012-08-16 12:35:15|2012-07-25|22.52
-- 20249|2012-08-16 16:52:23|2012-08-16 12:35:15|0.18
-- 20882|2012-08-18 19:11:48|2012-08-16 16:52:23|2.1
-- 18443|2012-08-28 05:34:03|2012-08-18 19:11:48|9.43
-- 10297|2012-09-04|2012-08-28 05:34:03|6.77
-- 11694|2012-09-17 00:27:14|2012-09-04|13.02
-- 25613|2012-09-18 22:37:15|2012-09-17 00:27:14|1.92
-- 17361|2012-09-19 12:13:21|2012-09-18 22:37:15|0.57
```

### Q8 [15 POINTS] (Q8_TOTAL_COST_QUARTILES):
> 获取每个用户的公司，顾客id 和 总花费，输出最底层的一组

For each Customer, get the CompanyName, CustomerId, and "total expenditures". Output the bottom quartile of Customers, as measured by total expenditures.
Details: Calculate expenditure using UnitPrice and Quantity (ignore Discount). Compute the quartiles for each company's total expenditures using NTILE. The bottom quartile is the 1st quartile, order them by increasing expenditure.
Make sure your output is formatted as follows (round expenditure to nearest hundredths): 

<code>Bon app|BONAP|4485708.49</code>

Note: There are orders for CustomerIds that don't appear in the Customer table. You should still consider these "Customers" and output them. If the CompanyName is missing, override the NULL to 'MISSING_NAME' using IFNULL.

```SQL

-- Note that there are orders for CustomerIds that don't appear in the Customer table.
-- This means we need to use left join

WITH expenditures AS( 
    SELECT 
        IFNULL(c.CompanyName,'MISSING_NAME') AS CompanyName,
        o.CustomerId,
        ROUND(SUM(od.Quantity*od.UnitPrice),2) AS TotalCost
    FROM 'Order' AS o
    INNER JOIN OrderDetail  od on od.OrderId = o.Id
    -- 因为customerid可能为空 则需要 leftjoin
    LEFT JOIN  Customer c on c.Id = o.CustomerId
    GROUP BY o.CustomerId
),
quartiles AS (
    -- Ntile 主要是用N个桶来装 所有的行 
    SELECT * ,NTILE(4) OVER (ORDER BY TotalCost ASC) AS ExpenditureQuartile
    FROM expenditures
)
SELECT CompanyName,CustomerId,TotalCost
FROM quartiles
-- 查看一号桶中的数据
WHERE ExpenditureQuartile = 1
ORDER BY TotalCost ASC;

-- Result
-- MISSING_NAME|DUMO|1615.9
-- MISSING_NAME|OCEA|3460.2
-- MISSING_NAME|ANTO|7515.35
-- MISSING_NAME|QUEE|30226.1
-- Trail's Head Gourmet Provisioners|TRAIH|3874502.02
-- Blondesddsl p��re et fils|BLONP|3879728.69
-- Around the Horn|AROUT|4395636.28
-- Hungry Owl All-Night Grocers|HUNGO|4431457.1
-- Bon app|BONAP|4485708.49
-- B��lido Comidas preparadas|BOLID|4520121.88
-- Galer��a del gastr��nomo|GALED|4533089.9
-- FISSA Fabrica Inter. Salchichas S.A.|FISSA|4554591.02
-- Maison Dewey|MAISD|4555931.37
-- Cactus Comidas para llevar|CACTU|4559046.87
-- Sp��cialit��s du monde|SPECD|4571764.89
-- Magazzini Alimentari Riuniti|MAGAA|4572382.35
-- Toms Spezialit?ten|TOMSP|4628403.36
-- Split Rail Beer & Ale|SPLIR|4641383.53
-- Sant�� Gourmet|SANTG|4647668.15
-- Morgenstern Gesundkost|MORGK|4676234.2
-- White Clover Markets|WHITC|4681531.74
-- La corne d'abondance|LACOR|4724494.22
-- Victuailles en stock|VICTE|4726476.33
-- Lonesome Pine Restaurant|LONEP|4735780.66
```


### Q9 [15 POINTS] (Q9_YOUNGBLOOD):
> 找到每个区域工作的最年轻的成员

Find the youngest employee serving each Region. If a Region is not served by an employee, ignore it.
Details: Print the Region Description, First Name, Last Name, and Birth Date. Order by Region Id.
Your first row should look like 

<code>Eastern|Steven|Buchanan|1987-03-04</code>

```SQL
    -- 得到每个区域 年龄最小的 员工 id 和 
SELECT RegionDescription, FirstName, LastName, bday
FROM 
(
    SELECT RegionId  AS rid,EmployeeId,FirstName,LastName,Birthdate,MAX(Employee.Birthdate) AS bday
    FROM Employee
        INNER JOIN EmployeeTerritory ON Employee.Id = EmployeeTerritory.EmployeeId
        INNER JOIN Territory ON TerritoryId = Territory.Id
    GROUP BY RegionId
)
INNER JOIN Region ON Region.Id = rid
GROUP BY EmployeeId
ORDER BY rid;

-- Result
-- Eastern|Steven|Buchanan|1987-03-04
-- Western|Michael|Suyama|1995-07-02
-- Northern|Anne|Dodsworth|1998-01-27
-- Southern|Janet|Leverling|1995-08-30
```

### Q10 [15 POINTS] (Q10_CHRISTMAS):
> 把 'Queen Cozinha' 在 2014-12-25 购买的 ProductNames 连接在一起，需要用到递归查询 ()

Concatenate the ProductNames ordered by the Company 'Queen Cozinha' on 2014-12-25.
Details: Order the products by Id (ascending). Print a single string containing all the dup names separated by commas like Mishi Kobe Niku, NuNuCa Nuß-Nougat-Creme...
Hint: You might find [Recursive CTEs](https://sqlite.org/lang_with.html) useful.

```SQL
with p as(
    SELECT ProductName,Product.Id
    FROM 'Order'
    INNER JOIN Customer on CustomerId = Customer.Id
    INNER JOIN OrderDetail on 'Order'.Id = OrderDetail.OrderId
    INNER JOIN Product on OrderDetail.ProductId = Product.Id
    where CompanyName = 'Queen Cozinha' AND Date(OrderDate) = '2014-12-25'
),
c as (
    select row_number() over (order by p.id asc) as seqnum,
    p.ProductName as name
    from p
),
flattened as(
    select seqnum,name as name from c 
    where seqnum = 1
    union all 
    select c.seqnum,f.name || ',' || c.name 
    from c join 
        flattened f 
        on c.seqnum = f.seqnum + 1
)
select name from flattened
ORDER BY seqnum Desc limit 1;

-- Result 
Mishi Kobe Niku,NuNuCa Nu?-Nougat-Creme,Schoggi Schokolade,Mascarpone Fabioli,Sasquatch Ale,Boston Crab Meat,Manjimup Dried Apples,Longlife Tofu,Lakkalik??ri  

```

---

## 参考资料：
1. [图解SQL中的各种JOIN](https://zhuanlan.zhihu.com/p/29234064)
2. [CMU-15445-SQL](https://15445.courses.cs.cmu.edu/fall2021/homework1/)
3. [SQLLITE_NTILE](https://www.sqlitetutorial.net/sqlite-window-functions/sqlite-ntile/)
4. [SQLITE_WITH](https://sqlite.org/lang_with.html)