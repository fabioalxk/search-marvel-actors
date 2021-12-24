const express = require("express");
var fs = require('fs');
require('dotenv').config();
const router = express.Router();

const { updateCharacterList, searchMoviesByActor, populateMarvelMoviesCast, getAllMarvelMovies } = require("./utils");

const MARVEL_MOVIES_FILE = 'marvelMovies.json';

// @route    GET api/movies/searchMoviesByActor
// @desc     Create a file with all movies from Marvel, since their API is too slow to make thousands of requests
// @access   Public
router.get('/createMovieList', async (req, res) => {
  try {
    let allMarvelMoviesList = await getAllMarvelMovies();
    allMarvelMoviesList = await populateMarvelMoviesCast(allMarvelMoviesList);
    fs.writeFileSync(MARVEL_MOVIES_FILE, JSON.stringify(allMarvelMoviesList));
    return res.json({msg: "Marvel Movies file created successfully"});
  } catch (error) {
    return res.status(400).json({error});
  }
});

// @route    GET /api/movies/createMovieList
// @desc     Create a file with all movies from Marvel
// @access   Public
router.get("/searchMoviesByActor", async (req, res) => {
  try {
    let json = fs.readFileSync(MARVEL_MOVIES_FILE);
    const allMarvelMoviesList = JSON.parse(json);
    const moviesActorParticipated = searchMoviesByActor(allMarvelMoviesList, req.query.actorName).map((movie) => {
      return movie.original_title;
    });

    return res.json(moviesActorParticipated);
  } catch (error) {
    return res.status(400).json({error});
  }
});

// Question 1
// @route    GET /api/movies/actorsplayed
// @desc     Get all marvel movies that each actor in the given list played
// @access   Public
router.post("/marvelMoviesPlayedByActorList", async (req, res) => {
  try {
    const { people } = req.body;
    if(!people) res.status(400).json({ error: 'Please provide a list of people' });

    let allMarvelMoviesJson = fs.readFileSync(MARVEL_MOVIES_FILE);
    const allMarvelMoviesList = JSON.parse(allMarvelMoviesJson);
    if (!people) res.status(404).json({ msg: "No people found" });

    const moviesByActor = people.map((actor) => {
      const moviesActorParticipated = searchMoviesByActor(allMarvelMoviesList, actor).map((movie) => {
        return movie.original_title;
      });
      return { actor, movies: moviesActorParticipated };
    });

    return res.json(moviesByActor);
  } catch (error) {
    return res.status(400).json({error});
  }
});

// Question 2
// @route    GET /api/movies/actorsPlayedManyCharacters
// @desc     Get all actors that played more than one marvel character in the movies in the list
// @access   Public
router.post("/actorsThatPlayedManyCharacters", async (req, res) => {
  try {
    let json = fs.readFileSync(MARVEL_MOVIES_FILE);
    const allMarvelMoviesList = JSON.parse(json);
    const { people } = req.body;
    if (!people) res.status(404).json({ msg: "No people found" });

    const allMarvelMoviesPlayedByActorList = people.map((actorName) => {
      const moviesActorParticipated = searchMoviesByActor(allMarvelMoviesList, actorName);
      return { name: actorName, movies: moviesActorParticipated, characters: [] };
    });

    allMarvelMoviesPlayedByActorList.forEach((actor) => {
      actor.movies.every((movie) => {
        return movie.cast.every((actorInCast) => {
          if (actorInCast.name === actor.name) {
              updateCharacterList(actor.characters, actorInCast.character);
          }
          return actorInCast;
        });
      });
    });

    const actorsThatPlayedMoreThanTwoCharacters = allMarvelMoviesPlayedByActorList.filter((actor) => {
      return actor.characters.length > 1;
    }).map((actor) => { 
      return { name: actor.name, characters: actor.characters };
    });

    return res.json(actorsThatPlayedMoreThanTwoCharacters);
  } catch (error) {
    return res.status(400).json({error});
  }
});

module.exports = router;

