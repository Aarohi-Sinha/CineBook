import app from "./app.js";
import "dotenv/config"

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});