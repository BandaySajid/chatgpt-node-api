import express from "express";
import chatRouter from "./controllers/chat.js";
const PORT = process.env.PORT || 9090;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(chatRouter);

app.listen(PORT, () => {
    console.log('server is up on PORT:', PORT);
});

