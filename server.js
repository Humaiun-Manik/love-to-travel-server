const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('server is running');
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ec7pw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function run() {
    try {
        await client.connect();
        const database = client.db("loveToTravel");
        const tours_Collection = database.collection("tours");
        const destinations_Collection = database.collection("destinations");
        const orders_Collection = database.collection("orders");

        // load tours get api
        app.get('/tours', async (req, res) => {
            const cursor = tours_Collection.find({});
            const tours = await cursor.toArray();
            res.json(tours);
        });

        // load destinations get api
        app.get('/destinations', async (req, res) => {
            const cursor = destinations_Collection.find({});
            const destinations = await cursor.toArray();
            res.json(destinations);
        });

        // load single tour get api
        app.get('/tours/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tour = await tours_Collection.findOne(query);
            res.json(tour);
        });

        // load order data according to user id get api
        app.get('/orders/:uid', async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await orders_Collection.find(query).toArray();
            res.json(result);
        });

        // add data to cart collection with additional info
        app.post('/tour/add', async (req, res) => {
            const tour = req.body;
            const result = await orders_Collection.insertOne(tour);
            res.json(result);
        });

        // delete data from order delete api
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orders_Collection.deleteOne(query);
            res.json(result);
        });

        // purchase delete api
        app.delete(`/booking/:uid`, async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await orders_Collection.deleteMany(query);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log('server is running on port', port);
});