const express = require('express')
const app = express()
const fetch = require("node-fetch")
var cron = require('node-cron')
const cors = require('cors');
require('dotenv').config();

app.use(express.static('build'))

let timeswirefixed = []
let topstories = []
let topstoriesfixed = []
let mostpopular = []
let mostpopularfixed = []

const sleep =(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

cron.schedule('*/2 * * * *', function(){
  timeswirefixed = []
  const getTimesWire = fetch(`https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=${process.env.API_KEY}`).then(res => res.json()).then(json => {
  for(let i = 0; i < json.results.length; i++){
    let picture = ``
    let cpr = ``
    if(!!json.results[i].multimedia && json.results[i].multimedia.length > 0){
      picture = json.results[i].multimedia[1].url
      cpr = json.results[i].multimedia[1].copyright
    }
    else{
      picture = ``
      cpr = ``
    }
    let singleObject = {
      title: json.results[i].title,
      abstract: json.results[i].abstract,
      url: json.results[i].url,
      pic: picture,
      alt: cpr
    }
    timeswirefixed.push(singleObject)
  }
}).catch((error) => {console.log(error)})
})

const getTopstoriesData = async url => {
  try{
    const response = await fetch(url)
    const json = await response.json()
    return json
  }
  catch (error){
    console.log(error)
  }
}

const getAllTopstoriesData = async() => {
  let sections = ["arts", "automobiles", "books", "business", "fashion", "food",
  "health", "home", "insider", "magazine", "movies", "national", 
  "nyregion", "obituaries", "opinion", "politics", "realestate",
  "science", "sports", "sundayreview", "technology", "theater",
  "tmagazine", "travel", "upshot", "world"]

  for(let j = 0; j < sections.length; j++){
    if(j % 5 === 0 && j !== 0){
      await sleep(60000)
    }
    let url = `https://api.nytimes.com/svc/topstories/v2/${sections[j]}.json?api-key=${process.env.API_KEY}`
    let dataFromUrl = await getTopstoriesData(url)
    for(let i = 0; i < dataFromUrl.results.length; i++){
      let picture = ""
      let cpr = ""
      if(!!dataFromUrl.results[i].multimedia && dataFromUrl.results[i].multimedia.length > 0){
        picture = dataFromUrl.results[i].multimedia[1].url
        cpr = dataFromUrl.results[i].multimedia[1].copyright
      }
      else{
        picture = ""
        cpr = ""
      }
      let singleObject = {
        section: sections[j],
        title: dataFromUrl.results[i].title,
        abstract: dataFromUrl.results[i].abstract,
        url: dataFromUrl.results[i].url,
        pic: picture,
        alt: cpr
      }
      topstoriesfixed.push(singleObject)
    }
    
  }
}

getMostpopularData = async url => {
  try{
    const response = await fetch(url)
    const json = await response.json()
    return json
  }
  catch (error){
    console.log(error)
  }
}

getAllMostpopularData = async() => {
  
  let what = ["shared", "viewed"]
  let when = ["1", "7", "30"]
  for(let j = 0; j < 2; j++){
    if(j === 1){
      await sleep(60000)
    }
    for(let k = 0; k < 3; k++){
      let url = `https://api.nytimes.com/svc/mostpopular/v2/${what[j]}/${when[k]}.json?api-key=${process.env.API_KEY}`
      let dataFromUrl = await getMostpopularData(url)
      for(let i = 0; i < dataFromUrl.results.length; i++){
        let picture = ""
        let cpr = ""
        if(!!dataFromUrl.results[i].media){
          picture = dataFromUrl.results[i].media[0]["media-metadata"][1].url
          cpr = dataFromUrl.results[i].media.copyright
        }
        else{
          picture = ""
          cpr = ""
        }
        let singleObject = {
          sorv: what[j],
          wheen: when[k],
          title: dataFromUrl.results[i].title,
          abstract: dataFromUrl.results[i].abstract,
          url: dataFromUrl.results[i].url,
          pic: picture,
          alt: cpr
        }
        mostpopularfixed.push(singleObject)
      }
    }
  }
}

cron.schedule('0 * * * *', function(){
  topstoriesfixed = []
  getAllTopstoriesData()
  topstories = topstoriesfixed
})

cron.schedule('0 * * * *', function(){
  mostpopularfixed = []
  getAllMostpopularData()
  mostpopular = mostpopularfixed
})

cron.schedule('30 * * * *', function(){
  topstoriesfixed = []
  getAllTopstoriesData()
  topstories = topstoriesfixed
})

cron.schedule('30 * * * *', function(){
  mostpopularfixed = []
  getAllMostpopularData()
  mostpopular = mostpopularfixed
})

app.use(cors());

app.get('/timeswire', (request, response) => {
  response.json(timeswirefixed)
})

app.get('/topstories', (request, response) => {
  response.json(topstories)
})

app.get('/mostpopular', (request, response) => {
  response.json(mostpopular)
})

app.get('/searchbysection', (request, response) => {
  response.sendFile(__dirname + '/build/index.html')
})
        
app.get('/mostsharedandviewed', (request, response) => {
  response.sendFile(__dirname + '/build/index.html')
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
