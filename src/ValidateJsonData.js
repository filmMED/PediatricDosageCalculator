export default function ValidateJsonDataFunction(Data) {
    let isValid = true;

    // Check for at least 1 medication
    if(Object.keys(Data).length < 1) {
        return false;
    }

    // Validate structure
    Object.keys(Data).forEach(function(medication) {

        Object.keys(Data[medication]).forEach(function(type) {
            let lastHigh;
            // don't validate notes
            if (type !== "notes") {
                if(!Data[medication][type]['weights']) {
                    console.log("weights are undefined")
                    isValid = false;
                } else {
                    Object.keys(Data[medication][type]['weights']).forEach(function(dosage) {
                        // Ensure we have a low and high for each
                        if(Data[medication][type]['weights'][dosage]["low"] === undefined || Data[medication][type]['weights'][dosage]["high"] === undefined) {
                            isValid = false;
                        }
                        // Check to ensure the low is lower than the high
                        if(Data[medication][type]['weights'][dosage]["low"] >= Data[medication][type]['weights'][dosage]["high"]) {
                            console.log("The low value is high than or equal to the high value for  '" + medication + "' of the '" + type + "' typeon the '" + dosage + "' dosage.");
                            isValid = false;

                            // Check to make sure our number are sequential
                        } else if(lastHigh !== undefined && (lastHigh+1 !== Data[medication][type]['weights'][dosage]["low"])) {
                            console.log("There is an error in the dosage chart data. The '" + medication + "' of the '" + type + "' type is non-sequential on the '" + dosage + "' dosage up to the next highest weight.");
                            isValid = false;
                        }

                        lastHigh = Data[medication][type]['weights'][dosage]["high"];
                    });
                }
            }
        });
    });

    // If we make it this far we didn't fail any of the validation
    return isValid;
};
