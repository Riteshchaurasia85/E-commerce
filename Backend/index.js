const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
// const { type } = require('os');
// const { error } = require('console');

app.use(express.json());
app.use(cors({
    origin: 'https://e-commerce-frontendd-vmjq.onrender.com',
}));

// Database Connection With MongoDB
// mongoose.connect("mongodb+srv://satyamst260:satyam2000@cluster0.ekjdpse.mongodb.net/e-commerce")||mongoose.connect("mongodb://0.0.0.0:27017/practicee-commerce")
// const mongoose = require('mongoose');

// Online MongoDB connection URI
const onlineURI = "mongodb+srv://infinitycoding59_db_user:qmdcRDd7VAlFBJTe@e-commerce.3gpk0wc.mongodb.net/";

// Local MongoDB connection URI
const localURI = "mongodb://0.0.0.0:27017/e-commerce";

// Connect to online MongoDB, if offline, connect to local MongoDB
mongoose.connect(onlineURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to online MongoDB");
    })
    .catch((onlineError) => {
        console.log("Online MongoDB connection failed. Attempting to connect to local MongoDB...");
        mongoose.connect(localURI, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log("Connected to local MongoDB");
            })
            .catch((localError) => {
                console.log("Local MongoDB connection failed. Exiting application...");
                process.exit(1); // Exit with error status
            });
    });

//Api creation

app.get("/", (req, res) => {
    res.send("Express App is Running")
})

// Image Storage Engine

const storage = multer.diskStorage({
    destination: "./upload/images",
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

//creating upload endpoint 
app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `https://e-commerce-backendd-0y49.onrender.com/images/https://www.istockphoto.com/photos/clothing`
    })
})

// schema for creating projects

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    avilable: {
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name,
    })
})

//creating api for deleting products

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log('Removed');
    res.json({
        success: true,
        name: req.body.name
    })
})


//craeting api for getting all products

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log('ALL PRODUCTS FETCHED');
    res.send(products);
})

// Schema creating for user model

const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

// Creating Endpoint for registering the user
app.post('/signup', async (req, res) => {

    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with same email address" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user._id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
})

// Creating endpoint for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user._id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, errors: "Wrong password" });
        }
    }
    else {
        res.json({ success: false, errors: "Wrong Email Id" })
    }
})



//Creating endpoint for newcollection data
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})


// Creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    console.log("popular in women fatched")
    res.send(popular_in_women);
})


// Creating middleware to fatch  user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenthicate using valid token" })
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "please authenticate using a valid token" })
        }
    }
}
// creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
    // console.log(req.body,req.user);
    console.log("Added", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send('Added')
})

// creating endpoint for remove products in cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send('Removed')
})


// creating endpoint to get cartdata
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    let userData = await Users.findOne({ _id: req.user.id });
     if (!userData) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json(userData.cartData);
})
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on port" + port)
    }
    else {
        console.log("Error :" + error)
    }
})
