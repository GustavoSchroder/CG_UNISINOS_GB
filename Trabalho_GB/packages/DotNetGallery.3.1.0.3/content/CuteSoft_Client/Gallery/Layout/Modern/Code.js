function GalleryLayout(gb)
{
    this.Browser=gb;
    this.PageSize = 8;
    this.PageIndex = 1;
    this.PageCount = 0;
        
    this.dng_photolist = this.Browser.FindElement("dng_photolist");
    this.dng_toolbar = this.Browser.FindElement("dng_toolbar");
    this.dng_btn_prev = this.Browser.FindElement("dng_btn_prev");
    this.dng_btn_next = this.Browser.FindElement("dng_btn_next");
    this.dng_fileinfor = this.Browser.FindElement("dng_fileinfor");
    this.dng_locagion = this.Browser.FindElement("dng_locagion");
    this.dng_uploaderholder = this.Browser.FindElement("dng_uploaderholder");
    this.dng_photo = this.Browser.FindElement("dng_photo");
    this.dng_photoinfor = this.Browser.FindElement("dng_photoinfor");
    
    
    this.dng_btn_prev.src=this.Browser.GetTheme("Images/standard-pageprev.png");
	this.dng_btn_next.src=this.Browser.GetTheme("Images/standard-pagenext.png");
	
	this.dng_btn_prev.onclick = ToDelegate(this,function(){this.GetNextPage(true);});
	this.dng_btn_next.onclick = ToDelegate(this,function(){this.GetNextPage(false);});
	
	var uploadercontainer=this.Browser.GetUploaderContainer();
	if(uploadercontainer)
	{
		uploadercontainer.style.display="none";
	}
	
	this._categories=this.Browser.GetCategories();
	
	this.DrawUI();
}

GalleryLayout.prototype.DrawUI=function _GalleryLayout_DrawUI()
{
	

    this._selecteddiv=null;
	var container=this.dng_photolist;	
	container.innerHTML="";	 

	var photos=[];
	for(var i=0;i<this._categories.length;i++)
	{
		photos=photos.concat(this._categories[i].Photos);
	}	

	if(photos.length!=0)
	this.ShowPhoto(photos[0]);
	this.PageCount = (photos.length%this.PageSize>0)?Math.floor(photos.length/this.PageSize) + 1:photos.length/this.PageSize;
	
	this.dng_btn_prev.style.display = "";
    this.dng_btn_next.style.display = "";
	if(this.PageIndex == 1)
        this.dng_btn_prev.style.display = "none";
    if(this.PageIndex == this.PageCount)
        this.dng_btn_next.style.display = "none";
        
    this.ShowLocation(this.PageIndex,this.PageCount);
	
	var startIndex = (this.PageIndex-1) * this.PageSize;
	var endIndex = this.PageIndex * this.PageSize;
	if(endIndex>photos.length)
	    endIndex = photos.length;
	
	this._showingitems = [];
	for(var i=startIndex;i<endIndex;i++)
	{
		var div=this.CreatePhotoDiv(photos[i]);
		this._showingitems = this._showingitems.concat(div);
		this.AttachItemEvent(div);
		container.appendChild(div);
	}
}

GalleryLayout.prototype.AttachItemEvent=function _GalleryLayout_AttachItemEvent(div)
{
	div.onmouseover = ToDelegate(this,function()
	{
	    div.className = "GalleryPhotoItem GalleryItemSelected";
		this.ShowImageTitle(div.dngphoto);
	});
	div.onmouseout = ToDelegate(this,function()
	{
	    div.className = "GalleryPhotoItem";
	    this.dng_fileinfor.innerHTML = "";
	    if(this._selecteddiv)
	    {
	        this.ShowImageTitle(this._selecteddiv.dngphoto);	        
	        this._selecteddiv.className = "GalleryPhotoItem GalleryItemSelected";
	    }
	});
	div.onmousedown = ToDelegate(this,function()
	{
		this.ShowPhoto(div.dngphoto);
	});
	div.ondblclick=ToDelegate(this,function()
	{
		this.Browser.ShowViewer(div.dngphoto);
	});
	div.oncontextmenu=ToDelegate(this,function(event)
	{
		event = window.event||event;
		this.Browser.ShowPhotoMenu(div.dngphoto,div,event,this);
		if(event.preventDefault)event.preventDefault();
		event.cancelBubble=true;
		return event.returnValue=false;
	});
}

