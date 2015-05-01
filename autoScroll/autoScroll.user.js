// ==UserScript==
// @name            滚动到指定位置
// @namespace       hzhz03371950@gmail.com
// @description     随心定制规则，指定网站滚到指定位置，再也不用看那些“垃圾内容”。
// @version         beta 0.3.5
// @author          Kelo
// @icon            https://raw.githubusercontent.com/GH-Kelo/userscript/master/autoScroll/img/autoScroll.png
// @include         *
// @grant           GM_openInTab
// @run-at          document-start
// @note            2015.3.3  beta 0.1.0 简单修改自http://bbs.kafan.cn/thread-1795464-1-1.html，加入循环（不影响网页加载），使用“document-start”，在网页加载完前即滚动，更加迅速。
// @note            2015.3.4  beta 0.1.1 修复V1.0循环问题。
// @note            2015.3.4  beta 0.1.5 更新至1.5大幅度优化代码、代码逻辑，增加显示错误功能，更快的速度。
// @note            2015.3.4  beta 0.1.6 简单增加存储网址，判断是否为刷新(刷新即不滚屏)。(有待完善)
// @note            2015.3.4  beta 0.1.7 简单完善存储，优化代码。(自用)
// @note            2015.3.4  beta 0.2.0 增加上下调整参数，为存储增加开关(默认false)。
// @note            2015.3.14 beta 0.2.5 增加桌面通知报错，第一次需要允许。
// @note            2015.4.26 beta 0.3.0 优化代码，删除存储，目前办不到，以后考虑添加。
// @note            2015.4.29 beta 0.3.1 优化代码，增加了全新的存储功能(使用GM_getValue和GM_setValue)。
// @note            2015.4.30 beta 0.3.5 优化代码，改进了全新的存储功能(使用localStorage)。
// @note            会对网页加载速度有一定影响，但并不大，在承受范围内。注意：一般默认参数优先级低于prefs。
// ==/UserScript==
(function () {
  //===============自定义设置区 Settings=============
  //========默认设置========
  //*** pref中如未定义则用这里的设置 ***
  var delay      = 0,
      times      = [1,100],
      isStandby  = false, 
      adjustment = 0,
      isSave     = true;                        //存储功能。判断是否刷新，刷新则不滚动。
  //========自定义设置========
  var prefs = {
    'bdnews': {
      startReg: /http:\/\/news\.baidu\.com/i,   //定义href正则
      element: '#headerwrapper',              //参数为要点击的按钮的css3 selector
      delay: 100,                               //总延迟
      times: [10,10],                           //前为次数，后为间隔，如果没有间隔，就为默认100(单位毫秒)。根据网速设定(在网页加载完前循环)。
      isStandby: true                           //定义是否，等待网页加载完毕后执行滚屏。
    },
    'kafan': {
      startReg: /http:\/\/bbs\.kafan\.cn\/forum-\d+-\d+\.html/i,
      element: '#threadlist',
      height: 1000,                             //不用element，直接定义高度，单位px。
      delay: 100,
    },
    'tieba': {
      startReg: /http:\/\/tieba\.baidu\.com\/f\?kw\=(.*?)/i,
      element: '#tb_nav',
      delay: 0,
      times: [10,10],
      adjustment:55                             //上下微调，+上-下，单位px
    },
     'qqnews': {
      startReg: /http:\/\/news\.qq\.com/i,
      times: [10,100],
      height: 1000,
      isStandby: true
    },
  }
  
  
  //================代码区 Codes====================
  //执行函数
  function init() {
    var site = testUrl();
    if (!site) return;
    var eltOrhit = prefs[site].element || prefs[site].height;
        delay = prefs[site].delay || delay,
        times = prefs[site].times || times,
        isStandby = prefs[site].isStandby || isStandby,
        adjustment = prefs[site].adjustment || adjustment;
    if (isSave) save();
    if (isStandby) 
     document.onreadystatechange = function () {
        if (document.readyState == 'complete') autoScroll(eltOrhit, delay, times, adjustment);
     }
    else autoScroll(eltOrhit, delay, times, adjustment);
  }
  
  function testUrl() {
    var href = window.location.href,
    site = null;
    for (var key in prefs) {
      if (prefs[key].startReg.test(href)) {
        site = key;
        break;
      }
    }
    return site;
  }
  
  function autoScroll(eltOrhit, delay, times, adjustment) {
    if(isSave && (localStorage.getItem('asSaveState') =="fresh")) return;
    var t = 0; //计时器  
    setTimeout(function () {
      var timer = setInterval(function () {
        t = t + 1; //计时器+1
        if (t == times[0]) clearInterval(timer);
        try {
          var height = (typeof eltOrhit == 'string') ? document.querySelector(eltOrhit).offsetTop : eltOrhit;
        } catch (e) {
          if (t == times[0]) showAlert('选择器错误或循环次数过少，请重新检查配置');
          return;
        }
        height = height + adjustment;
        window.scrollTo(0, height);
        console.log("运行了");
        //if (t == times[0]) clearInterval(timer);
      }, times[1]);
    }, delay);
  }
  
  //桌面通知
  function showAlert(aText) {
    //判断能否使用桌面通知
    if (window.Notification) {
      //申请使用桌面通知
      Notification.requestPermission();
      var notification = new Notification('自动滚屏错误：', {
        body: aText,
        icon: 'http://chuantu.biz/t/66/1425447844x-1376440082.png'
      });
      //设置定时撤销机制，防止通知长时间显示不被关闭 
      notification.ondisplay = function (event) {
        setTimeout(function () {
          event.currentTarget.cancel();
        }, 5000);
      };
      notification.onclick = function () {
        window.focus();
      };
    } else alert('你的浏览器不支持此特性，请下载其他浏览器试用该功能');
  }  
  
  function save() {
    window.onunload = function () {
      if (document.documentElement.scrollWidth != 0)
        localStorage.setItem('asSaveState','fresh');   
       else
        localStorage.setItem('asSaveState','close'); 
    }
  }
  
  init(); //开始执行
  
}) ();
