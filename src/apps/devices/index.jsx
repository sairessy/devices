import { useEffect, useState } from "react";
import { api_url, default_video_img } from "../../config";
import socket from "./socket.js";

const index = () => {
  const [devices, set_devices] = useState([]);
  const [user_devices, set_user_devices] = useState([]);

  const [src, set_src] = useState("");

  const get_devices = async () => {
    const res = await fetch(api_url + "/devices");
    const json = await res.json();
    set_devices(json);
  };

  const on_add_device = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("select-device", "value");
    formData.append("device-name", "value");

    const data = {
      name: formData.get("device-name"),
      id: formData.get("select-device"),
      owner: "1",
    };
    try {
      const res = await fetch(api_url + "/devices/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.status === 200) {
        const json = await res.json();
        get_user_devices();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const get_user_devices = async () => {
    const res = await fetch(api_url + "/devices/user/1");
    const json = await res.json();
    set_user_devices(json);
  };

  const on_delete = async (id) => {
    const res = await fetch(api_url + "/devices/delete/" + id);
    const json = await res.json();
    get_user_devices();
  };

  const on_rename = async (id) => {
    const new_name = prompt("Introduza o novo nome:");

    if (new_name) {
      const data = {
        new_name,
        id,
      };

      const res = await fetch(api_url + "/devices/rename", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.status === 200) {
        get_user_devices();
      }
    }
  };

  useEffect(() => {
    get_devices();
    get_user_devices();
  }, []);

  socket.on("stream", (data) => {
    if (user_devices.length > 0) {
      const new_state = user_devices.map((device) => {
        if (device._id === data.device_id && device.id == "2") {
          return { ...device, img: data.src };
        } else {
          return device;
        }
      });

      set_user_devices(new_state);
    }
  });

  socket.on("devices-tracker-position", (data) => {
    const { lat, lon, time } = data;

    if (user_devices.length > 0) {
      const new_state = user_devices.map((device) => {
        if (device._id === data.device_id && device.id == "3") {
          return { ...device, last_position: { lat, lon, time } };
        } else {
          return device;
        }
      });

      set_user_devices(new_state);
    }
  });

  socket.on("devices-camera-img", (data) => {
    const aux = user_devices;

    if (aux.length > 0) {
      for (let i = 0; i < aux.length; i++) {
        if (aux[i]._id === data.device_id) {
          aux[i].img = data.img.imageData;
          console.log(aux[i]);
          break;
        }
      }

      set_user_devices(aux);
    }
  });

  return (
    <div>
      <form
        id="form-add-device"
        onSubmit={on_add_device}
        className="d-flex align-items-center"
      >
        <select id="select-device" name="select-device">
          {devices?.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="text"
          id="device-name"
          name="device-name"
          placeholder="Nome do dispositivo"
          required
        />
        <input type="submit" form="form-add-device" value="Adicionar" />
      </form>

      {/* <img src={src} id="video" width="400" height="320" /> */}

      <div id="devices">
        {user_devices?.filter(({ id }) => id == "2").length > 0 && (
          <div>
            <h2>
              Câmeras ({user_devices?.filter(({ id }) => id == "2").length})
            </h2>
            <div className="row">
              {user_devices
                ?.filter(({ id }) => id == "2")
                ?.map(({ id, _id, def_name, name, img = "", qr_code }) => (
                  <div key={_id} className="col">
                    <div>
                      <div
                        style={{
                          height: 240,
                          background: `url(${
                            img || default_video_img
                          }) no-repeat center center/${
                            [null, undefined, ""].includes(img)
                              ? "contain"
                              : "cover"
                          }`,
                          border: "1px solid #eee",
                        }}
                      ></div>
                      <p>{name.toUpperCase()}</p>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <a
                          href={
                            api_url + "/devices/" + def_name + "/?id=" + _id
                          }
                          target="_blank"
                        >
                          <img
                            src={qr_code}
                            alt="qr_code"
                            width="70"
                            height="70"
                          />
                        </a>

                        <a
                          href={
                            api_url + "/devices/" + def_name + "/?id=" + _id
                          }
                          target="_blank"
                        >
                          {api_url + "/devices/" + def_name + "/?id=" + _id}
                        </a>
                      </div>
                    </div>
                    <div></div>
                    <div>
                      <button onClick={() => on_rename(_id)}>Renomear</button>{" "}
                      <button onClick={() => on_delete(_id)}>Apagar</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {user_devices?.filter(({ id }) => id == "1").length > 0 && (
          <div>
            <h2>
              Campainhas ({user_devices?.filter(({ id }) => id == "1").length})
            </h2>
            <div style={{ padding: 10 }}>
              {user_devices
                ?.filter(({ id }) => id == "1")
                ?.map(({ id, _id, def_name, name }) => (
                  <div key={_id}>
                    <div>
                      <p>{name.toUpperCase()}</p>
                      <p>
                        <a
                          href={
                            api_url + "/devices/" + def_name + "/?id=" + _id
                          }
                          target="_blank"
                        >
                          {api_url + "/devices/" + def_name + "/?id=" + _id}
                        </a>
                      </p>
                    </div>
                    <div></div>
                    <div>
                      <button onClick={() => on_rename(_id)}>Renomear</button>{" "}
                      <button onClick={() => on_delete(_id)}>Apagar</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {user_devices?.filter(({ id }) => id == "3").length > 0 && (
        <div>
          <h2>
            Rastreadores ({user_devices?.filter(({ id }) => id == "3").length})
          </h2>
          <div
            style={{
              height: 340,
              background: "#f9f9f9",
            }}
          ></div>
          <div style={{ padding: 10 }}>
            {user_devices
              ?.filter(({ id }) => id == "3")
              ?.map(({ id, _id, def_name, name, last_position, qr_code }) => (
                <div key={_id}>
                  <div>
                    <p>{name.toUpperCase()}</p>
                    <p>
                      ({last_position.lat}, {last_position.lon})
                    </p>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <a
                        href={api_url + "/devices/" + def_name + "/?id=" + _id}
                        target="_blank"
                      >
                        <img
                          src={qr_code}
                          alt="qr_code"
                          width="70"
                          height="70"
                        />
                      </a>

                      <a
                        href={api_url + "/devices/" + def_name + "/?id=" + _id}
                        target="_blank"
                      >
                        {api_url + "/devices/" + def_name + "/?id=" + _id}
                      </a>
                    </div>
                  </div>
                  <div></div>
                  <div>
                    <button onClick={() => on_rename(_id)}>Renomear</button>{" "}
                    <button onClick={() => on_delete(_id)}>Apagar</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {user_devices?.filter(({ id }) => id == "4").length > 0 && (
        <div>
          <h2>
            Spot Screens ({user_devices?.filter(({ id }) => id == "4").length})
          </h2>
          <div style={{ padding: 10 }}>
            {user_devices
              ?.filter(({ id }) => id == "4")
              ?.map(({ id, _id, def_name, name }) => (
                <div key={_id}>
                  <div>
                    <div
                      style={{
                        height: 240,
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <p>{name.toUpperCase()}</p>
                    <p>
                      <a
                        href={api_url + "/devices/" + def_name + "/?id=" + _id}
                        target="_blank"
                      >
                        {api_url + "/devices/" + def_name + "/?id=" + _id}
                      </a>
                    </p>
                  </div>
                  <div></div>
                  <div>
                    <button onClick={() => on_rename(_id)}>Renomear</button>{" "}
                    <button onClick={() => on_delete(_id)}>Apagar</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default index;
