const axios = require("axios");
const cheerio = require("cheerio");

const search = async (name) => {
	const { data } = await axios.get(
		`https://www.magazineluiza.com.br/busca/${name}`
	);
	const $ = cheerio.load(data);

	try {
		let ahref = $(".productShowCase.big li:nth-child(1)")
			.find("a")
			.attr("href")
			.split(" ")
			.join("");

		return ahref;
	} catch (error) {
		throw new Error("Product not found");
	}
};

const getInfos = async (link) => {
	const { data } = await axios.get(link);

	let name = getName(data);
	let price = getPrice(data);
	let specs = getSpecs(data);
	let description = getDescription(data);
	let imgs = getImgs(data);

	return { title: name, link, price, description, specs, imgs };
};

const getName = (data) => {
	console.log("[MAGAZINE] Buscando título do produto");

	if (data) {
		const $ = cheerio.load(data);

		let name = $(
			"body > div.wrapper__main > div.wrapper__content.js-wrapper-content > div.wrapper__control > div.header-product.js-header-product > h1"
		).text();
		if (name) {
			console.log("[MAGAZINE] Achou o título");
			return name;
		}

		console.log("[MAGAZINE] Não achou o título");
		return null;
	}

	console.log("[MAGAZINE] Erro ao carregar o HTML");
	return null;
};

const getPrice = (data) => {
	console.log("[MAGAZINE] Buscando preço");

	if (data) {
		const $ = cheerio.load(data);

		let price = $(".price-template__text").text();

		if (price) {
			console.log("[MAGAZINE] Achou o preço");
			return `R$ ${price}`;
		}

		console.log("[MAGAZINE] Não achou o preço");
		return null;
	}

	console.log("[MAGAZINE] Erro ao carregar o HTML");
	return null;
};

const getSpecs = (data) => {
	console.log("[MAGAZINE] Buscando tabela de especificações");

	if (data) {
		const $ = cheerio.load(data);

		let table = $.html("table");
		if (table) {
			console.log("[MAGAZINE] Achou a tabela de especificações");
			return table;
		}

		console.log("[MAGAZINE] Não achou a tabela de especificações");
		return null;
	}

	console.log("[MAGAZINE] Erro ao carregar o HTML");
	return null;
};

const getImgs = (data) => {
	console.log("[MAGAZINE] Buscando imagens");
	if (data) {
		const $ = cheerio.load(data);

		let imgs = [];
		$(".showcase-product__container-thumbs .showcase-product__thumbs").each(
			(index, el) => {
				let urlImage = $(el).find("img").attr("src");
				if (urlImage) {
					imgs.push({ url: urlImage });
				}
			}
		);

		if (imgs.length > 0) {
			console.log("[MAGAZINE] Achou as imagens");
			return imgs;
		}

		console.log("[MAGAZINE] Não achou as imagens");
		return null;
	}

	console.log("[MAGAZINE] Erro ao carregar o HTML");
	return null;
};

const getDescription = (data) => {
	console.log("[MAGAZINE] Buscando descricao");
	if (data) {
		const $ = cheerio.load(data);
		// magazine tem uma estruturacao horrivel de HTML, removendo o table que ja foi selecionado o bagui fica mais facil de coletar a descricao
		$("table").remove();

		let desc = $(".description__container-text").text();

		if (!desc) {
			console.log("[x] Nao achou a descricao na Magazine");
			return null;
		}

		console.log("[MAGAZINE] Encontrado descricao em texto");
		return { text: desc };
	}

	console.log("[MAGAZINE] Erro ao carregar o HTML");
	return null;
};

const main = async (productName) => {
	let link = await search(productName);
	let { ...data } = await getInfos(link);
	return data;
};
module.exports = main;
