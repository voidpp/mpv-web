import * as React from "react";
import AnimateHeight from 'react-animate-height';
import mpv from '../constants/mpv';
import PlayerHeader from "./PlayerHeader";
import PlayerBody from "./PlayerBody";

export default class Player extends React.Component<{player: mpv.Player, openable: boolean}> {

    constructor(props) {
        super(props);
    }

    render() {
        let player = this.props.player;
        if (!player.enabled)
            return <div className="player"></div>

        let height = this.props.openable ? (player.opened ? 'auto' : 0) : 'auto';

        return (
            <div className="player" style={{display: player.enabled ? 'block': 'none'}}>
                <PlayerHeader player={player}/>
                <AnimateHeight duration={ 300 } height={height} easing="cubic-bezier(0.65, 0, 0.35, 1)">
                    <PlayerBody player={player}/>
                </AnimateHeight>
            </div>
        );
    }
}
