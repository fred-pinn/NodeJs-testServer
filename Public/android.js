window.showText = false;
window.showState = 0;
window.oldHtml = null;
window.intervalTimer = window.setInterval(function(){
	
	var xhp = new XMLHttpRequest ();
	xhp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		   // Typical action to be performed when the document is ready:
		   if (window.oldHtml == null) {
			   window.oldHtml = xhp.responseText;
		   } else if (window.oldHtml != xhp.responseText) {
			   doc = window.document;
			   window.oldHtml = xhp.responseText;
			   doc.open();
			   doc.write(xhp.responseText);
			   doc.close();
			   
		   }
		}
	};
	xhp.open("GET", "/Activity.html", true);
	xhp.send();
	
	
},2000);
window.onclick = function(e){
	var target = e.target;
	if (target.id == 'IMG_16908336' || target.id == 'DIV_16908336') {
		switch(++window.showState) {
			case 0: case 3:
				window.showState = 0;
				setStyle("span {display:none !important;}\n"+"img {display:flex !important;}");
				break;
			case 1:
				setStyle("span {display:flex !important;}\n"+"img {display:flex !important;}");
				break;		
			case 2:
				setStyle("span {display:flex !important;}\n"+"img {display:none !important;}");
				break;			
		}	
	}
	else if (target.tagName == "BUTTON") {
		clickOnAndroid(target);
	}
	else {
		var element = target.parentElement;
	    while (element) {
			if (element.tagName == "BUTTON") {
				clickOnAndroid(element);
			}
			element = element.parentElement;
		}																																															
	}
	
}

function clickOnAndroid(el) {
		var buttonName = el.name;
		var url = "http://android.touchcommerce.com:8181/clickView?id=" + buttonName;
		//var iframe = document.createElement("IFRAME");
		//iframe.src = url;
		//iframe.style.display="none";
		//document.body.appendChild(iframe);
		
			var xhp = new XMLHttpRequest ();
			xhp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
				   // Typical action to be performed when the document is ready:

				}
			}
		 
			xhp.open("GET", "/clickView?id="+buttonName, true);
			xhp.send();

}

function setStyle(cssText) {
	var span = window.document.getElementById("spanHideShow");
	if (span) {
		span.innerText = cssText;
	} else {
		console.error("could not find style sheet");
	}
};