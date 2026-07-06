---
title: "两道有趣的证明题"
date: 2025-04-10
summary: "两道VA2的往年压轴证明题，个人比较喜欢，期末复习之余就研究了一下证明并整理了一下自己的过程。"
tags: [杂文, 数学]
---

## Problem 1 我们分别连续，我们一起连续？

已知函数 $f(x,y)$ 对每个变量 $x$ 和 $y$ 分别连续，且对每个固定的 $x$，函数 $f(x,y)$ 对变量 $y$ 单调。求证 $f(x,y)$ 作为二元函数是连续函数。

**证明.** 考虑点 $(x_0,y_0)$。$\forall \varepsilon>0$，$\exists \delta_1>0$，使得

$$|f(x,y_0)-f(x_0,y_0)|<\varepsilon,\qquad \forall |x-x_0|<\delta_1,$$

并且

$$|f(x_0,y)-f(x_0,y_0)|<\varepsilon,\qquad \forall |y-y_0|<\delta_1.$$

由于 $f$ 在 $y$ 方向上连续且单调，于是我们可以选择 $\frac{\delta_1}{2}$，有

$$f\left(x_0,y_0+\frac{\delta_1}{2}\right)\in [f(x_0,y_0),f(x_0,y_0)+\varepsilon]$$

且

$$f\left(x_0,y_0-\frac{\delta_1}{2}\right)\in [f(x_0,y_0)-\varepsilon,f(x_0,y_0)].$$

于是有 $\delta_2>0$，使得 $\forall |x-x_0|<\delta_2$，

$$\left|f\left(x,y_0+\frac{\delta_1}{2}\right)-f\left(x_0,y_0+\frac{\delta_1}{2}\right)\right|<\varepsilon,$$

$$\left|f\left(x,y_0-\frac{\delta_1}{2}\right)-f\left(x_0,y_0-\frac{\delta_1}{2}\right)\right|<\varepsilon.$$

因此，

$$f\left(x,y_0+\frac{\delta_1}{2}\right)<f\left(x_0,y_0+\frac{\delta_1}{2}\right)+\varepsilon<f(x_0,y_0)+2\varepsilon,$$

$$f\left(x,y_0-\frac{\delta_1}{2}\right)>f\left(x_0,y_0-\frac{\delta_1}{2}\right)-\varepsilon>f(x_0,y_0)-2\varepsilon.$$

于是，$\forall (x,y)\in [x_0-\delta_2,x_0+\delta_2]\times [y_0-\frac{\delta_1}{2},y_0+\frac{\delta_1}{2}]$，

$$\begin{aligned}|f(x,y)-f(x_0,y_0)|&\leq |f(x,y)-f(x,y_0)|+|f(x,y_0)-f(x_0,y_0)|\\&\leq \left|f\left(x,y_0+\frac{\delta_1}{2}\right)-f\left(x,y_0-\frac{\delta_1}{2}\right)\right|+|f(x,y_0)-f(x_0,y_0)|\\&<4\varepsilon+\varepsilon\\&=5\varepsilon.\end{aligned}$$

故 $f(x,y)$ 作为二元函数是连续函数。

## Problem 2 小小域域，我们的连续性

设 $K$ 是 $\mathbb{R}^k$ 的有界闭子集，函数 $f:\mathbb{R}^m\times K\to\mathbb{R}$ 连续，记

$$g(\boldsymbol{x})=\min_{\boldsymbol{y}\in K} f(\boldsymbol{x},\boldsymbol{y}).$$

证明 $g:\mathbb{R}^m\to\mathbb{R}$ 连续。

**证明.** 设

$$g(\boldsymbol{x}_0)=f(\boldsymbol{x}_0,\boldsymbol{y}_0).$$

因为 $f:\mathbb{R}^m\times K\to\mathbb{R}$ 连续，所以 $\forall \varepsilon>0$，$\exists B(\boldsymbol{x}_0,\boldsymbol{y}_0,\delta)$，使得 $\forall(\boldsymbol{x},\boldsymbol{y})\in B(\boldsymbol{x}_0,\boldsymbol{y}_0,\delta)$，有

$$|f(\boldsymbol{x},\boldsymbol{y})-f(\boldsymbol{x}_0,\boldsymbol{y}_0)|<\varepsilon.$$

更进一步，$f:\mathbb{R}^m\times K\to\mathbb{R}$ 在有界闭区域 $B(\boldsymbol{x}_0,\delta)\times K$ 上连续，于是 $f$ 在有界闭区域 $B(\boldsymbol{x}_0,\delta)\times K$ 上一致连续。

考察 $\forall \boldsymbol{x}_1$ 满足 $\|\boldsymbol{x}_1-\boldsymbol{x}_0\|<\delta$，设

$$g(\boldsymbol{x}_1)=f(\boldsymbol{x}_1,\boldsymbol{y}_1).$$

若 $(\boldsymbol{x}_1,\boldsymbol{y}_1)\in B(\boldsymbol{x}_0,\boldsymbol{y}_0,\delta)$，则

$$|g(\boldsymbol{x}_1)-g(\boldsymbol{x}_0)|=|f(\boldsymbol{x}_1,\boldsymbol{y}_1)-f(\boldsymbol{x}_0,\boldsymbol{y}_0)|<\varepsilon,$$

故 $g(\boldsymbol{x})$ 在 $\boldsymbol{x}_0$ 处连续。

若 $(\boldsymbol{x}_1,\boldsymbol{y}_1)\notin B(\boldsymbol{x}_0,\boldsymbol{y}_0,\delta)$，则 $\forall(\boldsymbol{x}_1,\boldsymbol{y})\in B(\boldsymbol{x}_0,\boldsymbol{y}_0,\delta)$，

$$f(\boldsymbol{x}_1,\boldsymbol{y}_1)<f(\boldsymbol{x}_0,\boldsymbol{y}),$$

从而

$$f(\boldsymbol{x}_1,\boldsymbol{y}_1)<f(\boldsymbol{x}_0,\boldsymbol{y})<f(\boldsymbol{x}_0,\boldsymbol{y}_0)+\varepsilon.$$

另一方面，由一致连续性知，

$$|f(\boldsymbol{x}_0,\boldsymbol{y}_1)-f(\boldsymbol{x}_1,\boldsymbol{y}_1)|<\varepsilon.$$

这是因为 $(\boldsymbol{x}_0,\boldsymbol{y}_1)$ 和 $(\boldsymbol{x}_1,\boldsymbol{y}_1)$ 距离也小于 $\delta$，所以

$$f(\boldsymbol{x}_0,\boldsymbol{y}_1)<f(\boldsymbol{x}_1,\boldsymbol{y}_1)+\varepsilon<f(\boldsymbol{x}_0,\boldsymbol{y}_0)+2\varepsilon.$$

由于 $\varepsilon$ 可以任意小，则

$$f(\boldsymbol{x}_0,\boldsymbol{y}_1)<f(\boldsymbol{x}_0,\boldsymbol{y}_0),$$

与前提 $g(\boldsymbol{x}_0)=f(\boldsymbol{x}_0,\boldsymbol{y}_0)$ 矛盾，所以

$$ (\boldsymbol{x}_1,\boldsymbol{y}_1)\in B(\boldsymbol{x}_0,\boldsymbol{y}_0,\delta). $$

综上，$g(\boldsymbol{x})$ 在 $\boldsymbol{x}_0$ 处连续。由于 $\boldsymbol{x}_0$ 的任意性，故 $g(\boldsymbol{x})$ 连续。
