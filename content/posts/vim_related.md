+++
title = 'Vim 相关技巧| Vim Tricks'
date = 2024-11-15T16:57:31+08:00
draft = false
tags = ['vim','tricks']
categories = ['vim']
+++

## Vim 相关技巧

> 收集一些常用的 Vim 相关技巧，包括插件、快捷键、命令等。(using lazyvim)

### Nice Motion

- `f{char}`: 移动到下一个 `{char}` 出现的位置, 类似于 `t{char}`
- `F{char}`: 移动到上一个 `{char}` 出现的位置, 类似于 `T{char}`
- `;` 和 `,`: 重复上一次的 f, F, t, T 命令

### Plugins

- lualine: vscode like status line
- gitblame: show git blame history
-

### Keymaps

#### 1. todo-comments keymaps

|Key|Description|Mode|
|<leader>st | Todo |n|
|<leader>sT (not working)| Todo/Fix/Fixme |n|
|<leader>xt (not working)| Todo (Trouble) |n|
|<leader>xT | Todo/Fix/Fixme (Trouble) |n|
|`[t` | Previous Todo Comment |n|
|`]t` | Next Todo Comment |n|

### Issues

#### 1. bug: Floating terminal is now static at bottom! #4740

现在 lazyvim 默认的终端位置在底部，你可以通过设置
[bug: Floating terminal is now static at bottom! #4740](https://github.com/LazyVim/LazyVim/issues/4740)

### 2

## References

### Articles

1.[boost-your-coding-speed-with-vim-tricks](https://www.barbarianmeetscoding.com/boost-your-coding-fu-with-vscode-and-vim) 2.[lazyvim.org](https://lazyvim.org/)

### Videos

1.[Lazy vim zero to ide](https://www.youtube.com/watch?v=N93cTbtLCIM)

### Books

1.[Practical Vim](https://digtvbg.com/files/LINUX/Practical%20Vim%20-%20Drew%20Neil_1241.pdf) 2. [LazyVim for Ambitious Developers](https://lazyvim-ambitious-devs.phillips.codes/)

> This book shows how to config lazyvim to be a powerful IDE. 3. ...
