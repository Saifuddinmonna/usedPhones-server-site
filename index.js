const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { query } = require("express");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.REACT_APP_CONNECTION;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

///database collection create here
const usedPhoneCollection = client
	.db("usedPhoneCollection")
	.collection("categoriesWithBrands");
const phonesCollections = client
	.db("usedPhoneCollection")
	.collection("allPhones");
const bdLocationCollections = client
	.db("usedPhoneCollection")
	.collection("bdLocatiion");
const usersCollection = client.db("usedPhoneCollection").collection("users");
const userscommencesDb = client
	.db("usedPhoneCollection")
	.collection("userscommences");
const customers = client.db("sample_analytics").collection("customers");
// perform actions on the collection object

//varify jwr from here

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send("unauthorized access");
	}

	const token = authHeader.split(" ")[1];

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
		console.log(
			"jwt varify err toker console",
			` ${process.env.ACCESS_TOKEN_SECRET}`,
		);
		if (err) {
			return res.status(403).send({ message: "forbidden access" });
		}
		req.decoded = decoded;
		next();
	});
}

///categoriesWithBrands information send from here
app.get("/categoriesWithBrands", async (req, res) => {
	try {
		const query = {};
		const cursor = await usedPhoneCollection.find(query).toArray();
		// const orders = cursor.toArray();
		res.send(cursor);
	} catch (error) {
		console.log(error);
	}
});
app.get("/allphones/all", async (req, res) => {
	try {
		const query = {};
		const cursor = await phonesCollections.find(query).toArray();
		// const orders = cursor.toArray();
		res.send(cursor);
	} catch (error) {
		console.log(error);
	}
});

/////categoriesWithBrands information insert  from here
app.post("/", async (req, res) => {
	try {
		console.log("connection i sol okk");
		const doc = {
			title: "Record of a Shriveled Datum",
			content: "No bytes, no problem. Just insert a document, in MongoDB",
			// title: "Record of a Shriveled Datum",
			// content: "No bytes, no problem. Just insert a document, in MongoDB",
			// title: "Record of a Shriveled Datum",
			// content: "No bytes, no problem. Just insert a document, in MongoDB",
		};
		const result = await usedPhoneCollection.insertOne(doc);
		console.log("insert ok");
	} catch (error) {
		console.log("post error start here", error);
	}
});

// jwt or access token start from here

app.get("/jwt", async (req, res) => {
	try {
		const email = req.query.email;
		const query = { email: email };
		const user = await usersCollection.findOne(query);
		if (user) {
			const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: "7d",
			});
			return res.send({ accessToken: token });
		}
		res.status(403).send({ accessToken: "" });
	} catch (error) {
		console.log(
			"err from jwt",
			error,
			console.log(
				" jwt get toker console",
				process.env.ACCESS_TOKEN_SECRET,
			),
		);
	}
});

// try {
// } catch (error) {
// 	console.log(error.bgRed);
// }

// I use verifyAdmin after verifyJWT
const verifyAdmin = async (req, res, next) => {
	try {
		const decodedEmail = req.decoded.email;
		const query = { email: decodedEmail };
		const user = await usersCollection.findOne(query);

		if (user?.role !== "admin") {
			return res.status(403).send({ message: "forbidden access" });
		}
		next();
	} catch (error) {
		console.log("err from admin varify", error);
	}
};

//brand name informaition send from here
app.get("/", async (req, res) => {
	console.log("Used Phones Server Is running");

	res.send("Used Phones Server Is running");
});
app.get("/brandname", async (req, res) => {
	const query = {};
	const result = await usedPhoneCollection
		.find(query)
		.project({ brand: 1 })
		.toArray();
	res.send(result);
});

//division name information send from here
app.get("/divisionsname", async (req, res) => {
	const query = {};
	const divisionsname = await bdLocationCollections.find(query).toArray();
	res.send(divisionsname);
});
app.get("/divisionsnameforreview", async (req, res) => {
	const query = {};
	const divisionsname = await bdLocationCollections.find(query).toArray();
	res.send(divisionsname);
});

//add phone insert from here
app.post("/phones", async (req, res) => {
	try {
		const phone = req.body;
		console.log(phone);
		// TODO: make sure you do not enter duplicate phone email
		// only insert phones if the phone doesn't exist in the database
		const result = await phonesCollections.insertOne(phone);
		res.send(result);
	} catch (error) {
		console.log(error.bgRed);
	}
});
app.post("/userscommences", async (req, res) => {
	try {
		const phone = req.body;
		console.log(phone);
		// TODO: make sure you do not enter duplicate phone email
		// only insert phones if the phone doesn't exist in the database
		const result = await userscommencesDb.insertOne(phone);
		res.send(result);
	} catch (error) {
		console.log(error.bgRed);
	}
});

