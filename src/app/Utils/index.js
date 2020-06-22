const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { Error } = require("mongoose");
const { throws } = require("assert");

const searchZoom = async (name) => {
	let zoomUrl = "https://www.zoom.com.br";
	const { data } = await axios.get(`${zoomUrl}/search?q=${name}`);

	const $ = cheerio.load(data);

	let href = $(
		"#pageSearchResultsBody > div.searchList___2csrw > div:nth-child(1)"
	)
		.find("a")
		.attr("href");

	console.log("[ZOOM] Busca feita ");

	if (href) {
		href = zoomUrl + href;
		return href;
	}

	console.log("[ZOOM] Nada encontrado");
	return null;
};

const puppeteerGetHtmlRedirect = async (url) => {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const page = await browser.newPage();
	await page.goto(url);
	// await page.waitForSelector("#anchor-description", {
	// 	visible: true,
	// 	timeout: 0,
	// });
	await page.waitForNavigation();
	await page.waitFor(500);

	let result = await page.$eval("html", (element) => {
		return element.innerHTML;
	});
	await browser.close();
	return result;
};

const filterText = (str) => {
	let newstr = str.replace(/\r?\n|\r/g, ""); //remove /n
	newstr = newstr.replace(/ +(?= )/g, ""); //remove mais que 1 espaco
	return newstr;
};

const puppeteerGetHtmlRedirectAmericanas = async (url) => {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const page = await browser.newPage();
	await page.setUserAgent(
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
	);
	await page.goto(url);
	await page.waitForNavigation();
	await page.waitFor(1000);

	page.evaluate((_) => {
		//scrolla pra carregar o IFRAME, caso tenha
		try {
			document.getElementById("info-section").scrollIntoView();
		} catch (error) {
			console.log("[AMERICANAS] Erro scroll");
		}
	});

	await page.waitFor(1000);

	let result = await page.$eval("html", (element) => {
		return element.innerHTML;
	});
	console.log("result", result);
	await browser.close();
	return result;
};

const getDescMagazine = async function (url) {
	console.log("[MAGAZINE] Buscando descricao");
	const data = await puppeteerGetHtmlRedirect(url);
	if (data) {
		const $ = cheerio.load(data);

		//excluindo texto nao usado
		$("table").remove();
		$(".description__product-title").remove();

		let desc = $(".description__container-text").text();

		if (!desc) {
			console.log("[x] Nao achou a descricao na Magazine");
			return null;
		}
		console.log("[MAGAZINE] Descrição encontrada");

		//limpando o texto
		desc = filterText(desc);

		return { text: desc };
	}

	return null;
};

const getDescAmazon = async function (url) {
	console.log("[AMAZON] Buscando descricao");
	const data = await puppeteerGetHtmlRedirect(url);

	if (data) {
		const $ = cheerio.load(data);
		// console.log(data);

		let desc = $("#productDescription > p").text();
		if (!desc) {
			console.log("[x] Nao achou a descricao na Amazon");
			return null;
		}

		return { text: desc };
	}
	return null;
};
const getDescAmericanas = async function (url) {
	console.log("[AMERICANAS] Buscando descricao");
	const data = await puppeteerGetHtmlRedirectAmericanas(url);

	if (data) {
		const $ = cheerio.load(data);

		let iframe = $.html(
			"#info-section > div:nth-child(1) > section > div > div > div.info-description-frame-inside.info__DescriptionCol-sc-13tjohn-0.FziEj.ColUI-gjy0oc-0.hZFKDP.ViewUI-sc-1ijittn-6.iXIDWU > div > div > div > iframe"
		);

		if (iframe) {
			console.log("[AMERICANAS] Encontrado Iframe");
			return { iframe, text: "" };
		}

		let desc = $(
			"#info-section > div:nth-child(1) > section > div > div > div.info-description-frame-inside.info__DescriptionCol-sc-13tjohn-0.FziEj.ColUI-gjy0oc-0.hZFKDP.ViewUI-sc-1ijittn-6.iXIDWU > div"
		).text();
		if (!desc) {
			console.log("[x] Nao achou a descricao na Americanas");
			return null;
		}

		console.log("[AMERICANAS] Encontrado descricao em texto");
		return { text: desc };
	}

	return null;
};

