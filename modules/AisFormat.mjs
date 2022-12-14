export default {
  longitude(lon) {
    lon = lon / 600000;
    if (lon === 181) {
      return null;
    }
    return lon;
  },
  latitude(lat) {
    lat = lat / 600000;
    if (lat === 91) {
      return null;
    }
    return lat;
  },
  courseOverGround(cog) {
    cog = cog / 10;
    if (cog === 360) {
      return null;
    }
    return cog;
  },
  heading(heading) {
    if (heading === 511) {
      return null;
    }
    return heading;
  },
  rateOfTurn(rot) {
    rot = Math.sqrt(rot / 4.733);
    if (rot === -128) {
      return null;
    }
    return rot;
  },
  speedOverGround(sog) {
    sog = sog / 10;
    if (sog === 102.3) {
      return null;
    }
    return sog;
  },
  inlandLengthOrBeam(lengthOrBeam) {
    return Math.round(lengthOrBeam * 0.1 * 100) / 100;
  },
  inlandDraught(draught) {
    return draught * 0.01;
  },
  draught(draught) {
    return draught / 10;
  },
  year(year) {
    if (year === 0) {
      return null;
    }
    return year;
  },
  month(month) {
    if (month === 0 || month > 12) {
      return null;
    }
    return month;
  },
  day(day) {
    if (day === 0 || day > 31) {
      return null;
    }
    return day;
  },
  hour(hour) {
    if (hour >= 24) {
      return null;
    }
    return hour;
  },
  minute(minute) {
    if (minute >= 60) {
      return null;
    }
    return minute;
  },
  second(second) {
    if (second >= 60) {
      return null;
    }
    return second;
  }
};