const express = require('express')
const cors = require('cors');
const app = express()
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = 3000

app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://clubs:tFWlxOKN7IFlaLyY@cluster0.aobh34k.mongodb.net/?retryWrites=true&w=majority";

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

    const clubsCollection = client.db('clubDB').collection('clubs');
    const applicationCollection = client.db('clubDB').collection('apply');
    

    app.get('/clubs', async (req, res) => {
      const result = await clubsCollection.find().toArray();
      res.send(result);
    });
    app.post('/add-club', async (req, res) => {
    const newClub = req.body;

    // Validate club data (you can add more validation)
    if (!newClub.clubName || !newClub.club) {
      return res.status(400).json({ error: 'Club name and club are required' });
    }

    // Insert the new club into the MongoDB collection
    try {
      const result = await clubsCollection.insertOne(newClub);
      console.log('Club added successfully');
      res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error('Error adding club:', error);
      res.status(500).json({ error: 'Failed to add club' });
    }
  });


    app.get('/clubs/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }; // Use ObjectId to convert the id parameter
      const result = await clubsCollection.findOne(query);
      res.send(result);
    });
    app.post('/clubs', async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await clubsCollection.insertOne(item);
      res.send(result);
    });
    

    //apply
    app.post('/apply', async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await applicationCollection.insertOne(item);
      res.send(result);
    });

    app.get('/allapply', async (req, res) => {
      const result = await applicationCollection.find().toArray();
      res.send(result);
    });

    app.get('/apply', async (req, res) => {
      const email= req.query.email;
      console.log(email);
      if(!email) {
        res.send([]);
      }
      const query = {email: email}
      const result = await applicationCollection.find(query).toArray();
      res.send(result);
    });
    
    app.delete("/apply/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await applicationCollection.deleteOne(query);
      res.send(result);
    });
    
    app.put("/apply/:id", async (req, res) => {
      const id = req.params.id;
      const newStatus = req.body.status;
    
      try {
        const query = { _id: new ObjectId(id) };
        const update = { $set: { status: newStatus } };
    
        const result = await applicationCollection.updateOne(query, update);
    
        if (result.modifiedCount === 1) {
          // Successfully updated the status
          res.status(200).json({ message: "Status updated successfully" });
        } else {
          // No document matched the ID
          res.status(404).json({ message: "Application not found" });
        }
      } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})