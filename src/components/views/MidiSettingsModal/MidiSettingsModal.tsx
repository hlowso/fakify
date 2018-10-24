import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import "./MidiSettingsModal.css";

export interface ISettingsModalProps {
    StateHelper: any;
    SoundActions: any;
    isOpen: boolean;
    close: () => void;
}

// TODO: remove selectedMidiInputId from this modal's state and move it to PlayViewController
export interface ISettingsModalState {
    // selectedMidiInputId: string;
    // requestingMidiAccess: boolean;
    // midiInputConnectionError: string;
}

class MidiSettingsModal extends Component<ISettingsModalProps, ISettingsModalState> {
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
                    Piano: 
                    <input 
                        type="range" 
                        id="piano-volume" 
                        name="piano" 
                        min="0" 
                        max="10"
                        value={state.pianoVolume}
                        onChange={(evt: React.SyntheticEvent<any>) => this._onVolumeChange("piano", evt.nativeEvent)} />
                    Bass:
                    <input 
                        type="range" 
                        id="bass-volume" 
                        name="bass" 
                        min="0" 
                        max="10"
                        value={state.bassVolume}
                        onChange={(evt: React.SyntheticEvent<any>) => this._onVolumeChange("bass", evt.nativeEvent)} />
                    Drums:
                    <input 
                        type="range" 
                        id="drums-volume" 
                        name="drums" 
                        min="0" 
                        max="10"
                        value={state.drumsVolume}
                        onChange={(evt: React.SyntheticEvent<any>) => this._onVolumeChange("drums", evt.nativeEvent)} />
                </Modal.Body>
                <Modal.Footer>
                   <Button bsStyle="primary" style={{ marginTop: 10 }} onClick={() => close()} >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        ); 
    }

    private _onVolumeChange = (instrument: "piano" | "bass" | "drums", evt: any) => {
        let { SoundActions } = this.props;
        let vol = parseInt(evt.target.value, undefined);

        SoundActions.setVolume(instrument, vol);
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

export default MidiSettingsModal;
