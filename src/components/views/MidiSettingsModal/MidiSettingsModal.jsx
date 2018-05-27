import React, { Component } from "react";
// import { button } from "react-bootstrap";
import Modal from "react-modal";

import "./MidiSettingsModal.css";

const modalStyle={
    overlay: {
        backgroundColor: "rgba(150, 150, 150, 0.75)",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        width: "600px",
        borderRadius: "10px",
        backgroundColor: "#ddd",
    }
};

Modal.setAppElement("#root");

class MidiSettingsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMidiInputId: "",
            requestingMidiAccess: false,
            midiInputConnectionError: ""
        }
    }

    componentWillMount() {
        let { StorageHelper } = this.props;
        this.setState({ selectedMidiInputId: StorageHelper.getMidiInputId() });
    }

    render() {
        let { StorageHelper, StateHelper, isOpen, close } = this.props;
    
        let midiInputId = StorageHelper.getMidiInputId();
        let midiAccess = StateHelper.getMidiAccess();

        let { 
            selectedMidiInputId, 
            requestingMidiAccess
        } = this.state;
    
        let inputRadioButtons = [], midiInputsForm;
    
        if (midiAccess && midiAccess.inputs) {
            let inputs = midiAccess.inputs.values();  
    
            for( let input = inputs.next(); input && !input.done; input = inputs.next()) {
                let { name, id } = input.value;
                inputRadioButtons.push(
                    <div key={name}>
                        <input 
                            type="radio" 
                            key={name} 
                            name="midiInput" 
                            value={id} 
                            defaultChecked={id === midiInputId} 
                            onChange={this.onMidiInputSelectionChange} />
                        {name}
                    </div>
                );
            }
    
            midiInputsForm = (
                <div className="section" >
                    <p>Midi Input</p>
                    {inputRadioButtons}
                    <div>
                        <button className="btn" onClick={this.onMidiInputsRefresh} >Refresh</button>
                        {requestingMidiAccess && "refreshing..."} 
                    </div>
                </div>
            );
        }
    
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={close}
                contentLabel={"MIDI Input Settings"} 
                style={modalStyle} >
                <div id="midi-settings-modal" >
                    <div className="header">
                        <span>MIDI Settings</span>
                    </div>
    
                    {inputRadioButtons
                        ? midiInputsForm 
                        : <p>No midi inputs available!</p>
                    }
                    
                    <div className="exit-btns" >
                        <button className="btn" onClick={close} >Cancel</button>
                        <button className="save btn" onClick={this.onSubmitMidiSettingsForm} >Save</button>
                    </div>
                </div>
            </Modal>
        ); 
    }

    onMidiInputSelectionChange = event => {
        this.setState({ selectedMidiInputId: event.target.value });
    }
    
    onMidiInputsRefresh = event => {
        event.preventDefault();
        let { MidiActions } = this.props;
    
        this.setState({ requestingMidiAccess: true });
        MidiActions.setMidiAccessAsync()
            .then(() => {
                this.setState({ requestingMidiAccess: false });
            });
    }
    
    onSubmitMidiSettingsForm = event => { 
        event.preventDefault();
        let { MidiActions, StorageHelper, close } = this.props;
        let { selectedMidiInputId } = this.state;
    
        let connectionSuccessful = MidiActions.connectToMidiInput(selectedMidiInputId); 
    
        if (connectionSuccessful) {
            StorageHelper.setMidiInputId(selectedMidiInputId);
            close(event); 
        } else {
            StorageHelper.setMidiInputId("");
            this.setState({ midiInputConnectionError: "Connection unsuccessful" });
        }
    }
}

export default MidiSettingsModal;