app.get("/userscommences", async (req, res) => {
	try {
		const query = {};
		const users = await userscommencesDb.find(query).limit(6).toArray();
		res.send(users);
	} catch (error) {
		console.log("error from usercommences", error);
	}
});
app.get("/userscommencesall", async (req, res) => {
	try {
		const query = {};
		const users = await userscommencesDb.find(query).limit().toArray();
		res.send(users);
	} catch (error) {
		console.log("error from usercommences", error);
	}
});

// login user collection add user insert from here
app.post("/users", async (req, res) => {
	const user = req.body;
	console.log(user);
	// TODO: make sure you do not enter duplicate user email
	// only insert users if the user doesn't exist in the database
	const result = await usersCollection.insertOne(user);
	res.send(result);
});
app.post("/usersseller", async (req, res) => {
	const user = req.body;
	console.log("seller signup sucessfully", user);
	// TODO: make sure you do not enter duplicate user email
	// only insert users if the user doesn't exist in the database
	const result = await usersCollection.insertOne(user);
	res.send(result);
});

app.get("/users", async (req, res) => {
	const query = {};
	const users = await usersCollection.find(query).toArray();
	res.send(users);
});

app.get("/users/admin/:email", async (req, res) => {
	const email = req.params.email;
	const query = { email };
	const user = await usersCollection.findOne(query);
	res.send({ isAdmin: user?.role === "admin" });
});

app.put("/users/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
	console.log("admin making confirm");
	const id = req.params.id;
	const filter = { _id: ObjectId(id) };
	const options = { upsert: true };
	const updatedDoc = {
		$set: {
			role: "admin",
		},
	};
	const result = await usersCollection.updateOne(filter, updatedDoc, options);
	console.log("admin making confirm");
	res.send(result);
});
app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
	const id = req.params.id;
	const filter = { _id: ObjectId(id) };
	const result = await usersCollection.deleteOne(filter);
	console.log("delete process confirm");
	res.send(result);
});

// app.put(
// // 			"/users/admin/:id",
// // 			verifyJWT,
// // 			verifyAdmin,
// // 			async (req, res) => {
// // 				const id = req.params.id;
// // 				const filter = { _id: ObjectId(id) };
// // 				const options = { upsert: true };
// // 				const updatedDoc = {
// // 					$set: {
// // 						role: "admin",
// // 					},
// // 				};
// // 				const result = await usersCollection.updateOne(
// // 					filter,
// // 					updatedDoc,
// // 					options,
// // 				);
// // 				res.send(result);
// // 			},
// // 		);

// Replace the uri string with your MongoDB deployment's connection string.

//
//
//

// async function run() {
// 	try {
// 		const appointmentOptionCollection = client
// 			.db("usedPhone")
// 			.collection("appointmentOptions");
// 		const bookingsCollection = client
// 			.db("usedPhone")
// 			.collection("bookings");
// 		const usersCollection = client.db("usedPhone").collection("users");
// 		const doctorsCollection = client
// 			.db("usedPhone")
// 			.collection("doctors");
// 		const paymentsCollection = client
// 			.db("usedPhone")
// 			.collection("payments");

//

// 		// Use Aggregate to query multiple collection and then merge data
// 		app.get("/appointmentOptions", async (req, res) => {
// 			const date = req.query.date;
// 			const query = {};
// 			const options = await appointmentOptionCollection
// 				.find(query)
// 				.toArray();

// 			// get the bookings of the provided date
// 			const bookingQuery = { appointmentDate: date };
// 			const alreadyBooked = await bookingsCollection
// 				.find(bookingQuery)
// 				.toArray();

// 			// code carefully :D
// 			options.forEach((option) => {
// 				const optionBooked = alreadyBooked.filter(
// 					(book) => book.treatment === option.name,
// 				);
// 				const bookedSlots = optionBooked.map((book) => book.slot);
// 				const remainingSlots = option.slots.filter(
// 					(slot) => !bookedSlots.includes(slot),
// 				);
// 				option.slots = remainingSlots;
// 			});
// 			res.send(options);
// 		});

