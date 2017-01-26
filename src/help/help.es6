import $ from 'jquery';
import windows from 'windows/windows';
import rv from 'common/rivetsExtra';
import html from 'text!help/help.html';
import 'css!help/help.css';

"use strict";

var win = null;
const init = () => {
	var $html = $(html);
	win = windows.createBlankWindow($("<div class='help-dialog'/>"), {
		title: "Help",
        width: 850,
        height: 400,
        resizable: false,
        minimizable: true,
        maximizable: true,
        modal: false,
        ignoreTileAction:true,
        close: () => {
          win.dialog('destroy');
          win.remove();
          win = null;
        },
        destroy: () => {
          win_view && win_view.unbind();
          win_view = null;
        }
	});

	var state = {
		current: {
			list: null,
			sublist: null,
			content_page: null,
			content: null
		},
		list:[
			{
				text: "About Binary.com",
				sublist_id: "about_us"
			},
			{
				text: "Getting started",
				sublist_id: ""
			},
			{
				text: " Types of trades",
				sublist_id:""
			},
			{
				text: "Indicators",
				sublist_id: ""
			},
			{
				text: "FAQ",
				sublist_id: ""
			},
			{
				text: "Glossary",
				sublist_id: ""
			}
		],
		sublist: {
			about_us: [
				{
					text: "About us",
					url: "About-us.html"
				},
				{
					text: "Group history",
					url: "Group-history.html"
				}
			]
		}
	};

	state.updateSublist = (list) => {
		state.current.list = list;
		state.current.sublist = state.sublist[list.sublist_id];
		state.current.content_page = null;
		state.current.content = null;
	};

	state.getContent = (url) => {
		state.current.content_page = url;
		require(['text!help/'+url],(content) => {
			state.current.content = content;
			//Change links in content to open in new tab.
			$(".help-dialog .content").find("a").each((i, node)=>{
				$(node).attr('target','_blank');
			});
		});
	};

	//Show the about us page initially
	state.current.list = state.list[0];
	state.updateSublist(state.current.list);
	state.current.content_page = state.sublist[state.current.list.sublist_id][0].url;
	state.getContent(state.current.content_page);

	$html.appendTo(win);
	var win_view = rv.bind(win[0], state);
    win.dialog('open');
};

export const init_help = (elem) => {
	elem.click(()=>{
		if(!win)
			init();
		else 
			win.moveToTop();
	});
};

export default {
	init_help
}