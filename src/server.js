import express from 'express';
import config from 'config';



const app = express();
app.use(express.json());
const serverConfig = config.get("server_config")


app.post('/', (req, res) => {
  console.log(req.body);
})

app.listen(serverConfig.port, () => {
  console.log(`Example app listening on port ${serverConfig.port}`)
})