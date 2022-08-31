const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const admin = require("firebase-admin");
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");

const serviceAccount = {
  type: "service_account",
  project_id: "doctorsportal-29f15",
  private_key_id: "b9b313179821aa8ab2b086ef4d4a3497199f41f5",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7tADc1j7DWddK\nH3IyrwRl5ht4zqGSE2McwzIiq+mUUtp+pf05NkWYcNGSe49nUSgnnTktUOjQ37ZW\nOlPevGQGj6z6QNaDoBTvLNTUAL7e/OjZR6le06n2ws7dEUughEQYhGn1gEkLpn4V\ne7WfQBjdsQMyv5TQY/q9jwuQNv7Bze9BPWLMALn2D+Ah8bwxlxc2LegQYzSkt5ca\nPysmldX0opfo3jH4smnM76yEeov7i6SKFXxHfb/lFECpI7ujhC4+aylXpLpCQy+D\nUvr8+WFTvBI+tAibFIKpPOy9prYKVwt6XBD1+WSrvYP8wENvdbPQvJdWWCgV0XwC\n8EwIchHtAgMBAAECggEABqEogX+yiBU7PvTRqQcvc5TCljVOHrw/IcUTu8/C4YPP\noluAffb0CghzMwrYve4mTn68YYk3m0xtwqmdA0yA9aCm5T4kugiNi5bBV1HX/kUW\ngEvTg70uYXbwPzSdCMQw4KnyUUMJ9f/O+RS0MjXdfUFMRAxzWBqbUvrsjlggoMbO\nKK1Ag/IwwKmtp71UV1moyY9BSyjkBLrKobvsGOmkkKuXjb7an/33vhaLT88Zy+lb\nLCpY/hcbZVRZKemwy4I83pyOVUsj/ZuIQi+z2UlT1KwrzOzgPFfAiDhjEzvvMqYa\nkvI3HEFChEZ5+R2X10zPRJYYxVTgx+PT0J4RSe6bAQKBgQDrPbbVoQDtNmL5XZuv\nTuiVFNKlqO7XU/Jtu9Nm/61gxB6ifbid0lz2VLCRFgBTNev7T2wSBmeY/EptV1Gf\nGm7ozv3l6qArdOpvTLlRfC5tpLtAgc+0ats/8nP/Kh7ih4aPjfKIoGdcLFgoZ47s\nikGIDgeZSesCc47EmGIVg2sZrQKBgQDMRF5uUjbxIrDdETPd8uhh9DpxtaBIiKBz\nbSXnSumO7IdIjM1YPTWMrfsLwD3pQGKSGqhWycXubNJlwKOZK/0SZ1JtEwTDbTpF\nxC8rWE+HWJxwm37w8Wv9sFj8uPl0xo+iR30B1AE9ZgXKWeG/AqU3kQI6e1islmw1\nBVM2SF5hQQKBgFnEri2th/39oB1KxGtMsGKblJrU8XfIOB356/1FGjNwA8S8NyQ6\nr3Ds9ogXHj6iuA+pyjLCsOvncrtw89vEKYi73JXNSBvtPL0GST24Jrt+flpqbwmJ\nMWugqPU5bJnDX+0OHPxYQbkhzu50Pk0zoTg7KlkrpPvFfzi0cdGF2evtAoGADGlD\nC5T3PaOL94KqEhxGPl1mh64vdPjINvs0yF7m3gZFGgVkHK5raIbRsB8YI+oDkzkH\nbW6JFjmKdyBDUHU5xTp96Z60NWOXnNGUxB9zhZe+uaDZD667jwh9/60FizDdXVDW\nqZvGD4L5axgW/VId08h9yCvicWoaXQZbzfqLsYECgYAnBUg0a3TWMFLBaM5/Ubzf\nfuYEBjpGUDBXpbolo79ayMQb4tROVzsTjGhQcEbYkQ0K3vWzjqHVKVka12bKr39/\nBm+h6stbB7YQQ16m+nrRudEhgocmRv/bC0bud4kMvte/WrdXyOzsphLhWr4x6Mf4\nbsY+nTS7WO6Vp5Npz/MpGw==\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-s9zt8@doctorsportal-29f15.iam.gserviceaccount.com",
  client_id: "113846190782893776400",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-s9zt8%40doctorsportal-29f15.iam.gserviceaccount.com",
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(fileUpload());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f8dsb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function verifyToken(req, res, next) {
  if (req.headers.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    } catch {}
  }
  next();
}

async function run() {
  try {
    await client.connect();
    const database = client.db("doctors_portal");
    const appointmentsCollection = database.collection("appointments");
    const doctorsCollection = database.collection("doctors");
    const userCollection = database.collection("users");
    //appointment api
    app.post("/appointments", async (req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.json(result);
    });

    //get//
    app.get("/appointments", verifyToken, async (req, res) => {
      const email = req.query.email;
      const date = req.query.date;
      const query = { email: email, date: date };
      const cursor = appointmentsCollection.find(query);
      const appointments = await cursor.toArray();
      res.json(appointments);
    });

    //single user
    app.get("/appointments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await appointmentsCollection.findOne(query);
      res.json(result);
    });
    //user api

    // post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    //upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.put("/users/admin", verifyToken, async (req, res) => {
      const user = req.body;
      const requester = req.decodedEmail;
      if (requester) {
        const requesterAccount = await userCollection.findOne({
          email: requester,
        });
        if (requesterAccount.role === "admin") {
          const filter = { email: user.email };
          const updateDoc = { $set: { role: "admin" } };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.json(result);
        }
      } else {
        res
          .status(403)
          .json({ message: "you do not have access to make admin" });
      }
    });
    // get user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    //doctor api
    //post api
    app.post("/doctors", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const doctor = {
        name,
        email,
        image: imageBuffer,
      };
      const result = await doctorsCollection.insertOne(doctor);
      res.json(result);
    });
    //get

    app.get("/doctors", async (req, res) => {
      const cursor = doctorsCollection.find({});
      const doctors = await cursor.toArray();
      res.json(doctors);
    });
  } finally {
    //await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(` ${port}`);
});
