/* eslint-disable radix */
const express = require("express");
const Products = require("../models/products");
const Stores = require("../models/stores");
const getInfosZoom = require("../Utils/zoom");

const router = express.Router();

const compareDate = require("../Utils/compareDate");

async function updateProduct(name, id) {
	console.log("[!] Update product ->", name);
	const { allprices } = await getInfosZoom(name, false);
	let updateAt = new Date();
	let updatedProduct = await Products.findByIdAndUpdate(id, {
		allprices,
		updateAt,
	});

	return updatedProduct;
}

let verifyProductInBd = async (name, res) => {
	let docs = await Products.find({
		title: {
			$regex: new RegExp(name, "ig"),
		},
	});

	if (docs.length > 0) {
		let { updateAt, _id } = docs[0];
		if (compareDate(updateAt)) {
			let updatedProduct = await updateProduct(name, _id);
			// return res.status(200).send({ updatedProduct });
			return { flag: true, docs: updatedProduct };
		}
		// return res.status(200).send({ docs });
		return { flag: true, docs };
	}

	return { flag: false };
};

router.get("/", async (req, res) => {
	try {
		const { name } = req.query;
		console.log(name);

		let { flag, docs = null } = await verifyProductInBd(name, res);

		if (flag) {
			return res.status(200).send({ docs });
		}

		const { ...data } = await getInfosZoom(name, true);

		let { title } = data;

		console.log("ZOOM achou ->", title);

		flag = undefined;

		//caso o usuario insira um nome errado: iphhone X, mas o site responde iphone X, ai ele verifica no banco de novo
		let obj = await verifyProductInBd(title, res);

		if (obj.flag) {
			return res.status(200).send({ docs: obj.docs });
		}

		const newProduct = await Products.create({
			...data,
			updateAt: new Date(),
		});

		return res.json(newProduct);
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			error: err.message,
		});
	}
});

router.get("/uncheckedStores", async (req, res) => {
	try {
		// agrupa por nome e conta
		const rt = await Stores.aggregate(
			[
				{
					$group: {
						_id: "$name",
						count: {
							$sum: 1,
						},
					},
				},
				{ $sort: { count: -1 } },
			],
			function (err, results) {
				if (err) throw err;
				return results;
			}
		);

		res.json(rt);
	} catch (error) {
		res.json({ erro: "falha na hora de agrupar as lojas :{" });
	}
});

module.exports = (app) => app.use("/zoom", router);
