
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
	
	this._categories=this.Browser.GetCategories();

	this.DrawUI();
}

GalleryLayout.prototype.DrawUI=function _GalleryLayout_DrawUI()
{
	clearTimeout(this._animationTimerid);
	
	this.dng_photolist.innerHTML="";
	
	var photos=[];
	for(var i=0;i<this._categories.length;i++)
	{
		photos=photos.concat(this._categories[i].Photos);
	}
	for(var i=0;i<photos.length;i++)
	{
		var div=this.CreatePhotoDiv(photos[i]);
		this.AttachItemEvent(div);
		this.dng_photolist.appendChild(div);
	}
	
}

GalleryLayout.prototype.CreatePhotoDiv=function _GalleryLayout_CreateItemDiv(photo)
{
	var div=document.createElement("DIV");
	div.className="GalleryPhotoItem";
	div.dngphoto=photo;
	var t=document.createElement("TABLE");
	t.style.width="100%";
	t.style.height="100%";
	t.border=0;
	t.cellSpacing=0;
	t.cellPadding=0;
	var c1=t.insertRow(-1).insertCell(-1);
	var c2=t.insertRow(-1).insertCell(-1);
	c1.className="GalleryItemImageCell";
	c1.onselectstart=new Function("","return false");
	c2.style.textAlign="center";
	var scale = Math.min(128/photo.Width, 96/photo.Height);
	var img=this.Browser.CreateThumbnail(photo.Thumbnail,Math.floor(photo.Width * scale),Math.floor(photo.Height * scale));
	c1.appendChild(img);
	img.style.cursor="pointer";
	img.onclick=ToDelegate(this,function()
	{
		this.Browser.ShowViewer(div.dngphoto);
	});
	
	c2.innerHTML="<span class='GalleryItemText'></span>";
	var titltText=photo.Title;
	if(titltText&&titltText.length>30)titltText=titltText.substring(0,30)+"..";
	c2.firstChild.appendChild(document.createTextNode(titltText));
	
	if(this.Browser.Param.AllowShowComment)
	{
		var cs=photo.Comments;
		if(cs&&cs.length)
		{
			c2.innerHTML+="<br/><span class='GalleryItemNumComments'>"+cs.length+" "+GalleryLocalize.NUMCOMMENTS+"<span>";
		}
	}
	
	div.appendChild(t);
	return div;
}

GalleryLayout.prototype.AttachItemEvent=function _GalleryLayout_AttachItemEvent(div)
{
	function SetDivClass(div)
	{
		var clsname;
		if(div.dngselected&&div.dnghover)
			clsname=" GalleryItemHoverSelected";
		else if(div.dngselected)
			clsname=" GalleryItemSelected";
		else if(div.dnghover)
			clsname=" GalleryItemHover";
		else
			clsname="";
		div.className="GalleryPhotoItem "+clsname;
	}
	div.onmouseover=ToDelegate(this,function()
	{
		div.dnghover=true;
		SetDivClass(div);
		this.Browser.ShowPhotoTooltip(div.dngphoto,div,this);
	});
	div.onmouseout=ToDelegate(this,function()
	{
		div.dnghover=false;
		SetDivClass(div);
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

GalleryLayout.prototype.Ajax_Result=function _GalleryLayout_Ajax_Result(ret,param,method)
{
	if(method=="GetAllCategoryData"||method=="GetCategoryData")
	{
		this._categories=this.Browser.GetCategories();
		this.DrawUI();
	}
}





