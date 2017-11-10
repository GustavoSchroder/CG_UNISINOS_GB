
function GalleryPopup(gb)
{
	this.Browser=gb;
}

GalleryPopup.prototype.Confirm=function _GalleryPopup_Confirm(message,func,_this,title)
{
	var val=confirm(message);
	func.apply(_this,[val]);
}

GalleryPopup.prototype.Prompt=function _GalleryPopup_Prompt(message,func,_this,title,defaultText)
{
	var param={}
	param.url=this.Browser.Param.Folder+"Share/Popup/Dialogs/prompt.htm?"+new Date().getTime();
	param.width=360;
	param.height=180;
	param.browser=this.Browser;
	param.arg_message=message;
	param.arg_value=defaultText||"";
	param.arg_title=title;
	param.arg_callback=function(val)
	{
		func.apply(_this,[val]);
	}
	GalleryCreateDialog(param);
}

GalleryPopup.prototype.PromptEditPhoto=function _GalleryPopup_PromptEditPhoto(photo)
{
	var param={}
	param.url=this.Browser.Param.Folder+"Share/Popup/Dialogs/editphoto.htm?"+new Date().getTime();
	param.width=360;
	param.height=180;
	param.browser=this.Browser;
	param.arg_photo=photo;
	GalleryCreateDialog(param);
	
//	this.Prompt(GalleryLocalize.PROMPT_TYPEPHOTONAME,function(newname){
//		if(!newname)return;
//		this.Browser.AsyncUpdatePhoto({CategoryID:photo.CategoryID,PhotoID:photo.PhotoID,Title:newname,Comment:photo.Comment});
//	},this,null,photo.Title);
}
GalleryPopup.prototype.PromptEditCategory=function _GalleryPopup_PromptEditCategory(category)
{
//	var param={}
//	param.url=this.Browser.Param.Folder+"Share/Popup/Dialogs/editcategory.htm?"+new Date().getTime();
//	param.width=360;
//	param.height=180;
//	param.browser=this.Browser;
//	param.arg_category=category;
//	GalleryCreateDialog(param);
	
	this.Prompt(GalleryLocalize.PROMPT_TYPECATEGORYNAME,function(newname){
		if(!newname)return;
		this.Browser.AsyncUpdateCategory({CategoryID:category.CategoryID,Title:newname});
	},this,null,category.Title);
}

GalleryPopup.prototype.PromptNewCategory=function _GalleryPopup_PromptNewCategory()
{
	this.Browser.Prompt(GalleryLocalize.PROMPT_TYPECATEGORYNAME,function(newname){
		if(!newname)return;
		this.Browser.AsyncCreateCategory({Title:newname});
	},this);
}

GalleryPopup.prototype.ShowCategoryMenu=function _GalleryPopup_ShowCategoryMenu(category,element,event,listener)
{
	GalleryHideTooltip();
	
	var menu=CreateGalleryMenu(this.Browser.ThemeFolder);
	menu.Add(1,GalleryLocalize.CLICK_OPENCATEGORY,null,function Open(){
		if(listener.Popup_OpenCategory)listener.Popup_OpenCategory(category);
	});
	
	menu.Add(1,GalleryLocalize.CLICK_SHOWSLIDER,null,ToDelegate(this,function Slider(){
		this.Browser.ShowSlider(category)
	}));
	
	menu.AddSpliter();
	
	if(this.Browser.Param.AllowPostComment)
	{
		menu.Add(1,GalleryLocalize.CLICK_ADDCOMMENT,null,ToDelegate(this,function AddComment(){
			this.Browser.ShowCategoryComments(category);
		}));

	}
	
	//if(this.Browser.Param.AllowShowComment)
	
	if(this.Browser.Param.AllowEdit)
	{
		var cs=category.Comments;
		var state=0;
		if(cs&&cs.length>0)state=1;
		var submenu=menu.Add(state,GalleryLocalize.CLICK_DELETECOMMENT);
		for(var i=0;i<(cs&&cs.length);i++)
		{
			var content=comment=cs[i].Content;
			if(content.length>30)content=content.substring(0,30)+"..";
			var mi=submenu.Add(1,HtmlEncode(content),null,ToDelegate(this,function DelComment(menuitem){
				var comment=cs[menuitem.commentIndex];
				this.Confirm(FormatText(GalleryLocalize.CONFIRM_CLICK_DELETECOMMENT,menuitem.commentContent),function(res){
					if(!res)return;
					this.Browser.AsyncDeleteCategoryComment({CategoryID:category.CategoryID,CommentID:comment.CommentID});
				},this);
			}));
			mi.commentContent=content;
			mi.commentIndex=i;
		}
	}
	
	menu.AddSpliter();
	
	if(this.Browser.Param.AllowEdit)
	{
		menu.Add(1,GalleryLocalize.CLICK_EDIT,null,ToDelegate(this,function Edit(){
			this.PromptEditCategory(category);
		}));
		
		menu.Add(1,GalleryLocalize.CLICK_DELETE,null,ToDelegate(this,function Delete(){
			this.Confirm(FormatText(GalleryLocalize.CONFIRM_CLICK_DELETECATEGORY,category.Title||GalleryLocalize.DEFAULTCATEGORYNAME),function(res){
				if(!res)return;
				this.Browser.AsyncDeleteCategory({CategoryID:category.CategoryID});
			},this);
		}));
		
		menu.AddSpliter();
	}
	
	var y=Math.max(document.body.scrollTop,document.documentElement.scrollTop)
	var x=Math.max(document.body.scrollLeft,document.documentElement.scrollLeft)
	menu.Show(document.body,event.clientX+x,event.clientY+y+1,element);
}

