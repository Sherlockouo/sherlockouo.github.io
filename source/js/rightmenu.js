let sherlockmenu = {};
 let selection = ""
window.addEventListener("mouseup",function(){
  // window.copyValue = window.getSelection().toString()
  selection = window.getSelection().toString()
})
sherlockmenu.showRightMenu = function (isTrue, x = 0, y = 0) {
  let $rightMenu = $("#rightMenu");
  $rightMenu.css("top", x + "px").css("left", y + "px");

  if (isTrue) {
    $rightMenu.show();
  } else {
    $rightMenu.hide();
  }
};
let mark = true;
let rmWidth = $("#rightMenu").width();
let rmHeight = $("#rightMenu").height();
window.oncontextmenu = function (event) {
  let pageX = event.clientX + 10; //加10是为了防止显示时鼠标遮在菜单上
  let pageY = event.clientY;

  // 鼠标默认显示在鼠标右下方，当鼠标靠右或考下时，将菜单显示在鼠标左方\上方
  if (pageX + rmWidth > window.innerWidth) {
    pageX -= rmWidth;
  }
  if (pageY + rmHeight > window.innerHeight) {
    pageY -= rmHeight;
  }
  if (mark) {
    sherlockmenu.showRightMenu(true, pageY, pageX);
    return false;
  } else {
    return true;
  }
};

window.onclick = function () {
  sherlockmenu.showRightMenu(false);
}; //隐藏菜单

$("#menu-backward").on("click", function () {
  window.history.back();
});
$("#menu-forward").on("click", function () {
  window.history.forward();
});
$("#menu-refresh").on("click", function () {
  window.location.reload();
});

sherlockmenu.switchDarkMode = function () {
  const nowMode =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  if (nowMode === "light") {
    activateDarkMode();
    saveToLocal.set("theme", "dark", 2);
    GLOBAL_CONFIG.Snackbar !== undefined &&
      btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night);
  } else {
    activateLightMode();
    saveToLocal.set("theme", "light", 2);
    GLOBAL_CONFIG.Snackbar !== undefined &&
      btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day);
  }
  // handle some cases
  typeof utterancesTheme === "function" && utterancesTheme();
  typeof FB === "object" && window.loadFBComment();
  window.DISQUS &&
    document.getElementById("disqus_thread").children.length &&
    setTimeout(() => window.disqusReset(), 200);
};

sherlockmenu.switchReadMode = function () {
  const $body = document.body;
  $body.classList.add("read-mode");
  const newEle = document.createElement("button");
  newEle.type = "button";
  newEle.className = "fas fa-sign-out-alt exit-readmode";
  $body.appendChild(newEle);

  function clickFn() {
    $body.classList.remove("read-mode");
    newEle.remove();
    newEle.removeEventListener("click", clickFn);
  }

  newEle.addEventListener("click", clickFn);
};

sherlockmenu.copySelected = function () {
  let str = selection
  try {
    return navigator.clipboard
      .writeText(str)
      .then(() => {
        btf.snackbarShow("已复制选中文本");
        return Promise.resolve();
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  } catch (e) {
    const input = document.createElement("input");
    input.setAttribute("readonly", "readonly");
    document.body.appendChild(input);
    input.setAttribute("value", str);
    input.select();
    try {
      let result = document.execCommand("copy");
      document.body.removeChild(input);
      if (!result || result === "unsuccessful") {
        return Promise.reject("复制文本失败!");
      } else {
        btf.snackbarShow("已复制选中文本");
        return Promise.resolve();
      }
    } catch (e) {
      document.body.removeChild(input);
      return Promise.reject(
        "当前浏览器不支持复制功能，请检查更新或更换其他浏览器操作!"
      );
    }
  }
};

// 返回顶部
sherlockmenu.backToTop = function () {
  // for Safari
  document.body.scrollTop = 0;
  // for chrome, edge ...
  document.documentElement.scrollTop = 0;
};

sherlockmenu.RemoveRightMenu = function () {
  sherlockmenu.showRightMenu(!1),
    $("#rightMenu").attr("style", "display: none");
  mark = false;
};

sherlockmenu.openLink = function(){
    // todo
}

$("#menu-copySelected").on("mousedown", sherlockmenu.copySelected);
// $("#menu-copySelected").on("mouseover", sherlockmenu.copySelected);
$("#menu-darkmode").on("click", sherlockmenu.switchDarkMode);
$("#menu-link").on("click", sherlockmenu.openLink);
$("#menu-readmode").on("click", sherlockmenu.switchReadMode);
$("#menu-home").on("click", function () {window.location.href = window.location.origin;});
$("#menu-backTop").on("click", function () {
  sherlockmenu.backToTop();
});
$("#menu-exit").on("click", function () {
  sherlockmenu.RemoveRightMenu();
});

sherlockmenu.switchTheme=function(load=false){
    //空字符串表示butterfly原版主题（即不加载css）
    //FallGuys.css是我自己的魔改主题，需替换
    let themes = ['FallGuys.css',''];
    let vTheme = parseInt(localStorage.getItem('visitor-theme'));
    if(!vTheme){
        vTheme = load?0:1;
    }else{
        vTheme += load?0:1;
        vTheme%=themes.length;
    }
    localStorage.setItem('visitor-theme',vTheme)
    let themesrc = ''
    if(themes[vTheme]){
        themesrc += window.location.origin+'/css/dorakika/'+themes[vTheme];
    }
    //css引入时link标签添加属性tag="theme"
    $(document.head).find('[tag="theme"]')[0].href = themesrc;
};

// window.onload = function(){sherlockmenu.switchTheme(true);}
