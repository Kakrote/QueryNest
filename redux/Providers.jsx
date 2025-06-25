"use client"
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";

const ProviderWrrper = ({ children }) => {
    return <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            {children}
            {console.log("redux mounted")}
        </PersistGate>
    </Provider>
}
export default ProviderWrrper