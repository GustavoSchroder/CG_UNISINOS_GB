
function GalleryTheme(gb)
{
	this.Browser=gb;
}

GalleryTheme.prototype.CreateThumbnail=function _GalleryTheme_CreateThumbnail(url,width,height)
{
	var div=document.createElement("SPAN");
	var img=GalleryCreateThumbnail(url,width-8,height-8);
	img.className="GalleryThumbnailImage";
	div.className="GalleryThumbnailContainer";
	div.style.width=width+"px";
	div.style.height=height+"px";
	div.appendChild(img);
	return div;
}

GalleryTheme.prototype.CreatePhoto=function _GalleryTheme_CreatePhoto(url,width,height)
{
	var img=GalleryCreateImage(url,width-8,height-8);
	img.className="GalleryPhotoImage";
	
	var div=document.createElement("DIV");
	div.className="GalleryPhotoContainer";
	div.style.width=width+"px";
	div.style.height=height+"px";
	div.appendChild(img);
	return div;
}

GalleryTheme.prototype.InitializeTooltip=function _GalleryTheme_InitializeTooltip(container)
{
	var div=document.createElement("DIV");
	div.className="GalleryTooltipContainer";
	container.appendChild(div);
	return div;
}





















