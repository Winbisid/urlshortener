require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
const dns = require('dns');
// const tldjs = require('tldjs');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model("Url", urlSchema);

// Your first API endpoint

  // new Url({originalUrl: "https://github.com/winbisid", shortUrl: "4444"}).save()

app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  const urlCode = shortid.generate();

 //  function isValidHttpUrl(url) {
 //    try {
 //      const newUrl = new URL(url);
 //      return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
 //    } catch (err) {
 //      return false;
 //    }
 //  }
 //  const https = isValidHttpUrl(url)

 //  const isValidUrl = urlString => {
	//   	var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	//     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	//     '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	//     '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	//     '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	//     '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
	//   return !!urlPattern.test(urlString);
	// }

  // const regUrl = isValidUrl(url)
  // const tld = tldjs.tldExists(url)
  if (!/(https?:\/\/)/.test(url)) return res.send({ error: "invalid url" })

  const primaryUrl = new URL(url).hostname
  
  if(!validUrl.isWebUri(url) /*|| !tldjs.tldExists(url)|| !https || !regUrl */){
    res.status(401).json({error: 'invalid url'})
  }else{
    try{
      dns.lookup(primaryUrl, async (e) => {
        if (!e){
          let findOne = await Url.findOne({original_url: url})
          if(findOne){
            res.json({original_url: findOne.original_url, short_url: findOne.shortUrl})
          }else{
            findOne = new Url({original_url: url, short_url: urlCode})
            await findOne.save()
            res.json({original_url: findOne.original_url, short_url: findOne.short_url})
          } 
        }else{
          res.json({error: 'invalid url'})
        }
      })
    }catch(err){
      console.log(err)
      res.status(500).json('server error')
    }
  }
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  const urlCode = shortid.generate();
  try{
    const urlParams = await Url.findOne({short_url: req.params.short_url}, )
    if(urlParams){
      return res.redirect(urlParams.original_url)
    }else{
      return res.status(404).json('no url found')
    }
  }catch(err){
    console.log(err)
    res.status(500).json('server error');
  }
});

app.get('/hello', (req,res) => {
  // const DNS = dns.lookup('htt:githsid', (err, address, family) => address)
  // console.log(DNS)
  // console.log(new URL('https://f'))

  //   function isValidHttpUrl(url) {
  //   try {
  //     const newUrl = new URL(url);
  //     return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  //   } catch (err) {
  //     return false;
  //   }
  // }
  // const https = isValidHttpUrl('url')
  // console.log(https)
  
  // res.json({res : DNS})
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});