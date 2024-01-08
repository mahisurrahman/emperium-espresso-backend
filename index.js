const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//Middlewares//
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b4ql9rm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //Collections//
    const coffeeCollection = client
      .db("EmperiumEspresso")
      .collection("coffees");

    //Get All Coffees//
    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //Get Single Coffee//
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    //Update a Single Coffee//
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coffee = req.body;
      const options = { upsert: true };
      const updatedCoffee = {
        $set: {
          name: coffee.name,
          taste: coffee.taste,
          category: coffee.category,
          chefName: coffee.chefName,
          details: coffee.details,
          photo: coffee.photo,
          price: coffee.price,
        },
      };
      const result = await coffeeCollection.updateOne(query, updatedCoffee, options);
      res.send(result);
    });

    //Add Coffees//
    app.post("/coffees", async (req, res) => {
      const coffee = req.body;
      const result = await coffeeCollection.insertOne(coffee);
      res.send(result);
    });

    // Delete Coffee//
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//Default Get and LISTEN Method//
app.get("/", (req, res) => {
  res.send("Server Running Smoothly");
});

app.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
});
