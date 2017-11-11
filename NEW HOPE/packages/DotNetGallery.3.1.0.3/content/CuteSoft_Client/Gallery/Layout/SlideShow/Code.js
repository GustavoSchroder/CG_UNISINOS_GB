
function GalleryLayout(gb)
{
	this.Browser=gb;
	
	this.TOOLBARHEIGHT=30;
	// unknown bug , do not use this.dng_toolbar.offsetHeight
	
	this.dng_container=this.Browser.FindElement("dng_container");
	
	this.dng_topinfo=this.Browser.FindElement("dng_topinfo");
	this.dng_topinfoname=this.Browser.FindElement("dng_topinfoname");
	this.dng_topinfoindex=this.Browser.FindElement("dng_topinfoindex");
	
	this.dng_photo1=this.Browser.FindElement("dng_photo1");
	this.dng_photo2=this.Browser.FindElement("dng_photo2");
	this.dng_tabcontainer=this.Browser.FindElement("dng_tabcontainer");
	
	this.dng_toolbar=this.Browser.FindElement("dng_toolbar");
	
	this.dng_btn_config=this.Browser.FindElement("dng_btn_config");
	this.dng_btn_prev=this.Browser.FindElement("dng_btn_prev");
	this.dng_btn_next=this.Browser.FindElement("dng_btn_next");
	this.dng_btn_play=this.Browser.FindElement("dng_btn_play");
	this.dng_btn_slider=this.Browser.FindElement("dng_btn_slider");
	
	
	this.dng_btn_config.src=this.Browser.GetTheme("Images/standard-config.png");
	this.dng_btn_prev.src=this.Browser.GetTheme("Images/standard-pageprev.png");
	this.dng_btn_next.src=this.Browser.GetTheme("Images/standard-pagenext.png");
	this.dng_btn_play.src=this.Browser.GetTheme("Images/standard-slider-play.png");
	this.dng_btn_slider.src=this.Browser.GetTheme("Images/standard-slider.png");
	
	//so the ToggleFullPage could be override.
	this.dng_btn_slider.onclick=ToDelegate(this,function(){ this.ToggleFullPage(); });
	
	this.dng_btn_config.onclick=ToDelegate(this,this.ShowConfig);
	this.dng_btn_play.onclick=ToDelegate(this,this.TogglePlay);
	
	this.dng_toolbar.onmouseover=ToDelegate(this,this.ToolbarMouseOver)
	this.dng_toolbar.onmouseout=ToDelegate(this,this.ToolbarMouseOut)
	this.dng_toolbar.onclick=function(e)
	{
		e=window.event||e;
		e.cancelBubble=true;
	}
	
	this.dng_container.onclick=ToDelegate(this,this.LayoutClick);
	this.dng_container.onmousemove=ToDelegate(this,this.LayoutMouseMove);
	this.dng_container.onmouseout=ToDelegate(this,this.LayoutMouseOut);

	var uploadercontainer=this.Browser.GetUploaderContainer();
	if(uploadercontainer)
	{
		uploadercontainer.style.display="none";
	}
	
	this.playing=false;
	this._speed=5.0;

	this._categories=this.Browser.GetCategories();
	

	function IsNotVisible(n)
	{
		if(window.getComputedStyle)
		{
			var s=window.getComputedStyle(n,null);
			if(s.getPropertyValue("display")=="none")
				return true;
			if(s.getPropertyValue("visibility")=="hidden")
				return true;
		}
		else
		{
			var s=n.currentStyle||n.style;
			if(s.display=="none")
				return true;
			if(s.visibility=="hidden")
				return true;
		}
		return false;
	}
	
	var initfunc=ToDelegate(this,function(){
	
		for(var vn=this.dng_container;vn&&vn.style;vn=vn.parentNode)
			if(IsNotVisible(vn))
				return setTimeout(initfunc,100);
		
		this.DrawUI();
	
		var photos=[];
		for(var i=0;i<this._categories.length;i++)
		{
			photos=photos.concat(this._categories[i].Photos);
		}
		if(photos.length>0)
		{
			this.TogglePlay();
			
			this.ShowPhoto(photos[0]);
		}
		
		var thisAdjustLayout=ToDelegate(this,this.AdjustLayout);
		function onwindowresize()
		{
			//need adjust twice..
			thisAdjustLayout();
			setTimeout(thisAdjustLayout,100);
		}
		
		if(window.attachEvent)
		{
			window.attachEvent("onresize",onwindowresize);
			document.attachEvent("onkeydown",ToDelegate(this,this.HandleKeyDown));
		}
		else
		{
			window.addEventListener("resize",onwindowresize,false);
			document.addEventListener("keydown",ToDelegate(this,this.HandleKeyDown),false);
		}
		
		this.AdjustLayout();
		
	})
	
	setTimeout(initfunc,100);
}

