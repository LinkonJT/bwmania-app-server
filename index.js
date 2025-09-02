require('dotenv').config()
const express = require('express')
const app = express()
const cors = require("cors");
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
const productsCollection = client.db("bwmaniaDB").collection('products')
const carsCollection = client.db("bwmaniaDB").collection('cars')


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


app.get('/users', async (req, res) => {
  const users = await usersCollection.find().toArray();
  res.send(users);
});

app.post('/products', async (req, res)=>{
  const product = req.body
  const result = await productsCollection.insertOne(product)
  res.send(result)
})


app.get ('/products', async (req, res)=>{
  const products = await productsCollection.find().toArray();
  res.send(products)
})


/**to get single product */
app.get ('/product/:id', async (req, res)=>{
  const id = req.params.id; // Get the product ID from the URL
  const query = {_id: new ObjectId(id)}
  const product = await productsCollection.findOne(query); // Find product by ID

  if(!product){
  return  res.status(404).send({message: "product not found"})
  }
  res.send(product)
})


//UPDATE PRODUCT*
app.patch('/products/:id', async (req, res) => {
  const id = req.params.id;
  // Extract the update data from the request body
  const updateData = req.body;  // This contains the fields to be updated
  // Define the query to find the product by ID
  const query = { _id: new ObjectId(id) };
  // Define the update object with $set to update only the provided fields
  const update = { $set: updateData };
  // Configure the options (if needed in future, like multi-update or upsert)
  const options = { upsert: false }; // Example option, false means it won't insert a new product if not found
  try {
    // Perform the update operation
    const result = await productsCollection.updateOne(query, update, options);

    // Check if any document was modified
    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: 'Product not found or no changes made' });
    }
    // Send a success response
    res.send({ message: 'Product updated successfully' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send({ message: 'Error updating product' });
  }
});

//Delete Product

app.delete('/products/:id', async (req, res)=>{
try{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
const result = await productsCollection.deleteOne(query);
// res.send(result); no need to send result
    // If no car is found, return an error
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Car not found' });
    }

    // Successfully deleted
    res.send({ message: 'Car deleted successfully' });
}catch(error){
  console.error(error)
  res.status(500).send({message: 'Error deleting product'})
}

})

//Cars using Axios, tanstack

app.post('/cars', async (req, res)=>{
  const cars = req.body
  const result = await carsCollection.insertOne(cars);
  res.send(result) 
} )

app.get('/cars', async (req, res)=>{ //to find all car infos in an array
  const cars = await carsCollection.find().toArray()
res.send(cars)
});

app.get('/car/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await carsCollection.findOne(query);
  res.send(result)
})

app.patch('/cars/:id', async(req, res)=>{
  const id = req.params.id;
  const updateData = req.body
  const update = {$set: updateData}
  const query = {_id: new ObjectId(id)};
   const options = { upsert: false }; 
try{
const result =  await carsCollection.updateOne(query, update, options );
 if (result.modifiedCount === 0) {
      return res.status(404).send({ message: 'Product not found or no changes made' }); //You don’t need to send  the result (res.send(result)) (from updateOne()) back to the client unless you need information like how many documents were matched or modified.
    }
    // Send a success response
    res.send({ message: 'Product updated successfully' });

}catch(error){
 console.error(error)
res.status(500).send({message: 'Error deleting product'})
}
})


app.delete('/cars/:id', async (req, res)=>{
try{
const id = req.params.id;
const query = {_id: new ObjectId(id)}
const result = await carsCollection.deleteOne(query)
res.send(result)
}catch(error){
  console.error(error)
}
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
