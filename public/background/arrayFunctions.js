const RoundedAverage = (acc, value, index, array) => {
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
const Total = (acc, value, index, array) => {
    //first we calculate the value
    var calculatedValue = acc + value;
    //then we see if we have hit the end of the array
    if (index === array.length - 1) {
        //if we have then we return the rounded value
        return calculatedValue;
    }
    //otherwise we are still interacting and we just return the running total
    return calculatedValue;
};
