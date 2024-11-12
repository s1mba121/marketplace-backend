const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: "Токен не предоставлен" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Декодированные данные пользователя:", decoded); // Лог для отладки
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Ошибка при проверке токена:", error); // Лог для отладки
        return res.status(401).json({ message: "Неверный токен" });
    }
};

module.exports = authMiddleware;
