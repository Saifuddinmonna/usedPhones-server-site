const express = require("express");

const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { query } = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

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
const ordersCollection = client.db("usedPhoneCollection").collection("orders");
const paymentsCollection = client
	.db("usedPhoneCollection")
	.collection("payments");
const userscommencesDb = client
	.db("usedPhoneCollection")
	.collection("userscommences");
const paymentsDb = client.db("sample_analytics").collection("payments");
const SellersDb = client.db("sample_analytics").collection("sellers");
const buyersDb = client.db("sample_analytics").collection("buyers");

// perform actions on the collection object

//varify jwr from here

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send("unauthorized access");
	}

	const token = authHeader.split(" ")[1];
	console.log("from token ", token);
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

// jwt or access token start from here

app.get("/jwt", async (req, res) => {
	try {
		const email = req.query.email;
		const query = { email: email };
		const user = await usersCollection.findOne(query);
		if (user) {
			const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: "20d",
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

///categoriesWithBrands information send from here
app.get("/categoriesWithBrands", async (req, res) => {
	try {
		const query = {};
		const cursor = await usedPhoneCollection.find(query).toArray();
		// const orders = cursor.toArray();
		res.send(cursor);
		console.log("query key", req.query);
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
app.get("/dashboard/myproducts/:email", async (req, res) => {
	try {
		const email = req.params.email;
		const decodedEmail = req.query.email;
		const query = { email: decodedEmail };
		const cursor = await phonesCollections.find(query).toArray();
		// const orders = cursor.toArray();
		console.log("myproducts are connected with email", email, decodedEmail);
		// console.log("myproducts are connected", cursor);
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

app.get("/allphones/", async (req, res) => {
	try {
		const decodedbrand = req.query.brand;
		const query = { brand: decodedbrand };
		const cursor = await phonesCollections.find(query).toArray();
		// const orders = cursor.toArray();
		console.log("console or bran collection", decodedbrand, cursor);
		res.send(cursor);
	} catch (error) {
		console.log(error);
	}
});

app.get("/category/:id", async (req, res) => {
	try {
		console.log("hit in category id");
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const cursor = await usedPhoneCollection.findOne(query);

		const query2 = { brand: cursor.brand };
		console.log("hit in category id", query2);
		const cursor2 = await phonesCollections.find(query2).toArray();
		res.send(cursor2);
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

app.delete("/myproducts/delete/id/:id/email/:email", async (req, res) => {
	try {
		const id = req.params.id;
		const email = req.params.email;
		console.log("connection paise", id, email);
		const query = {
			_id: ObjectId(id),
			// sellerEmail: email
		};
		const result = await phonesCollections.deleteOne(query);
		console.log("connection paise", id, email, query);
		if (result.deletedCount === 1) {
			res.send("Successfully deleted one document.");
		} else {
			console.log("No documents matched the query. Deleted 0 documents.");
			res.send("No documents matched the query. Deleted 0 documents.");
		}
		console.log("Got a DELETE request at /user");
		res.send("Got a DELETE request at /user");
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

app.get("/sellers", async (req, res) => {
	const query = { role: "seller" };
	const sellers = await usersCollection.find(query).toArray();
	res.send(sellers);
});

app.get("/buyers", async (req, res) => {
	const query = { role: "buyer" };
	const users = await usersCollection.find(query).toArray();
	res.send(users);
});

app.get("/users/admin/:email", async (req, res) => {
	const email = req.params.email;
	const query = { email };
	const user = await usersCollection.findOne(query);
	res.send({ isAdmin: user?.role === "admin" });
});
app.get("/users/seller/:email", async (req, res) => {
	const email = req.params.email;
	const query = { email };
	const user = await usersCollection.findOne(query);
	res.send({ isSeller: user?.role === "seller" });
});

app.get("/users/buyer/:email", async (req, res) => {
	const email = req.params.email;
	const query = { email };
	const user = await usersCollection.findOne(query);
	res.send({ isBuyer: user?.role === "buyer" });
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
app.put("/users/verify/:id", verifyJWT, verifyAdmin, async (req, res) => {
	console.log("admin making confirm");
	const id = req.params.id;
	const filter = { _id: ObjectId(id) };
	const options = { upsert: true };
	const updatedDoc = {
		$set: {
			verification: "verified",
		},
	};
	const result = await usersCollection.updateOne(filter, updatedDoc, options);
	console.log("verify process confirm");
	res.send(result);
});
app.put("/buyers/verify/:id", verifyJWT, verifyAdmin, async (req, res) => {
	console.log("admin making confirm");
	const id = req.params.id;
	const filter = { _id: ObjectId(id) };
	const options = { upsert: true };
	const updatedDoc = {
		$set: {
			verification: "verified",
		},
	};
	const result = await usersCollection.updateOne(filter, updatedDoc, options);
	console.log("verify process confirm");
	res.send(result);
});

app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
	const id = req.params.id;
	const filter = { _id: ObjectId(id) };
	const result = await usersCollection.deleteOne(filter);
	console.log("delete process confirm");
	res.send(result);
});

app.get("/bookings", async (req, res) => {
	const email = req.query.email;
	// console.log(" booking oders email check", email);
	// const decodedEmail = req.decoded;
	console.log(" booking oders decoded emailcheck email check", email);
	// if (email !== decodedEmail) {
	// 	return res.status(403).send({ message: "forbidden access" });
	// }

	const query = { email: email };
	const bookings = await ordersCollection.find(query).toArray();
	console.log("my order s are gotten ");
	res.send(bookings);
});
app.get("/bookingsemail", async (req, res) => {
	const email = req.query.email;
	// const decodedEmail = req.decoded.email;

	// if (email !== decodedEmail) {
	// 	return res.status(403).send({ message: "forbidden access" });
	// }

	const query = {};
	const bookings = await ordersCollection.find(query).toArray();
	console.log("my order s are gotten ");
	res.send(bookings);
});

//

//
//

app.get("/payment/:id", async (req, res) => {
	const id = req.params.id;
	const query = { _id: ObjectId(id) };
	console.log("payment iid ok 1st");
	const booking = await ordersCollection.findOne(query);
	console.log("payment iid ok 2nd", booking);

	res.send(booking);
});

app.post("/ordering", async (req, res) => {
	const booking = req.body;
	console.log("from ordering", booking);
	const query = {
		orderingDate: booking.appointmentDate,
		email: booking.email,
		phoneName: booking.brand,
		phoneModel: booking.phoneModel,
	};

	const alreadyBooked = await ordersCollection.find(query).toArray();

	if (alreadyBooked.length) {
		const message = `You already have a booking on ${booking.appointmentDate}`;
		return res.send({ acknowledged: false, message });
	}

	const result = await ordersCollection.insertOne(booking);
	res.send(result);
});

app.post("/create-payment-intent", async (req, res) => {
	const booking = req.body;
	const price = booking.price;
	const amount = price * 100;
	console.log("from ocreating payment intend", booking);
	const paymentIntent = await stripe.paymentIntents.create({
		currency: "usd",
		amount: amount,
		payment_method_types: ["card"],
	});
	console.log("from ocreating payment intend2", {
		clientSecret: paymentIntent.client_secret,
	});
	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

app.post("/payments", async (req, res) => {
	const payment = req.body;
	console.log("from creating payment intend", payment);
	const result = await paymentsCollection.insertOne(payment);
	const id = payment.bookingId;
	const filter = { _id: ObjectId(id) };
	const updatedDoc = {
		$set: {
			paid: true,
			transactionId: payment.transactionId,
		},
	};
	console.log("from  paymentupdate doc");
	const updatedResult = await ordersCollection.updateOne(filter, updatedDoc);
	res.send(result);
});
// THIS IS THE NEW ROUTE YOU NEED TO ADD
app.get("/allphones/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const phone = await phonesCollections.findOne(query);
		if (phone) {
			res.send(phone);
		} else {
			res.status(404).send({ message: "Phone not found" });
		}
	} catch (error) {
		console.log("Error fetching single phone by ID:", error);
		res.status(500).send({ message: "Error fetching phone details" });
	}
});

app.get("/allphones/", async (req, res) => {
	try {
		const decodedbrand = req.query.brand;
// temporary to update price field on booking options
app.get("/addPrice", async (req, res) => {
	const filter = {};
	const options = { upsert: true };
	const updatedDoc = {
		$set: {
			price: 99,
		},
	};
	const result = await appointmentOptionCollection.updateMany(
		filter,
		updatedDoc,
		options,
	);
	res.send(result);
});

app.get("/Sellers", verifyJWT, verifyAdmin, async (req, res) => {
	const query = {};
	const doctors = await doctorsCollection.find(query).toArray();
	res.send(doctors);
});

app.post("/sellers", verifyJWT, verifyAdmin, async (req, res) => {
	const doctor = req.body;
	const result = await doctorsCollection.insertOne(doctor);
	res.send(result);
});

app.listen(port, () => console.log(`Used Phone running on ${port}`));
