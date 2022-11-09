const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

// Middle ware
app.use(cors())
app.use(express.json())

// make uri for mongodb
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri)

async function dbConnect() {
    try {
        await client.connect()
        console.log('mongo connected');

    } catch (error) {
        console.log(error.message, error.name);

    }
}
dbConnect()

// create the database and collection
const Services = client.db('ExploreWorld').collection('service')
const Reviews = client.db('ExploreWorld').collection('review')

// service Post using post method in mongodb
app.post('/service', async (req, res) => {
    try {
        const result = await Services.insertOne(req.body)
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully created the ${req.body.name} with this id ${result.insertedId}`
            })
        }
        else {
            res.send({
                success: false,
                error: "Couldn't create the product"
            })
        }

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// this is get service function for server side
app.get('/service', async (req, res) => {
    try {
        const cursor = Services.find({}).limit(3).sort({ year: -1, _id: -1 });
        const service = await cursor.toArray()
        res.send({
            success: true,
            data: service
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })

    }
})

// this is get service id function for server side
app.get('/service/:id', async (req, res) => {
    try {
        const { id } = req.params
        const quary = { _id: ObjectId(id) };
        const service = await Services.findOne(quary)
        res.send({
            success: true,
            data: service
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })

    }
})


// Reviews function here for Post
// service Post using post method in mongodb
app.post('/review', async (req, res) => {
    try {
        const result = await Reviews.insertOne(req.body)
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully Added Review with this id ${result.insertedId}`
            })
        }
        else {
            res.send({
                success: false,
                error: "Couldn't Added The Review"
            })
        }

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// this is get service function for server side
app.get('/review', async (req, res) => {
    let query = {}
    if(req.query.id){
        query={
            id: req.query.id
        }
    }
    console.log(req.query.id);
    try {
        const cursor = Reviews.find({})
        const review = await cursor.toArray()
        res.send({
            success: true,
            data: review
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })

    }
})





app.get('/', (req, res) => {
    res.send('Assignment server up')
})

app.listen(port, () => {
    console.log(`server up on: ${port}`);
})