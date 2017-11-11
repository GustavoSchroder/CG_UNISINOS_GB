var GRIDSHOW_PAGESIZE=5;

function GalleryLayout(gb)
{
	this.Browser=gb;

	this.dng_photolist=this.Browser.FindElement("dng_photolist");
	
	this.Browser.Control.style.minHeight=this.Browser.Control.style.height;
	this.Browser.Control.style.height="";
	
	var uploadercontainer=this.Browser.GetUploaderContainer();
	if(uploadercontainer)
	{
		this.Browser.FindElement("dng_uploaderholder").appendChild(uploadercontainer);
	}
	else
	{

	}
	
	this.DrawUI();
}

GalleryLayout.prototype.DrawUI=function _GalleryLayout_DrawUI()
{
	clearTimeout(this._animationTimerid);
	
	this.dng_photolist.innerHTML="";
	
	var cs=this.Browser.GetCategories();
	
	var photos=[];
	for(var i=0;i<cs.length;i++)
	{
		photos=photos.concat(cs[i].Photos);
	}

	var page=this._page||1;
	var size=GRIDSHOW_PAGESIZE;
	var start=(page-1)*size;
	for(var i=0;i<size;i++)
	{
		var photo=photos[start+i];
		if(!photo)
			break;
		var div=this.CreatePhotoDiv(photo);
		this.AttachItemEvent(div);
		this.dng_photolist.appendChild(div);
	}
	
	
	var pagecount=Math.ceil(photos.length/size);
	if(pagecount==0)
		return;
	if(pagecount==1&&page==1)
		return;
		
	//draw pager :
	var pager=document.createElement("DIV");
	pager.style.textAlign="left";
	pager.style.clear="both";
	this.dng_photolist.appendChild(pager);
	
	var layout=this;
	function SetupButton(btn,btnpage)
	{
		if(page==btnpage)
		{
			btn.style.fontWeight="bold";
		}
		btn.innerHTML="["+btnpage+"]";
		btn.href="#";
		btn.onclick=ToDelegate(layout,function()
		{
			this._page=btnpage;
			this.DrawUI();
			return false;
		});
	}
	
	for(var i=0;i<pagecount;i++)
	{
		var btn=document.createElement("A")
		SetupButton(btn,i+1);
		pager.appendChild(btn);
		pager.appendChild(document.createTextNode(" "));
	}
}

GalleryLayout.prototype.CreatePhotoDiv=function _GalleryLayout_CreateItemDiv(photo)
{
	var div=document.createElement("DIV");
	div.className="GalleryPhotoItem";
	div.dngphoto=photo;

	var imgwidth=64;
	var imgheight=48;

	var img=this.Browser.CreateThumbnail(photo.Thumbnail,imgwidth,imgheight);
	div.appendChild(img);
	img.style.cursor="pointer";
	img.onclick=ToDelegate(this,function()
	{
		this.Browser.ShowViewer(div.dngphoto);
	});
	return div;
}

GalleryLayout.prototype.AttachItemEvent=function _GalleryLayout_AttachItemEvent(div)
{
	function SetDivClass(div)
	{
		var clsname;
		if(div.dngselected)
			clsname=" GalleryItemSelected";
		else
			clsname="";
		div.className="GalleryPhotoItem "+clsname;
	}
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
	div.ondblclick=ToDelegate(this,function()
	{
		this.Browser.ShowViewer(div.dngphoto);
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

	pos.top-=Math.floor((height-item.offsetHeight)/2);
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
		
		checkid=setTimeout(ToDelegate(this,CheckState),100);
		
	}),delay||100);
	
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
	div.oncontextmenu=ToDelegate(this,function(event)
	{
		event=event||window.event;
		this.Browser.ShowPhotoMenu(item.dngphoto,div,event,this);
		if(event.preventDefault)event.preventDefault();
		event.cancelBubble=true;
		return event.returnValue=false;
	});
	
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

GalleryLayout.prototype.Ajax_Result=function _GalleryLayout_Ajax_Result(ret,param,method)
{
	if(method=="GetAllCategoryData"||method=="GetCategoryData")
	{
		this.DrawUI();
	}
}





