import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { store } from "../store";
import EventList from "./EventList";

test("renders loading state initially", () => {
  render(
    <Provider store={store}>
      <EventList />
    </Provider>
  );

  expect(screen.getByText("Loading...")).toBeTruthy();
});
