import express from 'express';

const PORT = process.env.PORT;

const app = express();

app.get('/', (req, res) => {
    res.send('Hi');
});

app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
