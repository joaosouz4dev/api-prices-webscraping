const axios = require("axios");
const cheerio = require("cheerio");

const baseUrl = "https://www.americanas.com.br";

const search = async (name) => {
	const { data } = await axios.get(
		`https://www.americanas.com.br/busca/${name}`
	);
	const $ = cheerio.load(data);

	let ahref = $(
		"#content-middle > div:nth-child(6) > div > div > div > div.row.product-grid.no-gutters.main-grid > div:nth-child(1)"
	)
		.find("a")
		.attr("href")
		.split(" ")
		.join("");

	return baseUrl + ahref;
};

const getInfos = async (link) => {
	const { data } = await axios.get(link);

	let name = getName(data);
	let price = getPrice(data);
	let description = getDescription(data);
	let specs = getSpecs(data);
	let imgs = getImgs(data);

	return { title: name, link, price, description, specs, imgs };
};

const getName = (data) => {
	console.log("[AMERICANAS] Buscando título do produto");
	if (data) {
		const $ = cheerio.load(data);

		let name = $("#product-name-default").text();
		if (name) {
			console.log("[AMERICANAS] Achou o título");
			return name;
		}

		console.log("[AMERICANAS] Não achou o título");
		return null;
	}

	console.log("[AMERICANAS] Erro ao carregar o HTML");
	return null;
};

const getPrice = (data) => {
	console.log("[AMERICANAS] Buscando preço");
	if (data) {
		const $ = cheerio.load(data);

		let price = $(
			"#content > div > div > div.GridUI-wcbvwm-0.idBPEj.ViewUI-sc-1ijittn-6.iXIDWU > div > section > div > div.product-main-area-b__ProductMainAreaUI-sc-18529u5-1.NYTHl.ViewUI-sc-1ijittn-6.iXIDWU > div.offer-box__Wrapper-sc-1hat60-0.dKwBwA.ViewUI-sc-1ijittn-6.iXIDWU > div > div.buybox__BigSection-sc-4z0zqv-1.itEiUd.ViewUI-sc-1ijittn-6.iXIDWU > div:nth-child(1) > div > div.main-offer__ContainerUI-sc-1c7pzd1-0.fjQzCD.ViewUI-sc-1ijittn-6.iXIDWU > div:nth-child(1) > div > span"
		).text();

		if (price) {
			console.log("[AMERICANAS] Achou o preço");
			return price;
		}

		price = $(
			"#content > div > div > div.GridUI-wcbvwm-0.idBPEj.ViewUI-sc-1ijittn-6.iXIDWU > div > section > div > div.GridUI-wcbvwm-0.gpGkIJ.ViewUI-sc-1ijittn-6.iXIDWU > div.ColUI-gjy0oc-0.eukbCO.ViewUI-sc-1ijittn-6.iXIDWU > div:nth-child(3) > div > div > div:nth-child(2) > div > div > div > label > div > div.pricebox > span"
		).text();

		if (price) {
			console.log("[AMERICANAS] Achou o preço");
			return price;
		}

		console.log("[AMERICANAS] Não achou o preço");
		return null;
	}

	console.log("[AMERICANAS] Erro ao carregar o HTML");
	return null;
};

const getSpecs = (data) => {
	console.log("[AMERICANAS] Buscando a tabela de especificações");

	if (data) {
		const $ = cheerio.load(data);

		let table = $.html("table");
		if (table) {
			console.log("[AMERICANAS] Achou a tabela de especificações");
			return table;
		}

		console.log("[AMERICANAS] Não achou a tabela de especificações");
		return null;
	}

	console.log("[AMERICANAS] Erro ao carregar o HTML");
	return null;
};

const getImgs = (data) => {
	console.log("[AMERICANAS] Buscando imagens");
	if (data) {
		const $ = cheerio.load(data);

		let imgs = [];
		$(".image-gallery-content img").each((index, el) => {
			let urlImage = $(el).attr("src");
			if (urlImage) {
				imgs.push({ url: urlImage });
			}
		});

		if (imgs.length > 0) {
			console.log("[AMERICANAS] Achou as imagens");
			return imgs;
		}

		console.log("[AMERICANAS] Não achou as imagens");
		return null;
	}

	console.log("[AMERICANAS] Erro ao carregar o HTML");
	return null;
};

const getDescription = (data) => {
	console.log("[AMERICANAS] Buscando descricao");
	if (data) {
		const $ = cheerio.load(data);

		let iframe = $.html(
			"#info-section > div:nth-child(1) > section > div > div > div.info-description-frame-inside.info__DescriptionCol-sc-13tjohn-0.FziEj.ColUI-gjy0oc-0.hZFKDP.ViewUI-sc-1ijittn-6.iXIDWU > div > div > div > iframe"
		);

		if (iframe) {
			console.log("[AMERICANAS] Encontrado Iframe");
			return { iframe, text: "" };
		}

		let desc;
		$("section.CardUI-sc-1eg6n71-0.eyqIUw").each((index, el) => {
			if (index == 0) {
				desc = $(el).find(".info-description-frame-inside").text();
			}
		});

		if (!desc) {
			console.log("[x] Nao achou a descricao na Americanas");
			return null;
		}

		console.log("[AMERICANAS] Encontrado descricao em texto");
		return { text: desc };
	}

	console.log("[AMERICANAS] Erro ao carregar o HTML");
	return null;
};

const main = async (productName) => {
	let link = await search(productName);
	let { ...data } = await getInfos(link);
	return data;
};

module.exports = main;
