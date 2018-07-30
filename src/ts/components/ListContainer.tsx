import * as React from "react";

export default class ListContainer extends React.Component<{title: string, requestClose: () => void, className?: string}> {
    static defaultProps = {
        className: 'list-dialog-container'
    };

    render() {
        return (
            <div className={this.props.className}>
                <div className="title">{this.props.title}</div>
                <div className="items">{this.props.children}</div>
                <div className="controls">
                    <div className="button" onClick={this.props.requestClose}>Close</div>
                </div>
            </div>
        )
    }
}
