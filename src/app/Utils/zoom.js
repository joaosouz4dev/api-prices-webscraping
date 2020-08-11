const axios = require("axios");
const cheerio = require("cheerio");

const getInfosAmazon = require("../Utils/amazon");
const getInfosAmericanas = require("../Utils/americanas");
const getInfosMagazine = require("../Utils/magazine");

const StoresModel = require("../models/stores");

const createCustomError = require("./errorException");

const saveBd = async (stores) => {
	console.log("Salvando lojas que não possuem algoritmo de scrap");

	stores.map(async (el) => {
		if (el.length > 0) {
			await StoresModel.create({
				name: el,
			});
		}
	});
};

const saveNameStores = async (data) => {
	const $ = cheerio.load(data);

	const stores = [];
	let scrapStores = null;
	let flag = false;

	$(".card").each(function (i, el) {
		let name = $(el)
			.find(".merchantName")
			.text()
			.trim()
			.split(" ")
			.join("");

		// lojas que o algoritmo ja consegue fazer redirect
		if (
			!name.includes("Amazon") &&
			!name.includes("Americanas") &&
			!name.includes("Magazine")
		) {
			//lojas que nao podemos fazer o scrap
			//eh add no banco
			stores.push(name);
		} else if (!flag) {
			scrapStores = name;
			flag = true;
		}
	});

	await saveBd(stores);
	return scrapStores;
};

const searchZoom = async (name) => {
	let zoomUrl = "https://www.zoom.com.br";
	const { data } = await axios.get(`${zoomUrl}/search?q=${name}`);
	const $ = cheerio.load(data);

	let href = $("#pageSearchResultsBody > div:nth-child(2) > div:nth-child(1)")
		.find("a")
		.attr("href");

	console.log("[ZOOM] Busca feita ");

	//lead eh a url de redirect, o produto so tem em uma loja
	if (href && !href.includes("lead")) {
		console.log(href);
		href = zoomUrl + href;
		return { flag: true, href };
	}

	let scrapStores = await saveNameStores(data);
	console.log("[ZOOM] Nada encontrado");
	return {
		flag: false,
		href: null,
		scrapStores,
	};
};

const filterText = (str) => {
	let newstr = str.replace(/\r?\n|\r/g, ""); //remove /n
	newstr = newstr.replace(/ +(?= )/g, ""); //remove mais que 1 espaco
	return newstr;
};

const getDescription = async (allPrices, name) => {
	let description = {};
	// console.log(allPrices);

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
		try {
			console.log("[REDIRECT] Magazine");
			let { description } = await getInfosMagazine(name);
			desc = description;
		} catch (error) {
			console.log("[MAGAZINE] Erro");
		}
	}

	if (!desc && description["Americanas"]) {
		try {
			console.log("[REDIRECT] Americanas");
			let { description } = await getInfosAmericanas(name);
			desc = description;
		} catch (error) {
			console.log("[AMERICANAS] Erro");
		}
	}
	if (!desc && description["Amazon"]) {
		try {
			console.log("[REDIRECT] Amazon");
			let { description } = await getInfosAmazon(name);
			desc = description;
		} catch (error) {
			console.log("[Amazon] Erro");
		}
	}

	return desc;
};

const getTitle = ($) => {
	try {
		let title = $("#productInfo > h1 > span").text();
		title = filterText(title);
		console.log("[ZOOM] Titulo buscado ");

		return title;
	} catch (error) {
		console.log("[ZOOM] erro na busca pelo titulo");
	}
};

const getImgsAndStores = ($) => {
	try {
		console.log("[ZOOM] Buscando imagens");
		let allprices = [];

		let imgs = [];

		$(".offers-list__offer").each((i, el) => {
			let image = $(el).find(".col-img img").attr("src");

			let storeTitle = $(el)
				.find(".col-store a")
				.attr("title")
				.split(" ")[1];

			allprices.push({ storeTitle });
			imgs.push({ url: image });
		});

		return { allprices, imgs };
	} catch (error) {
		console.log("[ZOOM] Erro na busca de imagens");
	}
};

const getPrice = ($) => {
	try {
		let price = $(
			"#productInfo > div > div.product-price > p > span.price > a > strong"
		).text();

		console.log("[ZOOM] Preço salvo ");
		return price;
	} catch (error) {
		console.log("[ZOOM] Erro na busca dos preços");
	}
};

const getInfos = async (name, flagDescription = true) => {
	let urlProduct = await searchZoom(name);

	if (!urlProduct.flag) {
		//add loja: coloca mais uma verificao e a funcao da nova loja
		console.log("Passou 1" + urlProduct.scrapStores);
		let store = urlProduct.scrapStores;
		try {
			if (store.includes("Americanas")) {
				console.log("[REDIRECT] Americanas");
				let { ...data } = await getInfosAmericanas(name);
				return data;
			}
			if (store.includes("Amazon")) {
				console.log("[REDIRECT] Amazon");
				let { ...data } = await getInfosAmazon(name);
				return data;
			}
			if (store.includes("Magazine")) {
				console.log("[REDIRECT] Magazine");
				let { ...data } = await getInfosMagazine(name);
				return data;
			}
		} catch (error) {
			throw new createCustomError(
				`Redirect foi feito para a loja ${error.store}, mas deu erro na busca :{`,
				"Zoom"
			);
		}
	}

	try {
		console.log("Passou 2");
		const { data } = await axios.get(urlProduct.href);

		const $ = cheerio.load(data);

		let title = getTitle($);
		let { allprices, imgs } = getImgsAndStores($);
		let price = getPrice($);

		let specs = $.html(".tech-spec-table");
		console.log("[ZOOM] Especificações salvas ");

		let description;

		if (flagDescription) {
			if (allprices && allprices.length > 0) {
				description = await getDescription(allprices, name);
			}
		}

		return {
			title,
			link: urlProduct.href,
			price,
			description,
			specs,
			imgs,
		};
	} catch (error) {
		throw new createCustomError(`Erro na busca do Zoom:{`, "Zoom");
	}
};

module.exports = getInfos;
