//动态标题
var OriginTitile = document.title;
var titleTime;
var emo = ['o(≧▽≦)o','◕_◕','(•v•)','(っ°Д°;)っ','(ʘ╻ʘ)']
var happy = ['ヾ(≧▽≦*)o','( •̀ ω •́ )✧','(/≧▽≦)/o','((>ω< ))o','( •̀ ω •́ )y']
function getRandomIndex(){
    return Math.floor(Math.random()*10%5);
}
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        //离开当前页面时标签显示内容
        document.title = emo[getRandomIndex()]+'不要走！再看看嘛！';
        clearTimeout(titleTime);
    }
    else {
        //返回当前页面时标签显示内容
        document.title = emo[getRandomIndex()]+'欢迎回来！' + OriginTitile;
        //两秒后变回正常标题
        titleTime = setTimeout(function () {
            document.title = OriginTitile;
        }, 2000);
    }
});