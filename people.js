const express = require('express');
const app = express();
const cors = require('cors')
const fetch = require('node-fetch')
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var unprotected = express.Router();
unprotected.use(bodyParser.json({
    limit: '100mb'
}))

app.use(cors());
app.use(express.static('/home/edwardsverdlin/node_js/people1/src'))
function buildURL(params_list,path){

  // expects path to be in a form of /query/[query name]

  let url = "https://e57c1461-70ed-4fc7-adfa-d70b1e0b313f.i.tgcloud.us:9000" + path;
  let i = params_list.length;
  console.log("url = " + url);
  console.log("params length = " + params_list.length);

  let paramKeys = Object.keys(params_list)
  if (paramKeys.length > 0) {

      url += "?"
      for (let index = 0; index < paramKeys.length; index++) {
          const key = paramKeys[index];
          if (Array.isArray(params_list[key])) {//It was an array of values
              for (const val in params_list[key]) {
                  url += key + "=" + val + "&"
                  console.log("url = " + url);
              }
          }
          else {//It was just a single value
              url += key + "=" + params_list[key]
          }
      }
    }
}

unprotected.get('/query/*', async (req, res) => {
    var path = req.path;
    var params = req.query;
    console.log(path);

    let url = "https://e57c1461-70ed-4fc7-adfa-d70b1e0b313f.i.tgcloud.us:9000" + path;

    let paramKeys = Object.keys(params)
    if (paramKeys.length > 0) {
        url += "?"
       for (let index = 0; index < paramKeys.length; index++) {

            const key = paramKeys[index];
            if (Array.isArray(params[key])) {//It was an array of values
                for (const val in params[key]) {
                    url += key + "=" + val + "&"
                }
            }
            else {//It was just a single value
              if (index==0){
                url += key + "=" + params[key]
              }else{
                url += "&"+key + "=" + params[key]
              }
            }
        }
    }

    let mydate = new Date();
    console.log("full url ==>" + url);

    try {
        var results = await tigerCallGet(url)
        res.status(200)
        console.log(results);
        console.log("Ran at = " + mydate);
        res.send(results)
    }
    catch (e) {
        res.status(400)
        res.send(e.message)
    }
})

async function tigerCallGet(url){
    try{
      var token = "l06pgm29dft3emagk1tr30tbrhkqgg91"
      var tigerResponse = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        })
        var result
        if (tigerResponse.status === 200){
          result = await tigerResponse.json()
          return result
        }
        else{
          result = await tigerResponse.text()
          var responseData = {
            "error": true,
            "message": result,
            "status": tigerResponse.status
          }
          return responseData
        }
    }
    catch (e){
      console.log(e)
      console.log("Issue getting data from tiger")
      return e
    }
  }

  app.use('/', unprotected);
  const server = app.listen(port, ()=>console.log(`Listening on port ${port}.localhost: ${port}`));