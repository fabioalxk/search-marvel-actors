const express = require("express");
var fs = require('fs');
require('dotenv').config();
const router = express.Router();
const axios = require("axios");

const apiURI = process.env.API_URI;
const api_key= process.env.API_KEY;

router.get('/createMovieList', async (req, res) => {
  try {
    let allMarvelMoviesList = await getAllMarvelMovies2();

    allMarvelMoviesList = await populateMarvelMoviesCast(allMarvelMoviesList);

    fs.writeFileSync("jsonOutput.json", JSON.stringify(allMarvelMoviesList));

    return res.json({msg: "Marvel Movies file created successfully"});
  } catch (error) {
    return res.status(400).json({error});
  }
});

router.get("/", async (req, res) => {
  try {
    let json = fs.readFileSync("jsonOutput.json");
    const allMarvelMoviesList = JSON.parse(json);
    const moviesActorParticipated = searchMoviesByActorName(allMarvelMoviesList, req.query.actorName).map((movie) => {
      return movie.original_title;
    });

    return res.json(moviesActorParticipated);
  } catch (error) {
    return res.status(400).json({error});
  }
});

router.post("/actorsplayed", async (req, res) => {
  try {
    let json = fs.readFileSync("jsonOutput.json");
    const allMarvelMoviesList = JSON.parse(json);
    const { people } = req.body;
    if (!people) res.status(404).json({ msg: "No people found" });

    const actorsMovies = people.map((actorName) => {
      const moviesActorParticipated = searchMoviesByActorName(allMarvelMoviesList, actorName).map((movie) => {
        return movie.original_title;
      });
      return { name: actorName, movies: moviesActorParticipated };
    });

    return res.json(actorsMovies);
  } catch (error) {
    return res.status(400).json({error});
  }
});

router.post("/actorsPlayedManyCharacters", async (req, res) => {
  try {
    let json = fs.readFileSync("jsonOutput.json");
    const allMarvelMoviesList = JSON.parse(json);
    const { people } = req.body;
    if (!people) res.status(404).json({ msg: "No people found" });

    const actorsMovies = people.map((actorName) => {
      const moviesActorParticipated = searchMoviesByActorName(allMarvelMoviesList, actorName);
      return { name: actorName, movies: moviesActorParticipated, characters: [] };
    });

    actorsMovies.forEach((actor) => {
      actor.movies.every((movie) => {
        return movie.cast.map((actorInCast) => {
          if (actorInCast.name === actor.name) {
              if (actorInCast.character == 'Nathan Summers / Cable') {
                console.log('now');
              }
              if (isUnique(actor.characters, actorInCast.character)) {
                actor.characters.push(actorInCast.character);
                console.log(actorInCast.character);
              } 
          } 
          return actorInCast;
        });
      });
    });

  const actorsPlayedMoreThanTwoCharacters = actorsMovies.filter((actor) => {
    return actor.characters.length > 1;
  }).map((actor) => { 
    return { name: actor.name, characters: actor.characters };
  });

    return res.json(actorsPlayedMoreThanTwoCharacters);
  } catch (error) {
    return res.status(400).json({error});
  }
});

/*
    URL Example: https://api.themoviedb.org/3/discover/movie?api_key=1b0f12863ce6a2d1904e512a26fb3d98&language=en-US&sort_by=primary_release_date.desc&page=1&with_companies=11106|420|13252|2301|133955|19551|38679|7505|108634|125136|160251
*/
const getAllMarvelMovies2 = async () => {
  const movieList = [];

  const marvelMoviesURL = `${apiURI}/discover/movie?api_key=${api_key}&language=en-US&sort_by=primary_release_date.desc&page=1&with_companies=11106|420|13252|2301|133955|19551|38679|7505|108634|125136|160251`;
  let response = (await axios.get(marvelMoviesURL));
  let totalPages = response.data.total_pages;
  let allMarvelMoviesList = response.data.results;

  movieList.push(...allMarvelMoviesList);

  const promises = [];
  for (let i = 2; i <= totalPages; i++) {
    promises.push(await axios.get(`${marvelMoviesURL}&page=${i}`));
  }

  const response2 = await Promise.all(promises);

  response2.forEach((res) => {
    movieList.push(...res.data.results);
  });

  return movieList;
}

/*
  Example URL: http://api.themoviedb.org/3/movie/429617/casts?api_key=1b0f12863ce6a2d1904e512a26fb3d98
*/
const populateMarvelMoviesCast = async (allMarvelMoviesList) => {
  const promises = [];
  allMarvelMoviesList.forEach(async (movie, index) => {
    promises.push(axios.get(`${apiURI}/movie/${movie.id}/casts?api_key=${api_key}`));
    return movie;
  });
  const response = await Promise.all(promises);

  allMarvelMoviesList = allMarvelMoviesList.map((movie, index) => {
    movie.cast = response[index].data.cast;
    return movie;
  });

  return allMarvelMoviesList;
}

const searchMoviesByActorName = (allMarvelMovies, query) => {
  const moviesActorParticipated = allMarvelMovies.filter((movie, index) => {
    return movie.cast.find((actor) => {
      let regex = new RegExp(`${query.toUpperCase()}`);
      const result =  regex.test(actor.name.toUpperCase());
      if (result) {
        movie.character = actor.character;
        return true;
      }
      return false;
    });
  });
  return moviesActorParticipated;
};

const isUnique = (characterList, character) => {
  let isUnique = true;
  const selfRegex = new RegExp(`${('self').toUpperCase()}`);
  if (selfRegex.test(character.toUpperCase())) return false;
  if (characterList.length === 0) return true;

  let similarPercentage;

  characterList.forEach((charElement) => {
    similarPercentage = similarity(charElement, character);
    if (similarPercentage > 0.3) {
      isUnique = false;
      return false;
    }

    let charElementFirstWord = charElement.split(' ')[0];
    let characterFirstWord = character.split(' ')[0];
    if(charElementFirstWord === characterFirstWord) {
      isUnique = false;
      return false;
    }
  });
  return isUnique;
};

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

module.exports = router;

