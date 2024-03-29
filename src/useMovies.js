import { useState, useEffect } from "react";

const KEY = "82a95d94";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  callback?.(); //If a function exists by the user execute it

  useEffect(() => {
    const controller = new AbortController(); //Use browser API to abort fetch request at cleanup

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal } //connect fetch with browser API
        );

        if (!res.ok)
          throw new Error(
            "Something went wrong with fetching your movies... :("
          );

        const data = await res.json();

        if (data.Response === "False") throw new Error("No movie found");
        setMovies(data.Search);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message); //Ignore error message from AbortController
      } finally {
        setIsLoading(false);
      }
    }
    //Clean states when input is empty
    if (!query.length) {
      setMovies([]);
      setError("");
      return;
    }
    fetchMovies();

    return function () {
      controller.abort(); //abort previous search request after new key stroke
    };
  }, [query]);

  return { movies, isLoading, error };
}
