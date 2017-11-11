function GalleryLayout(gb)
{
    this.Browser=gb; 
    
    this.dng_fileinfor = this.Browser.FindElement("dng_fileinfor");
    this.dng_locagion = this.Browser.FindElement("dng_locagion");
    this.dng_comments = this.Browser.FindElement("dng_comments");
    this.dng_uploaderholder = this.Browser.FindElement("dng_uploaderholder");
    this.dng_photo = this.Browser.FindElement("dng_photo");
    this.dng_photoshape = this.Browser.FindElement("dng_photoshape");
    this.dng_prevphoto = this.Browser.FindElement("dng_prevphoto");
    this.dng_nextphoto = this.Browser.FindElement("dng_nextphoto");
    
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
	this.ShowNextPhoto();
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
	
	this.nextbtn.onclick = ToDelegate(this,this.ShowNextPhoto);
	this.prevbtn.onclick = ToDelegate(this,this.ShowPrevPhoto);
	
	this._showingdiv.appendChild(this._showingimg);
	this.dng_photoshape.onclick=ToDelegate(this,this.LayoutClick);
	this.dng_photoshape.onmousermove = ToDelegate(this,this.LayoutMouseMove);
	this._showingdiv.onclick=ToDelegate(this,this.LayoutClick);
	this._showingdiv.ondblclick = ToDelegate(this,this.LayoutDblClick);
	this._showingdiv.onmousemove=ToDelegate(this,this.LayoutMouseMove);
	this._showingdiv.onmouseout=ToDelegate(this,this.LayoutMouseOut);	
	this.ShowImageTitle(photo);	
	this.ShowImageComments(photo);
	
	this.AdjustLayout();
}