GalleryLayout.prototype.ShowImageComments = function _GalleryLayout_ShowImageComments(photo)
{
    if(!photo.Title)
        return;
    this.dng_photoinfor.innerHTML = "";
    var span_infor = document.createElement("span");
    span_infor.style.cssText = "margin-left:5px;";
    span_infor.innerHTML = photo.Title + " (" + photo.Width + "x" + photo.Height + ")";
    this.dng_photoinfor.appendChild(span_infor);
    
    var span_comments = document.createElement("span");
    span_comments.style.cssText = " margin-left:20px; color:blue; cursor:pointer;";
    this.dng_photoinfor.appendChild(span_comments);
    
    var cs = photo.Comments || [];
    span_comments.innerHTML = cs.length + " "+GalleryLocalize.NUMCOMMENTS;
    span_comments.onclick = ToDelegate(this,function(){
        this.ShowComments(photo);
    });
}

GalleryLayout.prototype.ShowComments = function _GalleryLayout_ShowComments(photo)
{
    var param={}
    param.url=this.Browser.Param.Folder+"Share/Popup/Dialogs/comments.htm?"+new Date().getTime();
    param.width=480;
    param.height=320;
    param.browser=this.Browser;
    param.arg_item=photo;
    GalleryCreateDialog(param);
}

GalleryLayout.prototype.ShowImageTitle = function _GalleryLayout_ShowImageTitle(photo)
{
    if(!photo.Title)
        return;
    this.dng_fileinfor.innerHTML = photo.Title + " (" + photo.Width + "x" + photo.Height + ")";
}

GalleryLayout.prototype.ShowLocation = function _GalleryLayout_ShowLocation(page,count)
{
    this.dng_locagion.innerHTML = page + "/" + count;
}

GalleryLayout.prototype.CreatePhotoDiv = function _GalleryLayout_CreatePhotoDiv(photo)
{
    var div=document.createElement("DIV");
	div.className="GalleryPhotoItem";
	div.dngphoto=photo;

	var imgwidth=74;
	var imgheight=74;

	var img=this.Browser.CreateThumbnail(photo.Thumbnail,imgwidth,imgheight);
	img.style.marginTop = "3px";
	div.appendChild(img);
	img.style.cursor="hand";
	return div;
}