GalleryLayout.prototype.DrawUI=function _GalleryLayout_DrawUI()
{
	this.dng_tabcontainer.innerHTML="";

	var div=document.createElement("DIV");
	
	this._wheeldiv=div;

	div.className="GalleryPhotoList";
	div.style.position="relative";
	div.style.overflow="hidden";
	div.style.width=this.dng_tabcontainer.offsetWidth-6+"px";
	div.style.height=this.dng_tabcontainer.offsetHeight-6+"px";
	//div.style.height="24px";

	var photos=[];
	for(var i=0;i<this._categories.length;i++)
	{
		photos=photos.concat(this._categories[i].Photos);
	}
	
	var nobr=document.createElement("NOBR");
	nobr.style.display="block";
	nobr.style.width=photos.length*40+"px";
	nobr.style.height="24px";
	div.appendChild(nobr);

	this.items=[];
	
	for(var i=0;i<photos.length;i++)
	{
		var photo=photos[i];
		
		var item=document.createElement("DIV");
		item.dngphoto=photo;

		item.style.height="24px";
		item.style.display="inline-block";
		item.style.verticalAlign="top";
		
		//var scale = Math.min(48/photo.Width, 24/photo.Height);
		//var imgwidth=Math.floor(photo.Width * scale);
		//var imgheight=Math.floor(photo.Height * scale);
		var imgwidth=32;
		var imgheight=24;
		
		var img=this.CreateItemThumb(photo.Thumbnail,imgwidth,imgheight);
		
		item.style.paddingLeft="2px";
		item.style.paddingRight="2px";
		item.style.width=imgwidth+4+"px";
		
		//if(imgheight<24)
		//{
		//	img.style.marginTop=Math.floor(12-imgheight/2)+"px";
		//}
		item.style.display="inline-block";
		item.style.position="relative";
		item.style.styleFloat="left";
	///	item.style["float"]="right";
		
		item.appendChild(img);
		
		this.AttachItemEvent(item);
		
		nobr.appendChild(item);
		
		this.items.push(item);
	}
	
	this.dng_tabcontainer.appendChild(div);
	
	if(div.scrollWidth > div.offsetWidth)
	{
		var widthfixer=document.createElement("DIV");
		widthfixer.style.position="absolute";
		widthfixer.style.top=widthfixer.style.width=widthfixer.style.height="1px";
		widthfixer.style.left=div.offsetWidth*Math.ceil(photos.length*40/div.offsetWidth)-4+"px";
		div.appendChild(widthfixer);
		
		var scrollbar=document.createElement("DIV");
		this.scrollbar=scrollbar;
		scrollbar.style.position="absolute";
		scrollbar.style.height="1px";
		var sbimg=scrollbar.appendChild(document.createElement("IMG"));
		sbimg.style.display="none";
		sbimg.style.height="1px";
		scrollbar.style.width=Math.floor(div.offsetWidth*div.offsetWidth/div.scrollWidth)-4+"px";
		this.dng_tabcontainer.appendChild(scrollbar);
		var sbpos=CalcPosition(scrollbar,div);
		sbpos.top+=div.offsetHeight+3;
		scrollbar.style.top=sbpos.top+"px";
		scrollbar.style.left=sbpos.left+2+"px";
		scrollbar.className="BlackSliderScrollbar";
		this.SetScrollBarPos=ToDelegate(this,SetScrollBarPos);
	}
	
	function SetScrollBarPos()
	{
		if(!scrollbar)return;
		if(this._isfullpage)
		{
			scrollbar.style.display="none";
			return;
		}

		var sbpos=CalcPosition(scrollbar,div);
		
		scrollbar.style.display="";
		sbpos.top+=div.offsetHeight+3;
		sbpos.left+=Math.floor(div.scrollLeft*div.offsetWidth/div.scrollWidth);
		scrollbar.style.top=sbpos.top+"px";
		scrollbar.style.left=sbpos.left+2+"px";
	}
	
	if(this.nextScrollLeft)
	{
		div.scrollLeft=this.nextScrollLeft;
		SetScrollBarPos();
	}
		
	this.nextScrollLeft=div.scrollLeft;
	
	div.onmousewheel=ToDelegate(this,function(event)
	{
		event=window.event||event;
		
		this.HandleWheel(event.wheelDelta*2);
		
		if(event.preventDefault)event.preventDefault();
		return event.returnValue=false;
	});
	this.dng_btn_prev.onclick=ToDelegate(this,function(){
		this.HandleWheel(div.offsetWidth);
	});
	this.dng_btn_next.onclick=ToDelegate(this,function(){
		this.HandleWheel(-div.offsetWidth);
	});

	clearTimeout(this.wheelTimerid);
	
}
GalleryLayout.prototype.HandleWheel=function _GalleryLayout_HandleWheel(delta)
{

	this.nextScrollLeft-=delta||0;

	this.nextScrollLeft=Math.max(this.nextScrollLeft,0);
	this.nextScrollLeft=Math.min(this.nextScrollLeft,this._wheeldiv.scrollWidth-this._wheeldiv.offsetWidth);

	//find the nearest item:
	if(this.items)
	{
		var nearLeft=-1;
		for(var i=0;i<this.items.length;i++)
		{
			var left=this.items[i].offsetLeft;
			if( Math.abs(left-this.nextScrollLeft) < Math.abs(nearLeft-this.nextScrollLeft) )
				nearLeft=left;
		}
		if(nearLeft!=-1)
			this.nextScrollLeft=nearLeft;
	}
	
	var ContinueMove=ToDelegate(this,function()
	{
		var miss=this.nextScrollLeft-this._wheeldiv.scrollLeft
		miss=Math.floor(miss*5/6-(miss>0?1:-1));
		
		clearTimeout(this.wheelTimerid);

		if(Math.abs(miss)<2)
		{
			this._wheeldiv.scrollLeft=this.nextScrollLeft;
		}
		else
		{
			this._wheeldiv.scrollLeft=this.nextScrollLeft-miss;
			
			this.wheelTimerid=setTimeout(ContinueMove,50);
		}
		if(this.SetScrollBarPos)this.SetScrollBarPos();
	});
	
	ContinueMove();
	
}
GalleryLayout.prototype.CreateItemThumb=function(url,width,height)
{
	// return this.Browser.CreateThumbnail(url,width,height);
	var thumb=GalleryCreateThumbnail(url,width-2,height-2);
	thumb.style.margin="1px";
	var div=document.createElement("DIV");
	div.style.width=width+"px";
	div.style.height=height+"px";
	div.style.display="inline-block";
	div.style.position="relative";
	div.className="GalleryScrollItem";
	var tick=document.createElement("DIV");
	tick.className="GalleryScrollItemTick";
	tick.style.position="absolute";
	tick.style.width=width+"px";
	tick.style.height=height+"px";
	div.appendChild(tick);
	div.appendChild(thumb);
	return div;
}
GalleryLayout.prototype.CreateNewTooltip=function _GalleryLayout_CreateNewTooltip(item,delay)
{
	var tt={};
	var closed=false;
	var photo=item.dngphoto;
	var div=document.createElement("DIV");
	
	var scale = Math.min(128/photo.Width, 128/photo.Height);
	var width=Math.floor(photo.Width * scale);
	var height=Math.floor(photo.Height * scale)
	var thumb=this.Browser.CreateThumbnail(photo.Thumbnail,width,height);
	
	div.style.width=width+"px";
	div.style.height=height+3+"px";
	
	div.appendChild(thumb);
	
	div.className="ZINDEXTOOLTIP";
	div.style.position="absolute";
	div.style.display="none";
	
	InsertToBody(div);
	
	var pos=CalcPosition(div,item);

	pos.top-=height+3;
	pos.left-=Math.floor((width-item.offsetWidth)/2);
	
	div.style.top=pos.top+"px";
	div.style.left=pos.left+"px";
	
	var itemisover=true;
	var divisover=false;
	var checkid;
	var outtime;
	
		
	setTimeout(ToDelegate(this,function(){
		if(closed)return;
		if(!itemisover)
		{
			tt.Close();
			return;
		}
		
		div.style.display="";
		
		for(var i=0;i<6;i++)
		{
			var line=document.createElement("DIV");
			line.style.position="absolute";
			line.style.backgroundColor="#CCCCCC";
			line.style.height="1px";
			line.style.width=i*2+1+"px";
			line.style.top=div.offsetHeight-i+"px";
			line.style.left=div.offsetWidth/2-i+"px";
			line.innerHTML="<img style='display:none;width:1px;height:1px;'/>";
			div.appendChild(line);
		}
		
		checkid=setTimeout(ToDelegate(this,CheckState),100);
		
	}),delay||600);
	
	function CheckState()
	{
		checkid=setTimeout(ToDelegate(this,CheckState),10);
		if(itemisover||divisover)
		{
			outtime=null;
			return;
		}
		
		if(!outtime)
		{
			outtime=new Date().getTime();
			return;
		}
		
		if(new Date().getTime()-outtime>300)
		{
			tt.Close();
		}
	}

	
	div.onmouseover=function()
	{
		divisover=true;
	}
	div.onmouseout=function()
	{
		divisover=false;
	}
	div.style.cursor="pointer";
	div.onclick=ToDelegate(this,function()
	{
		//this.ShowPhoto(photo);
		this.Browser.ShowViewer(photo);
		tt.Close();
	})
	
	tt.Close=ToDelegate(this,function()
	{
		if(closed)return;
		closed=true;
		
		clearTimeout(checkid);
		
		document.body.removeChild(div);
		
		this._currentTooltip=null;
	})
	
	tt.OnItemOver=ToDelegate(this,function(anotheritem)
	{
		itemisover=true;
		if(anotheritem!=item)
		{
			tt.Close();
			this.CreateNewTooltip(anotheritem,10);
		}
	})
	tt.OnItemOut=ToDelegate(this,function(anotheritem)
	{
		itemisover=false;
	})
	
	
	this._currentTooltip=tt;
}

