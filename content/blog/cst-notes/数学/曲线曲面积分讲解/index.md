---
title: "曲线曲面积分讲解"
date: 2025-05-20
summary: "曾经给Zinc讲微积分时候留下的手稿，写得令我比较满意，我把它们重新整理出来了放在这里。"
tags: [CST, 数学]
---
*p.s. 本文的章节号是出自Paul's Online Notes.*
## Preliminary: 曲面表示

三维空间中，**曲面的自由度是 $2$**（$\deg=2$）。所以曲面可以由**两个参数**表示。

于是一个曲面通常有下面两种表示方法：

$$\text{I.}\quad S:\begin{cases}x=x(u,v)\\y=y(u,v)\\z=z(u,v)\end{cases}$$

可记 $\boldsymbol{r}(u,v)=(x(u,v),y(u,v),z(u,v))$ 为该曲面的参数表示。

$$\text{II.}\quad z=z(x,y)$$

第二种就是把 $z$ 看成 $x,y$ 的函数，本质上 $x,y$ 就是两个参数。

## 求曲面面积 [15.9](https://tutorial.math.lamar.edu/Problems/CalcIII/SurfaceArea.aspx)

我们从曲面最基本的任务开始：求曲面的面积。

先看表示形式 I。设

$$\boldsymbol{r}=\begin{pmatrix}x(u,v)\\y(u,v)\\z(u,v)\end{pmatrix},$$

我们取 $x$ 和 $y$ 对参数 $u,v$ 的偏导数，得到

$$\boldsymbol{r}_u=\begin{pmatrix}x_u\\y_u\\z_u\end{pmatrix},\quad \boldsymbol{r}_v=\begin{pmatrix}x_v\\y_v\\z_v\end{pmatrix}.$$

则

$$\iint_S \mathrm d A=\iint_D \|\boldsymbol{r}_u\times\boldsymbol{r}_v\|\,\mathrm d u\,\mathrm d v.$$

展开就是

$$\iint_S \mathrm d A=\iint_D\sqrt{(y_u z_v-y_v z_u)^2+(x_u z_v-x_v z_u)^2+(x_u y_v-x_v y_u)^2}\,\mathrm d u\,\mathrm d v.$$

若为表示形式 II，即 $z=z(x,y)$，则

$$\iint_S \mathrm d A=\iint_D \sqrt{1+z_x^2+z_y^2}\,\mathrm d x\,\mathrm d y.$$

## 曲面积分 [17.2](https://tutorial.math.lamar.edu/Problems/CalcIII/ParametricSurfaces.aspx) & [17.3](https://tutorial.math.lamar.edu/Problems/CalcIII/SurfaceIntegrals.aspx)

进一步，我们探讨曲面稍微难一点的性质：数量场上的曲面积分（第一类曲面积分）。

要理解一个曲面，我们最好的方法就是去**把参数找到**，就如同要理解一个线性空间我们必须要寻找基底。曲面的自由度是 $2$，所以要找两个可以自由变化的量。我们用几个例子来看如何找参数：

例 1：

曲面为 $7x+3y+4z=15$（第一象限部分），我们令

$$x=x,\qquad y=y,\qquad z=\frac{15-7x-3y}{4},\qquad x,y,z\ge 0.$$

这里参数就是 $x,y$。

例 2（柱坐标）：

曲面为 $x^2+y^2=5$（$-1\leq z\leq 6$），我们令

$$x=\sqrt5\cos\theta,\qquad y=\sqrt5\sin\theta,\qquad z=z,$$

并限制

$$\theta\in[0,2\pi],\qquad z\in[-1,6].$$

这里参数就是 $\theta,z$。

例 3（球坐标）：

半径为 $6$ 的球面（$x\geq 0$ 的部分），我们令

$$x=6\sin\varphi\cos\theta,\qquad y=6\sin\varphi\sin\theta,\qquad z=6\cos\varphi.$$

并限制

$$\varphi\in[0,\pi],\qquad \theta\in\left[0,\frac{\pi}{2}\right]\cup\left[\frac{3\pi}{2},2\pi\right).$$

这里参数就是 $\varphi,\theta$。

