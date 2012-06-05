/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */


/**
 * Converts the given number of degrees to radians.
 * @param   degs                Number of degrees to convert.
 * @return  Same angle in radians.
 */
function degs2Rads(degs) {
    return degs * (Math.PI / 180.0);
}

/**
 * Converts the given number of radians to degrees.
 * @param   rads                Number of radians.
 * @return  Same angle in degrees.
 */
function rads2Degs(rads) {
    return rads * (180.0 / Math.PI);
}

/**
 * Limits the given angle value within the range [0...360) or [0...2*PI).
 * @param   angle               The angle value.
 * @param   units               Pass string 'rads' is value is radians.
 * @return  Same rotation but value is just single fold rotation.
 */
function clampRotationValue(angle, units) {
    console.log("--> clampRotationValue()");
    console.log("    angle: " + angle);
    if (units == 'rads') {
        var pi2 = 2.0 * Math.PI;
        while (angle < 0 || angle >= pi2) {
            console.log("    clamp: " + angle);
            if (angle >= pi2) {
                angle -= pi2;
            } else if (angle < 0) {
                angle += pi2;
            }
        }
        
    } else {
        while (angle < 0 || angle >= 360.0) {
            if (angle >= 360.0) {
                angle -= 360.0;
            } else if (angle < 0) {
                angle += 360;
            }
        }
    }
    console.log("<-- clampRotationValue()");
    return angle;
}