GalleryLayout.prototype.AttachItemEvent=function _GalleryLayout_AttachItemEvent(div)
{
	div.onmouseover=ToDelegate(this,function()
	{
		if(this._currentTooltip)
			this._currentTooltip.OnItemOver(div);
		else
			this.CreateNewTooltip(div);
	});
	div.onmouseout=ToDelegate(this,function()
	{
		if(this._currentTooltip)
			this._currentTooltip.OnItemOut(div);
	});
	div.onmousedown=ToDelegate(this,function()
	{
		this.ShowPhoto(div.dngphoto);
	});
	div.oncontextmenu=ToDelegate(this,function(event)
	{
		event=event||window.event;
		this.Browser.ShowPhotoMenu(div.dngphoto,div,event,this);
		if(event.preventDefault)event.preventDefault();
		event.cancelBubble=true;
		return event.returnValue=false;
	});
}


GalleryLayout.prototype.SetPlayTimeout=function _GalleryLayout_SetTimeout(func,timeout,type)
{
	clearTimeout(this.playtimerid);
	this.playtimerid=setTimeout(ToDelegate(this,func),timeout);
	if(type)this.playtimertype=type;
}


GalleryLayout.prototype.TogglePlay=function _GalleryLayout_TogglePlay()
{
	if(this.playing)
	{
		this.playing=false;
		this.dng_btn_play.src=this.Browser.GetTheme("Images/standard-slider-play.png");
	}
	else
	{
		this.playing=true;
		this.SetPlayTimeout(this.PlayOnTimer,this._speed*1000,"PlayOnTimer");
		this.dng_btn_play.src=this.Browser.GetTheme("Images/standard-slider-pause.png");
	}
}

