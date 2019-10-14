import React, { useReducer, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

const URL = process.env.REACT_APP_API_ENDPOINT;
const URL_PATH = "/ingredients.json";

const ingredientReducer = (currentIngreients, action) => {
  // like swith case
  const actions = {
    SET: () => {
      return action.ingredients;
    },
    ADD: () => {
      return [...currentIngreients, action.ingredients];
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

const httpReducer = (currentHttpState, action) => {
  // like swith case
  const actions = {
    SEND: () => {
      return { loading: true, error: null };
    },
    RESPONSE: () => {
      return { ...currentHttpState, loading: false };
    },
    ERROR: () => {
      return { loading: false, error: action.errorMessage };
    },
    CLEAR_ERROR: () => {
      return { ...currentHttpState, error: null };
    }
  };

  // default actions
  if (typeof actions[action.type] !== "function") {
    throw new Error("Should not be reached !!");
  }

  return actions[action.type]();
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null
  });
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();
  console.log("----------MAIN INGREDIENTS", userIngredients);

  // add
  const addIngredientHandler = useCallback(ingredient => {
    // setIsLoading(true);
    dispatchHttp({ type: "SEND" });
    fetch(`${URL}${URL_PATH}`, {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        // setIsLoading(false);
        dispatchHttp({ type: "RESPONSE" });
        return response.json();
      })
      .then(responseData => {
        // setUserIngredients(prevIngredients => [
        //   ...(prevIngredients || []),
        //   { id: responseData.name, ...ingredient }
        // ]);
        dispatch({
          type: "ADD",
          ingredients: { ...ingredient, id: responseData.name }
        });
      });
  }, []);

  // query / filter
  const filterIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  // delete
  const removeIngredientHandler = useCallback(ingredientId => {
    // setIsLoading(true);
    dispatchHttp({ type: "SEND" });
    fetch(`${URL}/ingredients/${ingredientId}.json`, {
      method: "DELETE"
    })
      .then(response => {
        // setIsLoading(false);
        // setUserIngredients(prevIngredients => {
        //   return prevIngredients.filter(
        //     ingredient => ingredient.id !== ingredientId
        //   );
        // });
        dispatchHttp({ type: "RESPONSE" });
        dispatch({ type: "DELETE", id: ingredientId });
      })
      .catch(error => {
        // setError("Something went wrong!!");
        dispatchHttp({ type: "ERROR", errorMessage: "Something went wrong!!" });
      });
  }, []);

  // clear Error
  const clearErrorHandler = useCallback(() => {
    // setError(null);
    // setIsLoading(false);
    dispatchHttp({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearErrorHandler}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search
          onLoadIngredients={filterIngredientsHandler}
          url={URL}
          urlPath={URL_PATH}
        />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
