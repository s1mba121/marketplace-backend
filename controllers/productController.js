// src/controllers/productController.js
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const PurchaseHistory = require("../models/PurchaseHistory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UPLOADS_DIR } = require("../config/constants");
const jwt = require('jsonwebtoken');

(async () => {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (error) {
        console.error("Ошибка при создании папки для загрузок:", error);
    }
})();

async function saveImageLocally(image) {
    console.log("Сохраняем изображение локально...");
    const filename = `${uuidv4()}.jpg`;
    const destinationPath = path.join(UPLOADS_DIR, filename);

    try {
        await fs.copyFile(image.path, destinationPath);
        console.log("Файл успешно сохранен локально:", destinationPath);
        return `/uploads/${filename}`;
    } catch (error) {
        console.error("Ошибка при сохранении файла локально:", error);
        throw error;
    }
}

exports.createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;
        const image = req.file;
        const createdBy = req.user && req.user.userId;

        if (!createdBy) {
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        if (!image) {
            return res.status(400).json({ message: "Изображение обязательно" });
        }

        const imageUrl = await saveImageLocally(image);

        const product = await Product.create({
            name,
            price,
            imageUrl,
            createdBy,
            dateUploaded: new Date(),
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Ошибка при добавлении продукта:", error);
        res.status(500).json({ message: "Ошибка при добавлении продукта" });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        if (!userId) {
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        const { name, minPrice, maxPrice, sortBy = 'dateUploaded', order = 'desc', page = 1, limit = 10 } = req.query;

        const filter = { createdBy: userId };
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (minPrice) {
            filter.price = { ...filter.price, $gte: Number(minPrice) };
        }
        if (maxPrice) {
            filter.price = { ...filter.price, $lte: Number(maxPrice) };
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };
        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            products,
            totalProducts,
            page: Number(page),
            totalPages: Math.ceil(totalProducts / limit),
        });
    } catch (error) {
        console.error("Ошибка при получении товаров:", error);
        res.status(500).json({ message: "Ошибка при получении товаров" });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        if (!userId) {
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        const products = await Product.find({ sold: false });

        const userCart = await Cart.findOne({ userId });
        const cartProductIds = new Set(
            userCart ? userCart.items.map(item => item.productId.toString()) : []
        );

        const productsWithCartInfo = products.map(product => ({
            ...product.toObject(),
            isInCart: cartProductIds.has(product._id.toString())
        }));

        res.status(200).json(productsWithCartInfo);
    } catch (error) {
        console.error("Ошибка при получении всех товаров:", error);
        res.status(500).json({ message: "Ошибка при получении всех товаров" });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        const { productId, quantity = 1 } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        const productIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

        if (productIndex > -1) {
            cart.items[productIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error("Ошибка при добавлении товара в корзину:", error);
        res.status(500).json({ message: "Ошибка при добавлении товара в корзину" });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        const { productId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Корзина не найдена" });
        }

        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error("Ошибка при удалении товара из корзины:", error);
        res.status(500).json({ message: "Ошибка при удалении товара из корзины" });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;

        if (!userId) {
            return res
                .status(400)
                .json({ message: "ID пользователя обязателен" });
        }

        const cart = await Cart.findOne({ userId }).populate("items.productId"); 

        if (!cart) {
            return res.status(404).json({ message: "Корзина не найдена" });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error("Ошибка при получении корзины:", error);
        res.status(500).json({ message: "Ошибка при получении корзины" });
    }
};

exports.createStripeSession = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        console.log("Запрос на создание сессии Stripe, ID пользователя:", userId);

        if (!userId) {
            console.log("ID пользователя не передано");
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        const cart = await Cart.findOne({ userId }).populate("items.productId");
        console.log("Корзина пользователя:", cart);

        if (!cart || cart.items.length === 0) {
            console.log("Корзина пуста или не найдена");
            return res.status(400).json({ message: "Корзина пуста" });
        }

        const lineItems = cart.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.productId.name,
                },
                unit_amount: item.productId.price * 100,
            },
            quantity: item.quantity,
        }));
        console.log("Сформированы товары для Stripe:", lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: { userId },
        });

        console.log("Сессия Stripe создана успешно, sessionId:", session.id);
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error("Ошибка при создании сессии Stripe:", error);
        res.status(500).json({ message: "Ошибка при создании сессии Stripe" });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        console.log("Получен вебхук от Stripe, проверка подписи...");
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Вебхук успешно проверен");
    } catch (error) {
        console.error("Ошибка проверки вебхука Stripe:", error.message);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata.userId;
        console.log("Платеж успешно завершен, обработка сессии пользователя:", userId);

        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart) {
            console.log("Корзина пользователя не найдена");
            return res.status(400).json({ message: "Корзина не найдена" });
        }

        const productIds = cart.items.map((item) => item.productId._id);
        console.log("Обновляем статус товаров в корзине с IDs:", productIds);

        await Product.updateMany({ _id: { $in: productIds } }, { sold: true });

        await PurchaseHistory.findOneAndUpdate(
            { userId },
            { $push: { products: { $each: productIds.map(id => ({ productId: id })) } } },
            { upsert: true, new: true }
        );

        cart.items = [];
        await cart.save();

        console.log("Покупка успешно завершена и история покупок обновлена");
    }

    res.status(200).send("Webhook received and processed");
};

exports.purchaseProducts = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        if (!userId) {
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Корзина пуста" });
        }

        const productIds = cart.items.map(item => item.productId._id);
        
        await Product.updateMany(
            { _id: { $in: productIds } },
            { sold: true, soldDate: new Date() }
        );

    
        await PurchaseHistory.findOneAndUpdate(
            { userId },
            {
                $push: {
                    products: { $each: productIds.map(id => ({ productId: id, purchaseDate: new Date() })) }
                }
            },
            { upsert: true, new: true }
        );

        await Cart.updateMany(
            { "items.productId": { $in: productIds } },
            { $pull: { items: { productId: { $in: productIds } } } }
        );

        cart.items = [];
        await cart.save();

        res.status(200).json({ message: "Покупка успешно завершена" });
    } catch (error) {
        console.error("Ошибка при совершении покупки:", error);
        res.status(500).json({ message: "Ошибка при совершении покупки" });
    }
};


exports.getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;
        console.log("Запрос на получение истории покупок, ID пользователя:", userId);

        if (!userId) {
            console.log("ID пользователя не передано");
            return res.status(400).json({ message: "ID пользователя обязателен" });
        }

        const history = await PurchaseHistory.findOne({ userId }).populate("products.productId");
        console.log("История покупок пользователя:", history);

        if (!history) {
            console.log("История покупок не найдена");
            return res.status(404).json({ message: "История покупок не найдена" });
        }

        res.status(200).json(history);
    } catch (error) {
        console.error("Ошибка при получении истории покупок:", error);
        res.status(500).json({ message: "Ошибка при получении истории покупок" });
    }
};
