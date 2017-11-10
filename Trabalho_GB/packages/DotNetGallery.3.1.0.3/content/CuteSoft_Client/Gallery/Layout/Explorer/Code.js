
function GalleryLayout(gb)
{
	this.Browser=gb;
	
	this.dng_btn_slider=this.Browser.FindElement("dng_btn_slider");
	this.dng_btn_newcategory=this.Browser.FindElement("dng_btn_newcategory");
	
	this.dng_btn_up=this.Browser.FindElement("dng_btn_up");
	
	this.dng_btn_newcategory.title=GalleryLocalize.CLICK_NEWCATEGORY;
	this.dng_btn_slider.title=GalleryLocalize.CLICK_SHOWSLIDER;
	this.Browser.FindElement("dng_location").innerHTML=GalleryLocalize.LOCATION+" : ";
	
	this.dng_btn_slider.src=this.Browser.Param.Folder+"Images/text-slider.png";
	this.dng_btn_newcategory.src=this.Browser.Param.Folder+"Images/text-category.png";
	
	this.dng_btn_newcategory.onclick=ToDelegate(this,function(){this.Browser.PromptNewCategory();return false});
	this.dng_btn_up.onclick=ToDelegate(this,this.OnButtonUpClick);

	if(!this.Browser.Param.AllowEdit)
	{
		this.dng_btn_newcategory.style.display="none";
	}
	
	var uploadercontainer=this.Browser.GetUploaderContainer();
	if(uploadercontainer)
	{
		this.Browser.FindElement("dng_uploaderholder").appendChild(uploadercontainer);
	}
	
	var pl=this.Browser.FindElement("dng_photolist");
	
	if(navigator.userAgent.indexOf("MSIE 6.")>-1)
	{

	}
	
	var ctrlwidth=this.Browser.Control.style.width;
	if( ctrlwidth && ctrlwidth.indexOf('%')==-1 )
	{
		pl.style.width=(parseInt(ctrlwidth)||pl.parentNode.offsetWidth)+"px";
	}

	var ctrlheight=this.Browser.Control.style.height;
	if( ctrlheight && ctrlheight.indexOf('%')==-1 )
	{
		pl.style.height=(parseInt(ctrlheight)||pl.parentNode.offsetHeight)+"px";
		pl.style.overflow="auto";
	}
	pl.ondragstart=new Function("","return false");
	pl.onselectstart=new Function("","return false");
	
	this._categories=this.Browser.GetCategories();
	this.DrawUI();
}

