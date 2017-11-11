
function GallerySlider(gb)
{
	this.Browser=gb;
	
	var link=document.createElement("LINK");
	link.setAttribute("rel","stylesheet");
	link.setAttribute("href",this.Browser.Param.Folder+"Layout/SlideShow/Style.css");
	document.body.insertBefore(link,document.body.firstChild);
}

GallerySlider.prototype.Show=function _GallerySlider_Show(optionalCategory)
{
	if(this.sliderobject)
	{
		this.sliderobject.Show(optionalCategory);
		return;
	}

	var xh=window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject('Microsoft.XMLHttp');
	xh.open("GET",this.Browser.Param.Folder+"Layout/SlideShow/Template.htm",false);
	xh.send("");
	var template=xh.responseText;
	xh.open("GET",this.Browser.Param.Folder+"Layout/SlideShow/Code.js",false);
	xh.send("");
	var codejs=xh.responseText;

	var browser=this.Browser
	var cls=new Function("","");
	cls.prototype=browser;
	var wrapper=new cls();

	var div=document.createElement("DIV");
	//div.className="ZINDEXSLIDER";
	div.style.position="absolute";
	div.style.width="600px";
	div.style.height="300px";
	InsertToBody(div);
	div.style.backgroundColor='gray'
	
	
	div.innerHTML=template;

	wrapper.Control=div;

	wrapper.FindElement=function(id)
	{
		if(div.all)
			return div.all(id);
		return this.FindElementImpl(div,id);
	}
	wrapper.Execute=function(command,argument)
	{
		ToDelegate(wrapper,browser.Execute)(command,argument);
	}
	wrapper.ShowSlider=Hide;
	wrapper.ShowViewer=function(photo)
	{
		browser.ShowPhotoInNewWindow(photo);
	}
	
	div.__gallerybrowser=wrapper;
	
	eval(codejs);
	var layout=new GalleryLayout(wrapper);
	
	layout.ToggleFullPage();
	layout.ToggleFullPage=Hide;
	
	function Hide()
	{
		div.style.display="none";
		if(layout.playing)layout.TogglePlay();
		GallerySetFloatObject(false);
		browser.Control.style.display="";
	}
	
	this.sliderobject={};
	this.sliderobject.layout=layout;
	this.sliderobject.Show=function(optionalCategory)
	{
		div.style.display="";
		if(!layout.playing)layout.TogglePlay();
		GallerySetFloatObject(layout);
		browser.Control.style.display="none";
	}
	
	browser.Control.style.display="none";
	
	GallerySetFloatObject(layout);
}


GallerySlider.prototype.Ajax_Result=function _GallerySlider_Ajax_Result(ret,param,method)
{
	if(this.sliderobject)
	{
		if(this.sliderobject.layout.Ajax_Result)
		{
			this.sliderobject.layout.Ajax_Result(ret,param,method);
		}
	}
}




