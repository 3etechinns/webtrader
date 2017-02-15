define(["exports","jquery","windows/windows","common/rivetsExtra","text!help/help.html","text!help/content.html","css!help/help.css"],function(a,b,c,d,e,f){"use strict";function g(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(a,"__esModule",{value:!0}),a.showSpecificContent=a.init_help=void 0;var h=g(b),i=g(c),j=g(d),k=g(e),l=g(f),m=null,n=[],o=function(){var a=h["default"](k["default"]),b=h["default"](l["default"]);b.find("a").each(function(a,b){-1==h["default"](b).attr("href").indexOf("contract-period")&&h["default"](b).attr("target","_blank")}),m=i["default"].createBlankWindow(h["default"]("<div class='help-dialog'/>"),{title:"Help",width:850,height:400,resizable:!0,minimizable:!0,maximizable:!0,modal:!1,ignoreTileAction:!0,close:function(){m.dialog("destroy"),m.remove(),m=null,n=[]},destroy:function(){r&&r.unbind(),n=[],r=null}});var c={current:{list:null,loading:!1,sublist:null,content_page:null,content:null},list:[{text:"About Binary.com".i18n(),sublist_id:"about_us"},{text:"Getting started".i18n(),sublist_id:"getting_started"},{text:" Types of trades".i18n(),sublist_id:"trade_types"},{text:"Indicators".i18n(),sublist_id:"indicators"},{text:"FAQ".i18n(),sublist_id:"faq"},{text:"Glossary".i18n(),sublist_id:"glossary"}],sublist:{about_us:[{text:"About us".i18n(),id:"about-us"},{text:"Group history".i18n(),id:"group-history"}],getting_started:[{text:"Why choose Binary Trading".i18n(),id:"why-binary"},{text:"Benefits of Binary Trading".i18n(),id:"binary-benefits"},{text:"How to trade Binaries".i18n(),id:"trade-binaries"}],trade_types:[{text:"Up/Down".i18n(),id:"up-down"},{text:"Touch/No Touch".i18n(),id:"touch-no-touch"},{text:"In/Out".i18n(),id:"in-out"},{text:"Asians".i18n(),id:"asians"},{text:"Digits".i18n(),id:"digits"},{text:"Spreads".i18n(),id:"spreads"}],indicators:[{text:"Volatility Indicators".i18n(),id:"volatility-indicators"},{text:"Overlap Studies".i18n(),id:"overlap-studies"},{text:"Momentum Indicators".i18n(),id:"momentum-indicators"},{text:"Price Transformation".i18n(),id:"price-transformation"},{text:"Statistical Functions".i18n(),id:"statistical-functions"},{text:"Pattern Recognition".i18n(),id:"pattern-recognition"},{text:"Bill Williams".i18n(),id:"bill-williams"}],faq:[{text:"Opening an account".i18n(),id:"opening-account"},{text:"Financial Security".i18n(),id:"financial-security"},{text:"Depositing and withdrawing funds".i18n(),id:"deposit-withdraw"},{text:"Learning to trade".i18n(),id:"learn-trade"}],glossary:[{text:"Barrier(s)".i18n(),id:"barriers"},{text:"Binary option".i18n(),id:"binary-option"},{text:"Commodities".i18n(),id:"commodities"},{text:"Contract period".i18n(),id:"contract-period"},{text:"Derivative".i18n(),id:"derivative"},{text:"Duration".i18n(),id:"duration"},{text:"Ends Between/Ends Outside trades".i18n(),id:"ends-between"},{text:"Entry spot price".i18n(),id:"entry-spot"},{text:"Expiry price".i18n(),id:"expiry-price"},{text:"Forex".i18n(),id:"forex"},{text:"GMT".i18n(),id:"gmt"},{text:"Higher/Lower trades".i18n(),id:"h_l-trades"},{text:"Indices".i18n(),id:"indices"},{text:"In/Out trades".i18n(),id:"i_o-trades"},{text:"Market exit price".i18n(),id:"m_exit-price"},{text:"No Touch trades".i18n(),id:"no-touch-trades"},{text:"(One) Touch trades".i18n(),id:"touch-trades"},{text:"Payout".i18n(),id:"payout"},{text:"Pip".i18n(),id:"pip"},{text:"Profit".i18n(),id:"profit"},{text:"Volatility Indices".i18n(),id:"volatility-indices"},{text:"Resale price".i18n(),id:"resale-price"},{text:"Return".i18n(),id:"return"},{text:"Rise/Fall trades".i18n(),id:"r_f-trades"},{text:"Sell option".i18n(),id:"sell-option"},{text:"Spot price".i18n(),id:"spot-price"},{text:"Stake".i18n(),id:"stake"},{text:"Stays Between/Goes Outside trades".i18n(),id:"stays-between-goes-outside-trades"},{text:"Tick".i18n(),id:"tick"},{text:"Underlying".i18n(),id:"underlying"}]}};c.updateSublist=function(a){c.current.list=a,c.current.sublist=c.sublist[a.sublist_id],c.getContent(c.current.sublist[0].id)},c.getContent=function(a){c.current.content_page=a,c.current.content=h["default"]("<div/>").append(b.filter("#"+a))[0].innerHTML,h["default"](".content").animate({scrollTop:0},500),h["default"](document).find("a[href$='#contract-period']").click(function(){return c.openSublist("contract period"),!1})},c.search=function(a){var b=h["default"](a.target).val().toLowerCase();if(b.length>0){c.current.list=null,c.current.content_page=null,c.current.sublist=n.filter(function(a){return-1!=a.text.toLowerCase().indexOf(b)});var d=_.flow(p,q);c.current.content=d(b),c.current.content&&h["default"](".help-dialog .content .items").find("a").each(function(a,b){b.onclick=function(a){c.openSublist(h["default"](a.target).text())}})}},c.openSublist=function(a){c.current.list=null,c.current.sublist=n.filter(function(b){return-1!=b.text.toLowerCase().indexOf(a.toLowerCase())}),c.current.sublist&&c.current.sublist.length&&c.getContent(c.current.sublist[0].id)};for(var d in c.sublist)n=n.concat(c.sublist[d]);for(var e=[],f=document.createTreeWalker(h["default"]("<div/>").append(b)[0],NodeFilter.SHOW_ELEMENT,function(a){return"DIV"==a.tagName?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP},!1),g=function(){o={},o.section=n.filter(function(a){return a.id==h["default"](f.currentNode).attr("id")})[0];var a=h["default"](f.currentNode).children();o.subSection=a.map(function(b,c){return"H3"===c.nodeName&&"P"===a[b+1].nodeName&&a[b+1].innerText?{title:c.innerText,description:a[b+1].innerText}:null}).get(),o.text=h["default"](f.currentNode)[0].innerText,e.push(o)};f.nextNode();){var o;g()}var p=function(a){var b=JSON.parse(JSON.stringify(e)),c=b.reduce(function(b,c){var d=c.subSection.reduce(function(b,d){return d.title&&-1!=d.title.toLowerCase().indexOf(a)&&d.description.replaceAll("\n","")?(c.text=c.text.replace(d.title,"").replace(d.description,""),b+"<strong>"+d.title+"</strong><p>"+d.description+"</p>"):b},"");if(d){var e="<a href='#'><h3>"+c.section.text+"</h3></a>"+d;b=b?b+"<hr>"+e:e}return b},"");return{query:a,content:c?c:"",array:b}},q=function(a){var b=a.array.reduce(function(b,c){var d=c.text.toLowerCase().indexOf(a.query);if(-1!=d){var e=c.text.substr(d,100).replaceAll("\n","<br>"),f="<a href='#'><h3>"+c.section.text+"</h3></a><p>..."+e+"...</p>";b=b?b+"<hr>"+f:f}return b},"");return'<div class="search-text">'+(a.content&&b?a.content+"<hr>":a.content)+b+"</div>"};c.current.list=c.list[0],c.updateSublist(c.current.list),c.current.content_page=c.sublist[c.current.list.sublist_id][0].id,c.getContent(c.current.content_page),a.appendTo(m);var r=j["default"].bind(m[0],c);m.dialog("open")},p=a.init_help=function(a){a.click(function(){m?m.moveToTop():o()})},q=a.showSpecificContent=function(a){m?m.moveToTop():o(),h["default"](".help-search").val(a).trigger("input")};a["default"]={init_help:p,showSpecificContent:q}});