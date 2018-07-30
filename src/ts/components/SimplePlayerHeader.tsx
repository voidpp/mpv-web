import * as React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import mpv from '../constants/mpv';

export default class SimplePlayerHeader extends React.Component<{player: mpv.Player}> {

    constructor(props) {
        super(props);
    }

    render() {
        let player = this.props.player;
        return (
            <div className="simple-player-header">
                <span className="close" onClick={e => player.remote.stop()}>
                    <FontAwesomeIcon icon="times" />
                </span>
                <div className="title">{player.caption}</div>
            </div>
        );
    }
}
