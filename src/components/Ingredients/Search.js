import React, { useState, useEffect, useRef } from "react";

import Card from "../UI/Card";
import "./Search.css";

const Search = React.memo(props => {
  const { onLoadIngredients, url, urlPath } = props;
  const [enteredFilter, setEnteredFilter] = useState("");
  const inputRef = useRef();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (enteredFilter === inputRef.current.value) {
        const query =
          enteredFilter.length === 0
            ? ""
            : `?orderBy="title"&equalTo="${enteredFilter}"`;
        fetch(`${url}${urlPath}${query}`)
          .then(respose => respose.json())
          .then(responseData => {
            const keys = responseData && Object.keys(responseData);
            const loadedIngredients =
              responseData &&
              keys.map(key => ({
                id: key,
                title: responseData[key].title,
                amount: responseData[key].amount
              }));
            onLoadIngredients(loadedIngredients);
          });
      }
    }, 500);

    // run before timer apply
    return () => {
      clearTimeout(timer);
    };
  }, [enteredFilter, onLoadIngredients, inputRef, url, urlPath]);

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input
            ref={inputRef}
            type="text"
            value={enteredFilter}
            onChange={event => setEnteredFilter(event.target.value)}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
