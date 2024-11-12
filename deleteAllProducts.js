// deleteAllProducts.js
require("dotenv").config(); // Загружаем переменные из .env
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const Product = require("./models/Product");
const { UPLOADS_DIR } = require("./config/constants");

// Функция для удаления всех продуктов и связанных изображений
async function deleteAllProducts() {
    try {
        // Удаляем все записи из коллекции продуктов
        const result = await Product.deleteMany({});
        console.log(`Удалено продуктов: ${result.deletedCount}`);

        // Удаляем все файлы из папки загрузок
        const files = await fs.readdir(UPLOADS_DIR);
        for (const file of files) {
            await fs.unlink(path.join(UPLOADS_DIR, file));
        }
        console.log("Все изображения удалены из папки загрузок");

    } catch (error) {
        console.error("Ошибка при удалении продуктов:", error);
    } finally {
        mongoose.connection.close();
    }
}

// Подключение к базе данных и вызов функции удаления
async function connectAndDelete() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Подключение к базе данных успешно");

        await deleteAllProducts();
    } catch (error) {
        console.error("Ошибка подключения к базе данных:", error);
    }
}

connectAndDelete();
