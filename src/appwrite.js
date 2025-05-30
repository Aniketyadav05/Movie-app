import { Client, Databases, ID, Query } from 'appwrite'

// getting the ids from the env file and storing all the ids of appwrite in new variables
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DATABASE_ID= import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID


// creating a new client object for the appwrite
const client = new Client()
    // Url of the appwrite server
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    // Setting the project id(id for the project we are working on)
    .setProject(PROJECT_ID)

// getting the access to the database of that particular project
const database = new Databases(client)

// function to update the count in the db of the no. of times a movie is searched 
export const updateSearch = async(searchTerm, movie) => {
    
    try {
        //getting the query that is searched from the db if it exists
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.equal('searchTerm',searchTerm),
        ])
        // if the movie is already present in teh document then just increase it's count
        if(result.documents.length>0){
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID,COLLECTION_ID, doc.$id, {
                count: doc.count+1
            })
        }
        // if that searchTerm or movie doesn't exists then just add it in the db and make its count to 1
        else {
            await database.createDocument(DATABASE_ID,COLLECTION_ID,ID.unique(),{
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}`
            })
        }
    } catch (error) {
        console.error(error)
    }
}


// function to get the top 5 movies from the db
export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
        Query.limit(5),
        Query.orderDesc("count")
    ])
    return result.documents;
    } catch (error) {
        console.error(error)
    }
}