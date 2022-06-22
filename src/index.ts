import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

import errorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";
import mongoose from "mongoose";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app: Application = express();

app.use(cors());
app.use(express.static("assets"));

app.use(notFound);
app.use(errorHandler);

mongoose
    .connect(<string>process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((error) => console.log(error.message));

export default app;
// {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }