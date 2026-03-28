const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

app.use(express.json());
app.use(cors({
    origin: 'https://e-commerce-frontendd-vmjq.onrender.com',
}));

// ✅ CREATE FOLDER IF NOT EXISTS
const uploadPath = './upload/images';

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ DATABASE CONNECTION
const onlineURI = "mongodb+srv://infinitycoding59_db_user:qmdcRDd7VAlFBJTe@e-commerce.3gpk0wc.mongodb.net/";

mongoose.connect(onlineURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(() => console.log("MongoDB Error"));

// ✅ API TEST
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// ✅ MULTER CONFIG
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ✅ STATIC IMAGE PATH
app.use('/images', express.static(uploadPath));

// ✅ UPLOAD API
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `https://e-commerce-backendd-0y49.onrender.com/images/${req.file.filename}`
    });
});

// ✅ PRODUCT SCHEMA
const Product = mongoose.model("Product", {
    id: Number,
    name: String,
    image: String,
    category: String,
    new_price: Number,
    old_price: Number,
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true }
});

// ✅ ADD PRODUCT
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id = products.length ? products.slice(-1)[0].id + 1 : 1;

    const product = new Product({
        id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });

    await product.save();

    res.json({ success: true });
});

// ✅ GET ALL PRODUCTS
app.get('/allproducts', async (req, res) => {
    const products = await Product.find({});
    res.send(products);
});

// ✅ USER SCHEMA
const Users = mongoose.model('Users', {
    name: String,
    email: { type: String, unique: true },
    password: String,
    cartData: Object,
    date: { type: Date, default: Date.now }
});

// ✅ SIGNUP
app.post('/signup', async (req, res) => {
    const existing = await Users.findOne({ email: req.body.email });

    if (existing) {
        return res.json({ success: false, message: "User exists" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    await user.save();

    const token = jwt.sign({ user: { id: user._id } }, 'secret_ecom');

    res.json({ success: true, token });
});

// ✅ LOGIN
app.post('/login', async (req, res) => {
    const user = await Users.findOne({ email: req.body.email });

    if (!user || user.password !== req.body.password) {
        return res.json({ success: false });
    }

    const token = jwt.sign({ user: { id: user._id } }, 'secret_ecom');

    res.json({ success: true, token });
});

// ✅ START SERVER
app.listen(port, () => {
    console.log("Server Running on port " + port);
});
