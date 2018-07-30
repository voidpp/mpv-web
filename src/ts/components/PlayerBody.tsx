import * as React from "react";
import Slider from 'rc-slider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames';
import mpv from '../constants/mpv';
import TimePositon from "./TimePosition";
import SliderStyle from "./SliderStyle";
import SeekBar from "./SeekBar";
import Time from "./Time";
import Dialog from "./Dialog";
import ListContainer from "./ListContainer";

interface State {
    showAudioList: boolean,
    showSubList: boolean,
    showPlayList: boolean,
}

export default class PlayerBody extends React.Component<{player: mpv.Player}, State> {

    constructor(props) {
        super(props);
        this.state = {
            showAudioList: false,
            showSubList: false,
            showPlayList: false,
        }
    }

    private _playlistItemRendered(el: HTMLElement, item: mpv.PlaylistItem) {
        if (el == null || !item.current)
            return;
        el.parentElement.scrollTop = el.offsetTop - el.clientHeight - el.parentElement.clientHeight / 2;
    }

    private _getPlaylist(): JSX.Element {
        let player = this.props.player;

        let playlist = [];
        player.playlist.forEach((item, idx) => {
            let name = item.filename;
            let parts = name.split('/');
            playlist.push(
                <div
                    key={idx}
                    ref={e => this._playlistItemRendered(e, item)}
                    className={classNames('item', {current: item.current})}
                    onClick={() => {
                        player.remote.setPlaylistPosition(idx);
                        this.setState({showPlayList: false});
                    }}
                    >
                    {parts[parts.length-1]}
                </div>
            );
        });

        return <ListContainer title="Playlist" requestClose={() => this.setState({showPlayList: false})}>{...playlist}</ListContainer>;
    }

    private _getTrackList(title: string, source: mpv.TrackDataMap, currentId: number, onSelect: (id: number) => void, onClose: () => void): JSX.Element {
        let list = [];
        let items = [{id: 0, lang: '', caption: '<None>'}];
        items.push(...Object.values(source));

        for(let track of items) {
            list.push(
                <tr
                    key={track.id}
                    className={classNames('item', {current: currentId == track.id})}
                    onClick={() => {
                        onSelect(track.id);
                        onClose();
                    }}
                    >
                    <td>{track.lang}</td>
                    <td>{track.caption}</td>
                </tr>
            );
        }

        return (
            <ListContainer title={title} requestClose={onClose}>
                <table>
                    <thead><tr><th>Lang</th><th>Title</th></tr></thead>
                    <tbody>{...list}</tbody>
                </table>
            </ListContainer>
        );
    }

    render() {
        let player = this.props.player;
        if (!player.enabled)
            return <div className="player"></div>

        return (
            <div className="player-body">
                <Dialog show={this.state.showAudioList} requestClose={() => this.setState({showAudioList: false})}>
                    {this._getTrackList('Audio track list', player.trackListMap.audio, player.aid,
                            player.remote.setAudioTrack.bind(player.remote), () => this.setState({showAudioList: false}))}
                </Dialog>

                <Dialog show={this.state.showSubList} requestClose={() => this.setState({showSubList: false})}>
                    {this._getTrackList('Subtitle track list', player.trackListMap.sub, player.sid,
                        player.remote.setSubtitleTrack.bind(player.remote), () => this.setState({showSubList: false}))}
                </Dialog>

                <Dialog show={this.state.showPlayList} requestClose={() => this.setState({showPlayList: false})}>
                    {this._getPlaylist()}
                </Dialog>

                <div className="time">
                    <TimePositon playerId={player.id} /><span className="duration">/<Time seconds={player.duration} /></span>
                </div>
                <div className="seek-bar">
                    <SeekBar player={player} />
                </div>
                <div className="main-controls">
                    <span onClick={e => player.remote.playlistPrev()}><FontAwesomeIcon icon="fast-backward" /></span>
                    <span onClick={e => player.remote.seek(-5)}><FontAwesomeIcon icon="backward" /></span>
                    <span onClick={e => player.remote.cyclePause()}> <FontAwesomeIcon icon={player.pause ? 'play' : 'pause'} /> </span>
                    <span onClick={e => player.remote.seek(5)}><FontAwesomeIcon icon="forward" /></span>
                    <span onClick={e => player.remote.playlistNext()}><FontAwesomeIcon icon="fast-forward" /></span>
                </div>
                <div className="volume-controls">
                    <span onClick={e => player.remote.cycleMute()} ><FontAwesomeIcon icon={player.mute ? 'volume-off' : 'volume-up'} /></span>
                    <Slider
                        min={0}
                        max={100}
                        value={player.volume}
                        onChange={v => player.remote.setVolume(v)}
                        railStyle={SliderStyle.rail}
                        trackStyle={SliderStyle.track}
                        handleStyle={SliderStyle.handle}
                    />
                </div>
                <div className="misc-controls">
                    <div onClick={() => player.remote.cycleFullscreen()} className="control">
                        <FontAwesomeIcon icon="expand-arrows-alt" />
                        <span className="desc">{player.fullscreen ? 'yes': 'no'}</span>
                    </div>
                    <div
                        onClick={() => this.setState({showAudioList: true})}
                        className={classNames('control', {disabled: Object.values(player.trackListMap.audio).length == 0})}
                    >
                        <FontAwesomeIcon icon="music" />
                        <span className="desc">{player.trackListMap.audio[player.aid] ? (player.trackListMap.audio[player.aid].lang || player.trackListMap.audio[player.aid].caption) : <FontAwesomeIcon className="none" icon="times" />}</span>
                    </div>
                    <div
                        onClick={() => this.setState({showSubList: true})}
                        className={classNames('control', {disabled: Object.values(player.trackListMap.sub).length == 0})}
                    >
                        <FontAwesomeIcon icon="closed-captioning" />
                        <span className="desc">{player.trackListMap.sub[player.sid] ? (player.trackListMap.sub[player.sid].lang || player.trackListMap.sub[player.sid].caption) : <FontAwesomeIcon className="none" icon="times" />}</span>
                    </div>
                    <div
                        onClick={() => this.setState({showPlayList: true})}
                        className={classNames('control', {disabled: player.playlist.length < 2})}
                    >
                        <FontAwesomeIcon icon="list-alt" />
                        <span className="desc">{player.playlistPos1} / {player.playlist.length}</span>
                    </div>
                </div>
            </div>
        );
    }
}
