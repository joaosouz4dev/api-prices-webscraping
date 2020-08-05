const axios = require("axios");
const cheerio = require("cheerio");

const baseUrl = "https://www.amazon.com.br";

const search = async (name) => {
	const { data } = await axios.get(`https://www.amazon.com.br/s?k=${name}`);
	const $ = cheerio.load(data);

	let ahref;

	//amazon coloca uma div de promocoes, essa parte de baixo pula isso
	let price = $(
		"#search > div.s-desktop-width-max.s-desktop-content.sg-row > div.sg-col-20-of-24.sg-col-28-of-32.sg-col-16-of-20.sg-col.sg-col-32-of-36.sg-col-8-of-12.sg-col-12-of-16.sg-col-24-of-28 > div > span:nth-child(4) > div.s-main-slot.s-result-list.s-search-results.sg-row > div:nth-child(1)"
	)
		.find(".a-row")
		.text();

	if (price) {
		if (price.includes("Mais vendido")) {
			ahref = $("#search  .a-link-normal.a-text-normal")
				.attr("href")
				.split(" ")
				.join("");
		} else {
			ahref = $(
				"#search > div.s-desktop-width-max.s-desktop-content.sg-row > div.sg-col-20-of-24.sg-col-28-of-32.sg-col-16-of-20.sg-col.sg-col-32-of-36.sg-col-8-of-12.sg-col-12-of-16.sg-col-24-of-28 > div > span:nth-child(4) > div.s-main-slot.s-result-list.s-search-results.sg-row > div:nth-child(1)"
			)
				.find("a")
				.attr("href")
				.split(" ")
				.join("");
		}
	} else {
		ahref = $(
			"#search > div.s-desktop-width-max.s-desktop-content.sg-row > div.sg-col-20-of-24.sg-col-28-of-32.sg-col-16-of-20.sg-col.sg-col-32-of-36.sg-col-8-of-12.sg-col-12-of-16.sg-col-24-of-28 > div > span:nth-child(4) > div.s-main-slot.s-result-list.s-search-results.sg-row > div:nth-child(2)"
		)
			.find("a")
			.attr("href")
			.split(" ")
			.join("");
	}

	if (!ahref) {
		throw new Error("Product not found");
	}

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
	console.log("[AMAZON] buscando nome");
	if (data) {
		const $ = cheerio.load(data);

		let name = $("#productTitle").text().trim();
		if (name) {
			console.log("[AMAZON] achou o nome");
			return name;
		}
		console.log("[AMAZON] não achou o nome");
		return null;
	}
	console.log("[AMAZON] falha no carregamento do html");
	return null;
};

const getPrice = (data) => {
	console.log("[AMAZON] buscando preço");
	if (data) {
		const $ = cheerio.load(data);

		let price = $("#priceblock_ourprice").text();

		if (price) {
			console.log("[AMAZON] Achou o preço");
			return price;
		}

		console.log("[AMAZON] não achou o preço");
		return null;
	}
	console.log("[AMAZON] falha no carregamento do html");
	return null;
};

const getSpecs = (data) => {
	console.log("[AMAZON] Buscando especificações");

	if (data) {
		const $ = cheerio.load(data);

		let table = $.html("#product-details-grid_feature_div table");
		if (table) {
			console.log("[AMAZON] Achou as tabelas de especificações");

			return table;
		}

		console.log("[AMAZON] Não achou as tabelas de especificações");

		return null;
	}

	console.log("[AMAZON] falha no carregamento do html");

	return null;
};

const getImgs = (data) => {
	console.log("[AMAZON] Buscando imagens");
	if (data) {
		const $ = cheerio.load(data);

		let imgs = [];
		$("#altImages img").each((index, el) => {
			let urlImage = $(el).attr("src");
			if (urlImage) {
				imgs.push({ url: urlImage });
			}
		});

		if (imgs.length > 0) {
			console.log("[AMAZON] achou as imagens");
			return imgs;
		}
		console.log("[AMAZON] não achou as imagens");
		return null;
	}
	console.log("[AMAZON] falha no carregamento do html");
	return null;
};

const getDescription = (data) => {
	console.log("[AMAZON] Buscando descricao");
	if (data) {
		const $ = cheerio.load(data);

		let desc = $.html("#productDescription");

		if (!desc) {
			console.log("[x] Nao achou a descricao na AMAZON");
			return null;
		}

		console.log("[AMAZON] Encontrado descricao em texto");
		return { html: desc.trim() };
	}

	console.log("[AMAZON] falha no carregamento do html");
	return null;
};

const main = async (productName) => {
	let link = await search(productName);
	let { ...data } = await getInfos(link);
	return data;
};

module.exports = main;
