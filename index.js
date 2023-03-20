require("dotenv").config()
const axios = require("axios");
const process = require("process");
const { Client } = require("@notionhq/client");
const notion = new Client({auth: process.env.NOTION_API_KEY})

const title = "tt9253284";

const showDetails = async (endpoint) => {
  const apiURL = `https://online-movie-database.p.rapidapi.com/title/${endpoint}`
  const options = {
    method: "GET",
    url: apiURL,
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host":"online-movie-database.p.rapidapi.com"
    },
    params: {
      tconst : title,
    }
  }
  return axios.request(options)
}

const allData = async () => {
  const details = await showDetails("get-overview-details");
  const seasons = await showDetails("get-seasons");
  const show = {
    showName: details.data.title.title,
    genres: details.data.genres,
    episodes: details.data.title.numberOfEpisodes,
    seasons: seasons.data.length,
    image: details.data.title.image.url,
    date: details.data.title.seriesStartYear + (details.data.title.seriesEndYear ? "-" + details.data.title.seriesEndYear : "–"),
    rating: details.data.ratings.rating,
  }
  return show;
}

const notionRequest = async () => {
  const data = await allData();
  notion.pages.create({
    "parent": {
      "database_id": process.env.DATABASE_ID
    },
    "cover": {
      "type": "external",
      "external": {
          "url": data.image
      }
    },
    "properties" : {
      title: {
        title: [
          {
            "type": 'text',
            text: {
              content: data.showName
            }
          }
        ]
      },
      [process.env.RATE] : {
        number: data.rating
      },
      [process.env.SEASONS] : {
        number: data.seasons
      },
      [process.env.EPISODES] : {
        number: data.episodes
      },
      [process.env.RELEASE] : {
        "rich_text": [
          {
            type: "text",
            text: {
              content: data.date
            }
          }
        ]
      },
      [process.env.GENRES] : {
        "multi_select" : [
          {name: data.genres[0]},
          {name: data.genres[1]},
          {name: data.genres[2]},
        ]
      }
    }
  })
}
notionRequest()