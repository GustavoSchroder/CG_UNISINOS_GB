
function GalleryEditor(gb)
{
	this.Browser=gb;
}

GalleryEditor.prototype.Show=function _GalleryEditor_Show()
{
	//var xh=window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject('Microsoft.XMLHttp');
	//xh.open("GET",browser.Param.Folder+"Editor/"+browser.Param.Editor+"/Template.htm",false);
	
	if(this.scope)return;
	
	var browser=this.Browser;
	
	var listener={};
	var scope={};
	this.scope=scope;
	
	var frame=document.createElement("DIV");
	
	frame.className="GalleryEditorFrame ZINDEXEDITOR";
	frame.style.position="absolute";
	
	var br=GetBodyRect();
	var st=br.top;
	var sl=br.left;
	
	frame.style.left=sl+Math.max(0,(document.body.offsetWidth-720)/2)+"px";
	frame.style.top=st+100+"px";
	frame.style.width="720px";
	frame.style.height="420px";
	
	InsertToBody(frame);
	
	var titlebar=document.createElement("DIV");
	titlebar.className="GalleryEditorTitlebar";
	frame.appendChild(titlebar);
	
	var rightToolbar=document.createElement("DIV");
	rightToolbar.className="GalleryEditorRightToolbar";
	frame.appendChild(rightToolbar);
	
	
	var leftToolbar=document.createElement("DIV");
	leftToolbar.className="GalleryEditorLeftToolbar";
	frame.appendChild(leftToolbar);
	
	
	var closebtn=CreateEditorButton("Images/standard-exit.png",GalleryLocalize.CLICK_CLOSE);
	rightToolbar.appendChild(closebtn);
	closebtn.onclick=ToDelegate(this,this.Hide);
	
	var newcatebtn=CreateEditorButton("Images/standard-category.png",GalleryLocalize.CLICK_NEWCATEGORY);
	leftToolbar.appendChild(newcatebtn);
	newcatebtn.onclick=function(){ browser.PromptNewCategory(); };
	
	var uploadbtn=CreateEditorButton("Images/standard-upload.png",GalleryLocalize.CLICK_UPLOADFILES);
	leftToolbar.appendChild(uploadbtn);
	browser.SetMantleButton(uploadbtn);
	
	var leftFrame=document.createElement("DIV");
	leftFrame.className="GalleryEditorLeftFrame";
	frame.appendChild(leftFrame);
	
	var categoryContainer=leftFrame;
	
	var rightFrame=document.createElement("DIV");
	rightFrame.className="GalleryEditorRightFrame";
	frame.appendChild(rightFrame);
	
	var uploadFrame=document.createElement("DIV");
	uploadFrame.style.display="none";
	uploadFrame.className="GalleryEditorRightFrame GalleryEditorUploadPanel";
	frame.appendChild(uploadFrame);
	
	if(navigator.userAgent.indexOf("MSIE 6.")>-1)
	{
		rightFrame.style.width=uploadFrame.style.width=frame.offsetWidth-leftFrame.offsetWidth-6+"px";
		rightFrame.style.styleFloat="right";
		rightFrame.style["float"]="right";
	}
	
	var photoContainer=rightFrame;
	
	var statusbar=document.createElement("DIV");
	statusbar.className="GalleryEditorStatusbar";
	frame.appendChild(statusbar);
	
	var statusright=document.createElement("DIV");
	statusright.style.styleFloat="right";
	statusright.style["float"]="right";
	statusright.className="GalleryEditorStatusRight";
	statusbar.appendChild(statusright);
	
	var statusleft=document.createElement("DIV");
	statusleft.style.styleFloat="left";
	statusleft.style["float"]="right";
	statusleft.className="GalleryEditorStatusLeft";
	statusbar.appendChild(statusleft);

	scope.DoClose=DisposeAll;
	scope.HandleAjaxResult=HandleAjaxResult;
	scope.HandleUploaderEvent=HandleUploaderEvent;

	ShowCategories();
	ShowAllPhotos();
	
	function ShowLeftStatus(status)
	{
		statusleft.innerHTML="";
		statusleft.appendChild(document.createTextNode(status));
	}
	function ShowRightStatus(status)
	{
		statusright.innerHTML="";
		statusright.appendChild(document.createTextNode(status));
	}
	
	function ShowCategories()
	{
		categoryContainer.innerHTML="";
		
		scope._cateitems=[];
		var cates=browser.GetCategories();
		for(var i=0;i<cates.length;i++)
		{
			var item=CreateCategoryItem(cates[i]);
			categoryContainer.appendChild(item);
			scope._cateitems.push(item);
		}
	}
	
	categoryContainer.onclick=ShowAllPhotos;
	
	titlebar.unselectable="on";
	titlebar.onmousedown=function(event)
	{
		event=window.event||event;
		if(event.button==2)return;
		scope.titlemovex=parseInt(frame.style.left)-event.clientX;
		scope.titlemovey=parseInt(frame.style.top)-event.clientY;
		if(document.attachEvent)
		{
			document.attachEvent("onmousemove",document_onmousemove);
			document.attachEvent("onmouseup",document_onmouseup);
		}
		else
		{
			document.addEventListener("mousemove",document_onmousemove,true);
			document.addEventListener("mouseup",document_onmouseup,true);
		}
		
		return event.returnValue=false;
	}
	function document_onmousemove(event)
	{
		event=window.event||event;
		frame.style.left=scope.titlemovex+event.clientX+"px";
		frame.style.top=scope.titlemovey+event.clientY+"px";
	}
	function document_onmouseup(event)
	{
		if(document.detachEvent)
		{
			document.detachEvent("onmousemove",document_onmousemove);
			document.detachEvent("onmouseup",document_onmouseup);
		}
		else
		{
			document.removeEventListener("mousemove",document_onmousemove,true);
			document.removeEventListener("mouseup",document_onmouseup,true);
		}
	}
	
	
	function ShowAllPhotos()
	{
		if(scope._selectedcateitem)
			scope._selectedcateitem.className="GalleryEditorCategory";
		scope._selectedcateitem=null;
		
		browser.SetUploadCategoryID(null);
		
		var cates=browser.GetCategories();
		var photos=[];
		var photos=[];
		for(var i=0;i<cates.length;i++)
		{
			photos=photos.concat(cates[i].Photos);
		}
		ShowPhotos(photos);
	}
	function SelectCategory(category)
	{
		var div=null;
		for(var i=0;i<scope._cateitems.length;i++)
		{
			if(scope._cateitems[i].category.CategoryID==category.CategoryID)
			{
				div=scope._cateitems[i];
			}
		}

		if(scope._selectedcateitem)
			scope._selectedcateitem.className="GalleryEditorCategory";
		scope._selectedcateitem=div;
		if(scope._selectedcateitem)
			scope._selectedcateitem.className="GalleryEditorCategory GalleryEditorCategorySelected";
			
		browser.SetUploadCategoryID(category.CategoryID);
			
		ShowPhotos(category.Photos);
	}
	function ShowPhotos(photos)
	{
		scope._showphotos=photos;
		
		scope._photoitems=[];
		photoContainer.innerHTML="";
		for(var i=0;i<photos.length;i++)
		{
			var item=CreatePhotoItem(photos[i]);
			photoContainer.appendChild(item);
			scope._photoitems.push(item);
		}
	}
	
	function CreatePhotoItem(photo)
	{
		var width=photo.Width;
		var height=photo.Height;
		var title=photo.Title;
		
		var div=document.createElement("DIV");
		div.className="GalleryEditorPhoto"
		div.photo=photo;

		var t=document.createElement("TABLE");
		t.style.width="100%";
		t.style.height="100%";
		t.border=0;
		t.cellSpacing=0;
		t.cellPadding=0;
		var c1=t.insertRow(-1).insertCell(-1);
		var c2=t.insertRow(-1).insertCell(-1);
		c1.className="GalleryEditorPhotoImageCell";
		c1.onselectstart=new Function("","return false");
		c2.style.textAlign="center";
		var scale = Math.min(88/width, 88/height);
		var img;
		if(photo)
		{
			img=browser.CreateThumbnail(photo.Thumbnail,Math.floor(width * scale),Math.floor(height * scale));
		}
		else
		{
			img=document.createElement("IMG");
			img.src=thumbnail;
			img.width=Math.floor(width * scale);
			img.height=Math.floor(height * scale);
		}	
		c1.appendChild(img);
		c2.innerHTML="<span class='GalleryEditorPhotoText'></span>";
		var titltText=title;
		if(titltText&&titltText.length>30)titltText=titltText.substring(0,30)+"..";
		c2.firstChild.appendChild(document.createTextNode(titltText));
		
		if(browser.Param.AllowShowComment)
		{
			var cs=photo.Comments;
			if(cs&&cs.length)
			{
				c2.innerHTML+="<br/><span class='GalleryEditorPhotoNumComments'>"+cs.length+" "+GalleryLocalize.NUMCOMMENTS+"<span>";
			}
		}
			
		div.appendChild(t);
		
		function SetDivClass(div)
		{
			var clsname;
			if(div.dngselected&&div.dnghover)
				clsname=" GalleryEditorPhotoHoverSelected";
			else if(div.dngselected)
				clsname=" GalleryEditorPhotoSelected";
			else
				clsname="";
			div.className="GalleryEditorPhoto "+clsname;
		}
		div.onmouseover=ToDelegate(this,function()
		{
			browser.ShowPhotoTooltip(photo,div,listener);
		});
		div.onclick=ToDelegate(scope,function()
		{
			if(scope._selectedphotoitem)
			{
				scope._selectedphotoitem.dngselected=false;
				SetDivClass(scope._selectedphotoitem);
			}
			scope._selectedphotoitem=div;
			div.dngselected=true;
			SetDivClass(div);
		});
		div.ondblclick=ToDelegate(scope,function()
		{
			browser.ShowViewer(photo);
		});
		div.oncontextmenu=ToDelegate(scope,function(event)
		{
			div.onclick();
			event=event||window.event;
			browser.ShowPhotoMenu(photo,div,event,scope);
			if(event.preventDefault)event.preventDefault();
			event.cancelBubble=true;
			return event.returnValue=false;
		});
		
		return div;
	}
	
	function CreateCategoryItem(category)
	{
		var div=document.createElement("DIV");
		div.category=category;
		div.className="GalleryEditorCategory";
		div.appendChild(document.createTextNode("("+category.Photos.length+")"));
		div.appendChild(document.createTextNode(category.Title||GalleryLocalize.DEFAULTCATEGORYNAME));
		div.onclick=function(event)
		{
			event=window.event||event;
			SelectCategory(category);
			event.cancelBubble=true;
		}
		div.oncontextmenu=function(event)
		{
			event=event||window.event;
			browser.ShowCategoryMenu(category,div,event,listener);
			if(event.preventDefault)event.preventDefault();
			event.cancelBubble=true;
			return event.returnValue=false;
		}
		return div;
	}
	
	function CreateEditorButton(url,txt)
	{
		var btn=document.createElement("SPAN");
		var img=document.createElement("IMG");
		img.src=browser.GetTheme(url);
		btn.appendChild(img);
		btn.appendChild(document.createTextNode(txt));
		btn.className="GalleryEditorButton";
		btn.onmouseover=function()
		{
			btn.className="GalleryEditorButton GalleryEditorButtonHover";
		}
		btn.onmouseout=function()
		{
			btn.className="GalleryEditorButton";
		}
		return btn;
	}
	
	function HandleAjaxResult(ret,param,method)
	{
		if(method=="GetAllCategoryData"||method=="GetCategoryData")
		{
			this._categories=browser.GetCategories();
			
			if(scope._selectedcateitem)
			{
				var cate=scope._selectedcateitem.category;
				for(var i=0;i<this._categories.length;i++)
				{
					if(this._categories[i].CategoryID==cate.CategoryID)
					{
						ShowCategories();
						SelectCategory(this._categories[i]);
						return;
					}
				}
			}
			
			ShowCategories();
			ShowAllPhotos();
		}
	}
	
	function HandleUploaderEvent(name,args)
	{
		var finishcount=0;
		var errorcount=0;
		var queuecount=0;
		
		var items=browser.GetUploaderItems();
		var currentitem;
		for(var i=0;i<items.length;i++)
		{
			var item=items[i];
			if(item.Status=="Finish")
				finishcount++;
			else if(item.Status=="Error")
				errorcount++;
			else if(item.Status=="Queue")
				queuecount++;
			else
				currentitem=item;
		}
		
		if(name=="Start")
		{
			rightFrame.style.display="none";
			uploadFrame.style.display="";
			uploadFrame.innerHTML="";
			var pctrl=document.createElement("DIV");
			pctrl.className="GalleryEditorUploadProgress";
			uploadFrame.appendChild(pctrl);
			var us=browser.uploaderhidden.internalobject;
			this.oldinsertbtn=us.insertBtn;
			us.progressCtrl=pctrl;
			us.progressText=pctrl;
			us.insertBtn=pctrl;
			
		}
		if(name=="Stop"||name=="Postback")
		{
			var us=browser.uploaderhidden.internalobject;
			us.insertBtn=this.oldinsertbtn;
			rightFrame.style.display="";
			uploadFrame.style.display="none";
			ShowLeftStatus("");
			ShowRightStatus("");
		}
		if(name=="QueueUI")
		{
			ShowRightStatus(finishcount+"/"+items.length);
		}
		if(name=="Progress")
		{
			var total=args[4];
			if(total)
			{
				var p=Math.floor(100*args[3]/total)
				ShowLeftStatus(args[1]+" - "+p+"%");
			}
			else
			{
				ShowLeftStatus(args[1]);
			}
		}

	}
	
	function DisposeAll()
	{
		document.body.removeChild(frame);
		//clear timers, clear events
	}
	
}

GalleryEditor.prototype.Hide=function _GalleryEditor_Hide()
{
	if(this.scope)
	{
		this.scope.DoClose();
		this.scope=null;
	}
}

GalleryEditor.prototype.Ajax_Result=function _GalleryEditor_Ajax_Result(ret,param,method)
{
	if(this.scope)
	{
		this.scope.HandleAjaxResult(ret,param,method);
	}
}

GalleryEditor.prototype.Uploader_Event=function _GalleryEditor_Uploader_Event(name,args)
{
	if(name=="Start")
	{
		if(!this.scope)
		{
			this._showbyupload=true;
			this.Show();
		}
	}
	if(name=="Stop")
	{
		if(this._showbyupload)
		{
			this._showbyupload=false;
			this.Hide();
		}
	}
	
	if(this.scope)
	{
		this.scope.HandleUploaderEvent(name,args);
	}

}
















