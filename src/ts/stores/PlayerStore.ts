import BaseStore from './BaseStore';
import Action from '../actions/Action';
import mpv from '../constants/mpv';
import PlayerEvent from '../constants/player';
import {RouterEvent} from '../utils/Router';
import Dispatcher from '../Dispatcher';
import TimePositionStore from './TimePositionStore';


export interface PlayerMap { [s: string]: mpv.Player; }

function _comparePlayers(a: mpv.Player, b: mpv.Player): number {
    let aname = a.caption.toLowerCase();
    let bname = b.caption.toLowerCase();
    if (aname < bname)
        return -1;
    if (aname > bname)
        return 1;
    return 0;
}

export class PlayerStore extends BaseStore {

    private _playerData: PlayerMap = {};
    private _showPlayerId: mpv.Id = null;
    private _showPlayerIdx: number = 0;

    getAllPlayerData(): PlayerMap {
        return this._playerData;
    }

    getPlayerData(id: mpv.Id): mpv.Player {
        return this._playerData[id];
    }

    get showedPlayerId(): mpv.Id {
        return this._showPlayerId;
    }

    get showedPlayerIdx(): number {
        return this._showPlayerIdx;
    }

    getOpenedPlayer(): mpv.Player {
        for (let player of Object.values(this._playerData)) {
            if (player.opened)
                return player;
        }
        return null;
    }

    private _keepOnePlayerOpened() {
        let players = Object.values(this._playerData);
        let open = false;
        let firtsEnabledPlayer: mpv.Player = null;
        for (let player of players) {
            player.opened = player.enabled && !player.pause;
            if (player.opened)
                open = true;
            if (player.enabled && firtsEnabledPlayer == null)
                firtsEnabledPlayer = player;
        }

        if (!open && firtsEnabledPlayer)
            firtsEnabledPlayer.opened = true;
    }

    private _sortPlayers(): void {
        let players = Object.values(this._playerData);
        players.sort(_comparePlayers)
        this._playerData = {};
        for (let player of players)
            this._playerData[player.id] = player;
    }

    private _openPlayer(id: mpv.Id) {
        for (let player of Object.values(this._playerData))
           player.opened = false;
        this._playerData[id].opened = true;
    }

    dispatchCallback(action: Action) {

        switch(action.type) {
            case PlayerEvent.toogleOpen:
                this._playerData[action.id].opened = !this._playerData[action.id].opened;
                this.emitChange();
                break;

            case mpv.Event.unpause:
            case PlayerEvent.open:
                this._openPlayer(action.id);
                this.emitChange();
                break;

            case mpv.Event.fileLoaded:
                if (this._showPlayerId == null)
                    this._showPlayerId = action.id;
                this._playerData[action.id] = action.data;
                this._sortPlayers();
                this._keepOnePlayerOpened();
                this.emitChange();
                break;

            case mpv.Event.idle:
                this._playerData[action.id].enabled = false;
                this._keepOnePlayerOpened();
                this.emitChange();
                break;

            case mpv.Event.propertyChange:
                if (action.id in this._playerData) {
                    this._playerData[action.id].setProperty(action.name, action.data);
                    this.emitChange();
                }
                break;

            case RouterEvent.disconnected:
                Dispatcher.waitFor([TimePositionStore.dispatchToken]);
                this._playerData = {};
                this.emitChange();
                break;

            case RouterEvent.mpvIstanceRemoved:
                delete this._playerData[action.id];
                this.emitChange();
                break;

            case PlayerEvent.show:
                this._showPlayerId = action.id;
                Object.values(this._playerData).forEach((player, idx) => {
                    if (player.id == action.id)
                        this._showPlayerIdx = idx;
                });
                this.emitChange();
                break;
        }
    }
}

export default new PlayerStore();
