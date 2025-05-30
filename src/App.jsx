import React, { useEffect, useState } from 'react'
import Search from './Components/Search'
import Spinner from './Components/Spinner';
import MovieCard from './Components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearch } from './appwrite';


const API_BASE_URL ='https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;


const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`

  }
};
const App = () => {
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList,setMovieList] = useState([])
  const [trendingMovies,setTrendingMovies] = useState([])

  const [isLoading,setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useDebounce(() => setDebouncedSearchTerm(searchTerm),500,[searchTerm])
  const fetchMovies = async (query ='')=> {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const endPoint = query? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
      `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endPoint,API_OPTIONS)
      console.log("Status code:", response.status);
      if(!response.ok){
        throw new Error("FAIL HOGYA FETCH KRNE M!!")
      }

      const data = await response.json()
      if(data.Response ==='false'){
        setErrorMessage(data.Error || "failed to fetch the data")
        setMovieList([])
        return;
      }
      setMovieList(data.results || [])

    if(query && data.results.length > 0){
      await updateSearch(query,data.results[0]);
  }
    } catch (error) {
        console.log(error)
        setErrorMessage("Error fetching the movies: Try again later!!!")
    }finally{
      setIsLoading(false)
    }
  }
  const loadTrendingMovies = async()=>{
    try {
      const movies = await getTrendingMovies()

      setTrendingMovies(movies)
    } catch (error) {
        console.log(error)
    }
  }
  useEffect(()=> {
    fetchMovies(debouncedSearchTerm)

  },[debouncedSearchTerm])
  
  useEffect(() => {
    loadTrendingMovies()
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