import React, { useState } from "react";
import axios from "axios";
import { GameState } from "../types/game";
import { Item } from "../types/item";
import createState from "../lib/create-state";
import Board from "./board";
import Loading from "./loading";
import Instructions from "./instructions";
import badCards from "../lib/bad-cards";

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [allItems, setAllItems] = useState<Item[] | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[] | null>(null);

  React.useEffect(() => {
    const fetchGameData = async () => {
      const res = await axios.get<string>("/items.json");
      const items: Item[] = res.data
        .trim()
        .split("\n")
        .map((line) => {
          return JSON.parse(line);
        })
        // Filter out questions which give away their answers
        .filter((item) => !item.label.includes(String(item.year)))
        .filter((item) => !item.description.includes(String(item.year)))
        .filter((item) => !/(?:th|st|nd)[ -]century/i.test(item.description))
        // Filter cards which have bad data as submitted in https://github.com/tom-james-watson/wikitrivia/discussions/2
        .filter((item) => !(item.id in badCards));
      setAllItems(items);
      setFilteredItems(items);
    };

    fetchGameData();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (filteredItems !== null) {
        setState(await createState(filteredItems));
        setLoaded(true);
      }
    })();
  }, [filteredItems]);

  const resetGame = React.useCallback(() => {
    (async () => {
      if (filteredItems !== null) {
        setState(await createState(filteredItems));
      }
    })();
  }, [filteredItems]);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);

  if (!loaded || state === null) {
    return <Loading />;
  }

  if (!started) {
    return (
      <Instructions
        highscore={highscore}
        start={() => setStarted(true)}
        allItems={allItems}
        setFilteredItems={setFilteredItems}
      />
    );
  }

  return (
    <Board
      highscore={highscore}
      state={state}
      setState={setState}
      resetGame={resetGame}
      updateHighscore={updateHighscore}
    />
  );
}
