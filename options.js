
window.onload = function(){
		setPrevious();
}

function setPrevious() {
	chrome.storage.local.get({'sound': 1}, function(result){
	if (result.sound==1) document.getElementById('sound').checked=true;
	else document.getElementById('sound').checked=false;
	});
}

document.getElementById("sound").addEventListener("checked", myFunction);

function myFunction() {
	if (document.getElementById('sound').checked)
		chrome.storage.local.set({'sound': 1 });
 	else
 		chrome.storage.local.set({'sound': 0 });
});


