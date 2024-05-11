import express from 'express';
import config from 'config';



const app = express()
const serverConfig = config.get("server_config")


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(serverConfig.port, () => {
  console.log(`Example app listening on port ${serverConfig.port}`)
})