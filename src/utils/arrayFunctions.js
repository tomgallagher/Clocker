export const RoundedAverage = (acc, value, index, array) => {
    //first we calculate the value
    var calculatedValue = acc + value;
    //then we see if we have hit the end of the array
    if (index === array.length - 1) {
        //if we have then we return the rounded value
        return Math.round(calculatedValue / array.length);
    }
    //otherwise we are still interating and we just return the running total
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
