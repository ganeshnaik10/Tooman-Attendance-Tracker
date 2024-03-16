const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs'); 
const app = express();
const port = 3000;

const url = " Your MongoDB server Url";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true  });

app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', __dirname ); 
app.set('view engine', 'ejs'); 


app.get('/data', async (req, res) => {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas cluster successfully");

        const database = client.db("TestDataBase");
        const yourCollection = database.collection("test1");

        const data = await yourCollection.find({}).toArray();

        const dataWithPercentage = data.map(item => {
            const percentage = (item.attend / item.total) * 100;
            return { ...item, percentage: percentage.toFixed(2) + '%' };
        });
        
        res.render('data', { data: dataWithPercentage}); 
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});


app.post('/submit', async (req, res) => {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas cluster successfully");

        const database = client.db("TestDataBase");
        const yourCollection = database.collection("test1");

        const { subject, attend, total } = req.body;

        const attendint32 = parseInt(attend);
        const totalint32 = parseInt(total);

        const result = await yourCollection.updateOne({ subject }, { $set: { attend: attendint32, total: totalint32 } });

        console.log("Modified document count:", result.modifiedCount);

        res.send('<script>alert("Data updated successfully!"); window.location.href = "/";</script>');
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('<script>alert("An error occurred while updating data."); window.location.href = "/";</script>');
    } finally {
        await client.close();
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
