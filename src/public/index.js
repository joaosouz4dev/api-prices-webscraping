async function search(siteName) {
	animation();
	try {
		var getUrl = window.location;
		var baseUrl =
			getUrl.protocol +
			"//" +
			getUrl.host +
			"/" +
			getUrl.pathname.split("/")[1];
		let name = document.querySelector("input").value;
		let response = await fetch(`${baseUrl}${siteName}?name=${name}`);
		saveJson(await response.json(), siteName);
	} catch (error) {
		alert("deu erro");
	}
	animation();
}
const saveJson = (file, siteName) => {
	let dataStr =
		"data:text/json;charset=utf-8," +
		encodeURIComponent(JSON.stringify(file, null, 4));
	let downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", siteName + ".json");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
};
const animation = () => {
	let anim = document.getElementById("animation");
	if (anim.style.opacity == 1) {
		anim.style.opacity = 0;
	} else {
		anim.style.opacity = 1;
	}
};
