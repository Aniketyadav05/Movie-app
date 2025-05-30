import React, { useEffect, useState } from 'react'
import Search from './Components/Search'
import Spinner from './Components/Spinner';
import MovieCard from './Components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearch } from './appwrite';

// Base Url of the movie website
const API_BASE_URL ='https://api.themoviedb.org/3'
// accessing the api_key from the env file
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// object to make api request
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`

  }
};
const App = () => {
  // state for debouncing of search function
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState("")

  const [errorMessage, setErrorMessage] = useState('')
  // state in which the movies fetched from the apis are stored
  const [movieList,setMovieList] = useState([])
  // state in which teh trending movies are stored
  const [trendingMovies,setTrendingMovies] = useState([])

  const [isLoading,setIsLoading] = useState(false)
  // state for getting the search term or query
  const [searchTerm, setSearchTerm] = useState("")

  // useDebounce hook to implement the debouncing of the search 
  useDebounce(() => setDebouncedSearchTerm(searchTerm),500,[searchTerm])

  // function in which we fetch the movies
  const fetchMovies = async (query ='')=> {
    setIsLoading(true)
    setErrorMessage('')
    try {
      // if the query is present then the endpoint will be to search the movie according to the particular query
      const endPoint = query? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
      // endpoint to fetch the movies by popularity
      `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      // variable to store the response the fetch
      const response = await fetch(endPoint,API_OPTIONS)
      

      if(!response.ok){
        throw new Error("FAIL HOGYA FETCH KRNE M!!")
      }
      // variable to store the response after converting it into an json
      const data = await response.json()
      if(data.Response ==='false'){
        setErrorMessage(data.Error || "failed to fetch the data")
        setMovieList([])
        return;
      }
      // setting the movieList with the results(that's what we need) in the data that we got
      setMovieList(data.results || [])
      // console.log(data)
      // console.log(data.results)
      
    if(query && data.results.length > 0){
      // calling the updateSearch function to update the query in the appwrite database
      await updateSearch(query,data.results[0]);
  }
    } catch (error) {
        console.log(error)
        setErrorMessage("Error fetching the movies: Try again later!!!")
    }finally{
      setIsLoading(false)
    }
  }
  // Function to load trending movies
  const loadTrendingMovies = async()=>{

    try {
      // storing the array that we got from the getTrendingMovies function in the movies variables
      const movies = await getTrendingMovies()
      // setting the trending movies to movies
      setTrendingMovies(movies)
    } catch (error) {
        console.log(error)
    }
  }
  // useEffect hook to fetch the movies with a query
  useEffect(()=> {
    // calling the fetchMovies function with a query to use the search endpoint
    fetchMovies(debouncedSearchTerm)

  },[debouncedSearchTerm])
  // UseEffect to load the trending moveis 
  useEffect(() => {
    
    loadTrendingMovies()
    // no dependency array because we only have to call it when the website loads 
  },[])
  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src="../hero.png" alt="Hero image" />
          <h1>Find <span className='text-gradient'>movies</span> that you love the most</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className='all-movies'>
          <h2>All movies</h2>
          {isLoading ? (
            <Spinner/>
          ): errorMessage ? 
            (
              <p className='text-red-500'>{errorMessage}</p>
            ): (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
            )}
        </section>
      </div>
    </main>
  )
}

export default App