GalleryLayout.prototype.ShowImageComments = function _GalleryLayout_ShowImageComments(photo)
{
    if(!photo.Title)
        return;
    
    var cs = photo.Comments || [];
    this.dng_comments.innerHTML = cs.length + " "+GalleryLocalize.NUMCOMMENTS;
    this.dng_comments.onclick = ToDelegate(this,function(){
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

GalleryLayout.prototype.ShowLocation = function _GalleryLayout_ShowLocation(index,count)
{
    this.dng_locagion.innerHTML = index + "/" + count;
}

GalleryLayout.prototype.AdjustLayout = function _GalleryLayout_AdjustLayout()
{	
    var offpos = {};
    offpos.left = this._showingimg.offsetLeft;
    offpos.top = this._showingimg.offsetTop;
    
    var imgwidth=parseInt(this._showingimg.style.width);
    var imgheight=parseInt(this._showingimg.style.height);
    if(this.prevbtn)
    {
        this.prevbtn.style.left= offpos.left +"px";
        this.prevbtn.style.top= offpos.top + imgheight/2 - 20 + "px";
    }
    if(this.nextbtn)
    {
        this.nextbtn.style.right= offpos.left +"px";
        this.nextbtn.style.top = offpos.top + imgheight/2 - 20 + "px";
    }
}

GalleryLayout.prototype.LayoutClick=function _GalleryLayout_LayoutClick(e)
{
	this.LayoutMouseMove(e);
	switch(this.divcursortype)
	{
		case "Next":
			this.ShowNextPhoto();
			break;
		case "Prev":
			this.ShowPrevPhoto();
			break;
	}
}

GalleryLayout.prototype.LayoutDblClick=function _GalleryLayout_LayoutDblClick(e)
{
    this.LayoutMouseMove(e);
    this.Browser.ShowViewer(this._showingphoto);
}

GalleryLayout.prototype.LayoutMouseMove = function _GalleryLayout_LayoutMouseMove(e)
{
    e=window.event||e;    
    
    this.nextbtn.style.display = "";
    this.prevbtn.style.display = ""; 
    
    if(this.lastmoveclientx==e.clientX&&this.lastmoveclienty==e.clientY)return;
	this.lastmoveclientx=e.clientX;
	this.lastmoveclienty=e.clientY;

	var x=e.clientX-GetClientPosition(this.dng_photoshape).left;
	var y=e.clientY-GetClientPosition(this.dng_photoshape).top;

	var cursor="pointer";
	var cw=parseInt(this.dng_photoshape.offsetWidth);
	
	if(x<cw*3/7)
	{
		this.divcursortype="Prev";
		if(this.prevbtn)this.prevbtn.style.display="";
		cursor="url("+this.Browser.Param.Folder+"Layout/"+this.Browser.Param.Layout+"/Images/showprev.cur)";
	}
	else if(x>cw*4/7)
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
GalleryLayout.prototype.LayoutMouseOut = function _GalleryLayout_LayoutMouseOut(e)
{
    e=window.event||e;
    
    this.nextbtn.style.display = "none";
    this.prevbtn.style.display = "none";
}
GalleryLayout.prototype.ShowNextPhoto=function _GalleryLayout_ShowNextPhoto()
{
    var photo = this.GetNextPhoto();
    if(!photo)
        return;
    this.ShowPhoto(photo);
    this.ShowBackPhoto(photo);
    try
    {   
        event = window.event || event;
        if(typeof(event)!="undefined")
        {
	        if(event.preventDefault)event.preventDefault();
	        event.cancelBubble=true;
	    }
	}
	catch(x)
	{}
}
GalleryLayout.prototype.ShowPrevPhoto=function _GalleryLayout_ShowPrevPhoto()
{
    var photo = this.GetNextPhoto(true);
    if(!photo)
        return;
    this.ShowPhoto(photo);
    this.ShowBackPhoto(photo);
    try
    {   
        event = window.event || event;
        if(typeof(event)!="undefined")
        {
	        if(event.preventDefault)event.preventDefault();
	        event.cancelBubble=true;
	    }
	}
	catch(x)
	{}
}
GalleryLayout.prototype.ShowBackPhoto = function _GalleryLayout_ShowBackPhoto(photo)
{
    if(!photo)
        return;
    var photos=[];
	for(var i=0;i<this._categories.length;i++)
	{
		photos=photos.concat(this._categories[i].Photos);
	}
	var imgwidth = 240;
	var imgheight= 240;
	this.dng_prevphoto.innerHTML = "";
	this.dng_nextphoto.innerHTML = "";
    var index = 1;
    var count = photos.length;
    var prevphoto;
    var nextphoto;
	for(var i=0;i<photos.length;i++)
	{
		var p=photos[i];
		if(p.CategoryID==photo.CategoryID&&p.PhotoID==photo.PhotoID)
		{
			index = i+1;
			prevphoto = photos[i-1];
			nextphoto = photos[i+1];
		}
	}
	if(prevphoto)
	{
	this.dng_prevphoto.appendChild(this.Browser.CreatePhoto(prevphoto.Url,imgwidth,imgheight));
	}
	     else
	   {
	    this.dng_prevphoto.appendChild(this.Browser.CreatePhoto(photos[photos.length-1].Url,imgwidth,imgheight));
	   }
	if(nextphoto)
	{
	 this.dng_nextphoto.appendChild(this.Browser.CreatePhoto(nextphoto.Url,imgwidth,imgheight));
	}
	   else
	   {
	    this.dng_nextphoto.appendChild(this.Browser.CreatePhoto(photos[0].Url,imgwidth,imgheight));
	   }
	    
	this.ShowLocation(index,count);
}

GalleryLayout.prototype.GetNextPhoto=function _GalleryLayout_GetNextPhoto(backward)
{
    var photo = this._showingphoto;
	var photos=[];
	for(var i=0;i<this._categories.length;i++)
	{
		photos=photos.concat(this._categories[i].Photos);
	}
	if(photos.length==0)
		return null;
	
	if(!photo)
	    return photos[0];
	
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
