const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.21hcnfr.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const brandCollection = client.db('brandShopDB').collection('brand');
        const productsCollection = client.db('brandShopDB').collection('products');
        const mycartCollection = client.db('brandShopDB').collection('mycart');

        // Brands Data Loaded Related Api
        app.get('/brand', async(req, res) => {
            const cursor = brandCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Products Data Related Api 
        app.get('/products', async(req, res) => {
            const cursor = productsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)}
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        app.post('/products', async(req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

        app.put('/products/:id', async(req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id)}
            const options = { upsert: true }
            const updatedProduct = req.body;
            const product = {
                $set: {
                    productName: updatedProduct.productName, 
                    brandName: updatedProduct.brandName, 
                    type: updatedProduct.type, 
                    price: updatedProduct.price, 
                    description: updatedProduct.description, 
                    rating: updatedProduct.rating, 
                    photo: updatedProduct.photo
                }
            }
            const result = await productsCollection.updateOne(filter, product, options)
            res.send(result);
        })

        // My Cart Data Related Api
        app.get('/mycart', async(req, res) => {
            const cursor = mycartCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/mycart', async(req, res) => {
            const cartProduct = req.body;
            const result = await mycartCollection.insertOne(cartProduct);
            res.send(result);
        })

        app.delete('/mycart/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)}
            const result = await mycartCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bombshell Beauty Brand Shop Server is Running......')
})

app.listen(port, () => {
    console.log('Bombshell Beauty Brand Shop Running on Port:', port)
})