import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import { StorageHelper } from "../../../shared/StorageHelper";

export interface ISettingsModalProps {
    StateHelper: any;
    SoundActions: any;
    isOpen: boolean;
    hiddenKeyboard: boolean;
    onToggleHideKeyboard: () => void;
    close: () => void;
}

// TODO: remove selectedMidiInputId from this modal's state and move it to PlayViewController
export interface ISettingsModalState {
    // selectedMidiInputId: string;
    // requestingMidiAccess: boolean;
    // midiInputConnectionError: string;
}

class SettingsModal extends Component<ISettingsModalProps, ISettingsModalState> {
    constructor(props: ISettingsModalProps) {
        super(props);
        this.state = {
            // selectedMidiInputId: "",
            // requestingMidiAccess: false,
            // midiInputConnectionError: ""
        }
    }

    // public componentWillMount() {
    //     this.setState({ selectedMidiInputId: StorageHelper.getMidiInputId() });
    // }

    public render() {
        let { isOpen, close, StateHelper } = this.props;

        let state = StateHelper.getState();
    
        // let midiInputId = StorageHelper.getMidiInputId();
        // let midiAccess = StateHelper.getMidiAccess();

        // let {
        //     requestingMidiAccess
        // } = this.state;
    
        // let inputRadioButtons = [], midiInputsForm;
    
        // if (midiAccess && midiAccess.inputs) {
        //     let inputs = midiAccess.inputs.values();  
    
        //     for( let input = inputs.next(); input && !input.done; input = inputs.next()) {
        //         let { name, id } = input.value;
        //         inputRadioButtons.push(
        //             <div key={name}>
        //                 <input 
        //                     type="radio" 
        //                     key={name} 
        //                     name="midiInput" 
        //                     value={id} 
        //                     defaultChecked={id === midiInputId} 
        //                     onChange={this.onMidiInputSelectionChange} />
        //                 {name}
        //             </div>
        //         );
        //     }
    
        //     midiInputsForm = (
        //         <div className="section" >
        //             <p>Midi Input</p>
        //             {inputRadioButtons}
        //             <div>
        //                 <button className="btn" onClick={this.onMidiInputsRefresh} >Refresh</button>
        //                 {requestingMidiAccess && "refreshing..."} 
        //             </div>
        //         </div>
        //     );
        // }
    
        return (

            <Modal dialogClassName="settings-modal" show={isOpen} onHide={close}>
                <Modal.Header closeButton={true} >
                    <h2>Settings</h2>
                </Modal.Header>
                <Modal.Body>
                    {this.renderVolumeSelect("piano", state.pianoVolume)}
                    {this.renderVolumeSelect("bass", state.bassVolume)}
                    {this.renderVolumeSelect("drums", state.drumsVolume)}
                    {this.renderHideKeyboard()}
                </Modal.Body>
                <Modal.Footer>
                   <Button bsStyle="primary" style={{ marginTop: 10 }} onClick={() => close()} >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        ); 
    }

    public renderVolumeSelect(instrument: "piano" | "bass" | "drums", currVolume: number) {
        return (
            <div style={{ display: "flex", marginBottom: 20 }}>
                <span style={{ fontSize: "130%", width: 140 }}>{instrument}:</span> 
                <input 
                    style={{ width: 200 }}
                    type="range" 
                    name={instrument} 
                    min="0" 
                    max="10"
                    value={currVolume}
                    onChange={(evt: React.SyntheticEvent<any>) => this._onVolumeChange(instrument, evt.nativeEvent)} 
                />
            </div>
        )
    }   

    public renderHideKeyboard() {
        let { hiddenKeyboard } = this.props;
        return (
            <div style={{ display: "flex" }}>   
                <span style={{ fontSize: "130%", width: 140 }}>Hide Keyboard</span>
                <input
                    type="checkbox"
                    name="hide-keyboard"
                    checked={hiddenKeyboard}
                    onChange={() => this._onToggleHideKeyboard()}
                />
            </div>
        );
    }

    private _onVolumeChange = (instrument: "piano" | "bass" | "drums", evt: any) => {
        let { SoundActions } = this.props;
        let vol = parseInt(evt.target.value, undefined);

        StorageHelper.setVolume(instrument, vol);
        SoundActions.setVolume(instrument, vol);
    }

    private _onToggleHideKeyboard = () => {
        let { hiddenKeyboard, onToggleHideKeyboard } = this.props;

        StorageHelper.setHideKeyboard(!hiddenKeyboard);
        onToggleHideKeyboard();
    }

    // private onMidiInputSelectionChange = (event: React.SyntheticEvent<any>) => {
    //     this.setState({ selectedMidiInputId: (event.target as any).value });
    // }
    
    // private onMidiInputsRefresh = (event: React.SyntheticEvent<any>) => {
    //     event.preventDefault();
    //     let { SoundActions } = this.props;
    
    //     this.setState({ requestingMidiAccess: true });
    //     SoundActions.setMidiAccessAsync()
    //         .then(() => {
    //             this.setState({ requestingMidiAccess: false });
    //         });
    // }
    
    // private onSubmitMidiSettingsForm = (event: React.SyntheticEvent<any>) => { 
    //     event.preventDefault();
    //     let { SoundActions, close } = this.props;
    //     let { selectedMidiInputId } = this.state;
    
    //     let connectionSuccessful = SoundActions.connectToMidiInput(selectedMidiInputId); 
    
    //     if (connectionSuccessful) {
    //         StorageHelper.setMidiInputId(selectedMidiInputId);
    //         close(); 
    //     } else {
    //         StorageHelper.setMidiInputId("");
    //         this.setState({ midiInputConnectionError: "Connection unsuccessful" });
    //     }
    // }
}

export default SettingsModal;
