const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')('your_stripe_secret_key');
const endpointSecret = 'whsec_mbfonHT92RVJH8ooeE9sVcU2YEKn5CEm';

const corsOptions = {
    origin: '*', // Разрешить доступ с любого источника
    methods: 'GET,POST,PUT,DELETE', // Разрешённые методы
    allowedHeaders: 'Content-Type,Authorization', // Разрешённые заголовки
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// Используем express.raw() для обработки тела запроса в виде буфера
app.post('/api/products/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Проверяем подпись Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("Вебхук успешно проверен");
    } catch (err) {
        console.error('Ошибка проверки подписи вебхука Stripe:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Обрабатываем событие
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('Платеж успешно завершен:', paymentIntent.id);
    }

    res.status(200).send('Принято');
});

app.listen(4000, () => console.log('Сервер слушает порт 4000'));
