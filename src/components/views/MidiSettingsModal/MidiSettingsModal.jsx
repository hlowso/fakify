import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-modal";

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
        backgroundColor: "#bbb",
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
        let { StateHelper, isOpen, close } = this.props;
    
        let midiAccess = StateHelper.getMidiAccess();
        let { 
            selectedMidiInputId, 
            requestingMidiAccess
        } = this.state;
    
        let inputRadioButtons = [], form;
    
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
                            defaultChecked={id === selectedMidiInputId} 
                            onChange={this.onMidiInputSelectionChange} />
                        {name}
                    </div>
                );
            }
    
            form = (
                <form >
                    {inputRadioButtons}
                    <Button onClick={this.onMidiInputsRefresh}>Refresh</Button>
                </form>
            );
        }
    
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={close}
                contentLabel={"MIDI Input Settings"} 
                style={modalStyle} >
                <div >
                    <h2>MIDI Settings</h2>
    
                    {requestingMidiAccess 
                        ? <p>Getting midi access</p>
                        : inputRadioButtons
                            ? form 
                            : <p>No midi inputs available!</p>
                    }
                    
                    <Button onClick={this.onSubmitMidiSettingsForm} >Save</Button>
                    <Button onClick={close} >Cancel</Button>
                </div>
            </Modal>
        ); 
    }

    onMidiInputSelectionChange = event => {
        this.setState({ selectedMidiInputId: event.target.value });
    }
    
    onMidiInputsRefresh = event => {
        let { MidiActions } = this.props;
    
        this.setState({ requestingMidiAccess: true });
        MidiActions.setMidiAccessAsync()
            .then(() => {
                this.setState({ requestingMidiAccess: false });
            });
    }
    
    onSubmitMidiSettingsForm = event => { 
        let { MidiActions, StorageHelper, close } = this.props;
        let { selectedMidiInputId } = this.state;
    
        let connectionSuccessful = MidiActions.connectToMidiInput(selectedMidiInputId); 
    
        if (connectionSuccessful) {
            StorageHelper.setMidiInputId(selectedMidiInputId);
            close(); 
        } else {
            StorageHelper.setMidiInputId("");
            this.setState({ midiInputConnectionError: "Connection unsuccessful" });
        }
    }
}

export default MidiSettingsModal;
