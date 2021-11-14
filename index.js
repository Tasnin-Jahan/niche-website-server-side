const express = require('express')
const app = express()
const cors = require('cors');
// const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ky1bh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);



// async function verifyToken(req, res, next) {
//     if (req.headers?.authorization?.startsWith('Bearer ')) {
//         const token = req.headers.authorization.split(' ')[1];

//         try {
//             const decodedUser = await admin.auth().verifyIdToken(token);
//             req.decodedEmail = decodedUser.email;
//         }
//         catch {

//         }

//     }
//     next();
// }

async function run() {

    try {
        await client.connect();


        const database = client.db('bicycle_shop');
        const bicyclesCollection = database.collection('bicycles');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');
        const productsCollection = database.collection('products');

        app.post('/bicycles', async (req, res) => {
            const bicycle = req.body;
            const result = await bicyclesCollection.insertOne(bicycle);
            console.log(result);
            res.json(result)
        });

        app.get('/bicycles', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }
            console.log(query);

            const cursor = bicyclesCollection.find(query);
            const bicycles = await cursor.toArray();
            res.json(bicycles);
        })

        app.delete('/bicycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bicyclesCollection.deleteOne(query);
            console.log('deleting cycle with id', id)
            res.json(result);
        })


        // review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the api', review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            // res.send('post hitted')
            res.json(result)
        });

        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        // PRODUCTS
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the api', product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            // res.send('post hitted')
            res.json(result)
        });

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // DELETE API(product)
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log('deleting product with id', id)
            res.json(result);
        })


        // USERS

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);

        })


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);

            //             const requester = req.decodedEmail;
            //             if (requester) {
            //                 const requesterAccount = await usersCollection.findOne({ email: requester });
            //                 if (requesterAccount.role === 'admin') {
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    }
    //                 }
    //             }
    //             else {
    //                 res.status(403).json({ message: 'you do not have access to make admin' })
    //             }

    //         })

    //     }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello there!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})

// app.get('/users')
// app.post('/users')
// app.get('/users/:id')
// app.put('/users/:id');
// app.delete('/users/:id')
// users: get
// users: post
