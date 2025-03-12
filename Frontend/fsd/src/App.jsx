import { useEffect, useState } from "react";

function App() {
    const [data, setData] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/data/")
            .then(res => res.json())
            .then(data => setData(data.message))
            .catch(err => console.error(err));
    }, []);

    return <h1>{data}</h1>;
}

export default App;
