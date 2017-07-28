function worldClock(zone) {
    ampm = '';
    now = new Date();
    var day = now.getDate();
    var month = now.getMonth();
    var year = now.getFullYear();
    ofst = now.getTimezoneOffset() / 60;
    secs = now.getSeconds();
    sec = -1.57 + Math.PI * secs / 30;
    mins = now.getMinutes();
    min = -1.57 + Math.PI * mins / 30;
    hr = (now.getHours() + parseInt(ofst)) + parseInt(zone);
    hr = (now.dst()) ? hr + 1 : hr;
    hrs = -1.575 + Math.PI * hr / 6 + Math.PI * parseInt(now.getMinutes()) / 360;
    if (hr < 0) hr += 24;
    if (hr > 23) hr -= 24;
    ampm = (hr > 11) ? "PM" : "AM";
    statusampm = ampm.toLowerCase();

    var monthArray = new Array("January", "February", "March", "April", "May",
                "June", "July", "August", "September", "October", "November", "December");

    hr2 = hr;
    if (hr2 === 0) hr2 = 12;
    hr2 = (hr2 < 13) ? hr2 : hr2 %= 12;
    if (hr2 < 10) hr2 = "0" + hr2;

    var finaltime = hr2 + ':' + ((mins < 10) ? "0" + mins : mins) + ':' +
        ((secs < 10) ? "0" + secs : secs) + ' ' + statusampm.toUpperCase();
    return monthArray[month] + " " + day + ", " + year + " " + finaltime;
}

function worldClockZone(){
    $("#fargo").text(worldClock(-6));
    $("#richmond").text(worldClock(-5));
    setTimeout("worldClockZone()", 1000);
}

Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

$(function() {
   worldClockZone(); 
});