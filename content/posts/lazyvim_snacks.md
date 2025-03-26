+++
title = 'Eat Some LazyVim Snacks'
date = 2024-11-20T19:22:08+08:00
draft = false
tags = ['vim','lazyvim','snacks.nvim']
categories = ['vim']
+++

## How to install color scripts and hub?

### Hub can be install by using brew

On MacOS you can install hub by using brew:

```
brew install hub
```

### Color scripts can be installed by [shell-color-scripts](https://gitlab.com/dwt1/shell-color-scripts)

```bash
git clone https://gitlab.com/dwt1/shell-color-scripts.git
cd shell-color-scripts
sudo make install

# optional for Removal
sudo make uninstall

# optional for zsh completion
sudo cp completions/_colorscript /usr/share/zsh/site-functions

# optional for fish shell completion
sudo cp completions/colorscript.fish /usr/share/fish/vendor_completions.d

```
