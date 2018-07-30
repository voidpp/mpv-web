import * as React from "react";
import PlayerStore, {PlayerMap} from '../stores/PlayerStore';
import PlayerTabBar from "./PlayerTabBar";
import PlayerBody from "./PlayerBody";
import mpv from "../constants/mpv";

import { bind } from "../tools";
import Carousel from "nuka-carousel";
import PlayerActionCreator from "../actions/PlayerActionCreator";
import SimplePlayerHeader from "./SimplePlayerHeader";

export default class PlayerTabList extends React.Component<{}, {players: PlayerMap, showed: mpv.Id, showedIdx: number}> {

    constructor(props) {
        super(props);

        bind(this, this._onControllerChanged, this._onSlide, this._updateDimensions);

        this.state = {
            players: {},
            showed: null,
            showedIdx: 0,
        };
    }

    private _updateDimensions() {
        this.setState(this.state);
    }

    componentDidMount() {
        PlayerStore.addChangeListener(this._onControllerChanged);
        window.addEventListener('resize', this._updateDimensions);
    }

    componentWillUnmount() {
        PlayerStore.removeChangeListener(this._onControllerChanged);
        window.removeEventListener('resize', this._updateDimensions);
    }

    private _onControllerChanged() {
        this.setState({
            players: PlayerStore.getAllPlayerData(),
            showedIdx: PlayerStore.showedPlayerIdx,
            showed: PlayerStore.showedPlayerId,
        });
    }

    private _onSlide(idx: number) {
        PlayerActionCreator.showPlayer(Object.values(this.state.players)[idx].id);
    }

    render() {
        let items = [];

        for (let [id, player] of Object.entries(this.state.players)) {
            if (!player.enabled)
                continue;
            items.push(
                <div key={id} className="player-slide">
                    <SimplePlayerHeader player={player} />
                    <PlayerBody player={player} />
                </div>
            );
        }

        let slidesToShow = 1;

        if(document.documentElement.clientWidth > document.documentElement.clientHeight)
            slidesToShow = 2;

        return (
            <div className="player-tab-list">
                <PlayerTabBar players={this.state.players} showed={this.state.showed} />

                <Carousel
                    renderCenterRightControls={null}
                    renderCenterLeftControls={null}
                    renderBottomCenterControls={null}
                    afterSlide={this._onSlide}
                    slideIndex={this.state.showedIdx}
                    slidesToShow={slidesToShow}
                    slidesToScroll={slidesToShow}
                >
                    {...items}
                </Carousel>
            </div>
        );
    }
}
