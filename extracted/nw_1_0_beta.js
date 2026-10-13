//var gui = require('nw.gui');
//var win = gui.Window.get();
var new_win = gui.Window.open('http://zhipu.lezhi99.com/zhipu-nw',{
		"title": "���Ѽ���",
		"icon": "icon/fanqie.png",
		"toolbar": false, 
		"width": 1100,
		"height": 680,
		"resizable":true,
		"show_in_taskbar":true,
		"frame":false,
		//"transparent":true,
		"kiosk":false,
		"show":false
	});

setTimeout(function(){
	new_win.show();
	new_win.focus();
	win.close();
	//new_win.setTransparent(true);
},5000);