GalleryLayout.prototype.GetPrevPhoto=function _GalleryLayout_GetPrevPhoto(photo)
{
	return this.GetNextPhoto(photo,true);
}
GalleryLayout.prototype.GetNextPhoto=function _GalleryLayout_GetNextPhoto(photo,backward)
{
	var photos=[];
	for(var i=0;i<this._categories.length;i++)
	{
		photos=photos.concat(this._categories[i].Photos);
	}
	if(photos.length==0)
		return null;
	
	var nextphoto;
	for(var i=0;i<photos.length;i++)
	{
		var p=photos[i];
		if(p.CategoryID==photo.CategoryID&&p.PhotoID==photo.PhotoID)
		{
			if(backward)
				nextphoto=photos[i-1];
			else
				nextphoto=photos[i+1];
			break;
		}
	}
	if(nextphoto)
		return nextphoto;
	if(backward)
		return photos[photos.length-1];
	return photos[0];
}

GalleryLayout.prototype.PlayOnTimer=function _GalleryLayout_PlayOnTimer()
{
	if(!this.playing)return;
	
	var floatingobj=GalleryHasFloatObject();
	if(floatingobj && floatingobj!=this )
	{
		this.SetPlayTimeout(this.PlayOnTimer,this._speed*1000);
		return;
	}
	
	var nextphoto=this.GetNextPhoto(this._showingphoto);
	
	if(nextphoto)
	{
		this.ShowPhoto(nextphoto,true);
	}
	else
	{
		this.TogglePlay();
	}
}

GalleryLayout.prototype.FindItemOfPhoto=function _GalleryLayout_FindItemOfPhoto(photo)
{
	if(!photo)return null;
	if(!this.items)return null;
	for(var i=0;i<this.items.length;i++)
	{
		var item=this.items[i];
		var p=item.dngphoto;
		if(p.CategoryID==photo.CategoryID&&p.PhotoID==photo.PhotoID)
			return item;
	}
}


