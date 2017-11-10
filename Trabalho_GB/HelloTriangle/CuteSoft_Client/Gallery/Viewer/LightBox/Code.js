
function GalleryViewer(gb)
{
	this.Browser=gb;
}

GalleryViewer.prototype.Show=function _GalleryViewer_Show(photo)
{
	this.currentphoto=photo;
	
	var padding=12;
	var bodypadding=48;
	var toolbarheight=60;
	
	if(this.Browser.Param.AllowShowComment)
	{
		var cs=photo.Comments
		toolbarheight=84;
		if(cs)toolbarheight+=Math.min(cs.length,5)*12;
	}
	
	clearTimeout(this.jobtimerid);
	
	var de=document.compatMode=="CSS1Compat"?document.documentElement:document.body;
	
	var st=Math.max(document.documentElement.scrollTop,document.body.scrollTop);
	var sl=Math.max(document.documentElement.scrollLeft,document.body.scrollLeft);
	
	var bodywidth=de.clientWidth;
	var bodyheight=de.clientHeight;
	
	var maxwidth=bodywidth-bodypadding*2-padding*2;
	var maxheight=bodyheight-bodypadding*2-toolbarheight-padding*3;
	
	if(maxwidth<100||maxheight<100)
		return;
		
	//Init the ....
	if(!this.frame)
	{
		this.frame=document.createElement("DIV");
		this.frame.style.position="absolute";
		this.frame.className="LightBoxFrame ZINDEXLIGHTBOXFRAME";
		
		this.mask=document.createElement("DIV");
		this.mask.style.position="absolute";
		this.mask.className="LightBoxMask ZINDEXLIGHTBOXMASK";

		InsertToBody(this.mask);
		InsertToBody(this.frame);
	}
	
	if(!this.showing)
	{
		this.frame.style.top=st+Math.floor(bodyheight/2)-64+"px";
		this.frame.style.left=sl+Math.floor(bodywidth/2)-64+"px";
		this.frame.style.width="128px";
		this.frame.style.height="128px";
		this.frame.style.display="";
		this.mask.style.display="";
	}
	
	this._loadStatus=null;
	this.frame.innerHTML="";

	this.toolbar=document.createElement("DIV");
	this.toolbar.style.position="absolute";
	this.toolbar.className="LightBoxToolbar";
	
	this.prevbtn=document.createElement("DIV");
	this.prevbtn.className="LightBoxPrevBtn";
	this.prevbtn.style.display="none";
	this.prevbtn.onclick=ToDelegate(this,function(){
		var p=this.GetPrevPhoto(photo);
		if(p)this.Show(p);
	})
	this.frame.appendChild(this.prevbtn);
	
	this.nextbtn=document.createElement("DIV");
	this.nextbtn.className="LightBoxNextBtn";
	this.nextbtn.style.display="none";
	this.nextbtn.onclick=ToDelegate(this,function(){
		var p=this.GetNextPhoto(photo);
		if(p)this.Show(p);
	})
	this.frame.appendChild(this.nextbtn);
	
	this.closebtn=document.createElement("DIV");
	this.closebtn.className="LightBoxCloseBtn";
	this.closebtn.onclick=ToDelegate(this,this.Hide)
	
	var mpos=GetScrollPosition(document.body);
	
	this.mask.style.top="0px";
	this.mask.style.left="0px";
	
	this.mask.style.width=de.scrollWidth+"px";
	this.mask.style.height=de.scrollHeight+"px";
	
	
	var scale = Math.min(maxwidth/photo.Width, maxheight/photo.Height);

	if(scale>1)scale=1;
	
	var imgwidth=Math.floor(photo.Width*scale);
	var imgheight=Math.floor(photo.Height*scale);
	
	this.img=GalleryCreateImage(photo.Url,imgwidth,imgheight);
	
	this.img.style.marginLeft=padding+"px";
	this.img.style.paddingTop=padding+"px";
	
	this.img.style.cursor="pointer";
	
	var innerwidth=imgwidth;
	if(innerwidth<480)
	{
		innerwidth=480;
		this.img.style.marginLeft=padding+Math.floor(innerwidth/2-imgwidth/2)+"px";
	}
	var innerheight=imgheight;
	if(innerheight<240)
	{
		innerheight=240;
		this.img.style.marginTop=padding+Math.floor(innerheight/2-imgheight/2)+"px";
	}
	
	var l=Math.floor(bodywidth/2-innerwidth/2-padding);
	var t=Math.floor(bodyheight/2-innerheight/2-toolbarheight/2-padding);
	var w=innerwidth+padding*2;
	var h=innerheight+padding*3;
	
	var cl=parseInt(this.frame.style.left)-sl;
	var ct=parseInt(this.frame.style.top)-st;
	var cw=parseInt(this.frame.style.width);
	var ch=parseInt(this.frame.style.height);
		
	var xstep=0;
	var ystep=0;
	function AdjustFrame()
	{
		if(ystep<10)
		{
			ystep++;
		}
		else if(xstep<10)
		{
			xstep++;
		}
		
		var nl=Math.floor(cl-(cl-l)*xstep/10);
		var nw=Math.floor(cw-(cw-w)*xstep/10);
		
		var nt=Math.floor(ct-(ct-t)*ystep/10);
		var nh=Math.floor(ch-(ch-h)*ystep/10);
		
		this.frame.style.left=sl+nl+"px";
		this.frame.style.top=st+nt+"px";
		this.frame.style.width=nw+"px";
		this.frame.style.height=nh+"px";
		
		if(xstep<10||ystep<10)
		{
			this.jobtimerid=setTimeout(ToDelegate(this,AdjustFrame),30);
			return;
		}
		
		this._loadStatus=1;
		
		this.frame.appendChild(this.toolbar);
		this.toolbar.display="";
		this.toolbar.style.top=padding*2+innerheight+"px";
		this.toolbar.style.left=padding+"px";
		this.toolbar.style.width=innerwidth+"px";
		this.toolbar.style.height="10px";
		
		this.frame.appendChild(this.img);
		
		this.jobtimerid=setTimeout(ToDelegate(this,AdjustToolbar),10);
	}
	
	var tstep=0;
	function AdjustToolbar()
	{
		tstep++;
		
		var th=Math.floor(toolbarheight*tstep/10);
		this.toolbar.style.height=th+"px";
		this.frame.style.height=h+th+"px";
		
		if(tstep<10)
		{
			this.jobtimerid=setTimeout(ToDelegate(this,AdjustToolbar),30);
			return;
		}
		
		this._loadStatus=2;

		UpdateToolbar=ToDelegate(this,UpdateToolbar);
		
		UpdateToolbar();
		this.toolbar.Update=function(newphoto)
		{
			photo=newphoto;
			UpdateToolbar();
		}
	}
	
	function UpdateToolbar()
	{
		this.toolbar.innerHTML="";
		this.toolbar.appendChild(this.closebtn);
		
		var infohtml=photo.Width+"x"+photo.Height;
		if(photo.Size<10000)
			infohtml+=" "+photo.Size+"B";
		else
			infohtml+=" "+Math.floor(photo.Size/1024)+"KB";
		this.photoinfo=document.createElement("DIV");
		this.photoinfo.className="LightBoxPhotoInfo";
		this.photoinfo.innerHTML=infohtml;
		this.toolbar.appendChild(this.photoinfo);
		
		this.phototext=document.createElement("DIV");
		this.phototext.className="LightBoxPhotoTitle";
		this.phototext.appendChild(document.createTextNode(photo.Title));
		this.toolbar.appendChild(this.phototext);
		
		if(photo.Comment)
		{
			this.photodesc=document.createElement("DIV");
			this.photodesc.className="LightBoxPhotoDescription";
			this.photodesc.appendChild(document.createTextNode(photo.Comment));
			
			this.toolbar.appendChild(this.photodesc);
		}
		
		var container=this.toolbar;
		if(this.Browser.Param.AllowShowComment)
		{
			var cs=photo.Comments;
			var d=document.createElement("DIV");
			d.innerHTML="<a href='#' class='GalleryTooltipNumComments'>"+(cs?cs.length:0)+" "+GalleryLocalize.NUMCOMMENTS+" : <a>";
			var link=d.firstChild;
			link.onclick=ToDelegate(this,function(){
				this.Browser.ShowPhotoComments(photo);
				return false;
			});
			container.appendChild(d);
			
			if(cs&&cs.length>0)
			{
				for(var i=0;i<cs.length;i++)
				{
					if(cs.length>4&&i>=2&&i<cs.length-2)
					{
						if(i==2)
						{
							d=document.createElement("DIV");
							d.className="GalleryCommentDotDotDot";
							d.appendChild(document.createTextNode("..."));
							container.appendChild(d);
						}
						continue;
					}
					var comment=cs[i];
					d=document.createElement("DIV");
					d.className="GalleryComment";
					var s0=document.createElement("SPAN");
					s0.innerHTML=GalleryFormatTimeHTML(comment.Time);
					s0.className="GalleryCommentTime";
					d.appendChild(s0);
					var s1=document.createElement("SPAN");
					s1.appendChild(document.createTextNode(comment.SenderName||GalleryLocalize.DEFAULTSENDERNAME));
					s1.className="GalleryCommentUser";
					d.appendChild(s1);
					d.appendChild(document.createTextNode(" : "));
					var s2=document.createElement("SPAN");
					s2.appendChild(document.createTextNode(comment.Content));
					s2.className="GalleryCommentText";
					d.appendChild(s2);
					container.appendChild(d);
				}
			}
		}
	}
	
	GallerySetFloatObject(true);
	this.showing=true;
	this.jobtimerid=setTimeout(ToDelegate(this,AdjustFrame),10);
	
	this.mask.onclick=ToDelegate(this,this.Hide)
	

	
	this.Browser.Control.style.visibility="hidden";
	
	var HidePrevNext=ToDelegate(this,function(){
		this.nextbtn.style.display="none";
		this.prevbtn.style.display="none";
	});
	var ShowPrevNext=ToDelegate(this,function(event){
		if(this._loadStatus<1)
			return HidePrevNext();
		event=window.event||event;
		var pos=GetClientPosition(this.frame);
		var top=event.clientY-pos.top;
		if(top>innerheight+padding)
			return HidePrevNext();
		
		var left=event.clientX-pos.left;
		this.prevbtn.style.display=left<w*1/3?"":"none";
		this.nextbtn.style.display=left>w*1/3?"":"none";
		
	});
	
	this.frame.onclick=ToDelegate(this,function(event){
		ShowPrevNext(event);
		if(this.prevbtn.style.display=="")
		{
			var p=this.GetPrevPhoto(photo);
			if(p)this.Show(p);
		}
		if(this.nextbtn.style.display=="")
		{
			var p=this.GetNextPhoto(photo);
			if(p)this.Show(p);
		}
	});
	this.frame.onmousemove=ShowPrevNext;
	this.frame.onmouseout=HidePrevNext;

	this.mask.onmousewheel=this.frame.onmousewheel=function(event)
	{
		event=window.event||event;
		if(event.preventDefault)event.preventDefault();
		return event.returnValue=false;
	}
}
GalleryViewer.prototype.Hide=function _GalleryViewer_Hide()
{
	clearTimeout(this.jobtimerid);
	this.frame.style.display="none";
	this.mask.style.display="none";
	this.toolbar.style.display="none";
	this.Browser.Control.style.visibility="";
	this.showing=false;
	GallerySetFloatObject(false);
}

GalleryViewer.prototype.Ajax_Result=function _GalleryViewer_Ajax_Result(ret,param,method)
{
	if(method=="GetAllCategoryData"||method=="GetCategoryData")
	{
		if(this.currentphoto&&this.frame&&this.frame.style.display=="")
		{
			var p=this.Browser.FindPhoto(this.currentphoto.CategoryID,this.currentphoto.PhotoID);
			if(p && this.toolbar.Update)
			{
				this.toolbar.Update(p);
			}
		}
	}
}

GalleryViewer.prototype.GetPrevPhoto=function _GalleryViewer_GetPrevPhoto(photo)
{
	return this.GetNextPhoto(photo,true);
}
GalleryViewer.prototype.GetNextPhoto=function _GalleryViewer_GetNextPhoto(photo,backward)
{
	var cs=this.Browser.GetCategories()
	var photos=[];
	for(var i=0;i<cs.length;i++)
	{
		photos=photos.concat(cs[i].Photos);
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

