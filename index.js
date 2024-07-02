import express from "express";

const PORT = 3017;
const app = express();

app.get("/load", (req, res) => {
    let precess = 0;
    
    for (let i = 1; i <= 50_000_000; i++) {
        precess++;
    }

    res.send(`Current process is ${process}\n`);
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log(`Process id = ${process.pid}`);
});

export default app;