GalleryLayout.prototype.ShowPhoto=function _GalleryLayout_ShowPhoto(photo,animation)
{
	var previtem;
	var nextitem;
	
	if(this.items)
	{
		for(var i=0;i<this.items.length;i++)
		{
			var item=this.items[i];
			var p=item.dngphoto;
			if(p.CategoryID==photo.CategoryID&&p.PhotoID==photo.PhotoID)
			{
				nextitem=item;
				
				this.dng_topinfoname.innerHTML=HtmlEncode(photo.Title +" ("+photo.Width+"x"+photo.Height+") "+(photo.Comment||""))
				this.dng_topinfoindex.innerHTML=HtmlEncode("Image "+(i+1)+ " of "+ this.items.length)
			}
			if(this._showingphoto)
			{
				if(p.CategoryID==this._showingphoto.CategoryID&&p.PhotoID==this._showingphoto.PhotoID)
				{
					previtem=item;
				}
			}
		}
		

	}
	
	this._showingphoto=photo;
	
	if(previtem)
	{
		previtem.className="";
	}

	if(nextitem)
	{
		nextitem.className="GallerySelectedItem";
		
		if(previtem)
		{
			var rightpos=this.nextScrollLeft+this._wheeldiv.offsetWidth-20;
			
			if(nextitem.offsetLeft>this.nextScrollLeft&&nextitem.offsetLeft<rightpos)
			{
				//item is in the view..
			}
			else if(nextitem.offsetLeft>previtem.offsetLeft)
			{
				if(previtem.offsetLeft <= rightpos && nextitem.offsetLeft >= rightpos)
				{
					this.HandleWheel(-this._wheeldiv.offsetWidth);
				}
				
				if(nextitem.offsetLeft-previtem.offsetLeft>this._wheeldiv.offsetWidth)
				{
					this.HandleWheel(-this._wheeldiv.scrollWidth);
				}
			}
			else
			{
				if(previtem.offsetLeft >= this.nextScrollLeft && nextitem.offsetLeft <= this.nextScrollLeft)
				{
					this.HandleWheel(this._wheeldiv.offsetWidth);
				}
				
				if(nextitem.offsetLeft<this.nextScrollLeft)
				{
					this.HandleWheel(this.nextScrollLeft);
				}
			}
		}
	}
	
	if(this.dng_photo2.style.display=="none")
	{
		this.dng_photo2.style.display="";
		this._showingdiv=this.dng_photo2;
		this.currentpdivbg=this.dng_photo1;
	}
	else
	{
		this.dng_photo1.style.display="";
		this._showingdiv=this.dng_photo1;
		this.currentpdivbg=this.dng_photo2;
	}
	
	if(this._isfullpage)
	{
		var br=GetBodyRect();
		var cw=br.width;
		var ch=br.height;
	}
	else
	{
		var cw=this.Browser.Control.offsetWidth;
		var ch=this.dng_container.offsetHeight-this.TOOLBARHEIGHT;
	}
	
	var scale=Math.min( cw / photo.Width , ch / photo.Height );
	
	if(this._autoexpend)
	{
	}
	else
	{
		if(scale>1)
			scale=1;
	}
	
	var imgwidth=Math.floor(scale*photo.Width);
	var imgheight=Math.floor(scale*photo.Height);

	this._showingimg=this.Browser.CreatePhoto(photo.Url,imgwidth,imgheight);

	this._showingdiv.innerHTML="";
	
	this.prevbtn=document.createElement("DIV");
	this.prevbtn.className="SlideShowPrevBtn";
	this.prevbtn.style.display="none";
	this._showingdiv.appendChild(this.prevbtn);
	
	this.nextbtn=document.createElement("DIV");
	this.nextbtn.className="SlideShowNextBtn";
	this.nextbtn.style.display="none";
	this._showingdiv.appendChild(this.nextbtn);


	var alpha=0;

	ToDelegate(this,PlayAlpha)();
	
	this._showingdiv.style.zIndex=0;
	this.currentpdivbg.style.zIndex=-1;
	this.currentpdivbg.style.display="none";
	
	this._showingdiv.appendChild(this._showingimg);
	this._showingdiv.style.display="";
	
	function PlayAlpha()
	{
		alpha+=10;
		
		GallerySetOpacity(this._showingdiv,alpha);

		if(alpha<100)
		{
			this.SetPlayTimeout(PlayAlpha,100,"PlayAlpha");
		}
		else
		{
			this.currentpdivbg.style.display="none";
			
			if(this.playing)
			{
				this.SetPlayTimeout(this.PlayOnTimer,this._speed*1000,"PlayOnTimer");
			}
		}
	}

	this.AdjustLayout();
	
	
		
	var nextphoto=this.GetNextPhoto(photo);
	if(nextphoto)
	{
		var nextimg=document.createElement("IMG");
		nextimg.style.position="absolute";
		nextimg.style.width="1px";
		nextimg.style.height="1px";
		nextimg.style.right="0px";
		nextimg.style.bottom="0px";
		nextimg.onload=function()
		{
			document.body.removeChild(nextimg);
		}
		nextimg.error=function()
		{
			document.body.removeChild(nextimg);
		}
		InsertToBody(nextimg);
		setTimeout(function(){
			nextimg.src=nextphoto.Url;
		},1000);
	}
	
}

