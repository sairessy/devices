import { useEffect, useState } from "react";

const index = () => {
  const [position, set_position] = useState({
    lat: 0,
    lon: 0,
    ip: "",
    time: "",
  });

  const track = async () => {
    const data = { lat: 0, lon: 0 };

    const res = await fetch("http://localhost:3000/tracker/position", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.status === 200) {
      const json = await res.json();
      set_position(json);
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      console.log("yyyyyy");
      console.log(pos);
      // const res = await fetch("http://localhost:3000/tracker/position", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(data),
      // });
      // if (res.status === 200) {
      //   const json = await res.json();
      //   set_position(json);
      // }
    });
    // try {
    //   if (navigator.geolocation) {

    //     navigator.geolocation.getCurrentPosition(async (pos) => {
    //       console.log(pos);
    //       const res = await fetch("http://localhost:3000/tracker/position", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(data),
    //       });
    //       if (res.status === 200) {
    //         const json = await res.json();
    //         set_position(json);
    //       }
    //     });
    //   } else {
    //     alert("Seu navegador não tem suporte a geolocalização");
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  };

  useEffect(() => {
    track();
  }, []);

  return (
    <div>
      <p>IP Address: {position.ip}</p>
      <p>Latitude: {position.lat}</p>
      <p>Longitude: {position.lon}</p>
      <p>Time: {position.time}</p>
    </div>
  );
};

export default index;
