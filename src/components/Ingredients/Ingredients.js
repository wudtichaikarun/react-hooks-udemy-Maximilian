import React, { useReducer, useCallback, useEffect } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";

const URL = process.env.REACT_APP_API_ENDPOINT;
const URL_PATH = "/ingredients.json";

const ingredientReducer = (currentIngreients, action) => {
  // like swith case
  const actions = {
    SET: () => {
      return action.ingredients;
    },
    ADD: () => {
      return [...currentIngreients, action.ingredient];
    },
    DELETE: () => {
      return currentIngreients.filter(ing => ing.id !== action.id);
    }
  };
  // default
  if (typeof actions[action.type] !== "function") {
    throw new Error("Should not get there!!");
  }

  return actions[action.type]();
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  console.log("userIngredients", userIngredients);

  const {
    isLoading,
    error,
    data,
    sendRequest,
    reqExtra,
    reqIdentifer,
    clear
  } = useHttp();

  useEffect(() => {
    if (!isLoading && !error && reqIdentifer === "REMOVE_INGREDIENT") {
      dispatch({ type: "DELETE", id: reqExtra });
    } else if (!isLoading && !error && reqIdentifer === "ADD_INGREDIENT") {
      dispatch({
        type: "ADD",
        ingredient: { id: data.name, ...reqExtra }
      });
    }
  }, [data, reqExtra, reqIdentifer, isLoading, error]);

  // add
  const addIngredientHandler = useCallback(
    ingredient => {
      sendRequest(
        `${URL}${URL_PATH}`,
        "POST",
        JSON.stringify(ingredient),
        ingredient,
        "ADD_INGREDIENT"
      );
    },
    [sendRequest]
  );

  // query / filter
  const filterIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  // delete
  const removeIngredientHandler = useCallback(
    ingredientId => {
      sendRequest(
        `${URL}/ingredients/${ingredientId}.json`,
        "DELETE",
        null,
        ingredientId,
        "REMOVE_INGREDIENT"
      );
    },
    [sendRequest]
  );

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
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
        {!isLoading && (
          <IngredientList
            ingredients={userIngredients}
            onRemoveItem={removeIngredientHandler}
          />
        )}
      </section>
    </div>
  );
};

export default Ingredients;