const getDescription = async (allPrices) => {
	let description = {};
	console.log(allPrices);

	// selecionando as lojas e facilitando a busca de descricao
	allPrices.map((store) => {
		if (store.storeTitle.includes("Magazine")) {
			description["Magazine"] = store;
		}
		if (store.storeTitle.includes("Amazon")) {
			description["Amazon"] = store;
		}
		if (store.storeTitle.includes("Americanas")) {
			description["Americanas"] = store;
		}
	});

	let desc = null;

	if (description["Magazine"]) {
		console.log("MAGAZINE");
		try {
			desc = await getDescMagazine(description["Magazine"].storeUrl);
		} catch (error) {
			console.log("[MAGAZINE] Erro");
		}
	}

	if (!desc && description["Americanas"]) {
		console.log("Americanas");
		console.log(description);
		try {
			desc = await getDescAmericanas(description["Americanas"].storeUrl);
		} catch (error) {
			console.log("[AMERICANAS] Erro");
		}
	}
	console.log("Amazon antes", desc);
	if (!desc && description["Amazon"]) {
		console.log("Amazon depois");
		try {
			desc = await getDescAmazon(description["Amazon"].storeUrl);
		} catch (error) {
			console.log("[Amazon] Erro");
		}
	}

	return desc;
};

const getInfos = async (name, flagDescription = true) => {
	let urlProduct = await searchZoom(name);

	if (!urlProduct) {
		return null;
	}

	const { data } = await axios.get(urlProduct);

	const $ = cheerio.load(data);

	let title = $("#productInfo > h1 > span").text();
	title = filterText(title);

	console.log("[ZOOM] Titulo buscado ");

	let allprices = [];
	$(".offers-list__offer").each((i, el) => {
		let image = $(el).find(".col-img img").attr("src");

		let storeTitle = $(el).find(".col-store a").attr("title").split(" ")[1];

		let storeUrl = $(el)
			.find(".col-store a")
			.attr("href")
			.split(" ")
			.join("");

		let price = $(el).find(".price__total").text();

		allprices.push({ image, storeTitle, storeUrl, price });
	});

	console.log("[ZOOM] Preços salvos ");

	let specs = $.html(".tech-spec-table");

	//salve quebrado
	// console.log(specs);
	// $(".tech-spec-table tbody").each((i, el) => {
	// 	let nameTable = $(el).find(".tt th").text();
	// 	nameTable = nameTable.replace(/\r?\n|\r/g, "");
	// 	nameTable = nameTable.replace(/ +(?= )/g, "");

	// 	// let infos = [];

	// 	// $(el)
	// 	// 	.find(".ti")
	// 	// 	.each((index, element) => {
	// 	// 		let name = $(element).find(".table-attr").text().trim();
	// 	// 		name = name.replace(/\r?\n|\r/g, "");
	// 	// 		name = name.replace(/ +(?= )/g, "");

	// 	// 		let value = $(element).find(".table-val").text();

	// 	// 		infos.push({ name, value });
	// 	// 	});

	// 	specs.push({ nameTable, infos });
	// });

	console.log("[ZOOM] Especificações salvas ");

	let description;

	if (flagDescription) {
		if (allprices && allprices.length > 0) {
			description = await getDescription(allprices);
		}

		//if (!description) {
		//	throw new Error("Product not found");
		//}
		// console.log(description);
	}

	return { title, description, specs, allprices };
};

// const saveJson = (files, name) => {
// 	console.log("[x] Salvando JSON");
// 	let atDate = new Date()
// 		.toLocaleString()
// 		.split(" ")
// 		.join("-")
// 		.split(":")
// 		.join("-")
// 		.split("/")
// 		.join("-");

// 	fs.writeFile(
// 		`${name}-${atDate}.json`,
// 		JSON.stringify(files, null, 4),
// 		function (err) {
// 			if (err) {
// 				console.log(err);
// 			}
// 		}
// 	);

// 	console.log("[!] bye");
// };
module.exports = getInfos;
