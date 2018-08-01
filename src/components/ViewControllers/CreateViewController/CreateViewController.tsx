import React, { Component } from "react";

export interface ICreateVCProps {
    StateHelper: any;
}

export interface ICreateVCState {

}

class CreateViewController extends Component<ICreateVCProps, ICreateVCState> {
    constructor(props: ICreateVCProps) {
        super(props);
        this.state = {

        };
    }

    public render() {
        return (
            <div>THIS WILL BE THE CREATE PAGE</div>
        );
    }
}

export default CreateViewController;

