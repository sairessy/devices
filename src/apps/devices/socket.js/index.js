import { io } from "socket.io-client";
import { api_url } from "../../../config.js";

const socket = io(api_url);

export default socket;
