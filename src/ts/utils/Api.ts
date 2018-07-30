import ServerStore from "../stores/ServerStore";
import ServerActionCreator from "../actions/ServerActionCreator";
import PlayerStore from "../stores/PlayerStore";
import dialog from "../constants/dialog";
import {Router, Server} from "./Router";

class Api {

    public router: Router = null;

    connectToLastConnectedServer() {
        let servers = Object.values(ServerStore.servers);

        if (servers.length)
            ServerActionCreator.connect(ServerStore.lastConnectedServer || servers[0]);
    }

    disconnect() {
        ServerActionCreator.disconnect();
    }

    suspend() {
        this.router.suspend();
    }

    resume() {
        this.router.resume();
    }

    changeVolume(diff: number) {
        let player = PlayerStore.getOpenedPlayer();
        if (player == null)
            return;
        player.remote.setVolume(player.volume + diff);
    }

    hideCurrentDialog() {
        window.dispatchEvent(new Event(dialog.globalHideEventName));
    }

    addServer(host: string, port: number, name: string) {
        ServerActionCreator.add(new Server(host, port, name));
    }

    removeServer(host: string, port: number, name: string) {
        ServerActionCreator.remove(new Server(host, port, name));
    }
}

export default new Api();
