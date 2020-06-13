/* eslint-disable radix */
const express = require("express");
const Products = require("../models/products");
const getInfos = require("../Utils");

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const { name } = req.query;
		console.log(name);
		const docs = await Products.find({
			title: {
				$regex: new RegExp(name, "ig"),
			},
		});

		if (docs.length > 0) {
			return res.status(200).send({ docs });
		}

		const { title, description, specs, allprices } = await getInfos(name);

		const newProduct = await Products.create({
			title,
			description,
			specs,
			allprices,
		});

		return res.json(newProduct);
	} catch (err) {
		console.log(err);
		return res
			.status(400)
			.send({
				error: "product not found",
				message:
					"Tente especificar mais detalhes: Galaxy S7 Edge, ao inves de Galaxy S7",
			});
	}
});

// router.post("/search", async (req, res) => {
// 	const { title } = req.query;

// 	const docs = await News.find({
// 		title: {
// 			$regex: new RegExp(title, "ig"),
// 		},
// 	});

// 	if (docs) {
// 		return res.status(200).send({ docs });
// 	}

// 	return res.status(404).send();
// });

// router.put('/update', authMiddleware, newsAuthQuery, async (req, res) => {
//     try {
//         const { title, resume, news } = req.body;

//         await News.findByIdAndUpdate(req.newsid, {
//             title,
//             resume,
//             news,
//         });
//         return res.status(200).send({ ok: 'updated news' });
//     } catch (err) {
//         return res.status(400).send({ error: 'update news failed' });
//     }
// });

// router.get('/', async (req, res) => {
//     const { newsid } = req.query;

//     if (newsid) {
//         const nNews = await News.findById({ _id: newsid });
//         return res.status(200).send({ docs: nNews });
//     }
//     return res.status(400).send();
// });

// router.get('/show', async (req, res) => {
//     const { page = 1, limite = 10 } = req.query;

//     const limit = parseInt(limite);
//     const news = await News.paginate(
//         {},
//         {
//             page,
//             limit,
//             sort: {
//                 createAt: -1, //  Sort by Date Added DESC
//             },
//         },
//     ); //  buscando todas as noticias

//     return res.status(200).json(news);
// });

// router.post('/remove', authMiddleware, newsAuthQuery, async (req, res) => {
//     const gfs = Grid(mongoose.connection.db, mongoose.mongo);
//     // gfs.collection('uploads')

//     const { newsid } = req;

//     await News.deleteMany({ _id: newsid });
//     const mfiles = await File.find({ newsid });
//     await File.deleteMany({ newsid });

//     const fileid = mfiles.map((t) => t.fileid);

//     fileid.map(async (t) => {
//         await gfs.remove({ _id: t, root: 'uploads' });
//     });
//     res.status(200).send();
// });

// router.post('/search', async (req, res) => {
//     const { title } = req.query;

//     const docs = await News.find({
//         title: {
//             $regex: new RegExp(title, 'ig'),
//         },
//     });

//     if (docs) {
//         return res.status(200).send({ docs });
//     }

//     return res.status(404).send();
// });

module.exports = (app) => app.use("/product", router);
