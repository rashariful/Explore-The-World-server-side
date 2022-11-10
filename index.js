const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middle ware
app.use(cors());
app.use(express.json());

// make uri for mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@exploreworld.fyzzpaq.mongodb.net/?retryWrites=true&w=majority`;

// const uri = 'mongodb://localhost:27017'
const client = new MongoClient(uri);

// jwt function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: "Forbidden access" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
}

async function dbConnect() {
  try {
    await client.connect();
    console.log("mongo connected");
  } catch (error) {
    console.log(error.message, error.name);
  }
}
dbConnect();

// jwt token
app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.send({ token });
});

// create the database and collection
const Services = client.db("ExploreWorld").collection("service");
const Reviews = client.db("ExploreWorld").collection("review");

// service Post using post method in mongodb
app.post("/service", async (req, res) => {
  try {
    const result = await Services.insertOne(req.body);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully created the ${req.body.name} with this id ${result.insertedId}`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't create the product",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// this is get service function for server side
app.get("/service", async (req, res) => {
  try {
    if (req.query.route) {
      return res.send({
        success: true,
        data: await Services.find({}).toArray(),
      });
    }
    const cursor = Services.find({}).limit(3).sort({ year: -1, _id: -1 });
    const service = await cursor.toArray();
    res.send({
      success: true,
      data: service,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// this is get service id function for server side
app.get("/service/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const service = await Services.findOne(query);
    res.send({
      success: true,
      data: service,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Reviews function here for Post
// Review Post using post method in mongodb
app.post("/review", async (req, res) => {
  try {
    const result = await Reviews.insertOne(req.body);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully Added Review with this id ${result.insertedId}`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't Added The Review",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// this is get Review function for server side
app.get("/review", async (req, res) => {
  let query = {};
  if (req.query.id) {
    query = {
      id: req.query.id,
    };
  }

  try {
    const cursor = Reviews.find({}, { sort: [["datefield", "asc"]] });
    const review = await cursor.toArray();
    res.send({
      success: true,
      data: review,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// this is delete review function
app.delete("/review/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Reviews.findOne({ _id: ObjectId(id) });

    if (!review?._id) {
      res.send({
        success: false,
        error: "review doesn't exist",
      });
      return;
    }

    const result = await Reviews.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount) {
      res.send({
        success: true,
        message: `Successfully deleted`,
      });
    } else {
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// this is update product function here 02 part
app.patch("/review/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Reviews.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );

    if (result.matchedCount) {
      res.send({
        success: true,
        message: `successfully updated`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't update  the product",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// this is get service id function for server side
app.get("/review/:id", async (req, res) => {
  const { id } = req.params;
  const query = { serviceid: id };
  const cursor = Reviews.find(query);

  const review = await cursor.toArray();
  console.log(review.length);
  res.send(review);
});

// this is review filter by email query
app.get('/myreview', verifyJWT, async (req, res) => {

  const decoded = req.decoded;

  if (decoded.email !== req.query.email) {
    res.status(403).send({ message: 'unauthorized access' })
  }



  let query = {};
  console.log(req.query.email);

  if (req.query.email) {
    query = {
      "user.email": req.query.email
    }
  }

  const cursor = Reviews.find(query);
  const orders = await cursor.toArray();
  res.send(orders);
});




app.get("/", (req, res) => {
  res.send("Assignment server up");
});

app.listen(port, () => {
  console.log(`server up on: ${port}`);
});
