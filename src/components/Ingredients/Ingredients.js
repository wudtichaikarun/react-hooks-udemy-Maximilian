import React, { useState, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

const URL = process.env.REACT_APP_API_ENDPOINT;
const URL_PATH = "/ingredients.json";

const Ingredients = () => {
  const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // add
  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch(`${URL}${URL_PATH}`, {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        setIsLoading(false);
        return response.json();
      })
      .then(responseData => {
        setUserIngredients(prevIngredients => [
          ...(prevIngredients || []),
          { id: responseData.name, ...ingredient }
        ]);
      });
  };

  // query / filter
  const filterIngredientsHandler = useCallback(filteredIngredients => {
    setUserIngredients(filteredIngredients);
  }, []);

  // delete
  const removeIngredientHandler = ingredientId => {
    setIsLoading(true);
    fetch(`${URL}/ingredients/${ingredientId}.json`, {
      method: "DELETE"
    })
      .then(response => {
        setIsLoading(false);
        setUserIngredients(prevIngredients => {
          return prevIngredients.filter(
            ingredient => ingredient.id !== ingredientId
          );
        });
      })
      .catch(error => {
        setError("Something went wrong!!");
      });
  };

  // clear Error
  const clearErrorHandler = () => {
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearErrorHandler}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search
          onLoadIngredients={filterIngredientsHandler}
          url={URL}
          urlPath={URL_PATH}
        />
        <IngredientList
          ingredients={userIngredients || []}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
