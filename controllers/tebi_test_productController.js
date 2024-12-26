// src/controllers/tebi_test_productController.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const Product = require("../models/Product");

const TEBI_ENDPOINT = "https://s3.tebi.io";
const TEBI_ACCESS_KEY = "bFSqxwvREwGhSwgZ";
const TEBI_SECRET_KEY = "FpNFu5tuVremHO8WVbaRHCLZRvWlYKZj6KpxRmRR";
const TEBI_BUCKET_NAME = "my-images";

const s3Client = new S3Client({
  endpoint: TEBI_ENDPOINT,
  credentials: {
    accessKeyId: TEBI_ACCESS_KEY,
    secretAccessKey: TEBI_SECRET_KEY,
  },
  region: "global",
});

async function uploadImageToTebi(image) {
  console.log("Начало загрузки изображения в Tebi...");

  const filename = `images/${uuidv4()}.jpg`;

  const uploadParams = {
    Bucket: TEBI_BUCKET_NAME,
    Key: filename,
    Body: image.buffer,
    ContentType: image.mimetype,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("Файл успешно загружен в Tebi:", data);
    return `https://${TEBI_BUCKET_NAME}.tebi.io/${filename}`;
  } catch (error) {
    console.error("Ошибка при загрузке файла в Tebi:", error);
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

        const imageUrl = await uploadImageToTebi(image);
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
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Ошибка при получении товаров:", error);
        res.status(500).json({ message: "Ошибка при получении товаров" });
    }
};
