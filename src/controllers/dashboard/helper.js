const getPercentage = (current, max) => {
    return ((current / max) * 100).toFixed(2);
}

const bytesToMegabytes = (bytes) => {
    return bytes / 1024 / 1024;
}

const bytesToKilobytes = (bytes) => {
    return (bytes / 1024).toFixed(2);
}

module.exports = { getPercentage, bytesToMegabytes, bytesToKilobytes };