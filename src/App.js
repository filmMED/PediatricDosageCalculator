import React from 'react';
import './App.css';
import ValidatedJsonData from './ValidateJsonData.js';
import Data from './data.json';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        // Start by validating the file and kicking it out if it fails
        this.state = {
            Medication: '',
            MedicationType: '',
            MedicationNotes: '',
            MedicationTypeOptions: [''],
            medicationTypeDisabled: true,
            childWeightDisabled: true,
            childWeight: 0,
            childWeightMin: 0,
            childWeightMax: 50,
            dosage: "",
        };
    }

    render() {
        if( ValidatedJsonData === true ) {
            return (
              <div className="fm_dosage_card">
                  <div className="fm_dosage_inner">
                      <h1>Dosage Calculator</h1>
                      <p>This chart, based on your child's weight, can help determine the right dosage amount, but is no substitute for your pediatrician's advice.</p>
                      <select onChange={evt => this.updateMedication(evt)} value={this.state.Medication} >
                          <option>Select Medication</option>
                          {Object.keys(Data).map((x,y) => <option key={"med" + y} value={x}>{x}</option>)}
                      </select>
                      <select onChange={evt => this.updateMedicationType(evt)} value={this.state.MedicationType} disabled={this.state.medicationTypeDisabled}>
                          <option>Select Type</option>
                          {this.state.MedicationTypeOptions}
                      </select>
                      <h3>Child Weight: {this.state.childWeight} lbs</h3>
                      <input
                          onChange={evt => this.updateChildWeight(evt)}
                          type="range"
                          step="1"
                          disabled={this.state.childWeightDisabled} min={this.state.childWeightMin}
                          max={this.state.childWeightMax}
                          value={this.state.childWeight
                      }/>
                      <h3>Child Dosage: {this.state.dosage}</h3>
                      <p>{this.state.MedicationNotes}</p>
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
                (x,y) => <option key={"dosage" + y} value={x}>{x}</option>
            ),
            medicationTypeDisabled: (medicationTypes == null),
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
                MedicationNotes: '',
                childWeightDisabled: true,
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
            MedicationNotes: ('notes' in currentData) ? this.convertTheNotesToHTML(currentData['notes']) : '',
            childWeightDisabled: false,
            childWeight: minWeight,
            childWeightMin: minWeight,
            childWeightMax: maxWeight,
        });

        this.updateDosageCalculation(minWeight, MedicationType);

        // Figure out how to deal with the slider and what not
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
                    });
                }
            });
        }
    }

    componentDidUpdate(PrevProps, prevState){
        //console.log("The component updated");
    }

    convertTheNotesToHTML(notes) {
        if(notes !== undefined) {
            return Object.keys(notes).map((x) =>
                <div className="medicationNote"><b>{x}:</b>{notes[x]}</div>)
        }
    }
};
