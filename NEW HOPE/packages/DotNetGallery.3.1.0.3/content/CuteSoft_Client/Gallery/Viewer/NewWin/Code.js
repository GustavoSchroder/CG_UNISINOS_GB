
function GalleryViewer(gb)
{
	this.Browser=gb;
}

GalleryViewer.prototype.Show=function _GalleryViewer_Show(photo)
{
	this.Browser.ShowPhotoInNewWindow(photo);
}




