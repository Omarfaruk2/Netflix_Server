
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// middleware
app.use(cors())
app.use(express.json())



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.odsjfxq.mongodb.net/?retryWrites=true&w=majority`

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfzndi4.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })




async function run() {

    try {
        await client.connect()

        const netfleixUserCollection = client.db("netfliex").collection("users")
        const movieCollection = client.db("netfliex").collection("movie")
        const listsCollection = client.db("netfliex").collection("lists")
        const loginCollection = client.db("netfliex").collection("loginUser")
        const seriesColloection = client.db("netfliex").collection("series")

        const paymentsCollection = client.db("netfliex").collection("payments")


        // ---------------------------------------------------------------------------


        app.post("/series", async (req, res) => {
            const newUser = req.body
            const result = await seriesColloection.insertOne(newUser)
            res.send(result)
        })


        app.get("/series", async (req, res) => {
            const query = {}
            const cursor = seriesColloection.find(query)
            const users = await cursor.toArray()
            res.send(users)

        })



        // paynent
        app.post('/create-payment-intent', async (req, res) => {
            const service = req.body
            const totalprice = service.totalprice
            const amount = totalprice * 100
            // const paymentIntent = await stripe.paymentIntents.create
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ['card']
            })
            res.send({ clientSecret: paymentIntent.client_secret })
        })



        app.patch("/loginuser/:email", async (req, res) => {
            const email = req.params.email
            const payment = req.body
            const filter = { email: email }

            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId,
                }
            }
            const updatedOrder = await orderCollection.updateOne(filter, updatedDoc)
            const result = await paymentsCollection.insertOne(payment)
            res.send(updatedDoc)
        })











        // -------user----------------------------------------------------------------------


        // My items
        app.get('/loginuser/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const cursor = await loginCollection.find(query).toArray()
            res.send(cursor)
        })




        app.post("/loginuser", async (req, res) => {
            const newUser = req.body
            const result = await loginCollection.insertOne(newUser)
            res.send(result)
        })



        app.get("/loginuser", async (req, res) => {
            const query = {}
            const cursor = loginCollection.find(query)
            const users = await cursor.toArray()
            res.send(users)

        })









        // ------------------------------------------------------------------------------

        app.post("/register", async (req, res) => {
            const newUser = req.body
            const result = await boomCollection.insertOne(newUser)
            res.send(result)
        })

        app.post("/user", async (req, res) => {
            const newUser = req.body
            const result = await netfleixUserCollection.insertOne(newUser)
            res.send(result)
        })

        app.put("/user/:id", async (req, res) => {
            const id = req.params.id
            const updatedUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: updatedUser
            }
            const result = await netfleixUserCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await netfleixUserCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/user/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await netfleixUserCollection.findOne(query)
            res.send(result)
        })


        app.get("/user", async (req, res) => {
            const query = {}
            const cursor = netfleixUserCollection.find(query)
            const users = await cursor.toArray()
            res.send(users)
        })
        // status----------------------------------------------------------------------

        app.get("/stats", async (req, res) => {
            const today = new Date()
            const latYear = today.setFullYear(today.setFullYear() - 1)


            const monthArray = [
                "January",
                "Fabruary",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ]

            const data = await netfleixUserCollection.aggregate([
                {
                    $project: {
                        month: { $year: "$createdAt" }
                    }
                }, {
                    $group: {
                        _id: "$month",
                        total: { $sum: 1 },
                    }
                }
            ])

            res.send(data)


            // const query = {}
            // const cursor = netfleixUserCollection.find(query)
            // const users = await cursor.toArray()

        })


        // Movie------------------------------------------------------------------------------------------------------------------------


        app.post("/movie", async (req, res) => {
            const newUser = req.body
            const result = await movieCollection.insertOne(newUser)
            res.send(result)
        })

        app.put("/movie/:id", async (req, res) => {
            const id = req.params.id
            const updatedUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: updatedUser
            }
            const result = await movieCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.delete("/movie/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await movieCollection.deleteOne(query)
            res.send(result)
        })

        // get all movie

        app.get("/movie", async (req, res) => {
            const query = {}
            const cursor = movieCollection.find(query)
            const users = await cursor.toArray()
            res.send(users.reverse())

        })


        // get a randomm movie

        app.get("/random", async (req, res) => {
            const query = {}
            const cursor = movieCollection.find(query)
            const users = await cursor.toArray()
            const randomItem = users[Math.floor(Math.random() * users.length)]
            res.send(randomItem)

        })


        app.get('/movie/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await movieCollection.findOne(query)
            res.send(result)
        })

        // list order----------------------------------------------------------------------------------------------------------------------------



        app.post("/lists", async (req, res) => {
            const list = req.body
            const result = await listsCollection.insertOne(list)
            res.send(result)
        })

        app.get("/lists", async (req, res) => {

            const query = {}
            const cursor = listsCollection.find(query).limit(10)
            const users = await cursor.toArray()
            res.send(users)

        })

        app.delete("/lists/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await listsCollection.deleteOne(query)
            res.send(result)
        })













    }
    finally {

    }
}
run().catch(console.dir)

app.post("/", (req, res) => {
    res.send("Gemus Server Running")
})


// middleware
app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
    res.send("Running Genius Server hello")
})

app.listen(port, () => {
    console.log("Listening to port", port)
})

