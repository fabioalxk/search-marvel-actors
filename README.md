# Search Marvel Actors

This is a Node.js application that uses TheMovieDB API  [TheMovieDB API] (https://developers.themoviedb.org/3) to get to know about the relationship between the Marvel Actors and Marvel Movies.

## Project Setup
### Install server dependencies

```bash
npm install
```
### Setup Enviroment variables
Don't forget to setup the Enviromental variables, by creating a .env file in the root directory.
Ask Fabio Alexandrino to get them.
```bash
API_URI = https://api.themoviedb.org/3
API_KEY= enter_api_key_here
```

### Call the createMovieList endpoint, to load all the Marvel Movies into a file.
TheMovieDB API needs to do hundreds and hundreds of calls to load the information about every movie, casting and actors. Hence, we are creating a file that has every Marvel movie in it, with the the respective cast.
The marvelMovies.json file should be in the repository, but if it isn't, call the following endpoint:
```bash
// @route GET /api/movies/createMovieList
Endpoint: http://localhost:5000/api/movies/createMovieList
```

### Run the project
```bash
npm start
```
## Endpoints
This app answers two questions.
Use the following body to call the endpoints
Body:
```json
{
	"people": [
		"Robert Downey Jr.",
		"Chris Evans",
		"Mark Ruffalo",
		"Chris Hemsworth",
		"Scarlett Johansson",
		"Jeremy Renner",
		"Don Cheadle",
		"Paul Rudd",
		"Brie Larson",
		"Michael B. Jordan",
		"Karen Gillan",
		"Danai Gurira",
		"Josh Brolin",
		"Gwyneth Paltrow",
		"Bradley Cooper",
		"Tom Holland",
		"Zoe Saldana",
		"Anthony Mackie",
		"Tom Hiddleston",
		"Chris Pratt",
		"Black Panther",
		"Samuel L. Jackson",
		"Dave Bautista"
	]
}
```

###  Question 1) 
Which Marvel movies did each actor play in?
```bash
// @route POST /api/movies/marvelMoviesPlayedByActorList
Endpoint: http://localhost:5000/api/movies/marvelMoviesPlayedByActorList
```

###  Question 2) 
Actors who played more than one Marvel character?
```bash
// @route POST /api/movies/marvelMoviesPlayedByActorList
Endpoint: http://localhost:5000/api/movies/marvelMoviesPlayedByActorList

```