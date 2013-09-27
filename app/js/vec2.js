/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */


/**
 * Calculates the dot product between two Vec2 objects.
 */
function Vec2DotProduct(vec1, vec2) {
    return vec1.mX * vec2.mX + vec1.mY * vec2.mY;
}


/**
 * Vec2 is a 2 dimensional vector. It contains some methods that can do some
 * vector calculations.
 */
Vec2 = function(x, y) {
    // Initialize member variables.
    this.mX = 0.0;
    this.mY = 0.0;
    if (x != undefined) {
        this.mX = x;
    }
    if (y != undefined) {
        this.mY = y;
    }
    
    /**
     * Sets new x and y components to this vector.
     * @param   x               X component.
     * @param   y               Y component.
     */
    this.set = function(x, y) {
        this.mX = x;
        this.mY = y;
    }
    
    /**
     * Normalizes this vector so that its length will be 1.
     */
    this.normalize = function() {
        var len = Math.sqrt(this.mX*this.mX + this.mY*this.mY);
        this.mX /= len;
        this.mY /= len;
    }
    
    /**
     * Sums given vector to this vector.
     * @param   vec1            Another vector to sum.
     */
    this.add = function(vec1) {
        this.mX += vec1.mX;
        this.mY += vec1.mY;
    }
    
    /**
     * Substracts given vector from this vector.
     * @param   vec1            Vector to be substracted from this one.
     */
    this.sub = function(vec1) {
        this.mX -= vec1.mX;
        this.mY -= vec1.mY;
    }
    
    /**
     * Returns the length of this vector.
     * @return  Length of this vector.
     */
    this.getLength = function() {
        return Math.sqrt(this.mX*this.mX + this.mY*this.mY);
    }
    
    
    /**
     * Multiplies this vector by given scalar.
     * @param   factor          The multiplier.
     */
    this.multiply = function(factor) {
        this.mX *= factor;
        this.mY *= factor;
    }
    
    /**
     * Performs 2D rotation around origo to this vector.
     * @param   rads            Rotation amount in radians.
     */
    this.rotate = function(rads) {
        var tmpX = this.mX * Math.cos(rads) - this.mY * Math.sin(rads);
        var tmpY = this.mY * Math.cos(rads) + this.mX * Math.sin(rads);
        this.mX = tmpX;
        this.mY = tmpY;
    }
}

