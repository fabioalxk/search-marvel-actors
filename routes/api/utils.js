const axios = require("axios");
require('dotenv').config();
const apiURI = process.env.API_URI;
const api_key= process.env.API_KEY;

const getAllMarvelMovies = async () => {
  try {
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

    const MovieListByPageResponse = await Promise.all(promises);

    MovieListByPageResponse.forEach((res) => {
      movieList.push(...res.data.results);
    });

    return movieList;
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}


//  Each movie has a Cast List, which is a list of all cast members.
const populateMarvelMoviesCast = async (allMarvelMoviesList) => {
  const promises = [];
  allMarvelMoviesList.forEach(async (movie) => {
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

const searchMoviesByActor = (allMarvelMovies, query) => {
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

const updateCharacterList = (characterList, character) => {
  if (isUnique(characterList, character)) {
    characterList.push(character);
  }
  return characterList;
}

/*
  1) The Marvel API returns same characters, but with with different names, for example:
  Spider-Man / Spider-Man uncredited
  Hence, we need to calculate the similarity between those two strings, to verify if they are unique.

  2) Also, Marvel made some movies that are Interviews, so the actors played "Himself", or "Herself", according to the API.
  Hence we had to remove those from the list.
*/
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

module.exports = { isUnique, searchMoviesByActor, populateMarvelMoviesCast, getAllMarvelMovies, updateCharacterList };