GalleryPopup.prototype.ShowPhotoMenu=function _GalleryPopup_ShowPhotoMenu(photo,element,event,listener)
{
	GalleryHideTooltip();
	
	var menu=CreateGalleryMenu(this.Browser.ThemeFolder);
	menu.Add(1,GalleryLocalize.CLICK_OPENPHOTO,null,ToDelegate(this,function Open(){
		if(listener.OnMenuOpenPhoto)
			listener.OnMenuOpenPhoto(photo);
		else
			this.Browser.ShowViewer(photo);
	}));
	menu.AddSpliter();
	
	if(this.Browser.Param.AllowPostComment)
	{
		menu.Add(1,GalleryLocalize.CLICK_ADDCOMMENT,null,ToDelegate(this,function AddComment(){
			this.Browser.ShowPhotoComments(photo);
		}));
	}
	
	if(this.Browser.Param.AllowEdit)
	{
		var cs=photo.Comments;
		var state=0;
		if(cs&&cs.length>0)state=1;
			
		var submenu=menu.Add(state,GalleryLocalize.CLICK_DELETECOMMENT);
		for(var i=0;i<(cs&&cs.length);i++)
		{
			var content=cs[i].Content;
			if(content.length>30)content=content.substring(0,30)+"..";
			var mi=submenu.Add(1,HtmlEncode(content),null,ToDelegate(this,function DelComment(menuitem){
				var comment=cs[menuitem.commentIndex];
				this.Confirm(FormatText(GalleryLocalize.CONFIRM_CLICK_DELETECOMMENT,menuitem.commentContent),function(res){
					if(!res)return;
					this.Browser.AsyncDeletePhotoComment({CategoryID:photo.CategoryID,PhotoID:photo.PhotoID,CommentID:comment.CommentID});
				},this);
			}));
			mi.commentContent=content;
			mi.commentIndex=i;
		}
	}
	
	menu.AddSpliter();
	
	if(this.Browser.Param.AllowEdit)
	{
		menu.Add(1,GalleryLocalize.CLICK_EDIT,null,ToDelegate(this,function Edit(){
			this.PromptEditPhoto(photo);
		}));
		
		menu.Add(1,GalleryLocalize.CLICK_DELETE,null,ToDelegate(this,function Delete(){
			this.Confirm(FormatText(GalleryLocalize.CONFIRM_CLICK_DELETEPHOTO,photo.Title),function(res){
				if(!res)return;
				this.Browser.AsyncDeletePhoto({CategoryID:photo.CategoryID,PhotoID:photo.PhotoID});
			},this);
		}));
		
		menu.AddSpliter();
	}
	
	var y=Math.max(document.body.scrollTop,document.documentElement.scrollTop)
	var x=Math.max(document.body.scrollLeft,document.documentElement.scrollLeft)
	menu.Show(document.body,event.clientX+x,event.clientY+y+1,element);
}

