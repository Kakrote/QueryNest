"use client"
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";

const ProviderWrapper = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate 
                loading={<div>Loading...</div>} 
                persistor={persistor}
                onBeforeLift={() => {
                    console.log("redux mounted");
                }}
            >
                {children}
            </PersistGate>
        </Provider>
    );
}

export default ProviderWrapper;