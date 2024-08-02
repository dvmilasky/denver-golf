import express from 'express';
import config from 'config';
import { parse_message } from './groupme/groupme.js';


const app = express();
app.use(express.json());
const serverConfig = config.get("server_config")




app.post('/', (req, res) => {
  try {
    const status = parse_message(req.body.text.toLowerCase());
    res.send("Success");
  }
  catch (error) {
    console.error(`Error processing request: ${error}`);
  }
})

app.listen(serverConfig.port, () => {
  console.log(`Golf Bot listening on port ${serverConfig.port}`)
})