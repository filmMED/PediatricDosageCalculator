import Data from "./data.json";

const ValidatedJsonData = ValidateJsonDataFunction();

function ValidateJsonDataFunction() {
    let isValid = true;

    // Ensure there is something there
    if(Data === undefined) {
        return false;
    }

    // Check for at least 1 medication
    if(Object.keys(Data).length < 1) {
        return false;
    }

    // Validate structure
    Object.keys(Data).forEach(function(medication) {
        Object.keys(Data[medication]).forEach(function(type) {
            let lastHigh;
            Object.keys(Data[medication][type]['weights']).forEach(function(dosage) {
                // Ensure we have a low and high for each
                if(Data[medication][type]['weights'][dosage]["low"] === undefined || Data[medication][type]['weights'][dosage]["high"] === undefined) {
                    isValid = false;
                }
                // Check to make sure our number are sequential
                if(lastHigh !== undefined && (lastHigh+1 !== Data[medication][type]['weights'][dosage]["low"])) {
                    console.log("There is an error in the dosage chart data. The '" + medication + "' of the '" + type + "' type is non-sequential on the '" + dosage + "' dosage up to the next highest weight.");
                    isValid = false;
                }
                lastHigh = Data[medication][type]['weights'][dosage]["high"];


            });
        });
    });

    // If we make it this far we didn't fail any of the validation
    return isValid;
}

export default ValidatedJsonData;
