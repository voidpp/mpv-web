
import * as React from "react";
import * as ReactDOM from "react-dom";

import MpvActionCreator from './actions/MpvActionCreator';
import {Router} from './utils/Router';

import 'rc-slider/assets/index.css';
import '../scss/app.scss';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import MenuBar from "./components/MenuBar";
import ServerActionCreator from "./actions/ServerActionCreator";
import PlayerList from "./components/PlayerList";
import Api from "./utils/Api";

library.add(fas);

let router = new Router();

MpvActionCreator.router = router;
ServerActionCreator.router = router;

window['api'] = {
    v1: Api,
};

let page = (
    <div>
        <MenuBar />
        <PlayerList />
    </div>
)

ReactDOM.render(page, document.getElementById('app'));
