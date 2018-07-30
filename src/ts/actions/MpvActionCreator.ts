import Dispatcher from '../Dispatcher';
import mpv from '../constants/mpv';

import {Router, RouterMessage, Listener, RouterEvent} from '../utils/Router';

class MpvActionCreator extends Listener {

    private _router: Router;

    set router(router: Router) {
        this._router = router;
        router.registerListener(this);
    }

    onConnecting(): void {}

    onClose() {
        Dispatcher.dispatch({type: RouterEvent.disconnected});
    }

    onOpen() {
        Dispatcher.dispatch({type: RouterEvent.connected});
        this._router.list().then(data => {
            for (let id of data) {
                this._fetchInitialData(id).then(data => {
                    Dispatcher.dispatch({
                        server: this._router.server,
                        type: RouterEvent.initialDataFetched,
                    });
                });
            }
        });
    }

    private _fetchInitialData(id: mpv.Id): Promise<mpv.Player> {
        let observeProps = [
            mpv.Property.fullscreen,
            mpv.Property.mute,
            mpv.Property.seekable,
            mpv.Property.volume,
            mpv.Property.pause,
            mpv.Property.aid,
            mpv.Property.sid,
            mpv.Property.playlist,
            mpv.Property.playlistPos1,
            mpv.Property.trackList,
        ];
        let getProps = [
            mpv.Property.timePos,
            mpv.Property.duration,
            mpv.Property.filename,
            mpv.Property.mediaTitle,
            mpv.Property.streamPath,
            ...observeProps,
        ];

        return new Promise((resolve, reject) => {
            this._router.getProperties(id, getProps).then((rawData) => {
                console.debug('initial data', rawData);
                let data = new mpv.Player(id, rawData);

                if (data.duration === undefined)
                    return;

                Dispatcher.dispatch({id, data, type: mpv.Event.fileLoaded});
                this._router.observeProperties(id, observeProps);
                resolve(data);
            });
        });
    }

    fetchTimePos(id: mpv.Id): void {
        this._router.getProperty(id, mpv.Property.timePos).then(data => {
            Dispatcher.dispatch({
                type: mpv.Event.propertyChange,
                name: mpv.Property.timePos,
                id,
                data,
            });
        })
    }

    private _dispatchMessage(msg: RouterMessage): void {
        let mpvId = msg.id;

        let mpvData = msg.data;
        Dispatcher.dispatch({
            type: mpvData.event,
            id: mpvId,
            name: mpvData.name,
            data: mpvData.data,
        });
    }

    onMessesage(msg: RouterMessage) {
        let mpvId = msg.id;
        let mpvData = msg.data;

        console.debug('onMessage', mpvId, mpvData);

        if (mpvData.event) {
            switch(mpvData.event) {
                case mpv.Event.fileLoaded:
                    this._fetchInitialData(mpvId);
                    break;

                case mpv.Event.pause:
                case mpv.Event.unpause:
                case mpv.Event.seek:
                    this.fetchTimePos(mpvId);
                    this._dispatchMessage(msg);
                    break;

                default:
                    this._dispatchMessage(msg);
                    break;
            }
        } else if(mpvData.routerevent) {
            Dispatcher.dispatch({
                type: mpvData.routerevent,
                id: mpvId,
            });
        }
    }

    cycleMute(id: mpv.Id): void {
        this._router.cycleProperty(id, mpv.Property.mute);
    }

    cyclePause(id: mpv.Id): void {
        this._router.cycleProperty(id, mpv.Property.pause);
    }

    setVolume(id: mpv.Id, value: number): void {
        this._router.setProperty(id, mpv.Property.volume, value);
    }

    playlistPrev(id: mpv.Id): void {
        this._router.inputCommand(id, mpv.Command.Input.playlistPrev);
    }

    playlistNext(id: mpv.Id): void {
        this._router.inputCommand(id, mpv.Command.Input.playlistNext);
    }

    seek(id: mpv.Id, seconds: number, type: mpv.Command.SeekType = mpv.Command.SeekType.relative): void {
        this._router.inputCommand(id, mpv.Command.Input.seek, seconds, type);
    }

    setAudioTrack(id: mpv.Id, aid: number) {
        this._router.setProperty(id, mpv.Property.aid, aid);
    }

    setSubtitleTrack(id: mpv.Id, sid: number) {
        this._router.setProperty(id, mpv.Property.sid, sid);
    }

    cycleAudioTracks(id: mpv.Id) {
        this._router.cycleProperty(id, mpv.Property.aid);
    }

    cycleSubtitleTracks(id: mpv.Id) {
        this._router.cycleProperty(id, mpv.Property.sid);
    }

    cycleFullscreen(id: mpv.Id) {
        this._router.cycleProperty(id, mpv.Property.fullscreen);
    }

    setPlaylistPosition(id: mpv.Id, idx: number) {
        this._router.setProperty(id, mpv.Property.playlistPos, idx);
    }

    stop(id: mpv.Id) {
        this._router.inputCommand(id, mpv.Command.Input.stop);
    }
}

export default new MpvActionCreator();

