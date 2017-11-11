
function GallerySlider(gb)
{
	this.Browser=gb;
}

GallerySlider.prototype.Show=function _GallerySlider_Show(optionalCategory)
{
	var w=window.screen.availWidth;
	var h=window.screen.availHeight;
	var url=this.Browser.Param.Folder+"Share/Slider/fullscreen.htm";
	window._galleryslider=this;
	this.optionalCategory=optionalCategory;
	var win=window.open(url,"slider"+new Date().getTime(),"fullscreen=1,left=0,top=0,width="+w+",height="+h+",resizable=1");
	//win.resizeTo(w,h);
}



