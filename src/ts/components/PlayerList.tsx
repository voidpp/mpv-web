import * as React from "react";
import PlayerStore, {PlayerMap} from '../stores/PlayerStore';
import Player from "./Player";
import { bind } from "../tools";

export default class PlayerList extends React.Component<any, {players: PlayerMap, multiPlayer: boolean}> {

    constructor(props) {
        super(props);

        bind(this, this._onControllerChanged, this._onScreenResize);

        this.state = {
            players: {},
            multiPlayer: this._calcMultiPlayer(),
        };
    }

    private _calcMultiPlayer(): boolean {
        let mainBreakPoint = parseInt(getComputedStyle(document.body).getPropertyValue('--main-break-point'));
        return window.innerWidth > mainBreakPoint;
    }

    componentDidMount() {
        PlayerStore.addChangeListener(this._onControllerChanged);
        window.addEventListener('resize', this._onScreenResize);
    }

    componentWillUnmount() {
        PlayerStore.removeChangeListener(this._onControllerChanged);
        window.removeEventListener('resize', this._onScreenResize);
    }

    private _onScreenResize(ev: UIEvent) {
        this.setState({multiPlayer: this._calcMultiPlayer()});
    }

    private _onControllerChanged() {
        this.setState({players: PlayerStore.getAllPlayerData()});
    }

    render() {
        let items = [];

        for (let player of Object.values(this.state.players)) {
            if (player.enabled)
                items.push(<Player openable={!this.state.multiPlayer} key={player.id} player={player} />);
        }

        if (items.length)
            return <div className="player-list">{...items}</div>;
        else
            return <div className="empty-player-list">Could not detect any MPV instances</div>;
    }
}
