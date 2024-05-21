const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'moviesData.db'),
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started at https://localhost/3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const convertDBObjectToObj = dbObj => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
    directorName: dbObj.director_name,
  }
}
app.get('/movies/', async (request, response) => {
  const moviesQuery = `SELECT movie_name FROM movie  ORDER BY movie_id;`
  const movies = await db.all(moviesQuery)
  response.send(
    movies.map(eachMovie => {
      return {movieName: eachMovie.movie_name}
    }),
  )
})
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const insertQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES(${directorId},'${movieName}','${leadActor}');`
  await db.run(insertQuery)
  response.send('Movie Successfully Added')
})
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`
  const movie = await db.get(movieQuery)
  response.send(convertDBObjectToObj(movie))
})
app.put('/movies/:movieId/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateQuery = `UPDATE movie SET director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}';`
  db.run(updateQuery)
  response.send('Movie Details Updated')
})
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletQuery = `DELETE FROM movie WHERE movie_id=${movieId};`
  await db.run(deletQuery)
  response.send('Movie Removed')
})
app.get('/directors/', async (request, response) => {
  const directorsQuery = `SELECT * FROM director ORDER BY director_id;`
  const directors = await db.all(directorsQuery)
  response.send(
    directors.map(eachDirector => {
      return convertDBObjectToObj(eachDirector)
    }),
  )
})
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const spdirQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId};`
  const movies = await db.all(spdirQuery)
  response.send(
    movies.map(each => {
      return convertDBObjectToObj(each)
    }),
  )
})
module.exports = app
