require('dotenv').config()
const express = require('express')
const app = express()
const cors = require("cors");
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion } = require('mongodb');

// Middleware
app.use(cors())
app.use(express.json())

/****MongoDB starts */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3h4lqut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    /****Start: coding here */
const usersCollection = client.db("bwmaniaDB").collection('users')


/*************** POST route to insert a new user********/ 
app.post('/users', async (req, res) => {
  const user = req.body   // frontend will send user data (name, email, etc.)

  const query = {email: user.email}
  const existingUser = await usersCollection.findOne(query);
  if(existingUser){
    return res.send({ message: 'User already exists', insertedId: null })
  }

  const result = await usersCollection.insertOne(user)  // insert into MongoDB
  res.send(result)   // send back MongoDB’s response (acknowledged + insertedId)
})





/**End COding here */

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



/****mongoDB ends */


/**part of cors */
app.get('/', (req, res) => {
  res.send('BWmania Server Running')
})

app.listen(port, () => {
  console.log(`BWmania app listening on port ${port}`)
})