找完参数以后，Part 1 里面的面积公式就直接变成曲面积分公式：

$$\iint_S F(x,y,z)\,\mathrm d A=\iint_D F(x(u,v),y(u,v),z(u,v))\|\boldsymbol{r}_u\times\boldsymbol{r}_v\|\,\mathrm d u\,\mathrm d v.$$

如果曲面写成 $z=z(x,y)$，则

$$\iint_S F(x,y,z)\,\mathrm d A=\iint_D F(x,y,z(x,y))\sqrt{1+z_x^2+z_y^2}\,\mathrm d x\,\mathrm d y.$$

## 曲线积分 [16.3](https://tutorial.math.lamar.edu/Problems/CalcIII/LineIntegralsPtII.aspx)

曲线的自由度是 $1$，所以参数数量也是 $1$。

曲线的两种常见表示：

$$\text{I.}\quad x=x(t),\ y=y(t),$$

这里的参数是 $t$。

$$\text{II.}\quad y=y(x),$$

这里可以直接认为 $x$ 是参数，也就和第一学期学的一元微积分一样了。

于是数量场上的曲线积分（第一类曲线积分）为

$$\int_C f(x,y)\,\mathrm d l=\int_L f(x(t),y(t))\sqrt{(x'(t))^2+(y'(t))^2}\,\mathrm d t.$$

若用 $y=y(x)$ 表示，则

