import * as React from "react";
import { bind } from "../tools";
import classNames from 'classnames';
import dialog from "../constants/dialog";

export default class Dialog extends React.Component<{show: boolean, requestClose: () => void}> {

    private _background: HTMLElement = null;

    constructor(props) {
        super(props);
        bind(this, this._onBackdroundClick);
    }

    private _onBackdroundClick(ev: React.MouseEvent) {
        if (ev.target == this._background)
            this.props.requestClose();
    }

    componentDidMount() {
        this._background.style.zIndex = '-5';
        this._background.addEventListener("transitionend", e => {
            if (!this.props.show)
                this._background.style.zIndex = '-5';
        })
        window.addEventListener(dialog.globalHideEventName, e => {
            if (this.props.show)
                this.props.requestClose();
        });
    }

    private _onRendered(el: HTMLElement) {
        if (el == null)
            return;
        this._background = el;
        if (this.props.show)
            this._background.style.zIndex = '5';
    }

    render() {
        return (
            <div
                ref={el => this._onRendered(el)}
                className={classNames('dialog', {hide: !this.props.show})}
                onClick={this._onBackdroundClick}
            >
                <div className="container">
                    {this.props.children}
                </div>
            </div>
        )
    }
}
