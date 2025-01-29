const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());

app.post('/data', (req, res) => {
    const oneMBString = '0'.repeat(4028 * 4028); // 1 MB of '0'
    res.json({ data: oneMBString });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