// 		app.get("/v2/appointmentOptions", async (req, res) => {
// 			try {
// 				const date = req.query.date;
// 				const options = await appointmentOptionCollection
// 					.aggregate([
// 						{
// 							$lookup: {
// 								from: "bookings",
// 								localField: "name",
// 								foreignField: "treatment",
// 								pipeline: [
// 									{
// 										$match: {
// 											$expr: {
// 												$eq: ["$appointmentDate", date],
// 											},
// 										},
// 									},
// 								],
// 								as: "booked",
// 							},
// 						},
// 						{
// 							$project: {
// 								name: 1,
// 								price: 1,
// 								slots: 1,
// 								booked: {
// 									$map: {
// 										input: "$booked",
// 										as: "book",
// 										in: "$$book.slot",
// 									},
// 								},
// 							},
// 						},
// 						{
// 							$project: {
// 								name: 1,
// 								price: 1,
// 								slots: {
// 									$setDifference: ["$slots", "$booked"],
// 								},
// 							},
// 						},
// 					])
// 					.toArray();
// 				console.log("hit v2 availableoption by clientsite");
// 				res.send(options);
// 			} catch (error) {
// 				console.log("i got erroe from available options v2", error);
// 			}
// 		});

// 		app.get("/appointmentSpecialty", async (req, res) => {
// 			const query = {};
// 			const result = await appointmentOptionCollection
// 				.find(query)
// 				.project({ name: 1 })
// 				.toArray();
// 			res.send(result);
// 		});

// 		/***
// 		 * API Naming Convention
// 		 * app.get('/bookings')
// 		 * app.get('/bookings/:id')
// 		 * app.post('/bookings')
// 		 * app.patch('/bookings/:id')
// 		 * app.delete('/bookings/:id')
// 		 */

// 		app.get("/bookings", verifyJWT, async (req, res) => {
// 			const email = req.query.email;
// 			const decodedEmail = req.decoded.email;

// 			if (email !== decodedEmail) {
// 				return res.status(403).send({ message: "forbidden access" });
// 			}

// 			const query = { email: email };
// 			const bookings = await bookingsCollection.find(query).toArray();
// 			res.send(bookings);
// 		});

// 		app.get("/bookings/:id", async (req, res) => {
// 			const id = req.params.id;
// 			const query = { _id: ObjectId(id) };
// 			const booking = await bookingsCollection.findOne(query);
// 			res.send(booking);
// 		});

// 		app.post("/bookings", async (req, res) => {
// 			const booking = req.body;
// 			console.log(booking);
// 			const query = {
// 				appointmentDate: booking.appointmentDate,
// 				email: booking.email,
// 				treatment: booking.treatment,
// 			};

// 			const alreadyBooked = await bookingsCollection
// 				.find(query)
// 				.toArray();

// 			if (alreadyBooked.length) {
// 				const message = `You already have a booking on ${booking.appointmentDate}`;
// 				return res.send({ acknowledged: false, message });
// 			}

// 			const result = await bookingsCollection.insertOne(booking);
// 			res.send(result);
// 		});

// 		app.post("/create-payment-intent", async (req, res) => {
// 			const booking = req.body;
// 			const price = booking.price;
// 			const amount = price * 100;

// 			const paymentIntent = await stripe.paymentIntents.create({
// 				currency: "usd",
// 				amount: amount,
// 				payment_method_types: ["card"],
// 			});
// 			res.send({
// 				clientSecret: paymentIntent.client_secret,
// 			});
// 		});

// 		app.post("/payments", async (req, res) => {
// 			const payment = req.body;
// 			const result = await paymentsCollection.insertOne(payment);
// 			const id = payment.bookingId;
// 			const filter = { _id: ObjectId(id) };
// 			const updatedDoc = {
// 				$set: {
// 					paid: true,
// 					transactionId: payment.transactionId,
// 				},
// 			};
// 			const updatedResult = await bookingsCollection.updateOne(
// 				filter,
// 				updatedDoc,
// 			);
// 			res.send(result);
// 		});

//

// 		// temporary to update price field on appointment options
// 		// app.get('/addPrice', async (req, res) => {
// 		//     const filter = {}
// 		//     const options = { upsert: true }
// 		//     const updatedDoc = {
// 		//         $set: {
// 		//             price: 99
// 		//         }
// 		//     }
// 		//     const result = await appointmentOptionCollection.updateMany(filter, updatedDoc, options);
// 		//     res.send(result);
// 		// })

// 		app.get("/doctors", verifyJWT, verifyAdmin, async (req, res) => {
// 			const query = {};
// 			const doctors = await doctorsCollection.find(query).toArray();
// 			res.send(doctors);
// 		});

// 		app.post("/doctors", verifyJWT, verifyAdmin, async (req, res) => {
// 			const doctor = req.body;
// 			const result = await doctorsCollection.insertOne(doctor);
// 			res.send(result);
// 		});

//
// 	} finally {
// 	}
// }

// run().catch(console.log);

// app.get("/", async (req, res) => {
// 	res.send("doctors portal server is running");
// });

app.listen(port, () => console.log(`Used Phone running on ${port}`));
