import React from 'react';
import './App.css';
import ValidateJsonData from './ValidateJsonData.js';
let Data, DataFetchedStarted, JSONDataIsValid;

export default class App extends React.Component {
    constructor(props) {
        super(props);
        // Start by validating the file and kicking it out if it fails
        this.state = {
            Medication: '',
            MedicationType: '',
            MedicationNotes: '',
            MedicationTypeNotes: '',
            MedicationTypeOptions: [''],
            medicationTypeDisabled: true,
            childWeightDisabled: true,
            childWeight: 0,
            childWeightMin: 0,
            childWeightMax: 50,
            dosage: "",
            hideDosage: true
        };
    }

    /**
     * Load the JSON data that will be used by the calculator
     */
    componentDidMount() {
        if(DataFetchedStarted === undefined) {
            DataFetchedStarted = true;
            let parentThis = this;
            fetch(window.fmPediatricDosageCalculatorJSONFileLocation)
                .then(response => response.json())
                .then(function (data) {
                    Data = data;
                    JSONDataIsValid = ValidateJsonData(Data);
                    parentThis.setState({})
                })
                .catch(function () {
                    // set to empty to throw error
                    Data = "";
                    console.log("Unable to load pediatric dosage chart data")
                    parentThis.setState({})
                })
        }
    }

    render() {
        // Ensure there is something there
        if(Data === undefined) {
            return(
                <div className={"Loading"}>Loading Calculator</div>
            );
        } else if( JSONDataIsValid ) {
            return (
              <div className="fm_dosage_card">
                  <div className="fm_dosage_inner">
                      <h2>Dosage Calculator</h2>
                      <p>This calculator can help determine the right dosage based on the medication type and your child's weight.</p>
                      <select onChange={evt => this.updateMedication(evt)} value={this.state.Medication} >
                          <option>Select Medication</option>
                          {Object.keys(Data).map((x,y) => <option key={"med" + y} value={x}>{x}</option>)}
                      </select>
                      <select onChange={evt => this.updateMedicationType(evt)} value={this.state.MedicationType} disabled={this.state.medicationTypeDisabled}>
                          <option>Select Type</option>
                          {this.state.MedicationTypeOptions}
                      </select>
                      <h3 className={"childWeight"}>Child Weight <span className={"childWeightValue"}>{this.state.childWeight} lbs</span></h3>
                      <input
                          onChange={evt => this.updateChildWeight(evt)}
                          type="range"
                          step="1"
                          disabled={this.state.childWeightDisabled}
                          min={this.state.childWeightMin}
                          max={this.state.childWeightMax}
                          value={this.state.childWeight}
                      />
                      <h3 className={"childDosage " + (this.state.hideDosage ? "hidden" : "")}>Maximum single dose <span className={"childDosageValue"}>{this.state.dosage}</span></h3>
                      <div>{this.state.MedicationNotes}{this.state.MedicationTypeNotes}</div>
                  </div>
              </div>
            );
        } else {
            return(
                <h2>Something seems to have gone wrong please check back later!</h2>
            );
        }
    }

    updateMedication(evt) {
        const val = evt.target.value,
            medicationTypes = (Data[val] !== undefined) ? Object.keys(Data[val]): null;

        this.setState({
            Medication: val,
            MedicationTypeOptions: (medicationTypes == null) ? '' : medicationTypes.map(
                (x,y) => (x !== "notes" ? <option key={"dosage" + y} value={x}>{x}</option> : "")
            ),
            medicationTypeDisabled: (medicationTypes == null),
            MedicationNotes: (Data[val] !== undefined && Data[val]['notes'] !== undefined) ? this.convertTheNotesToHTML(Data[val]['notes']) : ''
        });

        this.updateMedicationType(null, val);
    }

    updateMedicationType(evt = null, Medication = this.state.Medication ) {
        const MedicationType = (evt != null) ? evt.target.value : null,
              currentData = (Data[Medication] !== undefined && Data[Medication][MedicationType] !== undefined)
                  ? Data[Medication][MedicationType]: null;

        // Clear out as there is nothing to do
        if( Medication == null || MedicationType == null || currentData == null ) {
            // Clear the state and return
            if(evt != null) {
                evt.target.value = null;
            }
            this.setState({
                MedicationType: '',
                MedicationTypeNotes: '',
                childWeight: 0,
                childWeightDisabled: true,
                hideDosage: true
            });
            return;
        }

        let minWeight,
            maxWeight;

        if(currentData['weights'] !== undefined) {
            const weights = currentData['weights'];
            Object.keys(weights).forEach(function(dosage) {
                minWeight = (minWeight > weights[dosage]['low'] || minWeight === undefined) ? weights[dosage]['low'] : minWeight;
                maxWeight = (maxWeight < weights[dosage]['high'] || maxWeight === undefined) ? weights[dosage]['high'] : maxWeight;
            });
        }

        this.setState({
            MedicationType: MedicationType,
            MedicationTypeNotes: (currentData['notes'] !== undefined && currentData['notes'] !== undefined) ? this.convertTheNotesToHTML(currentData['notes']) : '',
            childWeightDisabled: false,
            childWeight: minWeight,
            childWeightMin: minWeight,
            childWeightMax: maxWeight,
        });

        this.updateDosageCalculation(minWeight, MedicationType);
    }

    updateChildWeight(evt) {
        const
            val = evt.target.value;

        this.setState({
            childWeight: val,
        });

        this.updateDosageCalculation(val);
    }

    updateDosageCalculation(val = this.state.minWeight, MedicationType = this.state.MedicationType) {
        const currentComponent = this,
              currentData = Data[this.state.Medication][MedicationType]['weights'];

        if(currentData !== undefined) {
            Object.keys(currentData).forEach(function(dosage) {
                if(
                    val >= currentData[dosage]['low'] &&
                    val <= currentData[dosage]['high']
                ) {
                    currentComponent.setState({
                        dosage: dosage,
                        hideDosage: false,
                    });
                }
            });
        }
    }

    convertTheNotesToHTML(notes) {
        if(notes !== undefined) {
            console.log(notes[""]);
            return Object.keys(notes).map((x, y) =>
                <div className="medicationNote" key={"note" + y} style={{whiteSpace: "pre-wrap"}}><b>{x}</b>{notes[x]}</div>)
        }
    }
};