$$\int_C f(x,y)\,\mathrm d l=\int_L f(x,y(x))\sqrt{1+(y'(x))^2}\,\mathrm d x.$$

这些积分公式其实在第一学期都已经学过，这里只是换了个名字。

## 曲线积分: 向量场 [16.4](https://tutorial.math.lamar.edu/Problems/CalcIII/LineIntegralsVectorFields.aspx)

要在向量场上积分，我们的核心思想就是**化向量场积分为数量场积分**，简单说就是被积函数是向量，微元也是向量，我们如果把微元拆成向量和微元标量的乘积，那被积对象就变成两个向量的点乘，于是就重新变回了我们最熟悉的数量场积分。

有了这个思想，我们的操作步骤仍然要给**积分路径**找**参数**。二维平面中的曲线和三维空间中的曲线自由度都是 $1$，只有 $1$ 个参数。

例如椭圆

$$\frac{x^2}{4}+\frac{y^2}{9}=1,$$

可取

$$x=2\cos t,\qquad y=3\sin t.$$

再按照题目给出的范围决定 $t$ 的范围与走向。

现在看向量微元：

$$\mathrm d\boldsymbol{r}=\boldsymbol{r}\,\mathrm d l.$$

其中单位方向向量与弧长微元分别是

$$\boldsymbol{r}=\frac{(x'(t),y'(t))}{\sqrt{(x'(t))^2+(y'(t))^2}},\qquad \mathrm d l=\sqrt{(x'(t))^2+(y'(t))^2}\,\mathrm d t.$$

所以

$$\mathrm d\boldsymbol{r}=\boldsymbol{r}\,\mathrm d l=(x'(t),y'(t))\,\mathrm d t.$$

我们惊喜地发现，根号被消去了！这很有助于我们计算！

因此

$$\int_C \boldsymbol{F}\cdot\mathrm d\boldsymbol{r}=\int_L \boldsymbol{F}(x(t),y(t))\cdot (x'(t),y'(t))\,\mathrm d t.$$

三维也一样：

$$\int_C \boldsymbol{F}\cdot\mathrm d\boldsymbol{r}=\int_L \boldsymbol{F}(x(t),y(t),z(t))\cdot (x'(t),y'(t),z'(t))\,\mathrm d t.$$

## 曲面积分：向量场 [17.4](https://tutorial.math.lamar.edu/Problems/CalcIII/SurfIntVectorField.aspx)

掌握了向量场的曲线积分，我们应当更有自信开始啃硬骨头，研究如何计算向量场上的曲面积分（第二类曲面积分）。这一节大抵也是整篇文章最难的部分。

回顾前面提到的曲面的两种表示方法：

$$\boldsymbol{r}(u,v)=(x(u,v),y(u,v),z(u,v)),\qquad z=z(x,y).$$

设

$$\boldsymbol{v}=(P,Q,R).$$

第二类曲面积分记作：

$$\iint_\Sigma \boldsymbol{v}\cdot\mathrm d\boldsymbol{S}=\iint_\Sigma \boldsymbol{v}\cdot\boldsymbol{n}\,\mathrm d S\overset{\mathrm{def}}=\iint_\Sigma P\,\mathrm d y\wedge\mathrm d z+Q\,\mathrm d z\wedge\mathrm d x+R\,\mathrm d x\wedge\mathrm d y.$$

接下来我们先看在**第一种曲面表示方法（参数表示）**下的向量场曲面积分。设

$$\boldsymbol{r}(u,v)=\bigl(x(u,v),y(u,v),z(u,v)\bigr).$$

先求法向量：

$$\boldsymbol{n}=\frac{\boldsymbol{r}_u\times\boldsymbol{r}_v}{\|\boldsymbol{r}_u\times\boldsymbol{r}_v\|}.$$

其中

$$\boldsymbol{r}_u\times\boldsymbol{r}_v=\left(\frac{\partial(y,z)}{\partial(u,v)},\frac{\partial(z,x)}{\partial(u,v)},\frac{\partial(x,y)}{\partial(u,v)}\right)=(A,B,C).$$

并且

$$\mathrm d S=\|\boldsymbol{r}_u\times\boldsymbol{r}_v\|\,\mathrm d u\,\mathrm d v.$$

所以

$$\iint_\Sigma \boldsymbol{v}\cdot\mathrm d\boldsymbol{S}=\pm\iint_\Sigma \boldsymbol{v}\cdot\boldsymbol{n}\,\mathrm d S=\pm\iint_\Sigma (P,Q,R)\cdot(\boldsymbol{r}_u\times\boldsymbol{r}_v)\,\mathrm d u\,\mathrm d v=\pm\iint_D(PA+QB+RC)\,\mathrm d u\,\mathrm d v.$$

这里 $P,Q,R$ 都以 $u,v$ 为参数。

**符号 $+$ 或 $-$ 取决于选出来的法向量是不是题目指定的曲面正向。** 如果是曲面正向，则取 $+$；如果是反向，则取 $-$。题目常见说法是向外、向上等等。

**Remark.** 并不一定要机械套上面的公式。比如单位球面，向外单位法向量由几何意义就是

$$\boldsymbol{n}=(x,y,z),$$

这样直接代入通量定义往往更快。

再看**第二种曲面表示方法（函数表示）** $z=z(x,y)$。

取

$$ (z_x,z_y,-1) $$

作为法向量方向对应的面积向量。因此

$$\iint_\Sigma \boldsymbol{v}\cdot\mathrm d\boldsymbol{S}=\pm\iint_D\bigl(Pz_x+Qz_y-R\bigr)\,\mathrm d x\,\mathrm d y.$$

**若 $(z_x,z_y,-1)$ 与题目给定正向一致，取 $+$；否则取 $-$。**

例如题目说向上时，通常更自然地用

$$( -z_x,-z_y,1)\,\mathrm d x\,\mathrm d y,$$

也就是

$$\iint_D(-Pz_x-Qz_y+R)\,\mathrm d x\,\mathrm d y.$$

总结一下，第二类曲面积分的步骤就是：

$$\boxed{\text{找参数}\longrightarrow\text{求法向量}\longrightarrow\text{套公式计算积分}\longrightarrow\text{判断正方向}}$$

## 场论 [16.5](https://tutorial.math.lamar.edu/Problems/CalcIII/FundThmLineIntegrals.aspx)

设

$$\boldsymbol{v}=(P,Q,R)$$

是一个向量场，我们给出保守场和势函数的定义：

1. $\boldsymbol{v}$ 是一个保守场当且仅当 $\int_{AB}\boldsymbol{v}\cdot\mathrm d\boldsymbol{l}$ 与路径无关，只与起点、终点有关。
2. 若存在函数 $f$，使得 $\nabla f=\boldsymbol{v}$，则称 $f$ 为 $\boldsymbol{v}$ 的势函数。

**一个很重要的定理**

$$\boldsymbol{v}\text{ 是保守场}\quad\Longleftrightarrow\quad \oint_L \boldsymbol{v}\cdot\mathrm d\boldsymbol{l}=0\quad\Longleftrightarrow\quad \exists f,\ \nabla f=\boldsymbol{v}.$$

$$\textbf{保守场}\Longleftrightarrow\textbf{闭合路径积分为 }0\Longleftrightarrow\textbf{有势函数}.$$

由此带来一个很好的性质，若 $\boldsymbol{v}=\nabla f$，则

$$\int_{(x_0,y_0,z_0)}^{(x_1,y_1,z_1)}\boldsymbol{v}\cdot\mathrm d\boldsymbol{l}=f(x_1,y_1,z_1)-f(x_0,y_0,z_0).$$

**无视路径，只做端点函数值相减。**

既然势函数这么好，那**如何验证一个场是不是保守场？** [16.6.1-3](https://tutorial.math.lamar.edu/Problems/CalcIII/ConservativeVectorField.aspx) **如何求势函数？** [16.6.4-7](https://tutorial.math.lamar.edu/Problems/CalcIII/ConservativeVectorField.aspx)

先回答第一个问题。对于二维平面内的复连通区域和三维空间的线连通区域，**有势场 $\Longleftrightarrow$ 保守场 $\Longleftrightarrow$ 无旋场（$\nabla\times\boldsymbol{v}=\boldsymbol{0}$）**。

若是二维情况，$\boldsymbol{v}=(P,Q)$，旋度为 $\boldsymbol{0}$ 就是

$$\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=0.$$

再看第二个问题，如何找势函数。方法一般就是偏积分法。例如已知

$$f_x=6x^2-2xy^2+\frac{y}{2\sqrt x},\qquad f_y=-2x^2y+4+\sqrt x.$$

由 $f_x$ 对 $x$ 积分：

$$f=2x^3-x^2y^2+\sqrt x\,y+g(y)+C_1.$$

由 $f_y$ 对 $y$ 积分：

$$f=-x^2y^2+4y+\sqrt x\,y+h(x)+C_2.$$

公共项是：

$$-x^2y^2,\sqrt x\,y,$$

可直接放到最后的函数中，第一行非公共项 $2x^3$ 对应第二行的 $h(x)$，同理第二行非公共项 $4y$ 对应第一行的 $g(y)$，于是综合起来：

$$f=-x^2y^2+\sqrt x\,y+2x^3+4y+C.$$

## Green's Theorem [16.7](https://tutorial.math.lamar.edu/Problems/CalcIII/GreensTheorem.aspx)

Green's Theorem 的作用：

$$\textbf{化（闭合）曲线积分为二重积分}.$$

对于闭合曲线 $\partial D$ 上的第二类曲线积分

$$\oint_{\partial D}(P,Q)\cdot\boldsymbol{\tau}\,\mathrm d l\overset{\mathrm{def}}=\oint_{\partial D}P\,\mathrm d x+Q\,\mathrm d y.$$

Green 公式给出

$$\oint_{\partial D}(P,Q)\cdot\boldsymbol{\tau}\,\mathrm d l\overset{\mathrm{def}}=\oint_{\partial D}P\,\mathrm d x+Q\,\mathrm d y=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)\,\mathrm d x\,\mathrm d y.$$

简记写法：

$$\oint_{\partial D}\boldsymbol{v}\cdot\boldsymbol{\tau}\,\mathrm d l=\iint_D \nabla\times\boldsymbol{v}\,\mathrm d x\,\mathrm d y.$$

变形：如果用法向量 $\boldsymbol{n}$，则

$$\oint_{\partial D}(P,Q)\cdot\boldsymbol{n}\,\mathrm d l=\iint_D\left(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}\right)\,\mathrm d x\,\mathrm d y.$$

简记法：

$$\oint_{\partial D}\boldsymbol{v}\cdot\boldsymbol{n}\,\mathrm d l=\iint_D \nabla\cdot\boldsymbol{v}\,\mathrm d x\,\mathrm d y.$$

**注意积分方向！** 平面上默认逆时针是曲线正向前进方向，所以例子 [16.7.3](https://tutorial.math.lamar.edu/Problems/CalcIII/GreensTheorem.aspx) 需要加负号！

## Divergence Theorem

Divergence Theorem 又叫 Gauss's Theorem。它本质上就是把 Green 公式推广到三维场景。

先 review Green 的法向量版本：

$$\oint_{\partial D}\boldsymbol{v}\cdot\boldsymbol{n}\,\mathrm d l=\iint_D\nabla\cdot\boldsymbol{v}\,\mathrm d x\,\mathrm d y.$$

Gauss / Divergence Theorem:

$$\iint_{\partial\Omega}\boldsymbol{v}\cdot\boldsymbol{n}\,\mathrm d S=\iiint_\Omega \nabla\cdot\boldsymbol{v}\,\mathrm d x\,\mathrm d y\,\mathrm d z.$$

思想就是**化曲面积分为三重积分**。

## Stokes Theorem

还记得 Green's Theorem 在二维中有两种形式：

$$(1)\qquad \oint_{\partial D}\boldsymbol{v}\cdot\boldsymbol{\tau}\,\mathrm d l=\iint_D \nabla\times\boldsymbol{v}\,\mathrm d x\,\mathrm d y,$$

$$(2)\qquad \oint_{\partial D}\boldsymbol{v}\cdot\boldsymbol{n}\,\mathrm d l=\iint_D \nabla\cdot\boldsymbol{v}\,\mathrm d x\,\mathrm d y.$$

这两个式子本质上都是二维平面里的**曲线积分**和**二重积分**之间的转换。

现在问：**推广到三维空间会发生什么？**

从法向量版本 (2) 推广，就得到 Divergence Theorem:

$$\iint_{\partial\Omega}\boldsymbol{v}\cdot\boldsymbol{n}\,\mathrm d S=\iiint_{\Omega}\nabla\cdot\boldsymbol{v}\,\mathrm d x\,\mathrm d y\,\mathrm d z.$$

这就是**化空间中的曲面积分为三重积分**。

从切向量版本 (1) 推广，就得到 Stokes Theorem:

$$\oint_{\partial S}\boldsymbol{v}\cdot\boldsymbol{\tau}\,\mathrm d l=\iint_S(\nabla\times\boldsymbol{v})\cdot\mathrm d\boldsymbol{S}=\iint_S(\nabla\times\boldsymbol{v})\cdot\boldsymbol{n}\,\mathrm d S.$$

这就是

$$\textbf{Stokes 公式：化空间中的曲线积分为曲面积分。}$$

具体来说，若

$$\boldsymbol{v}=(P,Q,R),$$

则

$$\oint_{\partial S}P\,\mathrm d x+Q\,\mathrm d y+R\,\mathrm d z$$

$$=\iint_S\left(\frac{\partial R}{\partial y}-\frac{\partial Q}{\partial z}\right)\mathrm d y\wedge\mathrm d z+\left(\frac{\partial P}{\partial z}-\frac{\partial R}{\partial x}\right)\mathrm d z\wedge\mathrm d x+\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)\mathrm d x\wedge\mathrm d y.$$

这里右边其实就是

$$\iint_S(\nabla\times\boldsymbol{v})\cdot\mathrm d\boldsymbol{S}.$$

实际上，这些公式理论上可以双向使用，但基本只考正向使用。

$$\text{空间中不好算的闭合曲面积分}\xrightarrow{\text{Divergence}}\text{好算的三重积分}.$$

$$\text{空间中不好算的闭合曲线积分}\xrightarrow{\text{Stokes}}\text{好算的曲面积分}.$$

当然也有，但比较少见：

$$\text{不好算的三重积分}\xrightarrow{\text{凑成Divergence逆用}}\text{好算的闭合曲面积分}.$$

$$\text{不好算的曲面积分}\xrightarrow{\text{凑成Stokes逆用}}\text{好算的闭合曲线积分}.$$

**注意方向！** $\partial S$ 是曲面 $S$ 的边界曲线，曲线正方向要和曲面的法向量方向匹配。判断时用右手法则：右手大拇指指向 $\boldsymbol{n}$，四指弯曲的方向就是 $\partial S$ 的正方向。

p.s. Stokes 公式要求比较低，记住公式形状即可，考的较少。