GalleryLayout.prototype.LayoutMouseMove=function _GalleryLayout_LayoutMouseMove(e)
{
	e=window.event||e;

	if(this.lastmoveclientx==e.clientX&&this.lastmoveclienty==e.clientY)return;
	this.lastmoveclientx=e.clientX;
	this.lastmoveclienty=e.clientY;

	if(this.playing&&this.playtimertype=="PlayOnTimer")
	{
		this.SetPlayTimeout(this.PlayOnTimer,this._speed*1000,"PlayOnTimer");
	}

	if(this.nextbtn)this.nextbtn.style.display="none";
	if(this.prevbtn)this.prevbtn.style.display="none";

	var x=e.clientX-GetClientPosition(this._showingdiv).left;
	var y=e.clientY-GetClientPosition(this._showingdiv).top;
			
	this.ActiveTopBottomInfo(y);

	var cursor="pointer";
	var cw=this.dng_container.clientWidth;
	if(x<cw*2/7)
	{
		this.divcursortype="Prev";
		if(this.prevbtn)this.prevbtn.style.display="";
		cursor="url("+this.Browser.Param.Folder+"Layout/"+this.Browser.Param.Layout+"/Images/showprev.cur)";
	}
	else if(x>cw*5/7)
	{
		this.divcursortype="Next";
		if(!this._isfullpage)
		{
			if(this.nextbtn)this.nextbtn.style.display="";
			cursor="url("+this.Browser.Param.Folder+"Layout/"+this.Browser.Param.Layout+"/Images/shownext.cur)";
		}
	}
	else
	{
		this.divcursortype="None";
		cursor="pointer";
	}
	try
	{
		if(window.XMLHttpRequest)
		{
			img.style.cursor=cursor;
			this._showingdiv.style.cursor=cursor;
			this.currentpdivbg.style.cursor=cursor;
		}
	}
	catch(x)
	{
	}
}
GalleryLayout.prototype.LayoutClick=function _GalleryLayout_LayoutClick(e)
{
	this.LayoutMouseMove(e);
	switch(this.divcursortype)
	{
		case "Next":
			clearTimeout(this.playtimerid);
			this.ShowPhoto(this.GetNextPhoto(this._showingphoto));
			break;
		case "Prev":
			clearTimeout(this.playtimerid);
			this.ShowPhoto(this.GetPrevPhoto(this._showingphoto));
			break;
		case "Open":
		default:
			if(!this._isfullpage)
			{
				this.Browser.ShowViewer(this._showingphoto);
			}
			else
			{
				clearTimeout(this.playtimerid);
				this.ShowPhoto(this.GetNextPhoto(this._showingphoto));
			}
			break;
	}
}
GalleryLayout.prototype.LayoutMouseOut=function _GalleryLayout_LayoutMouseOut(e)
{
	if(this.nextbtn)this.nextbtn.style.display="none";
	if(this.prevbtn)this.prevbtn.style.display="none";
	
	clearTimeout(this.hidetopinfotimerid);
	this.hidetopinfotimerid=setTimeout(ToDelegate(this,this._ContinueHideTopInfo),100);
}



GalleryLayout.prototype.SetSpeed=function _GalleryLayout_SetSpeed(spd)
{
	this._speed=spd;
	if(this.playtimertype=="PlayOnTimer"&&this.playing)
	{
		this.SetPlayTimeout(this.PlayOnTimer,this._speed*1000,"PlayOnTimer");
	}
}

