// ==UserScript==
// @name 卡饭头像
// @namespace  https://github.com/GH-Kelo/userscript
// @include http://bbs.kafan.cn/forum-*.html
// @version 1
// @grant none
// ==/UserScript==
(function () { 
	var css = '\
		.GMKaFanAvatar {\
			padding: 2px;\
			margin: auto 5px;\
			float: left;\
			width: auto;\
			height: auto;\
			max-width: 25px;\
			max-height: 25px;\
			background: #FFF none repeat scroll 0% 0%;\
			border-width: 1px;\
			border-style: solid;\
			-moz-border-top-colors: none;\
			-moz-border-right-colors: none;\
			-moz-border-bottom-colors: none;\
			-moz-border-left-colors: none;\
			border-image: none;\
			border-color: #F8F8F8 #CDCDCD #CDCDCD #F8F8F8;\
			border-radius: 5px;\
		}\
	';
	addStyle(css);
	addAvatar(); 
	
	function addAvatar() {
		var list = document.querySelectorAll('tbody > tr > td.by:nth-child(3) > cite > a');
		for (let i in list) {
			var _list = list[i];
			if (!_list.href || _list.hasAttribute("avatarIndex")) continue;
			_list.setAttribute('avatarIndex', i);
			var img = document.createElement('img');
			img.setAttribute('class', 'GMKaFanAvatar');
			img.setAttribute('src', getAvatar(_list.href));
			_list.parentNode.parentNode.insertBefore(img, _list.parentNode);
		}
	}
	
	// like http://www.kafan.cn/space-uid-968453.html → http://b.ikafan.com/000/96/84/53_avatar_middle.jpg
	function getAvatar(src) {
		var uid = src.split('-')[2].split('.')[0];
		if (uid.length < 6) uid = '000000'.substring(uid.length) + uid;
		var uidArr = uid.match(/\d{2}/g);
		var avatarSrc = 'http://b.ikafan.com/000/' + uidArr[0] + '/' + uidArr[1] + '/' + uidArr[2] + '_avatar_small.jpg';
		return avatarSrc;
	}
	
	function addStyle(css) {
		document.head.appendChild(document.createElement('style')).textContent = css;
	}
	
	var timer;
	document.addEventListener("scroll", (event) => {
		clearTimeout(timer)
		timer = setTimeout(addAvatar, 500);
	}, false);
	document.addEventListener("click", (event) => {
		clearTimeout(timer)
		timer = setTimeout(addAvatar, 500);
	}, false)
})();