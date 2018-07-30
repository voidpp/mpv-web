    import * as React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import mpv from '../constants/mpv';
import TimePositon from "./TimePosition";
import Time from "./Time";

import classNames from 'classnames';
import { bind } from "../tools";
import { PlayerMap } from "../stores/PlayerStore";
import PlayerActionCreator from "../actions/PlayerActionCreator";

export default class PlayerTabBar extends React.Component<{players: PlayerMap, showed: mpv.Id}> {

    constructor(props) {
        super(props);
    }

    render() {
        let tabs = [];

        for (let [id, player] of Object.entries(this.props.players)) {
            if (!player.enabled)
                continue;

            tabs.push(
                <div
                    key={id}
                    className={classNames('item', {showed: id == this.props.showed})}
                    onClick={e => PlayerActionCreator.showPlayer(id)}
                >
                    <div className="text">{player.caption}</div>
                </div>
            );
        }

        return (
            <div className="player-tab-bar">{...tabs}</div>
        );
    }
}