GalleryLayout.prototype.ShowConfig=function _GalleryLayout_ShowConfig()
{
	//this.dng_btn_config
	
	GalleryHideTooltip();
	
	var menu=CreateGalleryMenu(this.Browser.ThemeFolder);
	
	var selimg=this.Browser.GetTheme("Images/standard-selected.png");

	if(this.Browser.Param.AllowEdit)
	{
		menu.Add(1,GalleryLocalize.CLICK_SHOWEDITOR,null,ToDelegate(this,function Edit(){
			this.Browser.ShowEditor();
		}));

		menu.AddSpliter();
	}
	
	menu.Add(1,GalleryLocalize.CLICK_SHOWSLIDER,null,ToDelegate(this,function Slider(){
		this.Browser.ShowSlider()
		//this.ToggleFullPage();
	}));

	menu.AddSpliter();
	
	
	menu.Add(1,"Faster",this._speed==2.0?selimg:null,ToDelegate(this,function(){
		this.SetSpeed(2.0);
	}));
	menu.Add(1,"Medium",this._speed==5.0?selimg:null,ToDelegate(this,function(){
		this.SetSpeed(5.0);
	}));
	menu.Add(1,"Slower",this._speed==8.0?selimg:null,ToDelegate(this,function(){
		this.SetSpeed(8.0);
	}));
	
	menu.AddSpliter();
		
	menu.Add(1,GalleryLocalize.TODO("Auto Expend"),this._autoexpend?selimg:null,ToDelegate(this,function Slider(){
		this._autoexpend=!this._autoexpend;
		if(this._showingphoto)
		{
			this.ShowPhoto(this._showingphoto);
		}
	}));

	var pos=GetScrollPosition(this.dng_btn_config);
	menu.Show(this.dng_btn_config,0,this.dng_btn_config.offsetHeight,this.dng_btn_config);
	
}


GalleryLayout.prototype.HandleKeyDown=function _GalleryLayout_HandleKeyDown(event)
{
	event=event||window.event;
	
	if(event.keyCode==27)	//ESC
	{
		if(this._isfullpage)
		{
			this.ToggleFullPage();
		}
	}
	else if(event.keyCode==122)	//F11
	{
		var br=GetBodyRect();
		
		var oldcwch=br.width+br.height;
		
		var CheckFunc=ToDelegate(this,function(){
			var br=GetBodyRect();
			
			var newcwch=br.width+br.height;
			
			if(newcwch-oldcwch>60)
			{
				if(!this._isfullpage)
					this.ToggleFullPage();
			}
			else if(oldcwch-newcwch>60)
			{
				if(this._isfullpage)
					this.ToggleFullPage();
			}
		});
		
		setTimeout(CheckFunc,200)
	}
}

GalleryLayout.prototype.ToolbarMouseOver=function _GalleryLayout_ToolbarMouseOver()
{
	this.toolbarisover=true;
	clearTimeout(this.hidetoolbartimerid);
}
GalleryLayout.prototype.ToolbarMouseOut=function _GalleryLayout_ToolbarMouseOut()
{
	this.toolbarisover=false;
}

GalleryLayout.prototype._ContinueHideTopInfo=function _GalleryLayout_ContinueHideTopInfo()
{
	this.topinfoopacity-=10;
	if(this.topinfoopacity<=0)
	{
		this.dng_topinfo.style.display="none";
	}
	else
	{
		GallerySetOpacity(this.dng_topinfo,this.topinfoopacity);
		this.hidetopinfotimerid=setTimeout(ToDelegate(this,this._ContinueHideTopInfo),100);
	}
}

GalleryLayout.prototype._ContinueHideToolbar=function _GalleryLayout_ContinueHideToolbar()
{
	if(!this._isfullpage)return;
			
	this.toolbaropacity-=10;
	if(this.toolbaropacity<=0)
	{
		this.dng_toolbar.style.display="none";
	}
	else
	{
		GallerySetOpacity(this.dng_toolbar,this.toolbaropacity);
		this.hidetoolbartimerid=setTimeout(ToDelegate(this,this._ContinueHideToolbar),100);
	}
}

GalleryLayout.prototype.ActiveTopBottomInfo=function _GalleryLayout_ActiveTopBottomInfo(offsetY)
{
	if(offsetY<this.dng_container.offsetHeight/3)
	{
		this.dng_topinfo.style.display="";
		this.topinfoopacity=80;
		GallerySetOpacity(this.dng_topinfo,this.topinfoopacity);
		clearTimeout(this.hidetopinfotimerid);
		this.hidetopinfotimerid=setTimeout(ToDelegate(this,this._ContinueHideTopInfo),this._speed*1000+2000);
	}
	
	if(this._isfullpage)
	{
		this.dng_toolbar.style.display="";
		this.toolbaropacity=100;
		GallerySetOpacity(this.dng_toolbar,this.toolbaropacity);
		clearTimeout(this.hidetoolbartimerid);
		this.hidetoolbartimerid=setTimeout(ToDelegate(this,this._ContinueHideToolbar),1000);
	}
}