GalleryLayout.prototype.CreateItemDiv=function _GalleryLayout_CreateItemDiv(category,photo,title,thumbnail,width,height)
{
	var div=document.createElement("DIV");
	div.className=photo?"GalleryPhotoItem":"GalleryDirectoryItem";
	div.dngcategory=category;
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
	var scale = Math.min(88/width, 88/height);
	var img;
	if(photo)
	{
		img=this.Browser.CreateThumbnail(thumbnail,Math.floor(width * scale),Math.floor(height * scale));
	}
	else
	{
		img=document.createElement("IMG");
		img.src=thumbnail;
		img.width=Math.floor(width * scale);
		img.height=Math.floor(height * scale);
	}	
	c1.appendChild(img);
	c2.innerHTML="<span class='GalleryItemText'></span>";
	var titltText=title;
	if(titltText&&titltText.length>30)titltText=titltText.substring(0,30)+"..";
	c2.firstChild.appendChild(document.createTextNode(titltText));
	
	if(this.Browser.Param.AllowShowComment)
	{
		var cs=(photo||category||{}).Comments;
		if(cs&&cs.length)
		{
			c2.innerHTML+="<br/><span class='GalleryItemNumComments'>"+cs.length+" "+GalleryLocalize.NUMCOMMENTS+"<span>";
		}
	}
	
	div.appendChild(t);
	return div;
}
GalleryLayout.prototype.DrawUI=function _GalleryLayout_DrawUI()
{
	this._selecteddiv=null;
	var container=this.Browser.FindElement("dng_photolist");
	
	container.innerHTML="";

	if(!this._selectedcategory)
	{
		this.dng_btn_up.style.display="none";
		this.Browser.FindElement("dng_path").innerHTML="/";
		var folderthumb=this.Browser.GetTheme("Images/directory-thumbnail.png");
		for(var i=0;i<this._categories.length;i++)
		{
			var c=this._categories[i];
			var div=this.CreateItemDiv(c,null,(c.Title||GalleryLocalize.DEFAULTCATEGORYNAME)+" ("+c.Photos.length+")",folderthumb,128,128);
			this.AttachItemEvent(container.appendChild(div));
		}
	}
	else
	{
		this.dng_btn_up.style.display="";
		this.Browser.FindElement("dng_path").innerHTML="/"+(this._selectedcategory.Title||GalleryLocalize.DEFAULTCATEGORYNAME)+"/";
		
		//if(addparentnode)
		var returnthumb=this.Browser.GetTheme("Images/directory-thumbnail.png");
		var div=this.CreateItemDiv(null,null,"...",returnthumb,128,128);
		this.AttachItemEvent(container.appendChild(div));
		
		var photos=this._selectedcategory.Photos;
		
		for(var i=0;i<photos.length;i++)
		{
			var p=photos[i];
			var div=this.CreateItemDiv(this._selectedcategory,p,p.Title,p.Thumbnail,p.Width,p.Height);
			this.AttachItemEvent(container.appendChild(div));
		}
	}
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
		if(div.dngphoto)
			div.className="GalleryPhotoItem "+clsname;
		else
			div.className="GalleryDirectoryItem "+clsname;
	}
	div.onmouseover=ToDelegate(this,function()
	{
		div.dnghover=true;
		SetDivClass(div);
		if(div.dngphoto)
			this.Browser.ShowPhotoTooltip(div.dngphoto,div,this);
		else if(div.dngcategory)
			this.Browser.ShowCategoryTooltip(div.dngcategory,div,this);
	});
	div.onmouseout=ToDelegate(this,function()
	{
		div.dnghover=false;
		SetDivClass(div);
	});
	div.onclick=ToDelegate(this,function()
	{
		if(this._selecteddiv)
		{
			this._selecteddiv.dngselected=false;
			SetDivClass(this._selecteddiv);
		}
		this._selecteddiv=div;
		div.dngselected=true;
		SetDivClass(div);
	});
	div.ondblclick=ToDelegate(this,function()
	{
		if(div.dngphoto)
		{
			this.Browser.ShowViewer(div.dngphoto);
		}
		else
		{
			this._selectedcategory=div.dngcategory||null;
			this.DrawUI();
		}
	});
	div.oncontextmenu=ToDelegate(this,function(event)
	{
		div.onclick();
		event=event||window.event;
		if(div.dngphoto)
		{
			this.Browser.ShowPhotoMenu(div.dngphoto,div,event,this);
		}
		else if(div.dngcategory)
		{
			this.Browser.ShowCategoryMenu(div.dngcategory,div,event,this);
		}
		if(event.preventDefault)event.preventDefault();
		event.cancelBubble=true;
		return event.returnValue=false;
	});
}

GalleryLayout.prototype.OnButtonUpClick=function _GalleryLayout_OnButtonUpClick()
{
	this._selectedcategory=null;
	this.DrawUI();
}

GalleryLayout.prototype.Ajax_Result=function _GalleryLayout_Ajax_Result(ret,param,method)
{
	if(method=="GetAllCategoryData"||method=="GetCategoryData")
	{
		this._categories=this.Browser.GetCategories();
		var sc=this._selectedcategory;
		if(sc)this._selectedcategory=this.Browser.FindCategory(sc.CategoryID,sc.PhotoID);
		this.DrawUI();
	}
}


GalleryLayout.prototype.Popup_OpenCategory=function _GalleryLayout_OnMenuOpenCategory(category)
{
	this._selectedcategory=category;
	this.DrawUI();
}

GalleryLayout.prototype.GetDefaultSliderCategory=function _GalleryLayout_GetDefaultSliderCategory()
{
	return this._selectedcategory;
}




