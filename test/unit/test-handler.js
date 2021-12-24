const { expect } = require('chai');
const request = require('supertest');

const app = require('../../index');

const event = {
  "people": [
    "Robert Downey Jr.",
    "Chris Evans",
    ]
}

describe('Marvel Movies tests', () => {
  it('Should sucessfully return the Marvel movies that each actor played', async () => {
    const response = await request(app).post('/api/movies/marvelMoviesPlayedByActorList').send(event);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(2);
    expect(response.body[0]).to.have.property('actor');
    expect(response.body[0]).to.have.property('movies');
    expect(response.body[0].actor).to.equal('Robert Downey Jr.');
    expect(response.body[0].movies).to.be.an('array');
    expect(response.body[0].movies[0]).to.equal('Celebrating Marvel\'s Stan Lee');
  });

  it('Should sucessfully return the actors that played more than one character in the movies in the list', async () => {
    const response = await request(app).post('/api/movies/actorsThatPlayedManyCharacters').send(event);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(1);
    expect(response.body[0]).to.have.property('name');
    expect(response.body[0]).to.have.property('characters');
    expect(response.body[0].characters).to.have.lengthOf(2);
  });
});