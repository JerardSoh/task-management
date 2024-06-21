import React, { useEffect, useState } from "react";
import { fetchData } from "../apiService";

const ExampleComponent = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const result = await fetchData();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        getData();
    }, []);

    return (
        <div>
            <h1>Data from API</h1>
            {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "Loading..."}
        </div>
    );
};

export default ExampleComponent;
