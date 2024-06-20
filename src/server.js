import express from 'express';
import config from 'config';
import { parse_message } from './groupme/groupme';


const app = express();
app.use(express.json());
const serverConfig = config.get("server_config")




app.post('/', (req, res) => {
  parse_message(req.body.toLowerCase());
})

app.listen(serverConfig.port, () => {
  console.log(`Golf Bot listening on port ${serverConfig.port}`)
})