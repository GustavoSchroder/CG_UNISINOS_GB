//this file is for client side

GalleryLocalize_Current={

	LanguageName		:"en-us"
	,
	LanguageText		:"English(US)"
	,
	DEFAULTCATEGORYNAME	:"(Default)"
	,
	DEFAULTSENDERNAME	:"(Guest)"
	,
	NUMCOMMENTS	:"Comment(s)"
	,
	CLICK_OPENCATEGORY	:"Open"
	,
	CLICK_OPENPHOTO		:"Open"
	,
	CLICK_EDIT			:"Edit"
	,
	CLICK_SHOWEDITOR		:"Admin Console"
	,
	CLICK_DELETE			:"Delete"
	,
	CLICK_CLOSE			:"Close"
	,
	CLICK_SHOWSLIDER			:"Show Slider"
	,
	CLICK_ADDCOMMENT		:"Add Comment"
	,
	CLICK_UPLOADFILES		:"Upload files"
	,
	CLICK_DELETECOMMENT		:"Delete Comment"
	,
	LOCATION		:"Location"
	,
	CLICK_NEWCATEGORY	:"New Category"
	,
	CLICK_DELETE		:"Delete"
	,
	CLICK_SHOWSLIDER		:"Show Slider"
	,
	PROMPT_TYPECATEGORYNAME	:"Please input category name"
	,
	PROMPT_TYPEPHOTONAME	:"Please input photo title"
	,
	PROMPT_TYPECOMMENT		:"Please input new comment"
	,
	CONFIRM_CLICK_DELETEPHOTO		:"Are you sure you want to delete photo '{0}' ?"
	,
	CONFIRM_CLICK_DELETECATEGORY	:"Are you sure you want to delete category '{0}' and all its files ?"
	,
	CONFIRM_CLICK_DELETECOMMENT	:"Are you sure you want to delete comment '{0}' ?"
	,
	TODO	:function(text){return text;}
};

if(typeof(GalleryLocalize)=="undefined")
{
	//new Function("","") return a constructor , new constructor create an instance
	window.GalleryLocalize=new new Function("","");
}

for(var p in GalleryLocalize_Current)
{
	if(GalleryLocalize_Current.hasOwnProperty(p))
	{
		GalleryLocalize[p]=GalleryLocalize_Current[p];
	}
}


GalleryLocalize_ENUS=GalleryLocalize_Current;
GalleryLocalize["en-us"]=GalleryLocalize_Current;
