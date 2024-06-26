import React, { createContext, useContext, useState } from "react";
import { checkAdmin } from "../apiService";

const AdminContext = createContext();

export const useAdmin = () => {
    return useContext(AdminContext);
};

export const AdminProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    const verifyAdmin = async () => {
        try {
            await checkAdmin();
            setIsAdmin(true);
        } catch (error) {
            setIsAdmin(false);
        }
    };

    return (
        <AdminContext.Provider value={{ isAdmin, setIsAdmin, verifyAdmin }}>
            {children}
        </AdminContext.Provider>
    );
};
