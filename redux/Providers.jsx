"use client"
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { useState, useEffect } from "react";

const ProviderWrapper = ({ children }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <Provider store={store}>
            {isClient ? (
                <PersistGate loading={null} persistor={persistor}>
                    {children}
                </PersistGate>
            ) : (
                children
            )}
        </Provider>
    );
};

export default ProviderWrapper;