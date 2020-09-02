export const RoundedAverage = (acc, value, index, array) => {
    //first we calculate the value
    var calculatedValue = acc + value;
    //then we see if we have hit the end of the array
    if (index === array.length - 1) {
        //if we have then we return the rounded value
        return Math.round(calculatedValue / array.length);
    }
    //otherwise we are still interacting and we just return the running total
    return calculatedValue;
};
export const RoundedAverageMegaBytes = (acc, value, index, array) => {
    //first we calculate the value
    var calculatedValue = acc + value;
    //then we see if we have hit the end of the array
    if (index === array.length - 1) {
        //if we have then we get the rounded value, in bytes
        var total = Math.round(calculatedValue / array.length);
        //then we need to convert that to megabytes
        var megabytesTotal = total / 1048576;
        //then we need to have that to two decimal places
        return Math.round((megabytesTotal + Number.EPSILON) * 100) / 100;
    }
    //otherwise we are still interating and we just return the running total
    return calculatedValue;
};
export const TotalMegaBytes = (acc, value, index, array) => {
    //first we calculate the value
    var calculatedValue = acc + value;
    //then we see if we have hit the end of the array
    if (index === array.length - 1) {
        //then we need to convert that to megabytes
        var megabytesTotal = calculatedValue / 1048576;
        //then we need to have that to two decimal places
        return Math.round((megabytesTotal + Number.EPSILON) * 100) / 100;
    }
    //otherwise we are still interating and we just return the running total
    return calculatedValue;
};

//SORT FUNCTION FOR OBJECTS WHERE YOU NEED TO PRIORITISE CERTAIN FIELDS
//Call function like so
/*
    const sorted = testArray.sort((a, b) =>
        sortWithFieldPrecedence(a, b, ["age", "lastName", "status"])
    );
*/
//where the array contains the fields and the order you want to sort

export const sortWithFieldPrecedence = (a, b, precedenceArray) => {
    //map precedence array strings to object with type
    const precedences = precedenceArray.map(
        //this enables us to examine the properties of a and b
        (str) => ({ key: str, type: typeof a[str] })
    );
    //error handler in cases where the precedence array fields not present in either of objects to sort
    if (precedences.some((item) => !Object.keys(a).includes(item.key) || !Object.keys(b).includes(item.key))) {
        console.log('Precedence fields unmatched in array object property keys');
        return 0;
    }
    //in situations of equality of all fields we return 0, so no sorting
    if (!precedences.some((item) => a[item.key] !== b[item.key])) {
        console.log('Matched by all fields');
        return 0;
    }
    //otherwise we need to test each item in the precedence array
    //we use array reduce to return the sorting indicator for all precedences
    return precedences.reduce((accumulator, currentValue, index) => {
        //at the start we have no sort signal and also in the loop when equality
        if (accumulator === 0) {
            //we need a report on sorting that has occurred beyond the first criterion
            if (index > 0) {
                const objA = JSON.stringify(a);
                const objB = JSON.stringify(b);
                console.log(`Calculating Precedence at layer ${index}: ${currentValue.key}`);
                console.log(objA);
                console.log(objB);
            }
            //otherwise we need to vary according to the type of sort
            switch (currentValue.type) {
                case 'string':
                    const aString = a[currentValue.key].toLowerCase();
                    const bString = b[currentValue.key].toLowerCase();
                    //To see whether a string is greater than another,
                    //JavaScript uses the so-called “dictionary” or “lexicographical” order.
                    if (aString < bString) accumulator = -1;
                    if (aString > bString) accumulator = 1;
                    if (aString === bString) accumulator = 0;
                    break;
                case 'number':
                    //with numbers we can just return the first minus the second
                    accumulator = a[currentValue.key] - b[currentValue.key];
                    break;
                default:
                    console.log('Unrecognised key type');
            }
        }
        return accumulator;
    }, 0);
};
