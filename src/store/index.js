import { configureStore } from "@reduxjs/toolkit";
import eventsReducer from "../eventsSlice" // Dosya uzantısını kaldırdık

export const store = configureStore({
  reducer: {
    events: eventsReducer,
  },
});
