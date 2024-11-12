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


// Настройка хранилища Multer
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
    limits: { fileSize: 5 * 1024 * 1024 }, // Максимальный размер файла 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Неправильный формат файла. Только изображения!"));
        }
    },
});

// Маршрут для создания продукта (POST /products)
router.post(
    "/create",
    authMiddleware,         // Проверка токена пользователя
    upload.single('image'), // Загрузка одного файла
    createProduct
);

// Маршрут для получения продуктов с фильтрацией и пагинацией (GET /products)
router.get(
    "/",
    authMiddleware,        // Проверка токена пользователя
    getProducts
);

// Маршрут для получения всех продуктов пользователя (GET /products/all)
router.get(
    "/all",     // Проверка токена пользователя
    authMiddleware,
    getAllProducts
);

router.post(
    "/cart/add",
    authMiddleware, // Проверка токена пользователя
    addToCart
);

// Маршрут для удаления продукта из корзины (DELETE /products/cart/remove)
router.delete(
    "/cart/remove",
    authMiddleware, // Проверка токена пользователя
    removeFromCart
);

router.get(
    "/cart",
    authMiddleware, // Проверка токена пользователя
    getCart
);

router.post(
    "/purchase",
    authMiddleware, // Проверка токена пользователя
    purchaseProducts
);


router.get(
    "/history",
    authMiddleware, // Проверка токена пользователя
    getPurchaseHistory
);

router.post(
    "/create-checkout-session",
    authMiddleware, // Проверка токена пользователя
    createStripeSession
);

router.post(
    "/webhook",
    express.raw({ type: "application/json" }), // Обработка сырого тела вебхука
    handleStripeWebhook
);

module.exports = router;