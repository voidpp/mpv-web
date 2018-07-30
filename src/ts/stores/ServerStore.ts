import BaseStore from './BaseStore';

import {ServerAction, ServerEvent, Server, ServerState, RouterEvent} from '../utils/Router';

export type ServerMap = { [s: string]: Server };

class ServerStore extends BaseStore {

    private _servers: ServerMap = {};
    private readonly _currentServerStates = [ServerState.connected, ServerState.connecting, ServerState.ready];

    constructor() {
        super();
        let localdata = JSON.parse(localStorage.getItem('mpv-http-routers'));

        if (localdata != undefined) {
            for (let s of localdata) {
                let server = new Server(s.host, s.port, s.name);
                this._servers[server.id] = server;
            }
        }
    }

    get servers(): ServerMap {
        return this._servers;
    }

    get currentServer(): Server {
        for (let server of Object.values(this._servers)) {
            if (this._currentServerStates.indexOf(server.state) != -1)
                return server;
        }
        return null;
    }

    get lastConnectedServer(): Server {
        let id = localStorage.getItem('last-connected-mpv-http-router');
        return id in this._servers ? this._servers[id] : null;
    }

    private _saveServerData() {
        localStorage.setItem('mpv-http-routers', JSON.stringify(Object.values(this._servers)));
    }

    dispatchCallback(action: ServerAction) {
        switch(action.type) {
            case ServerEvent.add:
                if (!(action.server.id in this._servers)) {
                    this._servers[action.server.id] = action.server;
                    this._saveServerData();
                    this.emitChange();
                }
                break;

            case ServerEvent.remove:
                console.log('ServerEvent.remove', action.server.id);
                delete this._servers[action.server.id];
                this._saveServerData();
                this.emitChange();
                break;

            case ServerEvent.connecting:
                this._servers[action.server.id].state = ServerState.connecting;
                this.emitChange();
                break;

            case ServerEvent.connected:
                localStorage.setItem('last-connected-mpv-http-router', action.server.id);
                this._servers[action.server.id].state = ServerState.connected;
                this.emitChange();
                break;

            case RouterEvent.initialDataFetched:
                this._servers[action.server.id].state = ServerState.ready;
                this.emitChange();
                break;

            case ServerEvent.disconnected:
                if (action.server.id in this._servers) {
                    this._servers[action.server.id].state = ServerState.disconnected;
                    this.emitChange();
                }
                break;
        }
    }
}

export default new ServerStore();
