// src/routes/productRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const { createProduct, getProducts, getAllProducts, addToCart, removeFromCart, getCart, purchaseProducts, getPurchaseHistory, createStripeSession, handleStripeWebhook } = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const { UPLOADS_DIR } = require("../config/constants");

const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Неправильный формат файла. Только изображения!"));
        }
    },
});

router.post(
    "/create",
    authMiddleware,      
    upload.single('image'), 
    createProduct
);


router.get(
    "/",
    authMiddleware,        
    getProducts
);


router.get(
    "/all",  
    authMiddleware,
    getAllProducts
);

router.post(
    "/cart/add",
    authMiddleware,
    addToCart
);

router.delete(
    "/cart/remove",
    authMiddleware,
    removeFromCart
);

router.get(
    "/cart",
    authMiddleware,
    getCart
);

router.post(
    "/purchase",
    authMiddleware,
    purchaseProducts
);


router.get(
    "/history",
    authMiddleware,
    getPurchaseHistory
);

router.post(
    "/create-checkout-session",
    authMiddleware,
    createStripeSession
);

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

module.exports = router;