GalleryLayout.prototype.ShowPhoto = function _GalleryLayout_ShowPhoto(photo)
{ 	
    this._showingdiv = this.dng_photo;
  
    var cw= parseInt(this._showingdiv.parentNode.style.width.split("p")[0]);
	var ch= parseInt(this._showingdiv.parentNode.style.height.split("p")[0]);
	
	var scale=Math.min( cw / photo.Width , ch / photo.Height );
    if(scale>1)
        scale = 1;
    
    var imgwidth=Math.floor(scale*photo.Width);
	var imgheight=Math.floor(scale*photo.Height);
	
	this._showingphoto=photo;
	this._showingimg=this.Browser.CreatePhoto(photo.Url,imgwidth,imgheight);	
	this._showingdiv.innerHTML = "";	
	
	this.prevbtn=document.createElement("DIV");
	this.prevbtn.className="SlideShowPrevBtn";
	this.prevbtn.style.display="none";
	this._showingdiv.appendChild(this.prevbtn);
	
	this.nextbtn=document.createElement("DIV");
	this.nextbtn.className="SlideShowNextBtn";
	this.nextbtn.style.display="none";
	this._showingdiv.appendChild(this.nextbtn);
	
	this._showingdiv.appendChild(this._showingimg);
	
	this.AdjustLayout();
	
	if(this._selecteddiv)
	    this._selecteddiv.className = "GalleryPhotoItem";
	//get current div
	var div = this.FindCurrentDiv(photo);
	if(div)
	{
	    this._selecteddiv = div;
	    this._selecteddiv.className = "GalleryPhotoItem GalleryItemSelected";
	}
	
	this._showingdiv.onclick=ToDelegate(this,this.LayoutClick);
	this._showingdiv.ondblclick=ToDelegate(this,function(){
	    this.Browser.ShowViewer(this._showingphoto);
	});
	this._showingdiv.onmousemove=ToDelegate(this,this.LayoutMouseMove);
	this._showingdiv.onmouseout=ToDelegate(this,this.LayoutMouseOut);	
	
	this.ShowImageTitle(photo);
	this.ShowImageComments(photo);
	
}
GalleryLayout.prototype.FindCurrentDiv = function _GalleryLayout_FindCurrentDiv(photo)
{
    if(!photo)
        return null;
    if(!this._showingitems)
        return null;
    for(var i=0;i<this._showingitems.length;i++)
    {
        if(this._showingitems[i].dngphoto == photo)
            return this._showingitems[i];
    }
    return null;
}
GalleryLayout.prototype.AdjustLayout = function _GalleryLayout_AdjustLayout()
{	
    var br=GetBodyRect();
    var pos=CalcPosition(this._showingimg,document.body,true);
    var offpos = {};
    offpos.left = this._showingimg.offsetLeft;
    offpos.top = this._showingimg.offsetTop;
    var imgwidth=parseInt(this._showingimg.style.width);
    var imgheight=parseInt(this._showingimg.style.height);
    if(this.prevbtn)
    {
        this.prevbtn.style.left=Math.abs(pos.left) + offpos.left+"px";
        this.prevbtn.style.top=Math.abs(pos.top) + offpos.top +imgheight/2-10 + "px";
    }
    if(this.nextbtn)
    {
        this.nextbtn.style.right= br.width - Math.abs(pos.left) - offpos.left - imgwidth +"px";
        this.nextbtn.style.top=Math.abs(pos.top) + offpos.top +imgheight/2-10 + "px";
    }
}

GalleryLayout.prototype.GetNextPage = function _GalleryLayout_GetNextPage(backward)
{
    if(backward)
    {
        if(this.PageIndex == 1)
            return;
        this.PageIndex = this.PageIndex - 1;
        this.DrawUI(); 
        return;
    }
    if(this.PageIndex == this.PageCount)
        return;
    this.PageIndex = this.PageIndex + 1;
    this.DrawUI();
}

GalleryLayout.prototype.LayoutMouseMove=function _GalleryLayout_LayoutMouseMove(e)
{
	e=window.event||e;

	if(this.lastmoveclientx==e.clientX&&this.lastmoveclienty==e.clientY)return;
	this.lastmoveclientx=e.clientX;
	this.lastmoveclienty=e.clientY;


	if(this.nextbtn)this.nextbtn.style.display="none";
	if(this.prevbtn)this.prevbtn.style.display="none";

	var x=e.clientX-GetClientPosition(this._showingdiv).left;
	var y=e.clientY-GetClientPosition(this._showingdiv).top;

	var cursor="pointer";
	var cw=this.dng_photo.offsetWidth;
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
			this.ShowPhoto(this.GetNextPhoto(this._showingphoto));
			break;
		case "Prev":
			this.ShowPhoto(this.GetPrevPhoto(this._showingphoto));
			break;
		case "Open":
		default:
			if(!this._isfullpage)
			{
				//this.Browser.ShowViewer(this._showingphoto);
			}
			else
			{
				this.ShowPhoto(this.GetNextPhoto(this._showingphoto));
			}
			break;
	}
}
GalleryLayout.prototype.LayoutMouseOut=function _GalleryLayout_LayoutMouseOut(e)
{
	if(this.nextbtn)this.nextbtn.style.display="none";
	if(this.prevbtn)this.prevbtn.style.display="none";
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
GalleryLayout.prototype.Ajax_Result=function _GalleryLayout_Ajax_Result(ret,param,method)
{
	if(method=="GetAllCategoryData"||method=="GetCategoryData")
	{
		this._categories=this.Browser.GetCategories();
		this.DrawUI();
	
	}
}