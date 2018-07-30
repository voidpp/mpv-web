import mpv from '../constants/mpv';
import Dispatcher from '../Dispatcher';
import PlayerEvent  from '../constants/player';

class PlayerActionCreator {

    toogleOpen(id: mpv.Id): void {
        Dispatcher.dispatch({
            id,
            type: PlayerEvent.toogleOpen,
        });
    }

    open(id: mpv.Id): void {
        Dispatcher.dispatch({
            id,
            type: PlayerEvent.open,
        });
    }

    showPlayer(id: mpv.Id): void {
        Dispatcher.dispatch({
            id,
            type: PlayerEvent.show,
        });
    }

}

export default new PlayerActionCreator();