GalleryPopup.prototype.ShowPhotoTooltip=function _GalleryPopup_ShowPhotoTooltip(photo,element)
{
	var gb=this.Browser;
	
	var div,img
	var timerid;
	GalleryStartTooltip(this.Browser,element,null,ToDelegate(this,function(container){
		div=container;
		div.innerHTML="";
		
		var infohtml=photo.Width+"x"+photo.Height;
		if(photo.Size<10000)
			infohtml+=" "+photo.Size+"B";
		else
			infohtml+=" "+Math.floor(photo.Size/1024)+"KB";

		var d=document.createElement("DIV");
		d.className="GalleryPhotoTitle";
		d.appendChild(document.createTextNode(photo.Title));
		d.innerHTML+="&nbsp;"+infohtml;
		div.appendChild(d);
		
		if(photo.Comment)
		{
			var d=document.createElement("DIV");
			d.className="GalleryPhotoDescription";
			d.appendChild(document.createTextNode(photo.Comment));
			
			container.appendChild(d);
		}
		
		if(this.Browser.Param.AllowShowComment)
		{
			var cs=photo.Comments;
			var d=document.createElement("DIV");
			d.innerHTML="<a href='#' class='GalleryTooltipNumComments'>"+(cs?cs.length:0)+" "+GalleryLocalize.NUMCOMMENTS+" : <a>";
			var link=d.firstChild;
			link.onclick=ToDelegate(this,function(){
				GalleryHideTooltip();
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

		container.appendChild(document.createElement("BR"));

		img=document.createElement("IMG");
		img.border=0;
		img.src=photo.Thumbnail;
		img.style.cursor="pointer";
		
		var scale = Math.min(320/photo.Width, 320/photo.Height );
		if(scale>1)scale=1;
		img.style.width=Math.floor(photo.Width*scale)+"px";
		img.style.height=Math.floor(photo.Height*scale)+"px";
		
		img.onclick=function()
		{
			gb.ShowViewer(photo);
		}
		div.appendChild(img);
		
		if(gb["IsCached-"+photo.Url])
		{
			LoadPhoto();
		}
		else
		{
			setTimeout(LoadPhoto,800);
		}
	}),
	function(){
		clearTimeout(timerid);
	});
	function LoadPhoto()
	{
		var newimg=document.createElement("IMG");
		newimg.style.position='absolute';
		newimg.style.top="0px";
		newimg.style.left="0px";
		newimg.style.width="1px";
		newimg.style.height="1px";
		div.insertBefore(newimg,img);
		newimg.onload=function()
		{
			gb["IsCached-"+photo.Url]=true;
			newimg.style.position='';
			newimg.style.top="";
			newimg.style.left="";
			newimg.style.width=img.style.width;
			newimg.style.height=img.style.height;
			newimg.style.cursor="pointer";
			newimg.onclick=img.onclick;
			div.removeChild(img);
			img=newimg;
		}
		newimg.src=photo.Url;
	}
}
GalleryPopup.prototype.ShowCategoryTooltip=function _GalleryPopup_ShowCategoryTooltip(category,element,listener)
{
	var div;
	GalleryStartTooltip(this.Browser,element,null,ToDelegate(this,function(container){
		div=container;
		container.innerHTML="";
		container.appendChild(document.createTextNode((category.Title||GalleryLocalize.DEFAULTCATEGORYNAME)+" ("+category.Photos.length+")"));
		
		if(this.Browser.Param.AllowShowComment)
		{
			var cs=category.Comments;
			var d=document.createElement("DIV");
			d.innerHTML="<a href='#' class='GalleryTooltipNumComments'>"+(cs?cs.length:0)+" "+GalleryLocalize.NUMCOMMENTS+" : <a>";
			var link=d.firstChild;
			link.onclick=ToDelegate(this,function(){
				GalleryHideTooltip();
				this.Browser.ShowCategoryComments(category);
				return false;
			});
			container.appendChild(d);
			
			if(cs&&cs.length>0)
			{
				for(var i=0;i<cs.length;i++)
				{
					if(i>=2&&i<cs.length-2)
					{
						if(i==2)
						{
							d=document.createElement("DIV");
							d.appendChild(document.createTextNode("..."));
							container.appendChild(d);
						}
						continue;
					}
					var comment=cs[i];
					d=document.createElement("DIV");
					d.appendChild(document.createTextNode((comment.SenderName||GalleryLocalize.DEFAULTSENDERNAME)+" : "+comment.Content));
					container.appendChild(d);
				}
			}
		}

		for(var i=0;i<4;i++)
		{
			if(i%2==0)
				container.appendChild(document.createElement("BR"));
		
			var box=document.createElement("SPAN");
			box.style.floatStyle="left";
			box.style.padding="2px";
			box.style.width="130px";
			box.style.height="130px";
			box.style.textAlign="center";
			
			var photo=category.Photos[i];
			if(photo)
			{
				var img=document.createElement("IMG");
				img.border=0;
				var scale = Math.min(128/photo.Width, 128/photo.Height);
				if(scale>1)scale=1;
				img.style.width=Math.floor(photo.Width*scale)+"px";
				img.style.height=Math.floor(photo.Height*scale)+"px";
				img.src=photo.Thumbnail;
				box.appendChild(img);
			}
			
			if(listener&&listener.Popup_OpenCategory)
			{
				box.onclick=ClickIntoCategory;
				box.style.cursor="pointer";
			}
			
			container.appendChild(box);
		}

	}),
	function(){
		
	});
	
	function ClickIntoCategory()
	{
		GalleryHideTooltip();
		listener.Popup_OpenCategory(category);
	}
}





GalleryPopup.prototype.ShowCategoryComments=function _GalleryPopup_ShowCategoryComments(category)
{
	this.ShowComments(category);
}

GalleryPopup.prototype.ShowPhotoComments=function _GalleryPopup_ShowPhotoComments(photo)
{
	this.ShowComments(photo);
}

GalleryPopup.prototype.ShowComments=function _GalleryPopup_ShowComments(item)
{
	var param={}
	param.url=this.Browser.Param.Folder+"Share/Popup/Dialogs/comments.htm?"+new Date().getTime();
	param.width=480;
	param.height=320;
	param.browser=this.Browser;
	param.arg_item=item;
	GalleryCreateDialog(param);
}
















