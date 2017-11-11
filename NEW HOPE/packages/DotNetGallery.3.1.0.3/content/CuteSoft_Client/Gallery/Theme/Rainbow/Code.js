
function GalleryTheme(gb)
{
	this.Browser=gb;
}

GalleryTheme.prototype.CreateThumbnail=function _GalleryTheme_CreateThumbnail(url,width,height)
{
	var img=GalleryCreateThumbnail(url,width-4,height-4);
	img.className="GalleryThumbnailImage";
	
	var div1=document.createElement("SPAN");
	
	div1.style.width=width+"px";
	div1.style.height=height+"px";
	
	div1.className="GalleryThumbnailContainer";
	
	div1.appendChild(img);

	return div1;
}

GalleryTheme.prototype.CreatePhoto=function _GalleryTheme_CreatePhoto(url,width,height)
{
	var img=GalleryCreateImage(url,width-4,height-4);
	img.className="GalleryPhotoImage";
	
	var div1=document.createElement("SPAN");

	div1.style.width=width+"px";
	div1.style.height=height+"px";
	
	div1.className="GalleryPhotoContainer";
	
	div1.appendChild(img);

	return div1;
}

GalleryTheme.prototype.InitializeTooltip=function _GalleryTheme_InitializeTooltip(container)
{
	var div1=document.createElement("DIV");
	var div2=document.createElement("DIV");
	div1.className="GalleryTooltipContainer1";
	container.appendChild(div1);
	div2.className="GalleryTooltipContainer2";
	div1.appendChild(div2);
	return div2;
}





