GalleryLayout.prototype.AdjustLayout=function _GalleryLayout_AdjustLayout()
{
	//TODO:improve this logic, should check the size of the this.Browser.Control
	var br=GetBodyRect();

	if(this._isfullpage)
	{
		var pos=CalcPosition(this.dng_container,document.body,true);
		var style=this.dng_container.style;
		if(style.position=="absolute")
		{
			style.left=br.left+pos.left+"px";
			style.top=br.top+pos.top+"px";
		}
		else	//IE7
		{
			pos=GetScrollPosition(this.Browser.Control);
			document.documentElement.scrollTop=pos.top;
			document.documentElement.scrollLeft=pos.left;
			this.Browser.Control.runtimeStyle.width=br.width+"px";
			this.Browser.Control.runtimeStyle.height=br.height+"px";
		}
		
		style.width=br.width+"px";
		style.height=br.height+"px";
	}

	if(this._isfullpage)
	{
		var cw=br.width;
		var ch=br.height;

		this.dng_toolbar.style.top=ch-this.TOOLBARHEIGHT+"px";
	}
	else
	{
		var cw=this.Browser.Control.offsetWidth;
		var ch=this.Browser.Control.offsetHeight-this.TOOLBARHEIGHT;

		this.dng_toolbar.style.top=ch+"px";
	}
	
	this.dng_toolbar.style.width=cw+"px";
	
	this.dng_photo1.style.width=this.dng_photo2.style.width=cw+"px";
	this.dng_photo1.style.height=this.dng_photo2.style.height=ch+"px";

	if(this._showingimg)
	{
		var imgwidth=parseInt(this._showingimg.style.width)
		var imgheight=parseInt(this._showingimg.style.height)
		//this._showingdiv.style.paddingTop=Math.max(0,Math.floor(ch/2-imgheight/2))+"px";
		
		this._showingimg.style.position="absolute";
		this._showingimg.style.zIndex="-1";
		this._showingimg.style.top=Math.max(0,Math.floor(ch/2-imgheight/2))+"px";
		this._showingimg.style.left=Math.max(0,Math.floor(cw/2-imgwidth/2))+"px";
		
		if(this.prevbtn)this.prevbtn.style.left=Math.max(0,Math.floor(cw/2-imgwidth/2))+"px";
		if(this.prevbtn)this.nextbtn.style.right=Math.max(0,Math.floor(cw/2-imgwidth/2))+"px";
	}


	if(this.SetScrollBarPos)
	{
		this.SetScrollBarPos();
	}

	if(this.dng_tabcontainer.offsetWidth<10||!this._wheeldiv)
		return;
	
	if(
		this._lastpw!=this.dng_photo1.offsetWidth
		||
		Math.abs(this._wheeldiv.offsetWidth-this.dng_tabcontainer.offsetWidth)>10
	){
		this._wheeldiv.style.width="1px";
		this._wheeldiv.style.width=this.dng_tabcontainer.offsetWidth-6+"px";
	}
	
	this._lastpw=this.dng_photo1.offsetWidth;
	
}


GalleryLayout.prototype.ToggleFullPage=function _GalleryLayout_ToggleFullPage()
{
	var br=GetBodyRect();
	
	var isie7=navigator.userAgent.indexOf("MSIE 7.")>-1;
	
	if(!this._isfullpage)
	{
		this.save_autoexpend=this._autoexpend;
		this._autoexpend=true;
		
		this.bodyoverflow=document.body.style.overflow;
		document.body.style.overflow="hidden";
		document.documentElement.style.overflow="hidden";
		
		if(isie7)
		{
		}
		else
		{
			this.dng_container.style.position="absolute";
		}

		this.dng_container.className="ZINDEXSLIDER";
		this.dng_container.style.borderWidth="0px";
		this._isfullpage=true;
		
		this.Browser.ShowF11KeyMessage();
	}
	else
	{
		this._autoexpend=this.save_autoexpend;
		
		document.body.style.overflow=this.bodyoverflow||"";
		document.documentElement.style.overflow="";
		
		if(isie7)
		{
			this.Browser.Control.runtimeStyle.cssText="";
		}
		else
		{
			this.dng_container.style.position="relative";
		}
		
		this.dng_container.style.left="";
		this.dng_container.style.top="";
		this.dng_container.style.width="100%";
		this.dng_container.style.height="100%";
		this.dng_container.style.borderWidth="";
		this.dng_container.className="";
		this.dng_toolbar.style.display="";
		GallerySetOpacity(this.dng_toolbar,100);
		this._isfullpage=false;
	}
	
	if(this._showingphoto)
	{
		this.ShowPhoto(this._showingphoto);
	}
	else
	{
		this.AdjustLayout();
	}
}


GalleryLayout.prototype.Ajax_Result=function _GalleryLayout_Ajax_Result(ret,param,method)
{
	if(method=="GetAllCategoryData"||method=="GetCategoryData")
	{
		this._categories=this.Browser.GetCategories();
		this.DrawUI();
	}
}


